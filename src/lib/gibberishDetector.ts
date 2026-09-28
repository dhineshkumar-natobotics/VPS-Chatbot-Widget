/**
 * gibberishDetector.ts
 *
 * Detects unreadable / gibberish / random text that is not worth
 * sending to the AI backend (saves LLM tokens).
 *
 * Strategy:
 *  1. Entropy check  – high Shannon entropy → likely random chars
 *  2. Consonant-cluster ratio – too many consecutive consonants → not human words
 *  3. No-vowel ratio – excessive sequences with no vowels
 *  4. Keyboard-smash patterns – e.g. "asdfgh", "qwerty" runs
 *  5. Minimum meaningful length – ignore very short strings (handled upstream)
 *
 * Returns { isGibberish: boolean, reason: string }
 */

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** Shannon entropy of a string (bits per character) */
function shannonEntropy(s: string): number {
  const freq: Record<string, number> = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  const len = s.length;
  return Object.values(freq).reduce((sum, count) => {
    const p = count / len;
    return sum - p * Math.log2(p);
  }, 0);
}

/** Ratio of characters that are NOT a-z, A-Z, 0-9, or common punctuation */
function nonPrintableRatio(s: string): number {
  const nonPrint = s.split("").filter((c) => !/[a-zA-Z0-9 .,!?'"\-:;@#$%&()\n]/.test(c));
  return nonPrint.length / s.length;
}

/** Ratio of "words" (space-split tokens) that have no vowels */
function noVowelWordRatio(s: string): number {
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const noVowelCount = words.filter((w) => {
    const alpha = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (alpha.length < 3) return false; // skip short tokens like "v" or "2"
    return ![...alpha].some((c) => VOWELS.has(c));
  }).length;
  return noVowelCount / words.length;
}

/** Max run of consecutive consonants anywhere in the string */
function maxConsonantRun(s: string): number {
  const lower = s.toLowerCase().replace(/[^a-z]/g, " ");
  let max = 0;
  let run = 0;
  for (const ch of lower) {
    if (ch === " ") {
      run = 0;
    } else if (!VOWELS.has(ch)) {
      run++;
      max = Math.max(max, run);
    } else {
      run = 0;
    }
  }
  return max;
}

/** Detects keyboard-smash sequences (sequential keyboard rows) */
function hasKeyboardSmash(s: string): boolean {
  const rows = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "poiuytrewq",
    "lkjhgfdsa",
    "mnbvcxz",
  ];
  const lower = s.toLowerCase();
  for (const row of rows) {
    // look for ≥4 consecutive characters from the same keyboard row
    for (let i = 0; i <= row.length - 4; i++) {
      if (lower.includes(row.slice(i, i + 4))) return true;
    }
  }
  return false;
}

export interface GibberishResult {
  isGibberish: boolean;
  reason: string;
}

/**
 * Main export.
 *
 * @param input   Raw user-typed string
 * @returns       { isGibberish, reason }
 */
export function detectGibberish(input: string): GibberishResult {
  const trimmed = input.trim();

  // Very short inputs are fine — let the AI handle "hi", "ok", etc.
  if (trimmed.length < 6) {
    return { isGibberish: false, reason: "" };
  }

  // 1. Non-printable / symbol soup
  const npRatio = nonPrintableRatio(trimmed);
  if (npRatio > 0.35) {
    return {
      isGibberish: true,
      reason: `High symbol/special-character ratio (${(npRatio * 100).toFixed(0)}%)`,
    };
  }

  // Strip numbers and punctuation for linguistic checks
  const alpha = trimmed.replace(/[^a-zA-Z\s]/g, "").trim();

  // If after stripping there's almost nothing alphabetic, it may be all symbols/numbers — OK (e.g. ticket IDs), skip
  if (alpha.length < 4) {
    return { isGibberish: false, reason: "" };
  }

  // 2. Shannon entropy on alpha-only content
  const entropy = shannonEntropy(alpha.toLowerCase());
  // English prose ≈ 3.5-4.5 bits. Random letter strings → ≥ 4.7
  if (entropy > 4.6 && alpha.length > 15) {
    return {
      isGibberish: true,
      reason: `Very high character entropy (${entropy.toFixed(2)} bits) — looks random`,
    };
  }

  // 3. No-vowel word ratio
  const nvRatio = noVowelWordRatio(alpha);
  if (nvRatio > 0.65) {
    return {
      isGibberish: true,
      reason: `${(nvRatio * 100).toFixed(0)}% of words have no vowels`,
    };
  }

  // 4. Max consonant run
  const mcRun = maxConsonantRun(alpha);
  if (mcRun >= 7) {
    return {
      isGibberish: true,
      reason: `Consonant run of ${mcRun} characters — not human-readable`,
    };
  }

  // 5. Keyboard smash
  if (hasKeyboardSmash(trimmed) && trimmed.length < 30) {
    return {
      isGibberish: true,
      reason: "Keyboard-smash pattern detected",
    };
  }

  return { isGibberish: false, reason: "" };
}
