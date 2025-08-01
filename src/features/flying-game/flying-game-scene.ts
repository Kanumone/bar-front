import { Scene } from "phaser";
import { getAssetsPathByType } from "../../utils/get-assets-path";
import { usePlayerState } from "../../core/state";

const PLAYER_SIZE = 60;
const PLAYER_BODY_W = PLAYER_SIZE;
const PLAYER_BODY_H = PLAYER_SIZE;

const SHEEP_SIZE = 40;
const PLAYER_SPEED = 300;
const TAP_MOVE_SPEED = 300;
const TAP_STOP_THRESHOLD = 8;

const OBJECT_SPEED = 200; // скорость падения скал / земли
const OBSTACLE_HEIGHT = 100;
const HORIZONTAL_BUFFER = 50;
const SCORE_TEXT_STYLE = { fontSize: "16px",
  color: "#ffffff" };

const MAX_TILT_ANGLE = 25;
const TILT_SPEED_PX = 15;
const ROTATION_LERP = 0.15;

const WORLD_HALF = 100_000; // мир от –100 000 до +100 000 по X
const SIDE_BUFFER_SCREENS = 1;

const DRAG_DEADZONE_PX = 30;
const DRAG_FULL_DISTANCE = 300;
const DRAG_MIN_SPEED = 50;
const DRAG_MAX_SPEED = 400;

// — облака двигаются только по Y, медленнее земли / скал
const CLOUD_MIN_FACTOR_Y = 0.3; // 30 % скорости скал
const CLOUD_MAX_FACTOR_Y = 0.6; // 60 %

interface PooledObject extends Phaser.Physics.Arcade.Sprite { body: Phaser.Physics.Arcade.Body; }
interface CloudImage extends Phaser.GameObjects.Image { speedY: number; }
type PhysicsCallbackObject =
  | Phaser.GameObjects.GameObject
  | Phaser.Physics.Arcade.Body
  | Phaser.Physics.Arcade.StaticBody
  | Phaser.Tilemaps.Tile;

