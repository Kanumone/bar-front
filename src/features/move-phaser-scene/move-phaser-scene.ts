import { Scene } from "phaser";
import { createTiledBackground, getAssetsPathByType } from "$/utils";
import { GameScene } from "@core/types/common-types";
import type { MoveScene, MoveSceneData, SceneBackground } from "@core/types/common-types";
import { useMoveSceneStore } from "$/core/state/move-scene-store";
import { usePlayerState } from "$/core/state/player-store";
import { MoveSceneMapper } from "./move-scene-mapper";

const GROUND_HEIGHT = 50;
const PLAYER_GRAVITY = 500;
const PLAYER_BOUNCE = 0.2;
const PLAYER_SPEED = 150;
const PLAYER_FRAME_RATE = 16;
const NUM_PLAYER_FRAMES = 15;
const NUM_START_FRAMES = 7;

const PARALLAX_FACTORS = {
  background: 0.1,
  preBackground: 0.3,
  light: 0.6,
  front: 1.0,
};

export class MovePhaserScene extends Scene {
  private prefix = "MoveScene";
  private currentConfig: MoveSceneData | null = null;

  private player!: Phaser.Physics.Arcade.Sprite;
  private isMove = false;
  private isMovingInternal = false;
  private playerSpeed = 0;

  private parallaxBackground?: Phaser.GameObjects.TileSprite;
  private parallaxPreBackground?: Phaser.GameObjects.TileSprite;
  private parallaxLight?: Phaser.GameObjects.TileSprite;
  private parallaxFront?: Phaser.GameObjects.TileSprite;

  private targetX: number | null = null;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  backgroundLayers: SceneBackground | null = null;

  private blockedBubble?: Phaser.GameObjects.Container;

  constructor() {
    super(GameScene.Move);
  }

  init(data: MoveSceneData): void {
    // Если передан scenePrefix, пытаемся получить конфигурацию из маппера
    if (data.scenePrefix) {
      const config = MoveSceneMapper.getConfig(data.scenePrefix);
      if (config) {
        // Мерджим конфигурацию из маппера с переданными данными
        this.currentConfig = {
          ...MoveSceneMapper.createSceneData(data.scenePrefix),
          ...data,
        };
      }
    }

    // Если конфигурация не найдена в маппере, используем переданные данные
    if (!this.currentConfig) {
      this.currentConfig = data;
    }

    // Применяем конфигурацию
    this.prefix = this.currentConfig.scenePrefix ?? "MoveScene";
    this.targetX = this.currentConfig.targetX ?? 0;
    this.backgroundLayers = this.currentConfig.backgroundLayers;
    this.playerSpeed = this.currentConfig.playerSpeed ?? PLAYER_SPEED;
  }

  // ✅ Новый метод для переключения конфигурации во время работы сцены
  public switchToScene(scene: MoveScene, customData?: Partial<MoveSceneData>): void {
    try {
      // Получаем конфигурацию из маппера
      const config = MoveSceneMapper.getConfig(scene);
      if (!config) {
        console.warn(`[MovePhaserScene] Конфигурация для сцены ${scene} не найдена`);
        return;
      }

      // Создаем новую конфигурацию
      const newConfig = MoveSceneMapper.createSceneData(scene, customData);

      // Обновляем текущую конфигурацию
      this.currentConfig = newConfig;
      this.prefix = newConfig.scenePrefix ?? "MoveScene";
      this.targetX = newConfig.targetX ?? 0;
      this.backgroundLayers = newConfig.backgroundLayers;

      // Обновляем фоновые слои
      this.updateBackgroundLayers();

      // Обновляем позицию игрока если нужно
      if (this.player && newConfig.targetX !== undefined) {
        this.player.setX(newConfig.targetX);
      }

      console.log(`[MovePhaserScene] Переключено на сцену: ${scene}`);
    } catch (error) {
      console.error(`[MovePhaserScene] Ошибка при переключении на сцену ${scene}:`, error);
    }
  }

  // ✅ Метод для обновления фоновых слоев
  private updateBackgroundLayers(): void {
    // Очищаем старые слои
    this.clearParallaxLayers();

    // Создаем новые слои
    const { width, height } = this.sys.game.canvas;
    this.createParallaxLayers(width, height);
  }

  // ✅ Метод для очистки параллакс слоев
  private clearParallaxLayers(): void {
    if (this.parallaxBackground) {
      this.parallaxBackground.destroy();
      this.parallaxBackground = undefined;
    }
    if (this.parallaxPreBackground) {
      this.parallaxPreBackground.destroy();
      this.parallaxPreBackground = undefined;
    }
    if (this.parallaxLight) {
      this.parallaxLight.destroy();
      this.parallaxLight = undefined;
    }
    if (this.parallaxFront) {
      this.parallaxFront.destroy();
      this.parallaxFront = undefined;
    }
  }

