import Phaser from "phaser";
import { gameConfig } from "@core/game-engine/config";
import { useMoveSceneStore, useSceneStore } from "@core/state";
import { usePlayerState } from "@core/state/player-store";
import { syncService } from "$services/local-storage-service/sync-service";
import {
  type MoveScene,
  type MoveSceneData,
  GameScene,
} from "@core/types/common-types";
import { GameMapPhaserScene } from "@features/game-map";
import { MovePhaserScene, MoveSceneMapper } from "@features/move-phaser-scene";
import { FlyingGameScene } from "@features/flying-game/flying-game-scene";
import { ekbSlidesConfig, introSlidesConfig, kazanSlidesConfig, moscowSlidesConfig, railwayStationSlidesConfig, irkutskSlidesConfig, kamchatkaSlidesConfig, finalSlidesConfig } from "../../features/slides/configs";

const phaserScenes = {
  [GameScene.FlyingGame]: FlyingGameScene,
  [GameScene.GameMap]: GameMapPhaserScene,
  [GameScene.Move]: MovePhaserScene,
}

class GameFlowManager {
  private game: Phaser.Game | null = null;

  /** ✅ Маппинг логическая → физическая Phaser-сцена */
  private readonly sceneMapping: Partial<Record<GameScene, GameScene>> = {
    [GameScene.GameMap]: GameScene.GameMap,

    [GameScene.FlyingGame]: GameScene.FlyingGame,

    [GameScene.MoveToTrain]: GameScene.Move,
    [GameScene.MoveAfterTrain]: GameScene.Move,
    [GameScene.MoveToVdnh]: GameScene.Move,
    [GameScene.MoveToGallery]: GameScene.Move,
    [GameScene.MoveToKazan]: GameScene.Move,
    [GameScene.MoveInKazan]: GameScene.Move,
    [GameScene.MoveInKazanVillage]: GameScene.Move,
    [GameScene.MoveToEkb]: GameScene.Move,
    [GameScene.MoveInEkb]: GameScene.Move,
    [GameScene.MoveToIrkutsk]: GameScene.Move,
    [GameScene.MoveInIrkutsk]: GameScene.Move,

  };

  private readonly startMap: Partial<Record<GameScene, () => void>> = {
    [GameScene.RailwayStation]: this.showRailwayStation,
    [GameScene.Moscow]: this.showMoscow,
    [GameScene.Kazan]: this.showKazan,
    [GameScene.Ekb]: this.showEkb,
    [GameScene.Irkutsk]: this.showIrkutsk,
    [GameScene.Kamchatka]: this.showKamchatka,
    [GameScene.Final]: this.showFinal,
    
    [GameScene.DetectiveGame]: this.showDetectiveGame,
    [GameScene.TretyakovGame]: this.showTretyakovGame,
    [GameScene.CookingGame]: this.showCookingGame,
    [GameScene.FlyingGame]: this.showFlyingGame,
    
    [GameScene.MoveToTrain]: this.showMoveToTrainScene,
    [GameScene.MoveAfterTrain]: this.showMoveAfterTrain,
    [GameScene.MoveToVdnh]: this.showMoveToVdnh,
    [GameScene.MoveToGallery]: this.showMoveToGallery,
    [GameScene.MoveToKazan]: this.showMoveToKazan,
    [GameScene.MoveInKazan]: this.showMoveInKazan,
    [GameScene.MoveInKazanVillage]: this.showMoveInKazanVillage,
    [GameScene.MoveToEkb]: this.showMoveToEkb,
    [GameScene.MoveInEkb]: this.showMoveInEkb,
    [GameScene.MoveToIrkutsk]: this.showMoveToIrkutsk,
    [GameScene.MoveInIrkutsk]: this.showMoveInIrkutsk,
    
    [GameScene.Intro]: this.showIntro,
    [GameScene.Auth]: this.showAuth,
    [GameScene.GameMap]: this.showGameMap,
  };

  async initializeGame(parent: string | HTMLElement) {
    // 1) Пробуем восстановить состояние сторов из localStorage
    const restored = syncService.loadAllStoresFromLocal();

    // 2) Решаем, что показывать: если нет данных или нет username/gender → Auth, иначе текущую сцену
    const { playerName, playerGender, checkPoint } = usePlayerState.getState();
    const restoredScene = useSceneStore.getState().currentScene;
    const hasProfile = Boolean(playerName && playerName.trim().length > 0 && playerGender);

    // 3) Запускаем Phaser
    if (!this.game) {
      this.game = new Phaser.Game({
        ...gameConfig,
        parent,
      });
      
      for (const [key, scene] of Object.entries(phaserScenes)) {
        this.game.scene.add(key, scene);
      }

      this.game.events.on(Phaser.Core.Events.READY, () => {
        if (!restored || !hasProfile) {
          this.showAuth();
        } else if (restoredScene && restoredScene !== GameScene.Auth) {
          try {
            this.startScene(restoredScene as GameScene);
          } catch {
            this.showIntro();
          }
        } else if (checkPoint) {
          try {
            this.startScene(checkPoint as GameScene);
          } catch {
            // если сцена неизвестна — откатываемся на интро
            this.showIntro();
          }
        } else {
          this.showIntro();
        }
        syncService.start();
      });
    }
  }

