import { useCallback, useEffect } from "react";
import { Episode } from "$features/slides/common";
import type { Action } from "$features/slides";
import { useStoryStore } from "$core/state";

export function useSlidesNavigation(
  slides: Episode[],
  playSceneSound: (url?: string) => void,
  sceneName: string,
) {
  const {
    slideIndex,
    actionIndex,
    imageLoaded,
    canSkip,
    currentSlide,
    currentActions,
    setImageLoaded,
    setCanSkip,
    setSlides,
    processUpdate: storeProcessUpdate,
    goNext: storeGoNext,
    handleActionButtonClick: storeHandleActionButtonClick,
    handleChoiceSelect: storeHandleChoiceSelect,
  } = useStoryStore();

  // Инициализируем слайды при первом рендере и при их изменении
  useEffect(() => {
    setSlides(slides, sceneName);
  }, [slides, setSlides, sceneName]);

  const processUpdate = useCallback(() => {
    storeProcessUpdate(playSceneSound);
  }, [storeProcessUpdate, playSceneSound]);

  const goNext = useCallback(() => {
    storeGoNext(playSceneSound);
  }, [storeGoNext, playSceneSound]);

  const handleActionButtonClick = useCallback((action: Action) => {
    storeHandleActionButtonClick(action, playSceneSound);
  }, [storeHandleActionButtonClick, playSceneSound]);

  const handleChoiceSelect = useCallback((option: string) => {
    storeHandleChoiceSelect(option, playSceneSound);
  }, [storeHandleChoiceSelect, playSceneSound]);

  return {
    slideIndex,
    actionIndex,
    currentSlide: currentSlide || slides[slideIndex] || { actions: [] },
    currentActions,
    imageLoaded,
    setImageLoaded,
    canSkip,
    setCanSkip,
    goNext,
    handleActionButtonClick,
    handleChoiceSelect,
    processUpdate,
  };
}
