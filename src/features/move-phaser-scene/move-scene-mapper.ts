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
            targetX: 100,
        },

        // Сцена движения после поезда
        [GameScene.MoveAfterTrain]: {
            backgroundLayers: {
                background: getAssetsPathByType({
                    type: "images",
                    scene: "moscow-move",
                    filename: "khimki.svg",
                }),
                preBackground: null,
                light: null,
                front: null,
                ground: getAssetsPath("images/platform.png"),
            },
            playerSpeed: 150,
            targetY: 500,
        },

        // Сцена движения по городу
        // [GameScene.CityMove]: {
        //   backgroundLayers: {
        //     background: getAssetsPathByType({
        //       type: "images",
        //       scene: "moscow",
        //       filename: "background.jpg",
        //     }),
        //     preBackground: null,
        //     light: null,
        //     front: null,
        //     ground: getAssetsPath("images/platform.png"),
        //   },
        //   playerSpeed: 120,
        //   targetX: 150,
        // },
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