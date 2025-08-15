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
    // новое
    backgroundOverrideSrc,
    handleImagePick2Select: storeHandleImagePick2Select,
    initOrderMessages: storeInitOrderMessages,
    handleOrderMessagesReorder: storeHandleOrderMessagesReorder,
    handleOrderMessagesCheck: storeHandleOrderMessagesCheck,
    handleMultiChoiceSelect: storeHandleMultiChoiceSelect,
    handleMultiChoiceSubmit: storeHandleMultiChoiceSubmit,
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

  const handleChoiceSelect = useCallback((option: string, idx: number) => {
    storeHandleChoiceSelect(option, idx, playSceneSound);
  }, [storeHandleChoiceSelect, playSceneSound]);

  const handleImagePick2Select = useCallback((pos: "top" | "bottom") => {
    storeHandleImagePick2Select(pos, playSceneSound);
  }, [storeHandleImagePick2Select, playSceneSound]);

  const handleOrderMessagesCheck = useCallback(() => {
    return storeHandleOrderMessagesCheck(playSceneSound);
  }, [storeHandleOrderMessagesCheck, playSceneSound]);

  const handleMultiChoiceSubmit = useCallback(() => {
    storeHandleMultiChoiceSubmit(playSceneSound);
  }, [storeHandleMultiChoiceSubmit, playSceneSound]);

  const handleMultiChoiceSelect = useCallback((option: string) => {
    storeHandleMultiChoiceSelect(option, playSceneSound);
  }, [storeHandleMultiChoiceSelect, playSceneSound]);

  return {
    slideIndex,
    actionIndex,
    currentSlide: currentSlide || slides[slideIndex] || { actions: [] },
    currentActions,
    backgroundOverrideSrc,
    imageLoaded,
    setImageLoaded,
    canSkip,
    setCanSkip,
    goNext,
    handleActionButtonClick,
    handleChoiceSelect,
    processUpdate,
    handleImagePick2Select,
    initOrderMessages: storeInitOrderMessages,
    handleOrderMessagesReorder: storeHandleOrderMessagesReorder,
    handleOrderMessagesCheck,
    handleMultiChoiceSelect,
    handleMultiChoiceSubmit,
  };
}
