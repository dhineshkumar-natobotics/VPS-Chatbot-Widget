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
export declare function detectGibberish(input: string): GibberishResult;
