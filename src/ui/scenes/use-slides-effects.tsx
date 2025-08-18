import { useEffect } from "react";
import type { Action } from "$features/slides";
import { GameConstants } from "../../core/constants/constants";

interface UseSlideEffectsParams {
  imageLoaded: boolean;
  actionIndex: number;
  currentActions: Action[];
  showSkipButton: boolean;
  setCanSkip: (v: boolean) => void;
  config?: {
    canSkipDelay?: number;
    imageLoadDelay?: number;
  };
}

/**
 * Хук управляет эффектами слайда:
 * - Разрешает пропуск, если нет экшенов
 * - Устанавливает таймер для кнопки "Next"
 */
export function useSlideEffects({
  imageLoaded,
  actionIndex,
  currentActions,
  showSkipButton,
  setCanSkip,
  config,
}: UseSlideEffectsParams): void {

  // ✅ таймер для кнопки Skip с настраиваемой задержкой
  useEffect(() => {
    console.log("showSkipButton", showSkipButton);
    if (showSkipButton) {
      const canSkipDelay = config?.canSkipDelay ?? 1000;
      const timeout = currentActions.length === 0 ? canSkipDelay : GameConstants.SLIDE_TIMEOUT;

      const t = setTimeout(() => setCanSkip(true), timeout);
      return () => clearTimeout(t);
    }
  }, [showSkipButton, imageLoaded, actionIndex, setCanSkip, config?.canSkipDelay, currentActions.length]);
}
