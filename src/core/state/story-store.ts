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
  slidesScene: string | null;

  // Фоновый override
  backgroundOverrideSrc?: string | null;
  backgroundOverrideCarry?: boolean;

  // Локальное состояние интерактивных action’ов
  actionLocalState: Record<string, unknown>;

  // Вычисляемые свойства
  currentSlide: Episode | null;

  // Методы
  setSlideIndex: (index: number) => void;
  setActionIndex: (index: number) => void;
  setImageLoaded: (loaded: boolean) => void;
  setCanSkip: (canSkip: boolean) => void;
  setCurrentActions: (actions: Action[]) => void;
  setSlides: (slides: Episode[], sceneName: string) => void;

  // Навигация
  processUpdate: (playSceneSound: (url?: string) => void) => void;
  goNext: (playSceneSound: (url?: string) => void) => void;
  handleActionButtonClick: (action: Action, playSceneSound: (url?: string) => void) => void;
  handleChoiceSelect: (option: string, idx: number, playSceneSound: (url?: string) => void) => void;

  // Вспомогательные
  setBackgroundOverride: (src?: string | null, carry?: boolean) => void;
  clearBackgroundOverrideIfNeededOnSlideChange: () => void;
  getActionKey: (slideIndex: number, actionIndex: number) => string;
  setActionLocalState: (key: string, partial: unknown) => void;

  // Новые обработчики
  handleImagePick2Select: (pos: "top" | "bottom", playSceneSound: (url?: string) => void) => void;
  initOrderMessages: () => void;
  handleOrderMessagesReorder: (from: number, to: number) => void;
  handleOrderMessagesCheck: (playSceneSound: (url?: string) => void) => void;
  handleMultiChoiceSelect: (groupId: string, option: string) => void;
  handleMultiChoiceSubmit: (playSceneSound: (url?: string) => void) => void;

  // селекторы локального состояния
  getOrderMessagesLocal: (slideIdx: number, actionIdx: number) => { currentOrder: Array<{ id: string; text: string }>; checked?: boolean; correct?: boolean } | null;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  // Состояние
  slideIndex: 0,
  actionIndex: -1,
  imageLoaded: false,
  canSkip: false,
  currentActions: [],
  slides: [],
  slidesScene: null,
  backgroundOverrideSrc: undefined,
  backgroundOverrideCarry: false,
  actionLocalState: {},

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
  setSlides: (slides, sceneName) => {
    if (slides.length === 0) return;

    const { slidesScene, slideIndex } = get();
    console.log("slideScene", slidesScene);
    console.log("sceneName", sceneName);

    if (slidesScene === sceneName) {
      const safeSlideIndex = Math.min(Math.max(slideIndex, 0), slides.length - 1);
      const currentSlide = slides[safeSlideIndex];
      set({
        imageLoaded: false,
        currentActions: currentSlide?.actions || [],
      });
      return;
    }

    set({ slides, slidesScene: sceneName });
    const firstSlide = slides[0];
    set({
      slideIndex: 0,
      actionIndex: -1,
      imageLoaded: false,
      currentActions: firstSlide?.actions || [],
    });
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
        currentActions: nextSlide?.actions || [],
      });
      // сбросить override фона, если не требуется перенос
      const { backgroundOverrideCarry } = get();
      if (!backgroundOverrideCarry) {
        set({ backgroundOverrideSrc: undefined, backgroundOverrideCarry: false });
      }
    } else if (slideIndex === slides.length - 1 && (currentActions.length === 0 || actionIndex >= currentActions.length - 1)) {
      console.log("Сцена завершена, последний слайд проигран");
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
    const { processUpdate } = get();

    if (action.type === "button") {
      if (action.button?.sound) playSceneSound(action.button.sound);
      action.button?.action?.();
    }

    const scene = useSceneStore.getState().currentScene;
    usePlayerState.getState().setProgress(scene);

    processUpdate(playSceneSound);
  },

  handleChoiceSelect: (option, idx, playSceneSound) => {
    const { currentActions, actionIndex, processUpdate, setBackgroundOverride } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "choice") return;

    const outcome = curr.outcomes?.[idx];
    const toInsert = outcome?.actions ?? [];
    if (outcome?.background) {
      setBackgroundOverride(outcome.background, outcome.carryBackgroundToNextSlide ?? false);
    }
    const updated = [...currentActions];
    if (toInsert.length > 0) {
      updated.splice(actionIndex + 1, 0, ...toInsert);
    } else {
      // Нет outcomes или в outcome нет действий — добавить речь с выбранным текстом
      updated.splice(actionIndex + 1, 0, { type: "speech", text: option, characterName: "Алексей" });
    }

    set({ currentActions: updated });
    processUpdate(playSceneSound);
  },

  // Вспомогательные
  setBackgroundOverride: (src, carry) => {
    set({ backgroundOverrideSrc: src, backgroundOverrideCarry: !!carry });
  },
  clearBackgroundOverrideIfNeededOnSlideChange: () => {
    const { backgroundOverrideCarry } = get();
    if (!backgroundOverrideCarry) set({ backgroundOverrideSrc: undefined, backgroundOverrideCarry: false });
  },
  getActionKey: (slideIndex, actionIndex) => `s${slideIndex}:a${actionIndex}`,
  setActionLocalState: (key, partial) => {
    const { actionLocalState } = get();
    set({ actionLocalState: { ...actionLocalState, [key]: partial } });
  },
  getOrderMessagesLocal: (slideIdx, actionIdx) => {
    const key = `s${slideIdx}:a${actionIdx}`;
    const st = (get().actionLocalState as any)[key];
    if (st && st.kind === "order-messages") return st as any;
    return null;
  },

  // image-pick-2
  handleImagePick2Select: (pos, playSceneSound) => {
    const { slideIndex, actionIndex, currentActions, setActionLocalState, getActionKey, processUpdate } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "image-pick-2") return;
    const correct = curr.correct === pos;
    const key = getActionKey(slideIndex, actionIndex);
    setActionLocalState(key, { kind: "image-pick-2", selected: pos, result: correct ? "correct" : "wrong" });

    // Вставляем postActions при необходимости
    const toInsert = correct ? curr.postActions?.correct ?? [] : curr.postActions?.wrong ?? [];
    if (toInsert.length > 0) {
      const updated = [...currentActions];
      updated.splice(actionIndex + 1, 0, ...toInsert);
      set({ currentActions: updated });
    }

    if (correct || !curr.allowRetry) {
      processUpdate(playSceneSound);
    }
  },

  // order-messages
  initOrderMessages: () => {
    const { slideIndex, actionIndex, currentActions, getActionKey, setActionLocalState, actionLocalState } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "order-messages") return;
    const key = getActionKey(slideIndex, actionIndex);
    if (actionLocalState[key]) return; // уже инициализировано
    const shuffled = [...curr.messages]
      .map((v, i) => ({ text: v, id: `m${i}-${Math.random().toString(36).slice(2)}`, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ text, id }) => ({ id, text }));
    setActionLocalState(key, { kind: "order-messages", currentOrder: shuffled, checked: false });
  },
  handleOrderMessagesReorder: (from, to) => {
    const { slideIndex, actionIndex, getActionKey, actionLocalState, setActionLocalState } = get();
    const key = getActionKey(slideIndex, actionIndex);
    const st = actionLocalState[key] as any;
    if (!st || st.kind !== "order-messages") return;
    const arr: Array<{ id: string; text: string }> = [...st.currentOrder];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    setActionLocalState(key, { ...st, currentOrder: arr });
  },
  handleOrderMessagesCheck: (playSceneSound) => {
    const { slideIndex, actionIndex, currentActions, getActionKey, actionLocalState, setActionLocalState, processUpdate } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "order-messages") return;
    const key = getActionKey(slideIndex, actionIndex);
    const st = actionLocalState[key] as any;
    if (!st || st.kind !== "order-messages") return;
    const current = (st.currentOrder as Array<{ id: string; text: string }>).map((x) => x.text);
    const correct = JSON.stringify(current) === JSON.stringify(curr.messages);
    setActionLocalState(key, { ...st, checked: true, correct });

    const toInsert = correct ? curr.postActions?.correct ?? [] : curr.postActions?.wrong ?? [];
    // Не показываем решение в виде сообщения; подсветка делается в UI
    if (toInsert.length > 0) {
      const updated = [...currentActions];
      updated.splice(actionIndex + 1, 0, ...toInsert);
      set({ currentActions: updated });
    }

    if (correct || curr.allowRetry !== true) {
      processUpdate(playSceneSound);
    }
  },

  // multi-choice
  handleMultiChoiceSelect: (groupId, option) => {
    const { slideIndex, actionIndex, getActionKey, actionLocalState, setActionLocalState } = get();
    const key = getActionKey(slideIndex, actionIndex);
    const prev = (actionLocalState[key] as any) || { kind: "multi-choice", selections: {}, completed: false };
    if (prev.kind !== "multi-choice") {
      setActionLocalState(key, { kind: "multi-choice", selections: { [groupId]: option }, completed: false });
    } else {
      setActionLocalState(key, { ...prev, selections: { ...prev.selections, [groupId]: option } });
    }
  },
  handleMultiChoiceSubmit: (playSceneSound) => {
    const { slideIndex, actionIndex, currentActions, actionLocalState, getActionKey, setActionLocalState, setBackgroundOverride, processUpdate } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "multi-choice") return;
    const key = getActionKey(slideIndex, actionIndex);
    const st = (actionLocalState[key] as any) || { kind: "multi-choice", selections: {}, completed: false };
    if (st.kind !== "multi-choice") return;

    const allAnswered = curr.groups.every((g) => st.selections[g.id]);
    if (!allAnswered) return;

    const aggregated: Action[] = [];
    const applyOutcome = (o?: { actions?: Action[]; background?: string | null; carryBackgroundToNextSlide?: boolean }) => {
      if (!o) return;
      if (typeof o.background !== "undefined") {
        setBackgroundOverride(o.background, o.carryBackgroundToNextSlide ?? false);
      }
      if (Array.isArray(o.actions) && o.actions.length > 0) aggregated.push(...o.actions);
    };

    if (curr.postActionsOrder === "bySelection") {
      // по мере выбранных
      for (const g of curr.groups) {
        const sel = st.selections[g.id];
        applyOutcome(g.outcomes?.[sel]);
      }
    } else {
      // по группам (дефолт)
      for (const g of curr.groups) {
        const sel = st.selections[g.id];
        applyOutcome(g.outcomes?.[sel]);
      }
    }

    if (aggregated.length > 0) {
      const updated = [...currentActions];
      updated.splice(actionIndex + 1, 0, ...aggregated);
      set({ currentActions: updated });
    }
    setActionLocalState(key, { ...st, completed: true });
    processUpdate(playSceneSound);
  },
}));