export class FlyingGameScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private rocks!: Phaser.Physics.Arcade.Group;
  private sheeps!: Phaser.Physics.Arcade.Group;
  private clouds!: Phaser.GameObjects.Group;
  private grass!: Phaser.GameObjects.TileSprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver = false;

  private isDraggingPlayer = false;
  private tapTargetX: number | null = null;
  private prevX = 0;
  private currentAngle = 0;

  constructor() { super("FlyingGameScene"); }

  preload(): void {
    this.load.svg("flying-player", getAssetsPathByType({ type: "images",
      scene: "flying",
      filename: "hero-flight.svg" }));
    this.load.image("rock", getAssetsPathByType({ type: "images",
      scene: "flying",
      filename: "rock.png" }));
    this.load.image("sheep", getAssetsPathByType({ type: "images",
      scene: "flying",
      filename: "sheep.png" }));
    this.load.image("grass", getAssetsPathByType({ type: "images",
      scene: "flying",
      filename: "grass.png" }));
    for (let i = 1; i <= 4; i++) {
      this.load.image(`cloud-${i}`, getAssetsPathByType({ type: "images",
        scene: "flying",
        filename: `cloud-${i}.svg` }));
    }
  }

  /* ──────────────────────────────── CREATE ──────────────────────────────── */
  create(): void {
    /* Мир и камера */
    this.physics.world.setBounds(-WORLD_HALF, 0, WORLD_HALF * 2, this.scale.height);
    this.cameras.main.setBounds(-WORLD_HALF, 0, WORLD_HALF * 2, this.scale.height);
    this.cameras.main.roundPixels = true;

    /* однотонный фон */
    this.add.rectangle(-WORLD_HALF, 0, WORLD_HALF * 2, this.scale.height, 0x33a700)
      .setOrigin(0, 0)
      .setAlpha(0.5)
      .setScrollFactor(0)
      .setDepth(-20);

    /* земля (трава), закрывает весь мир по X */
    this.grass = this.add.tileSprite(-WORLD_HALF, 0, WORLD_HALF * 2, this.scale.height, "grass")
      .setOrigin(0, 0)
      .setTileScale(0.2)
      .setScrollFactor(1, 0)
      .setDepth(-10);

    /* группы и пулы */
    this.rocks = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true });
    this.sheeps = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true });
    this.clouds = this.add.group();

    /* пред-спавним облака */
    for (let i = 0; i < 6; i++) this.spawnCloud(true);

    /* пул скал */
    for (let i = 0; i < 50; i++) {
      const r = this.rocks.create(0, 0, "rock") as PooledObject;
      r.setOrigin(0.5).setActive(false)
        .setVisible(false)
        .setDepth(0);
      r.body.setAllowGravity(false); r.body.enable = false;
      r.displayWidth = r.displayHeight = OBSTACLE_HEIGHT;
      r.body.setSize(OBSTACLE_HEIGHT, OBSTACLE_HEIGHT, true); // центрируем тело
    }
    /* пул овец */
    for (let i = 0; i < 50; i++) {
      const s = this.sheeps.create(0, 0, "sheep") as PooledObject;
      s.setOrigin(0.5).setActive(false)
        .setVisible(false)
        .setDisplaySize(SHEEP_SIZE, SHEEP_SIZE);
      s.body.setAllowGravity(false); s.body.enable = false;
      s.displayWidth = s.displayHeight = SHEEP_SIZE;
      s.body.setSize(SHEEP_SIZE, SHEEP_SIZE, true);
    }

    /* игрок */
    this.player = this.physics.add.sprite(0, this.scale.height - PLAYER_SIZE * 3, "flying-player")
      .setOrigin(0.5, 0.5)
      .setDepth(5)
      .setDisplaySize(PLAYER_SIZE, PLAYER_SIZE);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(PLAYER_BODY_W, PLAYER_BODY_H, true);
    this.cameras.main.startFollow(this.player, false, 1, 0);
    this.prevX = this.player.x;

    /* UI */
    this.scoreText = this.add.text(16, 16, "Очки: 0", SCORE_TEXT_STYLE).setScrollFactor(0);
    this.cursors = this.input.keyboard ? this.input.keyboard.createCursorKeys()
                                         : ({} as Phaser.Types.Input.Keyboard.CursorKeys);

    /* input */
    this.input.on("pointerdown", this.onPointerDown);
    this.input.on("pointermove", this.onPointerMove);
    this.input.on("pointerup", this.onPointerUp);

    /* таймер на спавн элементов */
    this.time.addEvent({ delay: 1500,
      callback: this.spawnLevelElements,
      callbackScope: this,
      loop: true });

    /* коллизии / триггеры */
    this.physics.add.collider(this.player, this.rocks, this.hitObstacle, undefined, this);
    this.physics.add.overlap(this.player, this.sheeps, this.collectSheep, undefined, this);

    this.events.on("shutdown", () => window.removeEventListener("flying-game-restart", this.restart));
    window.addEventListener("flying-game-restart", this.restart);

  }

  /* ──────────────────────────────── UPDATE ──────────────────────────────── */
  update(): void {
    if (this.gameOver) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    /* горизонтальное управление */
    if (!this.input.activePointer.isDown && this.tapTargetX === null && !this.isDraggingPlayer) {
      body.setVelocityX(0);
      if (this.cursors.left?.isDown) body.setVelocityX(-PLAYER_SPEED);
      else if (this.cursors.right?.isDown) body.setVelocityX(PLAYER_SPEED);
    }
    if (this.tapTargetX !== null && !this.isDraggingPlayer) {
      const diff = this.tapTargetX - this.player.x;
      if (Math.abs(diff) < TAP_STOP_THRESHOLD) { body.setVelocityX(0); this.tapTargetX = null; }
      else body.setVelocityX(Math.sign(diff) * TAP_MOVE_SPEED);
    }

    /* наклон игрока */
    const dx = this.player.x - this.prevX;
    const ratio = Phaser.Math.Clamp(dx / TILT_SPEED_PX, -1, 1);
    this.currentAngle = Phaser.Math.Linear(this.currentAngle, ratio * MAX_TILT_ANGLE, ROTATION_LERP);
    this.player.setAngle(this.currentAngle);
    this.prevX = this.player.x;

    /* земля идёт вниз вместе со скалами */
    const dt = this.game.loop.delta;
    this.grass.tilePositionY -= (OBJECT_SPEED * dt) / (1000 * this.grass.tileScaleY);

    /* скалы / овцы падают */
    this.rocks.children.each((obj) => {
      const r = obj as PooledObject;
      if (r.active) {
        r.body.setVelocityY(OBJECT_SPEED);
        if (r.y > this.cameras.main.scrollY + this.scale.height) r.disableBody(true, true);
      }
      return true;
    });
    this.sheeps.children.each((obj) => {
      const s = obj as PooledObject;
      if (s.active) {
        s.body.setVelocityY(OBJECT_SPEED);
        if (s.y > this.cameras.main.scrollY + this.scale.height) s.disableBody(true, true);
      }
      return true;
    });

    /* облака: только по Y (медленнее), без горизонтального смещения */
    this.clouds.children.each((obj) => {
      const cloud = obj as CloudImage;
      cloud.y += cloud.speedY * dt / 1000;
      if (cloud.y > this.cameras.main.scrollY + this.scale.height + 300) cloud.destroy();
      return true;
    });
  }

  /* ────────────────────────────── INPUT ────────────────────────────── */
  private onPointerDown = (p: Phaser.Input.Pointer): void => {
    if (this.gameOver) return;
    const hit = Phaser.Geom.Rectangle.Contains(this.player.getBounds(), p.worldX, p.worldY);
    if (hit) {
      this.isDraggingPlayer = true;
      this.tapTargetX = null;
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    } else {
      this.isDraggingPlayer = false;
      this.tapTargetX = Phaser.Math.Clamp(p.worldX, -WORLD_HALF + PLAYER_SIZE / 2, WORLD_HALF - PLAYER_SIZE / 2);
    }
  };
  private onPointerMove = (p: Phaser.Input.Pointer): void => {
    if (!this.isDraggingPlayer || !p.isDown || this.gameOver) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const dxWorld = p.worldX - this.player.x;

    if (Math.abs(dxWorld) <= DRAG_DEADZONE_PX) { body.setVelocityX(0); return; }

    const dist = Math.abs(dxWorld) - DRAG_DEADZONE_PX;
    const t = Phaser.Math.Clamp(dist / DRAG_FULL_DISTANCE, 0, 1);
    const speed = DRAG_MIN_SPEED + t * (DRAG_MAX_SPEED - DRAG_MIN_SPEED);
    body.setVelocityX(Math.sign(dxWorld) * speed);
  };
  private onPointerUp = (): void => {
    if (this.gameOver) return;
    this.isDraggingPlayer = false;
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
  };

  /* ────────────────────────────── ПУЛЫ ────────────────────────────── */
  private getPooledRock(): PooledObject | null {
    const r = this.rocks.getFirstDead(false) as PooledObject | null;
    if (!r) return null;
    r.setActive(true).setVisible(true); r.body.enable = true;
    return r;
  }
  private getPooledSheep(): PooledObject | null {
    const s = this.sheeps.getFirstDead(false) as PooledObject | null;
    if (!s) return null;
    s.setActive(true).setVisible(true); s.body.enable = true;
    s.body.setSize(SHEEP_SIZE, SHEEP_SIZE, true);
    return s;
  }

  /* ────────────────────────────── ОБЛАКА ────────────────────────────── */
  private spawnCloud(initial = false): void {
    const key = `cloud-${Phaser.Math.Between(1, 4)}`;

    /* --- вертикальная позиция --- */
    const camY = this.cameras.main.scrollY;
    const y = initial
      ? Phaser.Math.Between(camY, camY + this.scale.height / 2)
      : camY - Phaser.Math.Between(100, 300);

    /* --- масштаб + глубина --- */
    const scale = Phaser.Math.FloatBetween(0.2, 0.5);
    const depth = scale < 0.35 ? 4 : 6;

    /* --- параллакс по X --- */
    const parallaxX = Phaser.Math.Linear(0.05, 0.18, (scale - 0.2) / (0.5 - 0.2));

    /* --- экранируем координату, потом пересчитываем в world --- */
    const screenX = Phaser.Math.Between(0, this.scale.width);
    const worldX = screenX + this.cameras.main.scrollX * parallaxX;

    const cloud = this.add.image(worldX, y, key)
      .setOrigin(0.5)
      .setDepth(depth)
      .setAlpha(Phaser.Math.FloatBetween(0.8, 1))
      .setScale(scale)
      .setScrollFactor(parallaxX, 1) as CloudImage;

    cloud.speedY = OBJECT_SPEED *
      Phaser.Math.FloatBetween(CLOUD_MIN_FACTOR_Y, CLOUD_MAX_FACTOR_Y);

    this.clouds.add(cloud);
  }

  /* ────────────────────────────── СПАВН ────────────────────────────── */
  private spawnLevelElements = (): void => {
    if (this.gameOver) return;

    const viewW = this.scale.width;
    const camLeft = this.cameras.main.scrollX;
    const rangeStart = camLeft - SIDE_BUFFER_SCREENS * viewW;
    const rangeEnd = camLeft + (SIDE_BUFFER_SCREENS + 1) * viewW;
    const spawnY = this.cameras.main.scrollY - OBSTACLE_HEIGHT;
    const placed: Phaser.Math.Vector2[] = [];

    const placeRock = (): void => {
      let x: number, y: number, safe: boolean;
      let tries = 0;

      do {
        x = Phaser.Math.Between(rangeStart + HORIZONTAL_BUFFER, rangeEnd - HORIZONTAL_BUFFER);
        y = spawnY - Phaser.Math.Between(0, 300);
        safe = placed.every((r) => Phaser.Math.Distance.Between(x, y, r.x, r.y) > OBSTACLE_HEIGHT);
        tries++;
      } while (!safe && tries < 5);

      if (!safe) return;

      const rock = this.getPooledRock();
      if (!rock) return;

      rock.x = x;
      rock.y = y;

      /* ✅ добавляем коэффициент увеличения */
      const kScale = Phaser.Math.FloatBetween(0.7, 1.5);

      /* ✅ масштабируем картинку (видимый размер) */
      rock.setDisplaySize(OBSTACLE_HEIGHT * kScale, OBSTACLE_HEIGHT * kScale);

      /* ✅ пересчёт hitbox через scaleX как в старом коде */
      const kOpacity = 0.5;
      const unscaled = (OBSTACLE_HEIGHT * kScale) / rock.scaleX * kOpacity;

      /* ✅ задаём физическое тело с корректной коррекцией */
      rock.body.setSize(unscaled, unscaled, true);

      rock.body.setVelocityY(OBJECT_SPEED);
      placed.push(new Phaser.Math.Vector2(rock.x, rock.y));
    };

    const placeSheep = (): void => {
      let x: number; let safe = false; let tries = 0;
      do {
        x = Phaser.Math.Between(rangeStart + HORIZONTAL_BUFFER, rangeEnd - HORIZONTAL_BUFFER);
        safe = placed.every((r) => Phaser.Math.Distance.Between(x, spawnY, r.x, r.y) > OBSTACLE_HEIGHT);
        tries++;
      } while (!safe && tries < 5);
      if (!safe) return;

      const sheep = this.getPooledSheep(); if (!sheep) return;
      sheep.x = x; sheep.y = spawnY - Phaser.Math.Between(50, 300);
      const unscaled = SHEEP_SIZE / sheep.scaleX;
      sheep.body.setSize(unscaled, unscaled, true);
      sheep.body.setVelocityY(OBJECT_SPEED);
    };

    for (let i = 0; i < Phaser.Math.Between(1, 3); i++) placeRock();
    for (let i = 0; i < Phaser.Math.Between(0, 2); i++) placeSheep();
    if (Math.random() < 0.7) this.spawnCloud();
  };

  /* ────────────────────────────── КОЛЛИЗИИ ────────────────────────────── */
  private hitObstacle = (): void => {
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);

    // ✅ уведомляем React о завершении игры
    window.dispatchEvent(new CustomEvent("flying-game-over", { detail: { score: this.score } }));
  };

  private collectSheep = (_: PhysicsCallbackObject, sheepObj: PhysicsCallbackObject): void => {
    if (!(sheepObj instanceof Phaser.GameObjects.Sprite)) return;
    const s = sheepObj as PooledObject; s.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText(`Очки: ${this.score}`);
    console.log(`Очки: ${this.score}`);
    if (this.score % 10 === 0) usePlayerState.getState().increaseEnergy();
  };

  /* ────────────────────────────── РЕСТАРТ ────────────────────────────── */
  private restart = (): void => {
    this.gameOver = false; this.score = 0;
    this.player.clearTint(); this.player.setAngle(0); this.currentAngle = 0;
    this.player.setPosition(0, this.scale.height - PLAYER_SIZE * 3); this.prevX = this.player.x;
    this.tapTargetX = null; this.isDraggingPlayer = false;
    this.physics.resume();
    this.rocks.clear(true, true);
    this.sheeps.clear(true, true);
    this.clouds.clear(true, true);
    this.cameras.main.scrollX = 0;
    this.scene.restart();
  };
}
