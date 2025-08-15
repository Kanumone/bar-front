import type { Episode } from "../../features/slides";

export type MoveScene =
  | typeof GameScene.MoveToTrain
  | typeof GameScene.MoveAfterTrain
  | typeof GameScene.MoveToVdnh
  | typeof GameScene.MoveToGallery
  | typeof GameScene.MoveToKazan
  | typeof GameScene.MoveInKazan
  | typeof GameScene.Move;

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
  // slides
  Intro: null;
  RailwayStation: null;
  Kazan: null;
  Moscow: null;

  // move scenes
  Move: MoveSceneData;
  MoveScene: MoveSceneData;
  MoveToTrain: MoveSceneData | null;
  MoveAfterTrain: null;
  MoveToVdnh: MoveSceneData | null;
  MoveToGallery: MoveSceneData | null;
  MoveToKazan: MoveSceneData | null;
  MoveInKazan: MoveSceneData | null;

  // games
  GameMap: GameMapSceneData;
  DetectiveGame: null;
  TretyakovGame: null;
  CookingGame: null;
  FlyingGame: null;
  GameFood: null;
  Game2048: null;
}

export type SceneName = keyof SceneDataMap;

export type SceneData<T extends SceneName> = SceneDataMap[T];

export const GameScene = {
  // novel slides
  Intro: "Intro",
  RailwayStation: "RailwayStation",
  Moscow: "Moscow",
  Kazan: "Kazan",

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
  MoveToVdnh: "MoveToVdnh",
  MoveToGallery: "MoveToGallery",
  MoveToKazan: "MoveToKazan",
  MoveInKazan: "MoveInKazan",

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

// ✅ Типы для системы инвентаря
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  image: string;
}
