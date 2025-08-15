import { getAssetsPath, getAssetsPathByType } from "$utils/get-assets-path";
import type { MoveSceneData, SceneBackground } from "@core/types/common-types";
import { GameScene } from "@core/types/common-types";
import type { MoveScene } from "@core/types/common-types";

export interface MoveSceneConfig {
  backgroundLayers: SceneBackground;
  playerSpeed?: number;
  targetX?: number;
  targetY?: number;
  parallaxFactors?: {
    background: number;
    preBackground: number;
    light: number;
    front: number;
  };
}

// Статический класс с конфигурациями сцен
export class MoveSceneMapper {
  private static readonly sceneConfigs: Partial<Record<MoveScene, MoveSceneConfig>> = {
    // Сцена движения к поезду
    [GameScene.MoveToTrain]: {
      backgroundLayers: {
        background: null,
        preBackground: null,
        light: getAssetsPathByType({
          type: "images",
          scene: "to-train-move",
          filename: "background.svg",
        }),
        front: null,
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
    },

    // Сцена движения после поезда
    [GameScene.MoveAfterTrain]: {
      backgroundLayers: {
        background: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "khimki_background.png",
        }),
        preBackground: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "khimki_pre.png",
        }),
        light: null,
        front: null,
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
      targetY: 500,
    },
    [GameScene.MoveToVdnh]: {
      backgroundLayers: {
        preBackground: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "moscow_up_background.png",
        }),
        background: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "moscow_down_background.png",
        }),
        light: null,
        front: null,
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
    },
    [GameScene.MoveToGallery]: {
      backgroundLayers: {
        preBackground: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "moscow_up_background.png",
        }),
        background: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "moscow_down_background.png",
        }),
        front: null,
        light: null,
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
    },
    [GameScene.MoveToKazan]: {
      backgroundLayers: {
        preBackground: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "pre-background.svg",
        }),
        background: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "background.svg",
        }),
        light: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "light.svg",
        }),
        front: getAssetsPathByType({
          type: "images",
          scene: "moscow-move",
          filename: "front.svg",
        }),
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
    },
    [GameScene.MoveInKazan]: {
      backgroundLayers: {
        background: getAssetsPathByType({
          type: "images",
          scene: "kazan-move",
          filename: "background.png",
        }),
        preBackground: getAssetsPathByType({
          type: "images",
          scene: "kazan-move",
          filename: "pre_background.png",
        }),
        light: null,
        front: null,
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
    },
    [GameScene.MoveInKazanVillage]: {
      backgroundLayers: {
        background: getAssetsPathByType({
          type: "images",
          scene: "kazan-move",
          filename: "kazan_village_background.png",
        }),
        preBackground: getAssetsPathByType({
          type: "images",
          scene: "kazan-move",
          filename: "kazan_village_pre_background.png",
        }),
        light: null,
        front: null,
        ground: getAssetsPath("images/platform.png"),
      },
      playerSpeed: 150,
    },
  };

  // Получает конфигурацию для сцены
  public static getConfig(scene: MoveScene): MoveSceneConfig | null {
    return this.sceneConfigs[scene] || null;
  }

  // Создает MoveSceneData для сцены
  public static createSceneData(scene: MoveScene, customData?: Partial<MoveSceneData>): MoveSceneData {
    const config = this.getConfig(scene);
    if (!config) {
      throw new Error(`[MoveSceneMapper] Конфигурация для сцены ${scene} не найдена`);
    }

    return {
      scenePrefix: scene,
      targetX: customData?.targetX ?? config.targetX ?? 0,
      targetY: customData?.targetY ?? config.targetY ?? 0,
      backgroundLayers: config.backgroundLayers,
      fromLocationId: customData?.fromLocationId,
      toLocationId: customData?.toLocationId,
      travelTime: customData?.travelTime,
    };
  }
}
