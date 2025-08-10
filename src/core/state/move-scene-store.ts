import { create } from "zustand";
import { gameFlowManager } from "@processes/game-flow/game-flow-manager";
import { GameScene, type QuizItem } from "@core/types/common-types";
import { apiClient } from "../../api";
import { useSceneStore } from "./scene-store";
import { GameConstants } from "$/core/constants/constants";

const TIMEOUT_FOR_QUESTION = GameConstants.TIMEOUT_FOR_QUESTION;

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
}

export const useMoveSceneStore = create<MoveSceneState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  isQuizVisible: false,
  stage: "hidden",
  selected: null,
  canSkip: false,
  remainTime: TIMEOUT_FOR_QUESTION,
  timerId: null,
  isMoving: false,
  backgroundMusic: null,

  setBackgroundMusic: (music: string) => set({ backgroundMusic: music }),

  setQuestions: (questions) => set({ questions }),

  setMoving: (moving: boolean) => {
    set({ isMoving: moving });
    const { isQuizVisible } = get();

    if (!isQuizVisible) {
      if (moving) {
        get().resumeTimer();
      } else {
        get().pauseTimer();
      }
    }
  },

  startTimer: () => {
    const { timerId } = get();
    if (timerId !== null) {
      clearInterval(timerId);
    }

    set({ remainTime: TIMEOUT_FOR_QUESTION });

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
          set((state) => ({ remainTime: state.remainTime - 1000 }));
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
    if (timerId === null && remainTime > 0 && get().isMoving) {
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
          set((state) => ({ remainTime: state.remainTime - 1000 }));
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
      remainTime: TIMEOUT_FOR_QUESTION,
    });

    // Если сразу показываем вопрос, разрешаем пропуск
    if (initialStage === "question") {
      set({ canSkip: true });
    } else {
      setTimeout(() => {
        if (get().isQuizVisible && get().currentIndex === index) {
          set({ canSkip: true });
        }
      }, TIMEOUT_FOR_QUESTION);
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

    const questionId = questions[currentIndex].id;
    set({ selected: answerId });

    // ✅ сразу отправляем ответ на сервер (заглушка)
    sendAnswerToServer(questionId, answerId).catch((err) => {
      console.error("Ошибка отправки ответа на сервер", err);
    });

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
    set({
      isQuizVisible: false,
      stage: "hidden",
    });

    const currentScene = useSceneStore.getState().currentScene;
    if (currentScene === GameScene.MoveToTrain) {
      gameFlowManager.showRailwayStation();
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
