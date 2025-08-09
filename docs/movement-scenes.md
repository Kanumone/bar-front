# Сцены перемещения

Сцены перемещения обеспечивают интерактивное передвижение персонажа по игровому миру с использованием Phaser 3 для физики и анимации.

## Архитектура системы

### Основные компоненты

1. **MovePhaserScene** - основная Phaser сцена для движения
2. **MoveSceneMapper** - маппер конфигураций сцен
3. **MoveSceneStore** - Zustand store для состояния
4. **Scene Wrappers** - React обертки для интеграции

## MovePhaserScene

### Основная логика

```typescript
export class MovePhaserScene extends Scene {
  private prefix = "MoveScene";
  private currentConfig: MoveSceneData | null = null;
  private player!: Phaser.Physics.Arcade.Sprite;
  private targetX: number | null = null;
  
  // Параллакс слои
  private parallaxBackground?: Phaser.GameObjects.TileSprite;
  private parallaxPreBackground?: Phaser.GameObjects.TileSprite;
  private parallaxLight?: Phaser.GameObjects.TileSprite;
  private parallaxFront?: Phaser.GameObjects.TileSprite;
}
```

### Инициализация сцены

```typescript
init(data: MoveSceneData): void {
  // Получение конфигурации из маппера или использование переданных данных
  if (data.scenePrefix) {
    const config = MoveSceneMapper.getConfig(data.scenePrefix);
    if (config) {
      this.currentConfig = {
        ...MoveSceneMapper.createSceneData(data.scenePrefix),
        ...data
      };
    }
  }
  
  // Применение конфигурации
  this.prefix = this.currentConfig.scenePrefix ?? "MoveScene";
  this.targetX = this.currentConfig.targetX ?? 0;
  this.backgroundLayers = this.currentConfig.backgroundLayers;
}
```

## Система параллакса

### Слои фона

```typescript
interface SceneBackground {
  background: string | null;      // Дальний фон
  preBackground: string | null;   // Средний фон  
  light: string | null;          // Световые эффекты
  front: string | null;          // Передний план
  ground: string;                // Земля/платформа
}
```

### Коэффициенты параллакса

```typescript
const PARALLAX_FACTORS = {
  background: 0.1,      // Самый медленный слой
  preBackground: 0.3,   // Средняя скорость
  light: 0.6,          // Быстрый слой
  front: 1.0,          // Движется со скоростью игрока
};
```

### Обновление параллакса

```typescript
// Обновление параллакса в update()
if (isCurrentlyMoving) {
  const parallaxFactors = this.currentConfig?.parallaxFactors ?? PARALLAX_FACTORS;
  const speedFactor = currentVelocityX * this.game.loop.delta / 1000;
  
  if (this.parallaxBackground) 
    this.parallaxBackground.tilePositionX += speedFactor * parallaxFactors.background;
  if (this.parallaxPreBackground) 
    this.parallaxPreBackground.tilePositionX += speedFactor * parallaxFactors.preBackground;
  if (this.parallaxLight) 
    this.parallaxLight.tilePositionX += speedFactor * parallaxFactors.light;
  if (this.parallaxFront) 
    this.parallaxFront.tilePositionX += speedFactor * parallaxFactors.front;
}
```

## Анимация персонажа

### Фазы анимации

1. **Idle** - состояние покоя
2. **Start Walking** - начало движения (переходная анимация)
3. **Walk Cycle** - цикличная анимация ходьбы

### Кадры анимации

```typescript
// Загрузка кадров для фазы начала движения (start_1 - start_7)
for (let i = 1; i <= NUM_START_FRAMES; i++) {
  const assetKey = `${this.prefix}-player_start_${i}`;
  const filename = `alex/start_${i}.png`;
  this.load.image(assetKey, getAssetsPathByType({
    type: "images",
    filename: filename,
  }));
}

// Загрузка кадров для цикла движения (cycle_1 - cycle_15)  
for (let i = 1; i <= NUM_PLAYER_FRAMES; i++) {
  const assetKey = `${this.prefix}-player_cycle_${i}`;
  const filename = `alex/cycle_${i}.png`;
  this.load.image(assetKey, getAssetsPathByType({
    type: "images", 
    filename: filename,
  }));
}
```

### Создание анимаций

```typescript
createAnimations(): void {
  // Анимация покоя
  this.anims.create({
    key: `${this.prefix}-idle`,
    frames: [{ key: `${this.prefix}-player_start_1` }],
    frameRate: PLAYER_FRAME_RATE,
    repeat: 0,
  });

  // Анимация начала движения
  this.anims.create({
    key: `${this.prefix}-start_walking`, 
    frames: startFrames,
    frameRate: PLAYER_FRAME_RATE,
    repeat: 0, // Не повторяем - переходная анимация
  });

  // Анимация цикла ходьбы
  this.anims.create({
    key: `${this.prefix}-walk`,
    frames: walkFrames,
    frameRate: PLAYER_FRAME_RATE,
    repeat: -1, // Бесконечный цикл
  });
}
```

