# Интерактивная карта

Интерактивная карта обеспечивает навигацию по игровому миру, позволяя игроку перемещаться между городами России и отслеживать свое местоположение.

## Архитектура системы

### Основные компоненты

1. **GameMapPhaserScene** - Phaser сцена для отображения карты
2. **GameMapSceneWrapper** - React обертка для интеграции
3. **Система городов** - интерактивные точки на карте
4. **Система навигации** - управление камерой и зумом

## GameMapPhaserScene

### Основная структура

```typescript
export default class GameMapPhaserScene extends Scene {
  private mapImage!: Phaser.GameObjects.Image;     // Основное изображение карты
  private player!: Phaser.GameObjects.Image;       // Маркер игрока
  private cities: City[] = [];                     // Массив городов
  
  private lastTouchDistance = 0;                   // Для жестов зума
  private minZoom = 0.5;                          // Минимальный зум
  private maxZoom = 3;                            // Максимальный зум  
  private currentZoom = 1;                        // Текущий зум
  private selectedCity = "";                      // Выбранный город
}
```

### Интерфейс города

```typescript
interface City {
  name: string;                              // Название города
  x: number;                                // Координата X на карте
  y: number;                                // Координата Y на карте  
  object: Phaser.GameObjects.Arc | null;    // Игровой объект
}
```

## Инициализация карты

### Загрузка ресурсов

```typescript
preload(): void {
  // Загружаем SVG карту России
  this.load.svg("map_image", getAssetsPathByType({ 
    type: "images",
    scene: "game-map",
    filename: "map.svg" 
  }));

  // Загружаем маркер игрока
  this.load.svg("player_marker", getAssetsPathByType({ 
    type: "images",
    scene: "game-map",
    filename: "player-pointer.svg" 
  }));
}
```

### Создание сцены

```typescript
create(): void {
  let playerPlace = START_POINT;
  
  // Отображаем карту
  this.mapImage = this.add.image(0, 0, "map_image").setOrigin(0, 0);
  
  const mapWidth = this.mapImage.width;
  const mapHeight = this.mapImage.height;
  
  // Настраиваем камеру
  const camera = this.cameras.main;
  camera.setBounds(0, 0, mapWidth, mapHeight);
  
  // Размещаем игрока
  this.player = this.add.image(playerPlace.x, playerPlace.y, "player_marker")
    .setScale(0.15);
  this.player.setScrollFactor(1);
  
  // Создаем города
  this.createCities();
  
  // Центрируем камеру на игроке
  camera.centerOn(this.player.x, this.player.y);
  
  // Настраиваем управление камерой
  this.setupCameraControls(camera);
}
```

## Система городов

### Конфигурация городов

```typescript
private cities: City[] = [
  { 
    name: "Москва",
    x: 400,
    y: 850,
    object: null 
  },
  { 
    name: "Санкт-Петербург",
    x: 400,
    y: 550,
    object: null 
  },
  { 
    name: "Казань",
    x: 600,
    y: 1100,
    object: null 
  },
];
```

### Создание интерактивных городов

```typescript
this.cities.forEach((city) => {
  city.object = this.add.circle(city.x, city.y, CITY_RADIUS, 0xffe600, 0.2)
    .setScrollFactor(1)
    .setAlpha(1)
    .setInteractive();

  city.object.on("pointerup", (pointer: Phaser.Input.Pointer) => {
    const distance = Phaser.Math.Distance.Between(
      pointer.downX, pointer.downY, 
      pointer.upX, pointer.upY
    );

    if (distance < TAP_THRESHOLD) {
      // Успешный тап по городу
      this.selectCity(city);
    } else {
      // Неудачный тап (было перетаскивание)
      this.logFailedTap(city, distance);
    }
  });
});
```

### Выбор города

```typescript
selectCity(city: City): void {
  // Логируем успешный выбор
  void logActivity("city_tapped_success", { 
    cityName: city.name,
    tapDistance: distance 
  }, GameScene.GameMap);

  // Центрируем камеру на городе
  camera.centerOn(city.x, city.y);
  
  // Анимация пульсации если город изменился
  if (city.name !== this.selectedCity) {
    this.startPulseAnimation(city.object as Phaser.GameObjects.Arc);
  }
  
  // Обновляем состояние в store
  useSceneStore.setState({
    currentScene: GameScene.GameMap,
    sceneData: { 
      selectedCity: city.name,
      targetX: city.x,
      targetY: city.y 
    },
  });
  
  this.selectedCity = city.name;
}
```

## Управление камерой

### Панорамирование и зум

```typescript
setupCameraControls(camera: Phaser.Cameras.Scene2D.Camera): void {
  this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    if (pointer.event instanceof TouchEvent && pointer.event.touches.length >= 1) {
      this.lastTouchDistance = 0;
    }
  });

  this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    if (!pointer.isDown) return;

    const distanceMoved = Phaser.Math.Distance.Between(
      pointer.downX, pointer.downY, 
      pointer.x, pointer.y
    );

    if (distanceMoved > TAP_THRESHOLD) {
      this.handleCameraMovement(pointer, camera);
    }
  });
}
```

### Обработка жестов

