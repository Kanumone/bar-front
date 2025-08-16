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
  handleSwitchBack: () => void;
  handleImagePick2Select: (pos: "top" | "bottom", playSceneSound: (url?: string) => void) => void;
  initOrderMessages: () => void;
  handleOrderMessagesReorder: (from: number, to: number) => void;
  handleOrderMessagesCheck: (playSceneSound: (url?: string) => void) => boolean;
  handleMultiChoiceSelect: (option: string, playSceneSound: (url?: string) => void) => void;
  handleMultiChoiceSubmit: (playSceneSound: (url?: string) => void) => void;

  // селекторы локального состояния
  getOrderMessagesLocal: (slideIdx: number, actionIdx: number) => { currentOrder: Array<{ id: string; text: string }>; checked?: boolean; correct?: boolean } | null;
  getMultiChoiceLocal: (slideIdx: number, actionIdx: number) => { visited: string[]; completed?: boolean } | null;
  getMultiChoiceLocalByKey: (key: string) => { visited: string[]; completed?: boolean } | null;
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
    const { slideIndex, actionIndex, currentActions, slides } = get();

    const currentAction: Action | undefined = currentActions[actionIndex];
    const nextSound: string | undefined = currentAction?.onNext?.sound;
    if (nextSound) playSceneSound(nextSound);

    if (currentActions.length > 0 && actionIndex < currentActions.length - 1) {
      get().handleSwitchBack();
      set({ actionIndex: actionIndex + 1 });
    } else if (slideIndex < slides.length - 1) {
      // Перед переключением слайда проверим, есть ли на текущем слайде незавершённый multi-choice.
      // Если есть — возвращаемся к нему (вставленные вложенные действия уже проиграны),
      // чтобы пользователь мог продолжить проход оставшихся опций.
      const { actionLocalState } = get();
      for (const key of Object.keys(actionLocalState)) {
        const m = key.match(/^s(\d+):a(\d+)$/);
        if (!m) continue;
        const keySlideIdx = Number(m[1]);
        const keyActionIdx = Number(m[2]);
        if (keySlideIdx !== slideIndex) continue;
        const st = (actionLocalState as any)[key];
        if (st && st.kind === "multi-choice" && !st.completed) {
          set({ actionIndex: keyActionIdx });
          return;
        }
      }

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
  },

  goNext: (playSceneSound) => {
    console.log("goNext");
    const { canSkip, processUpdate } = get();
    if (!canSkip) return;
    set({ canSkip: false });
    processUpdate(playSceneSound);
  },

  handleSwitchBack: () => {
    const { currentActions, actionIndex } = get();
    if (currentActions.length > actionIndex + 1) {
      const nextAction = currentActions[actionIndex + 1];
      console.log("nextAction", nextAction);
      if (nextAction?.type === "switchback") {
        get().setBackgroundOverride(nextAction.background);
      }
    }
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
  getMultiChoiceLocal: (slideIdx, actionIdx) => {
    const key = `s${slideIdx}:a${actionIdx}`;
    const st = (get().actionLocalState as any)[key];
    if (st && st.kind === "multi-choice") {
      // приводим к новому формату: visited — массив option
      const visitedArr: string[] = [];
      if (st.visited) {
        if (Array.isArray(st.visited)) visitedArr.push(...(st.visited as string[]));
        else if (typeof st.visited === 'object') {
          const vals = Object.values(st.visited as Record<string, any>).flat();
          const strings = vals.filter((v): v is string => typeof v === 'string');
          visitedArr.push(...strings);
        }
      }
      return { visited: visitedArr, completed: st.completed } as any;
    }
    return null;
  },
  getMultiChoiceLocalByKey: (key) => {
    const st = (get().actionLocalState as any)[key];
    if (st && st.kind === "multi-choice") return st as any;
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
    // Вставляем message с feedback сразу после action, затем postActions (если есть)
    const feedbackText = correct ? curr.feedback?.correct : curr.feedback?.wrong;
    const updated = [...currentActions];
    const feedbackAction: Action | null = feedbackText ? ({ type: "message", text: feedbackText } as Action) : null;
    let insertPos = actionIndex + 1;
    if (feedbackAction) {
      updated.splice(insertPos, 0, feedbackAction);
      insertPos += 1;
    }
    if (toInsert.length > 0) {
      updated.splice(insertPos, 0, ...toInsert);
    }
    set({ currentActions: updated });

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
    // При перемещении сбрасываем флаг проверки
    setActionLocalState(key, { ...st, currentOrder: arr, checked: false });
  },
  handleOrderMessagesCheck: (playSceneSound) => {
    const { slideIndex, actionIndex, currentActions, getActionKey, actionLocalState, setActionLocalState, processUpdate } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "order-messages") return false;
    const key = getActionKey(slideIndex, actionIndex);
    const st = actionLocalState[key] as any;
    if (!st || st.kind !== "order-messages") return false;
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
    
    return correct;
  },

  // multi-choice
  handleMultiChoiceSelect: (option, playSceneSound) => {
    const { slideIndex, actionIndex, currentActions, setActionLocalState, getActionKey, actionLocalState, setBackgroundOverride, processUpdate } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "multi-choice") return;

    const key = getActionKey(slideIndex, actionIndex);
    const st = (actionLocalState as any)[key] || { kind: "multi-choice", visited: [], completed: false, order: [] };
    const visited: string[] = Array.isArray(st.visited) ? [...st.visited] : [];
    const order: string[] = Array.isArray(st.order) ? [...st.order] : [];

    if (visited.includes(option)) return; // уже посещено

    // добавляем в visited и порядок
    visited.push(option);
    order.push(option);

    // Вставляем действия outcomes (если есть) сразу после multi-choice
    const outcome = curr.outcomes?.[option];
    const toInsert = outcome?.actions ?? [];
    if (outcome?.background) {
      // background может быть относительным именем — полагаемся на то, что конфиг проводит нормализацию
      setBackgroundOverride(outcome.background as any, (outcome as any).carryBackgroundToNextSlide ?? false);
    }

    const updated = [...currentActions];
    if (toInsert.length > 0) {
      updated.splice(actionIndex + 1, 0, ...toInsert);
    } else {
      // если нет вложенных действий — показать выбранный текст как речь
      updated.splice(actionIndex + 1, 0, { type: "speech", text: option, characterName: "Алексей" });
    }

    // Сохраняем локальное состояние
    const completed = visited.length >= curr.options.length;
    setActionLocalState(key, { ...st, visited, order, completed });
    set({ currentActions: updated });

    // Если режим auto — запускаем проигрывание вложенных действий
    if (curr.submitMode === "auto") {
      // Если это была последняя опция — пометить completed (уже сделано выше) и позволить processUpdate продолжить
    }

    processUpdate(playSceneSound);
  },

  handleMultiChoiceSubmit: (playSceneSound) => {
    const { slideIndex, actionIndex, currentActions, actionLocalState, setActionLocalState, getActionKey, processUpdate } = get();
    const curr = currentActions[actionIndex] as Action | undefined;
    if (!curr || curr.type !== "multi-choice") return;

    const key = getActionKey(slideIndex, actionIndex);
    const st = (actionLocalState as any)[key];
    const visited: string[] = st && Array.isArray(st.visited) ? st.visited : [];

    if (visited.length < curr.options.length) return; // ещё не все варианты пройдены

    // Отмечаем multi-choice как завершённый и даём продолжить
    setActionLocalState(key, { ...st, completed: true });
    processUpdate(playSceneSound);
  },
}));
