import { Scene } from "phaser";
import { getAssetsPathByType } from "@utils/get-assets-path";
import { GameScene } from "@core/types/common-types";
import { logActivity } from "$/api/log-activity";
import { useSceneStore } from "$core/state";
const TAP_THRESHOLD = 10;

interface City {
  id: string;
  name: string;
  x: number;
  y: number;
}

const defaultCityId = "nsk";

export default class GameMapPhaserScene extends Scene {
  private mapImage!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Image;
  private cities: Record<string, City> = {
    "nsk": {
      id: "nsk",
      name: "Новосибирск",
      x: 1500,
      y: 1650,
    },
    "moscow": {
      id: "moscow",
      name: "Москва",
      x: 400,
      y: 820,
    },
    "kazan": {
      id: "kazan",
      name: "Казань",
      x: 600,
      y: 1050
    },
    "ekb": {
      id: "ekb",
      name: "Екатеринбург",
      x: 1010,
      y: 1250,
    },
    "irkutsk": {
      id: "irkutsk",
      name: "Иркутск",
      x: 2180,
      y: 1890,
    },
    "kamchatka": {
      id: "kamchatka",
      name: "Камчатка",
      x: 3770,
      y: 1180,
    },
  };

  private lastTouchDistance = 0;
  private minZoom = 0.5;
  private maxZoom = 3;
  private currentZoom = 1;

  constructor() {
    super(GameScene.GameMap);
  }

  private getCityByScene(scene: GameScene | string): City {
    const sceneKey = String(scene);
    const sceneToCityId: Record<string, string> = {
      // slides
      [GameScene.Moscow]: "moscow",
      [GameScene.Kazan]: "kazan",
      [GameScene.Ekb]: "ekb",
      [GameScene.Irkutsk]: "irkutsk",
      [GameScene.Kamchatka]: "kamchatka",
      // slides without explicit city => Новосибирск
      [GameScene.Intro]: "nsk",
      [GameScene.Final]: "nsk",
      // explicit move scenes
      [GameScene.MoveToKazan]: "kazan",
      [GameScene.MoveInKazan]: "kazan",
      [GameScene.MoveInKazanVillage]: "kazan",
      [GameScene.MoveToEkb]: "ekb",
      [GameScene.MoveInEkb]: "ekb",
      [GameScene.MoveToIrkutsk]: "irkutsk",
      [GameScene.MoveInIrkutsk]: "irkutsk",
    };

    // точное сопоставление
    let cityId = sceneToCityId[sceneKey];

    // если нет точного, попробуем распознать move-сцену по имени
    if (!cityId) {
      const moveMatch = sceneKey.match(/^Move(?:To|In)(.+)$/);
      if (moveMatch && moveMatch[1]) {
        const suffix = moveMatch[1].toLowerCase();
        if (suffix.includes("kazan")) cityId = "kazan";
        else if (suffix.includes("ekb") || suffix.includes("ekaterin")) cityId = "ekb";
        else if (suffix.includes("irkutsk")) cityId = "irkutsk";
        else if (suffix.includes("kamchatka")) cityId = "kamchatka";
        else if (suffix.includes("moscow") || suffix.includes("train") || suffix.includes("vdnh") || suffix.includes("gallery")) cityId = "moscow";
      }
    }

    cityId = cityId ?? sceneKey;
    return this.cities[cityId] || this.cities[defaultCityId];
  }

  preload(): void {
    // ✅ Загружаем одну большую карту SVG/PNG
    // this.load.image("map_image", getAssetsPath("images/map.svg"));
    this.load.image("map_image", getAssetsPathByType({
      type: "images",
      scene: "game-map",
      filename: "map.jpg"
    }));

    this.load.svg("player_marker", getAssetsPathByType({
      type: "images",
      scene: "game-map",
      filename: "player-pointer.svg"
    }));
  }

  create(): void {
    const { currentScene } = useSceneStore.getState();
    const playerCity = this.getCityByScene(currentScene);
    const playerPlace = { x: playerCity.x, y: playerCity.y };
    // ✅ Отображаем карту
    this.mapImage = this.add.image(0, 0, "map_image").setOrigin(0, 0);

    const mapWidth = this.mapImage.width;
    const mapHeight = this.mapImage.height;

    const camera = this.cameras.main;
    camera.setBounds(0, 0, mapWidth, mapHeight);

    // ✅ Игрок
    this.player = this.add.image(playerPlace.x, playerPlace.y, "player_marker").setScale(0.15);
    this.player.setScrollFactor(1);

    // ✅ Города
    // точки городов удалены

    camera.centerOn(this.player.x, this.player.y);

    // ✅ Панорамирование, зум (логика из старой версии остаётся)
    this.setupCameraControls(camera);

    void logActivity("scene_enter", { scene: GameScene.GameMap }, GameScene.GameMap);
  }

  private setupCameraControls(camera: Phaser.Cameras.Scene2D.Camera) {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.event instanceof TouchEvent && pointer.event.touches.length >= 1) {
        this.lastTouchDistance = 0;
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;

      const distanceMoved = Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.x, pointer.y);

      if (distanceMoved > TAP_THRESHOLD) {
        if (pointer.event instanceof TouchEvent && pointer.event.touches.length === 1) {
          camera.scrollX += pointer.prevPosition.x - pointer.x;
          camera.scrollY += pointer.prevPosition.y - pointer.y;
        } else if (pointer.event instanceof TouchEvent && pointer.event.touches.length === 2) {
          const touches = pointer.event.touches;
          const currentDistance = Phaser.Math.Distance.Between(
            touches[0].clientX,
            touches[0].clientY,
            touches[1].clientX,
            touches[1].clientY,
          );

          if (this.lastTouchDistance > 0 && currentDistance !== this.lastTouchDistance) {
            const zoomFactor = currentDistance / this.lastTouchDistance;
            this.currentZoom = Phaser.Math.Clamp(this.currentZoom * zoomFactor, this.minZoom, this.maxZoom);
            camera.setZoom(this.currentZoom);
          }
          this.lastTouchDistance = currentDistance;
        }
      }
    });

    this.input.on("pointerup", () => {
      this.lastTouchDistance = 0;
    });
  }

  update(): void {
    /* ничего не требуется */
  }
}