  preload(): void {
    // Загружаем кадры для фазы начала движения (start_1 - start_9)
    for (let i = 1; i <= NUM_START_FRAMES; i++) {
      const assetKey = `${this.prefix}-player_start_${i}`;
      const filename = `alex/start_${i}.png`;

      this.load.image(assetKey, getAssetsPathByType({
        type: "images",
        filename: filename,
      }));
    }

    // Загружаем кадры для фазы движения (cycle_1 - cycle_15)
    for (let i = 1; i <= NUM_PLAYER_FRAMES; i++) {
      const assetKey = `${this.prefix}-player_cycle_${i}`;
      const filename = `alex/cycle_${i}.png`;

      this.load.image(assetKey, getAssetsPathByType({
        type: "images",
        filename: filename,
      }));
    }

    // Загружаем фоновые слои
    const layers = this.backgroundLayers;
    if (layers) {
      if (layers.background) this.load.image(`${this.prefix}-background`, layers.background);
      if (layers.preBackground) this.load.image(`${this.prefix}-pre-background`, layers.preBackground);
      if (layers.light) this.load.image(`${this.prefix}-light`, layers.light);
      if (layers.front) this.load.image(`${this.prefix}-front`, layers.front);
      if (layers.ground) this.load.image(`${this.prefix}-ground`, layers.ground);
    }
  }

  create(): void {
    const { width, height } = this.sys.game.canvas;

    this.createParallaxLayers(width, height);
    this.createPlatforms();
    this.createPlayer();
    this.createAnimations();
    this.setupInputHandling();

    // this.physics.add.collider(this.player, this.platforms);
    this.scale.on("resize", this.handleResize, this);

    // Устанавливаем начальное состояние движения в сторе
    useMoveSceneStore.getState().setMoving(false);
  }

  destroy(): void {
    console.log(`${this.prefix}: destroy() — очищена сцена`);
    // Убедимся, что состояние движения сброшено при уничтожении сцены
    this.clearParallaxLayers();
    useMoveSceneStore.getState().setMoving(false);
  }

  private handleResize = (gameSize: Phaser.Structs.Size): void => {
    const { width, height } = gameSize;
    this.resizeParallaxLayers(width, height);
    if (this.platforms.getChildren().length) {
      const platform = this.platforms.getChildren()[0] as Phaser.Physics.Arcade.Sprite;
      this.resizePlatform(platform, width, height);
      platform.refreshBody();
    }
    if (this.player) {
      this.player.setX(this.targetX || width / 2);
      this.player.setY(height - GROUND_HEIGHT);
    }
    this.cameras.main.setSize(width, height);
  };

  private createParallaxLayers(width: number, height: number): void {
    // ✅ создаём только если текстура существует
    if (this.textures.exists(`${this.prefix}-background`)) {
      this.parallaxBackground = createTiledBackground(this, `${this.prefix}-background`)
        .setOrigin(0, 0)
        .setDepth(0);
      this.parallaxBackground.displayWidth = width;
      this.parallaxBackground.displayHeight = height;
    }

    if (this.textures.exists(`${this.prefix}-pre-background`)) {
      this.parallaxPreBackground = createTiledBackground(this, `${this.prefix}-pre-background`)
        .setOrigin(0, 0)
        .setDepth(1);
    }

    if (this.textures.exists(`${this.prefix}-light`)) {
      this.parallaxLight = createTiledBackground(this, `${this.prefix}-light`)
        .setOrigin(0, 0)
        .setDepth(2);
    }

    if (this.textures.exists(`${this.prefix}-front`)) {
      this.parallaxFront = createTiledBackground(this, `${this.prefix}-front`)
        .setOrigin(0, 0)
        .setDepth(3);
    }

    this.resizeParallaxLayers(width, height);
  }

  private createPlatforms(): void {
    const { width, height } = this.sys.game.canvas;
    this.platforms = this.physics.add.staticGroup();
    const platform = this.platforms.create(0, height, `${this.prefix}-ground`) as Phaser.Physics.Arcade.Sprite;
    platform.setOrigin(0.5, 0.5).setDepth(-1000)
      .setBounce(0)
      .setImmovable(true)
      .setAlpha(0);
    this.resizePlatform(platform, width, height);
    platform.refreshBody();
  }

  private createPlayer(): void {
    const { width, height } = this.sys.game.canvas;
    this.player = this.physics.add.sprite(this.targetX || width / 2, height, `${this.prefix}-player_start_1`);
    this.player
      .setOrigin(0.5, 1)
      .setCollideWorldBounds(true)
      .setBounce(PLAYER_BOUNCE)
      .setGravityY(PLAYER_GRAVITY)
      .setDepth(2);
  }

  private createAnimations(): void {
    this.anims.create({
      key: `${this.prefix}-idle`,
      frames: [{ key: `${this.prefix}-player_start_1` }],
      frameRate: PLAYER_FRAME_RATE,
      repeat: 0,
    });

    // Анимация начала движения (start_2 - start_7)
    const startFrames = Array.from({ length: NUM_START_FRAMES }, (_, i) => ({
      key: `${this.prefix}-player_start_${i + 1}`,
    }));

    this.anims.create({
      key: `${this.prefix}-start_walking`,
      frames: startFrames,
      frameRate: PLAYER_FRAME_RATE,
      repeat: 0, // Не повторяем, так как это переходная анимация
    });

    // Анимация движения (cycle_1 - cycle_15)
    const walkFrames = Array.from({ length: NUM_PLAYER_FRAMES }, (_, i) => ({
      key: `${this.prefix}-player_cycle_${i + 1}`,
    }));

    this.anims.create({
      key: `${this.prefix}-walk`,
      frames: walkFrames,
      frameRate: PLAYER_FRAME_RATE,
      repeat: -1,
    });
  }

