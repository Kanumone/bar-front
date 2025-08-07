import { create } from "zustand";
import { Episode } from "$features/slides/common";
import type { Action } from "$features/slides/common";
import { useSceneStore } from "./scene-store";
import { usePlayerState } from "./player-store";

interface StoryState {
  // Состояние
  slideIndex: number;
  actionIndex: number;
  imageLoaded: boolean;
  canSkip: boolean;
  currentActions: Action[];
  slides: Episode[];
  
  // Вычисляемые свойства
  currentSlide: Episode | null;
  
  // Методы
  setSlideIndex: (index: number) => void;
  setActionIndex: (index: number) => void;
  setImageLoaded: (loaded: boolean) => void;
  setCanSkip: (canSkip: boolean) => void;
  setCurrentActions: (actions: Action[]) => void;
  setSlides: (slides: Episode[]) => void;
  
  // Навигация
  processUpdate: (playSceneSound: (url?: string) => void) => void;
  goNext: (playSceneSound: (url?: string) => void) => void;
  handleActionButtonClick: (action: Action, playSceneSound: (url?: string) => void) => void;
  handleChoiceSelect: (option: string, playSceneSound: (url?: string) => void) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  // Состояние
  slideIndex: 0,
  actionIndex: -1,
  imageLoaded: false,
  canSkip: false,
  currentActions: [],
  slides: [],
  
  // Вычисляемые свойства
  get currentSlide() {
    const { slideIndex, slides } = get();
    return slides.length > 0 ? slides[slideIndex] || null : null;
  },
  
  // Методы
  setSlideIndex: (index) => set({ slideIndex: index }),
  setActionIndex: (index) => set({ actionIndex: index }),
  setImageLoaded: (loaded) => set({ imageLoaded: loaded }),
  setCanSkip: (canSkip) => set({ canSkip }),
  setCurrentActions: (actions) => set({ currentActions: actions }),
  setSlides: (slides) => {
    set({ slides });
    // При установке новых слайдов сбрасываем состояние
    if (slides.length > 0) {
      const currentSlide = slides[0];
      set({ 
        slideIndex: 0,
        actionIndex: -1,
        imageLoaded: false,
        currentActions: currentSlide?.actions || []
      });
    }
  },
  
  processUpdate: (playSceneSound) => {
    console.log("processUpdate");
    console.log(get());
    const { slideIndex, actionIndex, currentActions, slides } = get();
    
    const currentAction: Action | undefined = currentActions[actionIndex];
    const nextSound: string | undefined = currentAction?.onNext?.sound;
    if (nextSound) playSceneSound(nextSound);

    if (currentActions.length > 0 && actionIndex < currentActions.length - 1) {
      set({ actionIndex: actionIndex + 1 });
    } else if (slideIndex < slides.length - 1) {
      const nextIndex = slideIndex + 1;
      const nextSlide = slides[nextIndex];
      set({ 
        slideIndex: nextIndex,
        actionIndex: -1,
        imageLoaded: false,
        currentActions: nextSlide?.actions || []
      });
    } else {
      set({
        slideIndex: 0,
        actionIndex: -1,
        imageLoaded: false,
        currentActions: []
      });
      useSceneStore.getState().setSlidesConfig(undefined);
    }
    console.log("processUpdate end");
    console.log(get());
  },
  
  goNext: (playSceneSound) => {
    const { canSkip, processUpdate } = get();
    if (!canSkip) return;
    set({ canSkip: false });
    processUpdate(playSceneSound);
  },
  
  handleActionButtonClick: (action, playSceneSound) => {
    const { slideIndex, processUpdate } = get();
    
    if (action.button?.sound) playSceneSound(action.button.sound);
    action.button?.action?.();
    
    const scene = useSceneStore.getState().currentScene;
    usePlayerState.getState().setProgress(scene, slideIndex + 1);
    
    processUpdate(playSceneSound);
  },
  
  handleChoiceSelect: (option, playSceneSound) => {
    const { currentActions, actionIndex, processUpdate } = get();
    
    const updated = [...currentActions];
    updated.splice(actionIndex + 1, 0, {
      type: "thoughts",
      text: option
    });
    console.log("handleChoiceSelect");
    console.log(get());
    set({ currentActions: updated });
    console.log("handleChoiceSelect end");
    console.log(get());
    processUpdate(playSceneSound);
  }
}));