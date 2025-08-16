import { getAssetsPathByType } from "$/utils/get-assets-path";

type ActionBase = { onNext?: { sound?: string } };

export type Outcome = {
  actions?: Action[];
  background?: string | null; // null — оставить как было
  carryBackgroundToNextSlide?: boolean;
}

export type Action =
  | {
    type: "thoughts";
    text: string;
    characterName?: string;
  } & ActionBase
  | {
    type: "speech";
    text: string;
    characterName?: string;
  } & ActionBase
  | ({ type: "message"; text: string }) & ActionBase
  | {
    type: "button";
    button: { text: string; sound?: string; action: () => void };
  } & ActionBase
  | {
    // Единый choice с необязательными outcomes
    type: "choice";
    text?: string;
    characterName?: string;
    options: string[];
    outcomes?: Record<
      number, Outcome

    >;
  } & ActionBase
  | {
    // 2) Выбор правильной картинки из двух (верх/низ)
    type: "image-pick-2";
    topImage: string; // filename
    bottomImage: string; // filename
    correct: "top" | "bottom";
    feedback?: { correct?: string; wrong?: string };
    allowRetry?: boolean;
    postActions?: { correct?: Action[]; wrong?: Action[] };
  } & ActionBase
  | {
    // 5) Смена фона
    type: "switchback";
    background: string;
  } & ActionBase
  | {
    // 3) Расстановка сообщений в нужном порядке
    type: "order-messages";
    messages: string[]; // правильный порядок
    allowRetry?: boolean; // по умолчанию true
    feedback?: { correct?: string; wrong?: string };
    showSolutionAfterCheck?: boolean;
    postActions?: { correct?: Action[]; wrong?: Action[] };
  } & ActionBase
  | {
    // 4) Мультивыбор как обычный choice, но нужно пройти все options
    type: "multi-choice";
    options: string[];
    outcomes?: Record<string, Outcome>;
    submitMode?: "auto" | "button";
    submitButtonText?: string;
    postActionsOrder?: "bySelection"; // порядок агрегации: по порядку посещения
  } & ActionBase;

export interface EpisodeConfig {
  slideIndex: number;
  filename: string;
  originX?: number;
  originY?: number;
  positionX?: number;
  positionY?: number;
  backgroundSound?: string,
  startSound?: string;
  actions?: Action[];
}

/*
| origin      | position      | translate       | Результат                                     |
| ----------- | ------------- | --------------- | --------------------------------------------- |
| 0.5 / 0.5   | 0.5 / 0.5     | -50 / -50       | по центру                                     |
| **0** / 0.5 | **0** / 0.5   | **0** / -50     | левый край по центру вертикали                |
| **1** / 1   | **0.9** / 0.9 | **-100** / -100 | правый-нижний угол, но «прижат» к 90 % экрана |
*/
export class Episode {
  public key: string;
  public src: string;
  public slideIndex: number;
  public scene: string;
  public actions: Action[];
  public originX: number;
  public originY: number;
  public positionX: number;
  public positionY: number;
  public backgroundSound?: string;
  public startSound?: string;

  constructor(config: EpisodeConfig & { scene: string }) {
    this.slideIndex = config.slideIndex;
    this.scene = config.scene;
    this.key = `slide-${config.slideIndex.toString().padStart(2, "0")}`;

    this.src = getAssetsPathByType({
      type: "images",
      scene: this.scene,
      filename: config.filename,
    });

    this.originX = config.originX ?? 0.5;
    this.originY = config.originY ?? 0.5;
    this.positionX = config.positionX ?? 0.5;
    this.positionY = config.positionY ?? 0.5;

    this.backgroundSound = config.backgroundSound
      ? getAssetsPathByType({
        type: "sounds",
        scene: this.scene,
        filename: config.backgroundSound,
      })
      : undefined;

    this.startSound = config.startSound
      ? getAssetsPathByType({
        type: "sounds",
        scene: this.scene,
        filename: config.startSound,
      })
      : undefined;

    // ✅ нормализуем actions и звуки/картинки
    const normalizeAction = (raw: any): Action => {
      // нормализуем onNext.sound если есть
      const onNext = raw?.onNext?.sound
        ? { sound: getAssetsPathByType({ type: "sounds", scene: this.scene, filename: raw.onNext.sound }) }
        : raw?.onNext;

      // button
      if (raw.type === "button") {
        const button = raw.button
          ? {
            ...raw.button,
            sound: raw.button.sound
              ? getAssetsPathByType({ type: "sounds", scene: this.scene, filename: raw.button.sound })
              : undefined,
          }
          : raw.button;
        return { ...raw, button, onNext } as Action;
      }

      // image-pick-2
      if (raw.type === "image-pick-2") {
        const topImage = getAssetsPathByType({ type: "images", scene: this.scene, filename: raw.topImage });
        const bottomImage = getAssetsPathByType({ type: "images", scene: this.scene, filename: raw.bottomImage });
        const postActions = raw.postActions
          ? {
            correct: raw.postActions.correct ? raw.postActions.correct.map((aa: any) => normalizeAction(aa)) : undefined,
            wrong: raw.postActions.wrong ? raw.postActions.wrong.map((aa: any) => normalizeAction(aa)) : undefined,
          }
          : raw.postActions;
        return { ...raw, topImage, bottomImage, postActions, onNext } as Action;
      }

      // choice
      if (raw.type === "choice" && raw.outcomes) {
        const outcomes: Record<number, { actions?: Action[]; background?: string | null; carryBackgroundToNextSlide?: boolean }> = {};
        for (const key of Object.keys(raw.outcomes)) {
          const idx = Number(key);
          const o = (raw.outcomes as any)[idx] || {};
          const background = typeof o.background === "string"
            ? getAssetsPathByType({ type: "images", scene: this.scene, filename: o.background })
            : o.background; // null | undefined
          const actions = o.actions ? (o.actions as any[]).map((aa) => normalizeAction(aa)) : undefined;
          outcomes[idx] = { ...(o as any), background, actions };
        }
        return { ...raw, outcomes, onNext } as Action;
      }

      // order-messages
      if (raw.type === "order-messages") {
        const postActions = raw.postActions
          ? {
            correct: raw.postActions.correct ? raw.postActions.correct.map((aa: any) => normalizeAction(aa)) : undefined,
            wrong: raw.postActions.wrong ? raw.postActions.wrong.map((aa: any) => normalizeAction(aa)) : undefined,
          }
          : raw.postActions;
        return { ...raw, postActions, onNext } as Action;
      }

      // multi-choice
      if (raw.type === "multi-choice") {
        const outcomes: Record<string, Outcome> | undefined = raw.outcomes
          ? Object.keys(raw.outcomes).reduce((acc: any, k) => {
            const o = (raw.outcomes as any)[k];
            const background = typeof o.background === "string"
              ? getAssetsPathByType({ type: "images", scene: this.scene, filename: o.background })
              : o.background;
            const actions = o.actions ? (o.actions as any[]).map((aa) => normalizeAction(aa)) : undefined;
            acc[k] = { ...o, background, actions };
            return acc;
          }, {})
          : undefined;
        return { ...raw, outcomes, onNext } as Action;
      }
      if (raw.type === "switchback") {
        const background = getAssetsPathByType({ type: "images", scene: this.scene, filename: raw.background });
        return { ...raw, background, onNext } as Action;
      }

      // прочие типы — просто отдать с onNext
      return { ...(raw as any), onNext } as Action;
    };

    this.actions = (config.actions ?? []).map((a) => normalizeAction(a));
  }
}