```typescript
handleCameraMovement(pointer: Phaser.Input.Pointer, camera: Phaser.Cameras.Scene2D.Camera): void {
  if (pointer.event instanceof TouchEvent) {
    if (pointer.event.touches.length === 1) {
      // Одним пальцем - панорамирование
      camera.scrollX += pointer.prevPosition.x - pointer.x;
      camera.scrollY += pointer.prevPosition.y - pointer.y;
    } 
    else if (pointer.event.touches.length === 2) {
      // Двумя пальцами - зум
      const touches = pointer.event.touches;
      const currentDistance = Phaser.Math.Distance.Between(
        touches[0].clientX, touches[0].clientY,
        touches[1].clientX, touches[1].clientY,
      );

      if (this.lastTouchDistance > 0 && currentDistance !== this.lastTouchDistance) {
        const zoomFactor = currentDistance / this.lastTouchDistance;
        this.currentZoom = Phaser.Math.Clamp(
          this.currentZoom * zoomFactor, 
          this.minZoom, 
          this.maxZoom
        );
        camera.setZoom(this.currentZoom);
      }
      this.lastTouchDistance = currentDistance;
    }
  }
}
```

## Анимации и эффекты

### Анимация выбора города

```typescript
startPulseAnimation(circle: Phaser.GameObjects.Arc): void {
  // Останавливаем предыдущие анимации
  this.tweens.killTweensOf(circle);

  // Создаем анимацию пульсации
  this.tweens.add({
    targets: circle,
    scaleX: 1.2,
    scaleY: 1.2,
    alpha: 1,
    duration: 300,
    ease: "Linear",
    repeat: 0,
    yoyo: true,
    onComplete: () => {
      circle.setAlpha(0.000001);  // Почти невидимый
      circle.setScale(1);
    },
  });
}
```

### Плавные переходы камеры

```typescript
smoothCameraTransition(targetX: number, targetY: number, duration: number = 1000): void {
  this.tweens.add({
    targets: this.cameras.main,
    scrollX: targetX - this.cameras.main.width / 2,
    scrollY: targetY - this.cameras.main.height / 2,
    duration: duration,
    ease: "Power2.easeInOut"
  });
}
```

## Состояние карты

### SceneData для карты

```typescript
interface GameMapSceneData {
  currentMapId?: string;        // ID текущей карты
  unlockedRegions?: string[];   // Открытые регионы
  selectedCity?: string;        // Выбранный город
  targetX?: number;            // Целевая позиция X
  targetY?: number;            // Целевая позиция Y
}
```

### Сохранение состояния

```typescript
// При выборе города обновляем глобальное состояние
useSceneStore.setState({
  currentScene: GameScene.GameMap,
  sceneData: { 
    selectedCity: city.name,
    targetX: city.x,
    targetY: city.y,
    unlockedRegions: [...currentRegions, city.name]
  },
});
```

## Интеграция с игровым процессом

### React обертка

```typescript
export const GameMapSceneWrapper: React.FC = () => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const sceneData = useSceneStore((state) => state.sceneData) as GameMapSceneData;
  
  return (
    <DefaultSceneWrapper className={styles.gameMapWrapper}>
      {/* Phaser сцена рендерится автоматически */}
      
      {/* UI элементы поверх карты */}
      {sceneData?.selectedCity && (
        <div className={styles.cityInfo}>
          <h3>{sceneData.selectedCity}</h3>
          <Button 
            text="Отправиться" 
            onClick={() => startJourneyToCity(sceneData.selectedCity)}
          />
        </div>
      )}
    </DefaultSceneWrapper>
  );
};
```

### Переходы к другим сценам

```typescript
startJourneyToCity(cityName: string): void {
  switch(cityName) {
    case "Москва":
      gameFlowManager.showMoscow();
      break;
    case "Казань":
      gameFlowManager.showCookingGame();
      break;
    case "Санкт-Петербург":
      gameFlowManager.showDetectiveGame();
      break;
  }
}
```

## Аналитика

### Отслеживание действий

```typescript
// Успешный выбор города
await logActivity("city_tapped_success", { 
  cityName: city.name,
  tapDistance: distance,
  currentZoom: this.currentZoom,
  timeOnMap: Date.now() - this.startTime
}, GameScene.GameMap);

// Неудачный тап
await logActivity("city_tapped_fail_drag", { 
  cityName: city.name,
  tapDistance: distance,
  attempted: true
}, GameScene.GameMap);

// Вход на карту
await logActivity("scene_enter", { 
  scene: GameScene.GameMap,
  playerPosition: { x: this.player.x, y: this.player.y }
}, GameScene.GameMap);
```

## Производительность

### Оптимизация отрисовки

- **SVG карта** для четкости на любом разрешении
- **Минимальные интерактивные элементы** - только города
- **Эффективные коллизии** - простые круги для городов
- **Ограниченный зум** - предотвращает излишнюю детализацию

### Управление памятью

```typescript
destroy(): void {
  // Очистка ресурсов при уничтожении сцены
  this.cities.forEach(city => {
    if (city.object) {
      city.object.destroy();
    }
  });
  
  this.tweens.killAll();
  super.destroy();
}
```

Интерактивная карта обеспечивает интуитивную навигацию по игровому миру с плавными анимациями и отзывчивым управлением.