  /** ✅ Общий метод запуска Phaser сцены */
  private startPhaserScene(scene: GameScene, data?: Record<string, unknown>): void {
    if (!this.game) {
      console.error("Game not initialized");
      return;
    }

    const phaserKey = this.sceneMapping[scene];
    if (!phaserKey) {
      console.log(`▶️ Запущена React сцена ${scene}`, data);
      return;
    }

    const payload = (data && typeof data === "object") ? data : {};
    this.stopActiveScenes();
    this.game.scene.start(phaserKey, payload);

    console.log(`▶️ Запущена логическая сцена ${scene} (Phaser: ${phaserKey})`, data);
  }

  private stopActiveScenes() {
    Object.values(GameScene).forEach((scene) => {
      if (this.game?.scene.isActive(scene)) {
        this.game.scene.stop(scene);
      }
    });
  }

  // ✅ Новый метод для переключения сцены во время работы
  switchMoveScene(scene: MoveScene, customData?: Partial<MoveSceneData>): void {
    if (!this.game) {
      console.warn("Game not initialized");
      return;
    }

    const moveScene = this.game.scene.getScene(GameScene.Move) as MovePhaserScene;
    if (!moveScene) {
      console.warn("Move scene not found");
      return;
    }

    moveScene.switchToScene(scene, customData);
  }

  startScene(scene: GameScene) {
    this.startMap[scene]?.call(this)
  }

  showAuth() {
    useSceneStore.getState().setScene(GameScene.Auth, null);
  }

  showGameMap() {
    this.startPhaserScene(GameScene.GameMap);
    useSceneStore.getState().setScene(GameScene.GameMap, {});
  }

  // ✅ Обновленный метод для движения после поезда
  showMoveAfterTrain(data?: Omit<MoveSceneData, "backgroundLayers">) {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveAfterTrain", data);

    useSceneStore.getState().setScene(GameScene.MoveAfterTrain, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  // ✅ Обновленный метод для движения к поезду
  showMoveToTrainScene() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveToTrain", {});

    useSceneStore.getState().setScene(GameScene.MoveToTrain, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    useMoveSceneStore.setState({
      backgroundMusic: "Andrey Bakt - Rainy Hanoi.mp3",
    });

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  // ✅ Новая сцена: движение к ВДНХ
  showMoveToVdnh() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveToVdnh", {});

    useSceneStore.getState().setScene(GameScene.MoveToVdnh, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  // ✅ Новая сцена: движение к Галерее
  showMoveToGallery() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveToGallery", {});

    useSceneStore.getState().setScene(GameScene.MoveToGallery, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  // ✅ Новая сцена: движение к Казани
  showMoveToKazan() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveToKazan", {});

    useSceneStore.getState().setScene(GameScene.MoveToKazan, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  // Новая сцена: движение внутри Казани
  showMoveInKazan() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveInKazan", {});

    useSceneStore.getState().setScene(GameScene.MoveInKazan, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  showMoveInKazanVillage() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData(GameScene.MoveInKazanVillage, {});

    useSceneStore.getState().setScene(GameScene.MoveInKazanVillage, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  showMoveToIrkutsk() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveToIrkutsk", {});

    useSceneStore.getState().setScene(GameScene.MoveToIrkutsk, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  showMoveInIrkutsk() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveInIrkutsk", {});

    useSceneStore.getState().setScene(GameScene.MoveInIrkutsk, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  showMoveToEkb() {}

  showMoveInEkb() {
    if (!this.game) return;

    const sceneData = MoveSceneMapper.createSceneData("MoveInEkb", {});

    useSceneStore.getState().setScene(GameScene.MoveInEkb, sceneData);
    useSceneStore.getState().setBackgroundLayers(sceneData.backgroundLayers);

    this.stopActiveScenes();
    this.game.scene.start(GameScene.Move, sceneData);
  }

  // Game scenes
  showFlyingGame() {
    this.startPhaserScene(GameScene.FlyingGame);
    useSceneStore.getState().setScene(GameScene.FlyingGame, null);
  }

  showCookingGame() {
    useSceneStore.getState().setScene(GameScene.CookingGame, null);
  }

  showDetectiveGame() {
    useSceneStore.getState().setScene(GameScene.DetectiveGame, null);
  }

  showTretyakovGame() {
    useSceneStore.getState().setScene(GameScene.TretyakovGame, null);
  }

  // slides scenes
  showIntro() {
    useSceneStore.getState().setScene(GameScene.Intro, null);
    useSceneStore.getState().setSlidesConfig(introSlidesConfig);
  }

  showRailwayStation() {
    useSceneStore.getState().setScene(GameScene.RailwayStation, null);
    useSceneStore.getState().setSlidesConfig(railwayStationSlidesConfig);
  }

  showMoscow() {
    useSceneStore.getState().setScene(GameScene.Moscow, null);
    useSceneStore.getState().setSlidesConfig(moscowSlidesConfig);
  }

  showKazan() {
    useSceneStore.getState().setScene(GameScene.Kazan, null);
    useSceneStore.getState().setSlidesConfig(kazanSlidesConfig);
  }

  showEkb() {
    useSceneStore.getState().setScene(GameScene.Ekb, null);
    useSceneStore.getState().setSlidesConfig(ekbSlidesConfig);
  }

  showIrkutsk() {
    useSceneStore.getState().setScene(GameScene.Irkutsk, null);
    useSceneStore.getState().setSlidesConfig(irkutskSlidesConfig);
  }

  showKamchatka() {
    useSceneStore.getState().setScene(GameScene.Kamchatka, null);
    useSceneStore.getState().setSlidesConfig(kamchatkaSlidesConfig);
  }

  showFinal() {
    useSceneStore.getState().setScene(GameScene.Final, null);
    useSceneStore.getState().setSlidesConfig(finalSlidesConfig);
  }
}

export const gameFlowManager = new GameFlowManager();
