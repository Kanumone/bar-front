import { create } from "zustand";
import { type SceneName, type SceneDataMap, type SceneBackground, type SlidesConfig, GameScene } from "@core/types/common-types";
import { gameFlowManager } from "$services/game-flow";

interface SceneState {
  prevScene: SceneName | null;
  currentScene: SceneName;
  sceneData: SceneDataMap[SceneName];
  backgroundLayers: SceneBackground | null;

  slidesConfig?: SlidesConfig;

  /** === Методы === */
  setScene: <T extends SceneName>(scene: T, data: SceneDataMap[T] | null) => Promise<void>;
  setBackgroundLayers: (layers: SceneBackground) => void;
  setSlidesConfig: (config?: SlidesConfig) => void;
  backToPrevScene: () => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  prevScene: null,
  currentScene: "Auth",
  sceneData: null,
  backgroundLayers: null,
  slidesConfig: undefined,

  setScene: async (scene, data) => {
    const prevScene = get().currentScene;

    set({
      prevScene,
      currentScene: scene,
      sceneData: data,
    });
  },

  setBackgroundLayers: (layers) => set({ backgroundLayers: layers }),

  setSlidesConfig: (config) => set({ slidesConfig: config }),

  backToPrevScene: () => {
    const { prevScene, currentScene } = get();

    if (prevScene) {
      set({
        prevScene: currentScene,
      });
      gameFlowManager.startScene(prevScene as GameScene);
    }
  },
}));