  private setupInputHandling(): void {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.tryStartMovement();
    });

    this.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.hideBlockedBubble();
      this.stopMovement();
    });
  }

  update(_time: number, _delta: number): void {
    // === Frame pipeline ===
    if (this.handleQuizBlocking()) return;
    if (!this.player || !this.player.body) return;
    // Авто-остановка при нехватке энергии или максимальном голоде
    if (this.handleCharacterConstraintsBlocking()) return;

    this.handleMovementState(this.isMove);

    if (this.isMove) {
      const parallaxFactors = this.currentConfig?.parallaxFactors ?? PARALLAX_FACTORS;
      const k = this.playerSpeed * this.game.loop.delta / 1000;
      if (this.parallaxBackground) this.parallaxBackground.tilePositionX += k * parallaxFactors.background;
      if (this.parallaxPreBackground) this.parallaxPreBackground.tilePositionX += k * parallaxFactors.preBackground;
      if (this.parallaxLight) this.parallaxLight.tilePositionX += k * parallaxFactors.light;
      if (this.parallaxFront) this.parallaxFront.tilePositionX += k * parallaxFactors.front;
    }
  }

  // === High-level actions ===
  private tryStartMovement(): void {
    if (this.handleQuizBlocking()) return;
    if (this.handleCharacterConstraintsBlocking()) return;
    this.startMovement();
  }

  private startMovement(): void {
    this.isMove = true;
  }

  private stopMovement(): void {
    this.isMove = false;
    this.player.anims.stop();
    this.player.anims.play(`${this.prefix}-idle`, true);
  }

  // === Blocking handlers ===
  private handleQuizBlocking(): boolean {
    if (!useMoveSceneStore.getState().isQuizVisible) return false;

    this.stopMovement();
    this.player?.anims.stop();
    if (this.player && this.player.anims.currentAnim?.key !== `${this.prefix}-idle`) {
      this.player.anims.play(`${this.prefix}-idle`, true);
    }
    return true;
  }

  private handleCharacterConstraintsBlocking(): boolean {
    if (usePlayerState.getState().canMove()) {
      this.hideBlockedBubble();
      return false;
    }
    const { energy } = usePlayerState.getState();
    this.stopMovement();
    this.showBlockedBubble(energy === 0 ? "Нужно поспать..." : "Нужно поесть...");
    return true;
  }

  private handleMovementState(isMoving: boolean): void {
    // Если состояние движения изменилось
    if (isMoving !== this.isMovingInternal) {
      this.isMovingInternal = isMoving;
      // Обновляем состояние в Zustand-сторе
      useMoveSceneStore.getState().setMoving(isMoving);

      if (isMoving) {
        this.player.play(`${this.prefix}-start_walking`, true);
        this.player.once("animationcomplete", () => {
          // Убедимся, что игрок все еще движется, прежде чем переключаться на анимацию ходьбы
          if (this.isMovingInternal) {
            this.player.play(`${this.prefix}-walk`, true);
          }
        });
      } else {
        this.player.play(`${this.prefix}-idle`, true);
      }
    }
  }

  private resizeParallaxLayers(width: number, height: number): void {
    [this.parallaxBackground, this.parallaxPreBackground, this.parallaxLight, this.parallaxFront].forEach((layer) => {
      if (layer) {
        layer.displayWidth = width;
        layer.displayHeight = height;
      }
    });
  }

  private resizePlatform(platform: Phaser.Physics.Arcade.Sprite, width: number, height: number): void {
    platform.setX(width / 2);
    platform.setY(height);
    platform.displayWidth = width * 2;
    platform.displayHeight = GROUND_HEIGHT * 1.5;
  }

  // === UI helpers ===
  private showBlockedBubble(message: string): void {
    this.hideBlockedBubble();

    const { x, y } = this.player;

    const container = this.add.container(x, y - 140).setDepth(10000);

    // фон пузыря
    const bg = this.add.graphics();
    const text = this.add.text(0, 0, message, {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      align: "center",
    });
    text.setOrigin(0.5, 0.5);
    const bubbleWidth = 280;
    const bubbleHeight = 80;
    bg.fillStyle(0x000000, 0.7);
    // draw rounded rect centered at 0,0
    const rectX = -bubbleWidth / 2;
    const rectY = -bubbleHeight / 2;
    bg.fillRoundedRect(rectX, rectY, bubbleWidth, bubbleHeight, 12);

    this.blockedBubble = container.add([bg, text]);
  }

  private hideBlockedBubble(): void {
    if (this.blockedBubble) {
      this.blockedBubble.destroy(true);
      this.blockedBubble = undefined;
    }
  }
}
