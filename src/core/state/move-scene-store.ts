import { create } from "zustand";
import { gameFlowManager } from "$services/game-flow";
import { GameScene, type QuizItem } from "@core/types/common-types";
import { apiClient } from "../../api";
import { useSceneStore } from "./scene-store";
import { GameConstants } from "$/core/constants/constants";
import { usePlayerState } from "./player-store";


async function sendAnswerToServer(questionId: string, answerId: string): Promise<void> {
  try {
    await apiClient.quiz.quizAnswerControllerCreate({
      questionId,
      answerId,
    });
  } catch (error) {
    console.error("Ошибка отправки ответа на сервер", error);
  }
}

interface MoveSceneState {
  questions: QuizItem[];
  currentIndex: number;
  isQuizVisible: boolean;
  stage: "intro" | "question" | "hidden";
  selected: string | null;
  canSkip: boolean;
  remainTime: number;
  timerId: number | null;
  isMoving: boolean;
  backgroundMusic: string | null;
  consumptionTimerId: number | null;
  setBackgroundMusic: (music: string) => void;
  setQuestions: (questions: QuizItem[]) => void;
  startQuizCycle: () => void;
  openQuiz: (index: number) => void;
  skipIntro: () => void;
  answerQuestion: (answerId: string) => void;
  completeQuiz: () => void;
  hideQuiz: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  setMoving: (moving: boolean) => void;
  startMovementConsumption: () => void;
  stopMovementConsumption: () => void;
  resetQuizState: () => void;
}