## MoveSceneMapper

### Конфигурации сцен

```typescript
interface MoveSceneConfig {
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
```

### Предустановленные конфигурации

```typescript
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
};
```

## Управление вводом

### Сенсорное управление

```typescript
setupInputHandling(): void {
  this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
    if (pointer.x < this.sys.game.canvas.width / 2) {
      this.moveLeft = true;
      this.moveRight = false;
    } else {
      this.moveRight = true;
      this.moveLeft = false;
    }
  });

  this.input.on(Phaser.Input.Events.POINTER_UP, () => {
    this.moveLeft = false;
    this.moveRight = false;
  });
}
```

### Клавиатурное управление

```typescript
if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();

// В update()
if (this.cursors) {
  if (this.cursors.left?.isDown) body.setVelocityX(-currentSpeed);
  else if (this.cursors.right?.isDown) body.setVelocityX(currentSpeed);
}
```

## Физика и коллизии

### Настройка игрока

```typescript
createPlayer(): void {
  const { width, height } = this.sys.game.canvas;
  this.player = this.physics.add.sprite(this.targetX || width / 2, height, `${this.prefix}-player_start_1`);
  this.player
    .setOrigin(0.5, 1)
    .setCollideWorldBounds(true)
    .setBounce(PLAYER_BOUNCE)       // Отскок при приземлении
    .setGravityY(PLAYER_GRAVITY)    // Гравитация
    .setDepth(2);                   // Z-индекс
}
```

### Платформы

```typescript
createPlatforms(): void {
  const { width, height } = this.sys.game.canvas;
  this.platforms = this.physics.add.staticGroup();
  const platform = this.platforms.create(0, height, `${this.prefix}-ground`);
  platform.setOrigin(0.5, 0.5)
    .setDepth(-1000)
    .setBounce(0)
    .setImmovable(true)
    .setAlpha(0);  // Невидимая платформа
  
  // Коллизия игрока с платформами
  this.physics.add.collider(this.player, this.platforms);
}
```

## Интеграция с React

### Zustand Store

```typescript
interface MoveSceneState {
  isMoving: boolean;           // Двигается ли игрок
  isQuizVisible: boolean;      // Видим ли квиз
  backgroundMusic: string | null;
  
  setMoving: (moving: boolean) => void;
  setQuizVisible: (visible: boolean) => void;
}
```

### Синхронизация состояния

```typescript
// Обновление состояния движения
handleMovementState(isMoving: boolean): void {
  if (isMoving !== this.isMovingInternal) {
    this.isMovingInternal = isMoving;
    // Обновляем состояние в Zustand-сторе
    useMoveSceneStore.getState().setMoving(isMoving);

    if (isMoving) {
      this.player.play(`${this.prefix}-start_walking`, true);
      this.player.once("animationcomplete", () => {
        if (this.isMovingInternal) {
          this.player.play(`${this.prefix}-walk`, true);
        }
      });
    } else {
      this.player.play(`${this.prefix}-idle`, true);
    }
  }
}
```

## Переключение сцен

### Динамическое переключение

```typescript
public switchToScene(scene: MoveScene, customData?: Partial<MoveSceneData>): void {
  // Получаем новую конфигурацию
  const newConfig = MoveSceneMapper.createSceneData(scene, customData);
  
  // Обновляем текущую конфигурацию
  this.currentConfig = newConfig;
  this.prefix = newConfig.scenePrefix ?? "MoveScene";
  this.targetX = newConfig.targetX ?? 0;
  
  // Обновляем фоновые слои
  this.updateBackgroundLayers(newConfig.backgroundLayers);
  
  // Обновляем позицию игрока
  if (this.player && newConfig.targetX !== undefined) {
    this.player.setX(newConfig.targetX);
  }
}
```

## Адаптивность

### Автоматическое масштабирование

```typescript
private handleResize = (gameSize: Phaser.Structs.Size): void => {
  const { width, height } = gameSize;
  
  // Изменение размеров параллакс слоев
  this.resizeParallaxLayers(width, height);
  
  // Обновление платформ
  if (this.platforms.getChildren().length) {
    const platform = this.platforms.getChildren()[0] as Phaser.Physics.Arcade.Sprite;
    this.resizePlatform(platform, width, height);
    platform.refreshBody();
  }
  
  // Перепозиционирование игрока
  if (this.player) {
    this.player.setX(this.targetX || width / 2);
    this.player.setY(height - GROUND_HEIGHT);
  }
};
```

Система сцен перемещения обеспечивает плавное и интерактивное передвижение персонажа с красивыми визуальными эффектами параллакса и анимации.
