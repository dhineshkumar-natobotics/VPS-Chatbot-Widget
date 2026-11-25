import { useCallback, useEffect, useRef, useState } from "react";

const preferenceKey = "vps-chatbot-response-sound";

export function useResponseSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const enabledRef = useRef(true);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      enabledRef.current = window.localStorage.getItem(preferenceKey) !== "off";
      setSoundEnabled(enabledRef.current);
    } catch {
      // The preference still works for the current view if storage is blocked.
    }

    return () => {
      void audioRef.current?.close().catch(() => {});
      audioRef.current = null;
    };
  }, []);

  const prepareSound = useCallback(() => {
    if (!enabledRef.current || typeof AudioContext === "undefined") return;
    try {
      const audio = audioRef.current ?? (audioRef.current = new AudioContext());
      if (audio.state !== "running") void audio.resume().catch(() => {});
    } catch {
      // Audio availability should never affect chat requests.
    }
  }, []);

  const toggleSound = useCallback(() => {
    const enabled = !enabledRef.current;
    enabledRef.current = enabled;
    setSoundEnabled(enabled);
    try {
      window.localStorage.setItem(preferenceKey, enabled ? "on" : "off");
    } catch {
      // Keep the in-memory preference.
    }
    if (enabled) prepareSound();
  }, [prepareSound]);

  const playSound = useCallback(() => {
    const audio = audioRef.current;
    if (!enabledRef.current || audio?.state !== "running") return;
    try {
      const now = audio.currentTime;
      for (const [index, note] of [660, 880].entries()) {
        const start = now + index * 0.09;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = note;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.06, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(start + 0.15);
      }
    } catch {
      // The chat reply stays complete if audio playback is unavailable.
    }
  }, []);

  return { soundEnabled, toggleSound, prepareSound, playSound };
}