export const useMoveSceneStore = create<MoveSceneState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  isQuizVisible: false,
  stage: "hidden",
  selected: null,
  canSkip: false,
  remainTime: GameConstants.TIMEOUT_FOR_QUESTION,
  timerId: null,
  isMoving: false,
  backgroundMusic: null,
  consumptionTimerId: null,

  setBackgroundMusic: (music: string) => set({ backgroundMusic: music }),

  resetQuizState: () => {
    const { timerId, consumptionTimerId } = get();
    if (timerId !== null) {
      clearInterval(timerId);
    }
    if (consumptionTimerId) {
      clearInterval(consumptionTimerId);
    }
    set({
      currentIndex: 0,
      isQuizVisible: false,
      stage: "hidden",
      selected: null,
      canSkip: false,
      remainTime: GameConstants.TIMEOUT_FOR_QUESTION,
      timerId: null,
      consumptionTimerId: null,
    });
  },

  setQuestions: (questions) => {
    // Полный сброс состояния перед установкой нового набора вопросов
    get().resetQuizState();
    set({ questions, currentIndex: 0 });
  },

  setMoving: (moving: boolean) => {
    set({ isMoving: moving });
    const { isQuizVisible } = get();

    // Всегда управляем потреблением ресурсов в зависимости от движения
    if (moving) {
      get().startMovementConsumption();
    } else {
      get().stopMovementConsumption();
    }

    // Таймер вопроса управляется только когда квиз скрыт
    if (!isQuizVisible) {
      if (moving) {
        get().resumeTimer();
      } else {
        get().pauseTimer();
      }
    }
  },

  startMovementConsumption: () => {
    const { consumptionTimerId } = get();
    if (consumptionTimerId) {
      clearInterval(consumptionTimerId);
      set({ consumptionTimerId: null });
    }
    if (!get().isMoving) return;
    const intervalMs = 1000; // шаг 1 сек
    const timerId = setInterval(() => {
      if (!get().isMoving) {
        get().stopMovementConsumption();
        return;
      }
      const energyDelta = -GameConstants.ENERGY_POINTS_PER_SECOND;
      const hungerDelta = GameConstants.HUNGER_POINTS_PER_SECOND;
      const { addHunger, setEnergy, energy } = usePlayerState.getState();
      addHunger(hungerDelta);
      setEnergy(energy + energyDelta);
    }, intervalMs) as unknown as number;
    set({ consumptionTimerId: timerId });
  },

  stopMovementConsumption: () => {
    const { consumptionTimerId } = get();
    if (consumptionTimerId) {
      clearInterval(consumptionTimerId);
      set({ consumptionTimerId: null });
    }
  },

  startTimer: () => {
    console.log("startTimer");
    const { timerId } = get();
    if (timerId !== null) {
      clearInterval(timerId);
    }

    set({ remainTime: GameConstants.TIMEOUT_FOR_QUESTION });

    if (get().isMoving) {
      const newTimerId = setInterval(() => {
        const { remainTime: currentRemainTime } = get();
        if (!get().isMoving) {
          clearInterval(newTimerId);
          set({ timerId: null });
          return;
        }

        if (currentRemainTime <= 0) {
          clearInterval(newTimerId);
          set({ timerId: null });
          get().openQuiz(get().currentIndex);
        } else {
          set((state) => ({ remainTime: Math.max(0, state.remainTime - 1000) }));
        }
      }, 1000) as unknown as number;

      set({ timerId: newTimerId });
    } else {
      set({ timerId: null });
    }
  },

  pauseTimer: () => {
    const { timerId } = get();
    if (timerId !== null) {
      clearInterval(timerId);
      set({ timerId: null });
    }
  },

  resumeTimer: () => {
    const { timerId, remainTime } = get();
    if (timerId === null && remainTime >= 0 && get().isMoving) {
      const newTimerId = setInterval(() => {
        const { remainTime: currentRemainTime } = get();
        if (!get().isMoving) {
          clearInterval(newTimerId);
          set({ timerId: null });
          return;
        }

        if (currentRemainTime <= 0) {
          clearInterval(newTimerId);
          set({ timerId: null });
          get().openQuiz(get().currentIndex);
        } else {
          set((state) => ({ remainTime: Math.max(0, state.remainTime - 1000) }));
        }
      }, 1000) as unknown as number;

      set({ timerId: newTimerId });
    }
  },

  startQuizCycle: () => {
    const { questions, currentIndex, completeQuiz } = get();
    if (currentIndex >= questions.length) {
      completeQuiz();
      return;
    }
    get().startTimer();
  },

  /** 🔹 Показ квиза */
  openQuiz: (index) => {
    const { questions, pauseTimer } = get();
    pauseTimer();
    // Останавливаем движение и потребление, пока открыт квиз
    get().setMoving(false);

    if (index >= questions.length) {
      get().completeQuiz();
      return;
    }

    const currentQuestion = questions[index];

    // Если у вопроса нет текста для intro, сразу переходим к вопросу
    const initialStage = (!currentQuestion.text || currentQuestion.text.length === 0) ? "question" : "intro";

    set({
      currentIndex: index,
      isQuizVisible: true,
      stage: initialStage,
      selected: null,
      canSkip: false,
      remainTime: GameConstants.TIMEOUT_FOR_QUESTION,
    });

    // Если сразу показываем вопрос, разрешаем пропуск
    if (initialStage === "question") {
      set({ canSkip: true });
    } else {
      setTimeout(() => {
        if (get().isQuizVisible && get().currentIndex === index) {
          set({ canSkip: true });
        }
      }, GameConstants.SLIDE_TIMEOUT);
    }
  },

  skipIntro: () => {
    const { stage, canSkip } = get();
    if (stage === "intro" && canSkip) {
      set({ stage: "question" });
    }
  },

  /** 🔹 Обработка ответа */
  answerQuestion: (answerId) => {
    const { currentIndex, questions, pauseTimer } = get();
    pauseTimer();

    // const questionId = questions[currentIndex].id;
    set({ selected: answerId });

    // ✅ сразу отправляем ответ на сервер (заглушка)
    // sendAnswerToServer(questionId, answerId).catch((err) => {
    //   console.error("Ошибка отправки ответа на сервер", err);
    // });

    setTimeout(() => {
      set({
        isQuizVisible: false,
        stage: "hidden",
      });
      if (currentIndex < questions.length - 1) {
        set((state) => ({ currentIndex: state.currentIndex + 1 }));
        setTimeout(() => get().startQuizCycle(), 1000);
      } else {
        get().completeQuiz();
      }
    }, 1000);
  },

  completeQuiz: () => {
    // Останавливаем все таймеры/потребление и приводим стор в начальное состояние
    get().pauseTimer();
    get().stopMovementConsumption();
    set({
      isQuizVisible: false,
      stage: "hidden",
      currentIndex: 0,
      selected: null,
      canSkip: false,
      remainTime: GameConstants.TIMEOUT_FOR_QUESTION,
    });

    const currentScene = useSceneStore.getState().currentScene;
    switch (currentScene) {
      case GameScene.MoveToTrain:
        gameFlowManager.showRailwayStation();
        break;
      case GameScene.MoveAfterTrain:
        gameFlowManager.showMoscow();
        break;
      case GameScene.MoveToVdnh:
      case GameScene.MoveToGallery:
      case GameScene.MoveInKazan:
      case GameScene.MoveInKazanVillage:
      case GameScene.MoveInEkb:
      case GameScene.MoveInIrkutsk:
      case GameScene.MoveInKamchatka:
        useSceneStore.getState().backToPrevScene();
        break;
      case GameScene.MoveToKazan:
        gameFlowManager.showKazan();
        break;
      case GameScene.MoveInKamchatka:
        gameFlowManager.showFinal();
        break;
    }
  },

  hideQuiz: () => {
    get().pauseTimer();
    set({
      isQuizVisible: false,
      stage: "hidden",
    });
  },
}));
