import type { Episode } from "../../features/slides";

export type MoveScene = typeof GameScene.MoveToTrain | typeof GameScene.MoveAfterTrain | typeof GameScene.Move;

export interface MoveSceneData {
  scenePrefix?: MoveScene;
  fromLocationId?: string;
  toLocationId?: string;
  travelTime?: number;
  targetX: number;
  targetY: number;
  backgroundLayers: SceneBackground;
  playerSpeed?: number;
  parallaxFactors?: {
    background: number;
    preBackground: number;
    light: number;
    front: number;
  };
}

export interface GameMapSceneData {
  currentMapId?: string;
  unlockedRegions?: string[];
  selectedCity?: string;
  targetX?: number;
  targetY?: number;
}

export interface SceneDataMap {
  Auth: null;
  Intro: null;
  MoveScene: MoveSceneData;
  GameMap: GameMapSceneData;
  Game2048: null;
  MoveToTrain: MoveSceneData | null;
  DetectiveGame: null;
  TretyakovGame: null;
  RailwayStation: null;
  CookingGame: null;
  MoveAfterTrain: null;
  FlyingGame: null;
  GameFood: null;
  Moscow: null; // Добавляем недостающую сцену
  Move: MoveSceneData; // Добавляем сцену Move, которая используется в GameScene
}

export type SceneName = keyof SceneDataMap;

export type SceneData<T extends SceneName> = SceneDataMap[T];

export const GameScene = {
  // novel slides
  Intro: "Intro",
  RailwayStation: "RailwayStation",
  Moscow: "Moscow",

  // games
  FlyingGame: "FlyingGame",
  DetectiveGame: "DetectiveGame",
  TretyakovGame: "TretyakovGame",
  CookingGame: "CookingGame",
  Game2048: "Game2048",

  // move
  Move: "Move",
  MoveToTrain: "MoveToTrain",
  MoveAfterTrain: "MoveAfterTrain",

  // others
  Auth: "Auth",
  GameMap: "GameMap",
} as const;

export type GameScene = typeof GameScene[keyof typeof GameScene];

export const Gender = {
  Male: "Male",
  Female: "Female",
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export function isGender(value: string): value is Gender {
  return Object.values(Gender).includes(value as Gender);
}

export interface QuizItem {
  id: string;
  text?: string[];
  question: string;
  answers: {
    id: string;
    text: string
  }[];
  backgroundColor?: string;
  borderColor?: string;
  color?: string;
}

export type QuizQuestions = QuizItem[];

export interface SceneBackground {
  background: string | null;
  preBackground: string | null;
  light: string | null;
  front: string | null;
  ground: string;
}

// ✅ Новые типы для универсальной конфигурации слайдов
export interface SlidesSceneConfig {
  scene: string;
  backgroundMusic?: string;
  effects?: {
    canSkipDelay?: number;
    imageLoadDelay?: number;
  };
}

export interface SlidesConfig {
  getSlides: () => Episode[]// - будет импортирован в конкретных файлах
  sceneConfig: SlidesSceneConfig;
}
