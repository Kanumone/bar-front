import { useRef, useEffect, useState } from "react";
import type { Episode } from "$features/slides/common";
import { useSettingsStore } from "$core/state";

export function useSlideSounds() {
  const [current, setCurrent] = useState<Episode | null>(null);
  const activeSounds = useRef<HTMLAudioElement[]>([]);
  const bgRef = useRef<HTMLAudioElement | null>(null);
  const isSoundEnabled = useSettingsStore((s) => s.isSoundEnabled);

  const playSceneSound = (url?: string): void => {
    if (!url || !isSoundEnabled) return;

    const audio = new Audio(url);
    audio.volume = 0.8;
    activeSounds.current.push(audio);
    audio.addEventListener("ended", () => {
      activeSounds.current = activeSounds.current.filter((a) => a !== audio);
    });
    void audio.play().catch(() => void 0);
  };

  useEffect(() => {
    if (!current) return;

    // остановка старого фонового звука
    if (bgRef.current) {
      bgRef.current.pause();
      bgRef.current = null;
    }

    // запуск нового
    if (current.backgroundSound && isSoundEnabled) {
      const bg = new Audio(current.backgroundSound);
      bg.loop = true;
      bg.volume = 0.5;
      void bg.play().catch(() => void 0);
      bgRef.current = bg;
    }

    // стартовый звук
    if (current.startSound && isSoundEnabled) playSceneSound(current.startSound);

    return () => {
      if (bgRef.current) {
        bgRef.current.pause();
        bgRef.current = null;
      }
    };
  }, [current, isSoundEnabled]);

  // реакция на переключение глобального флага звука
  useEffect(() => {
    if (!isSoundEnabled) {
      // остановить и сбросить все активные звуки и фон
      if (bgRef.current) {
        bgRef.current.pause();
        bgRef.current.currentTime = 0;
        bgRef.current = null;
      }
      activeSounds.current.forEach((a) => {
        a.pause();
        a.currentTime = 0;
      });
      activeSounds.current = [];
    } else {
      // при включении — восстановить только фон текущего эпизода (без стартового эффекта)
      if (current?.backgroundSound && !bgRef.current) {
        const bg = new Audio(current.backgroundSound);
        bg.loop = true;
        bg.volume = 0.5;
        void bg.play().catch(() => void 0);
        bgRef.current = bg;
      }
    }
  }, [isSoundEnabled, current]);

  return {
    playSceneSound,
    setCurrentSlide: setCurrent
  };
}
