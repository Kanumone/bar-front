# Мини-игры

Проект включает несколько аркадных мини-игр, каждая из которых представляет собой отдельную игровую механику, интегрированную в общий игровой процесс.

## Обзор мини-игр

### 1. Детективная игра
**Тип**: Поиск объектов  
**Цель**: Найти все необходимые предметы в комнате  
**Технология**: React + CSS

### 2. Кулинарная игра  
**Тип**: Тетрис + менеджмент ресурсов  
**Цель**: Готовить блюда, собирая ингредиенты  
**Технология**: React + DnD Kit

### 3. Игра полета
**Тип**: Бесконечный раннер  
**Цель**: Избегать препятствий, собирать овец  
**Технология**: Phaser 3

### 4. Игра 2048
**Тип**: Числовая головоломка  
**Цель**: Достичь числа 2048  
**Технология**: React

## 1. Детективная игра

### Архитектура

```typescript
interface Item {
  id: string;           // Уникальный идентификатор
  name: string;         // Название предмета  
  description: string;  // Описание при находке
  emoji: string;        // Эмодзи для отображения
  found: boolean;       // Найден ли предмет
}
```

### Основная логика

```typescript
export const DetectiveGame: React.FC = () => {
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [showInventory, setShowInventory] = useState(false);
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [showFoundMessage, setShowFoundMessage] = useState(false);

  const handleItemClick = useCallback((event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const target = (event.target as HTMLElement).parentElement as HTMLElement;
    const itemID = target.id;

    const clickedItem = items.find((item) => item.id === itemID && !item.found);

    if (clickedItem) {
      clickedItem.found = true;
      setItems(items);
      setFoundItem(clickedItem);
      setShowFoundMessage(true);
      
      // Визуальная подсветка
      target.classList.add(styles.highLight);
      
      setTimeout(() => {
        setShowFoundMessage(false);
        target.classList.remove(styles.highLight);
      }, SHOW_MESSAGE_TIMEOUT);
    }
  }, [items]);
};
```

### Предметы для поиска

```typescript
const ITEMS: Item[] = [
  {
    id: "metro",
    name: "Значок метро",
    description: "Я сам его придумал. И с гордостью ношу.",
    emoji: "📍",
    found: false,
  },
  {
    id: "earpods", 
    name: "Наушники с изолентой",
    description: "Хрипят, но ближе всех. Как будто шепчут тайны.",
    emoji: "🎧",
    found: false,
  },
  // ... другие предметы
];
```

### SVG интеграция

Игра использует SVG изображение комнаты с интерактивными элементами:

```typescript
<div className={styles.svgContainer}>
  <Room handleClick={handleItemClick} />
</div>
```

## 2. Кулинарная игра

### Архитектура

Кулинарная игра сочетает элементы Тетриса с системой рецептов:

```typescript
export function CookingGame() {
  return (
    <GameProvider>
      <GameContent/>
    </GameProvider>
  );
}
```

### Компоненты системы

1. **TetrisGame** - основная игровая механика
2. **RecipeSelector** - выбор рецептов
3. **Shop** - магазин ингредиентов
4. **Score** - система очков

### Игровой контекст

```typescript
interface GameState {
  currentScreen: 'tetris' | 'recipe-book' | 'shop';
  score: number;
  selectedRecipe: Recipe | null;
  availableIngredients: Ingredient[];
}

const { state } = useGameContext();
const { goToRecipeBook, goToTetris, goToShop } = useGameNavigation();
```

## 3. Игра полета

### Phaser архитектура

```typescript
export class FlyingGameScene extends Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private rocks!: Phaser.Physics.Arcade.Group;      // Препятствия
  private sheeps!: Phaser.Physics.Arcade.Group;     // Собираемые объекты
  private clouds!: Phaser.GameObjects.Group;        // Декоративные облака
  private grass!: Phaser.GameObjects.TileSprite;    // Движущийся фон
  
  private score = 0;
  private gameOver = false;
}
```

### Управление игроком

```typescript
// Сенсорное управление
private onPointerDown = (p: Phaser.Input.Pointer): void => {
  const hit = Phaser.Geom.Rectangle.Contains(this.player.getBounds(), p.worldX, p.worldY);
  if (hit) {
    this.isDraggingPlayer = true;
    this.tapTargetX = null;
  } else {
    this.isDraggingPlayer = false;
    this.tapTargetX = Phaser.Math.Clamp(p.worldX, -WORLD_HALF + PLAYER_SIZE / 2, WORLD_HALF - PLAYER_SIZE / 2);
  }
};

// Перетаскивание игрока
private onPointerMove = (p: Phaser.Input.Pointer): void => {
  if (!this.isDraggingPlayer || !p.isDown || this.gameOver) return;
  const body = this.player.body as Phaser.Physics.Arcade.Body;
  const dxWorld = p.worldX - this.player.x;

  if (Math.abs(dxWorld) <= DRAG_DEADZONE_PX) { 
    body.setVelocityX(0); 
    return; 
  }

  const dist = Math.abs(dxWorld) - DRAG_DEADZONE_PX;
  const t = Phaser.Math.Clamp(dist / DRAG_FULL_DISTANCE, 0, 1);
  const speed = DRAG_MIN_SPEED + t * (DRAG_MAX_SPEED - DRAG_MIN_SPEED);
  body.setVelocityX(Math.sign(dxWorld) * speed);
};
```

### Система спауна объектов

```typescript
private spawnLevelElements = (): void => {
  if (this.gameOver) return;

  const viewW = this.scale.width;
  const camLeft = this.cameras.main.scrollX;
  const rangeStart = camLeft - SIDE_BUFFER_SCREENS * viewW;
  const rangeEnd = camLeft + (SIDE_BUFFER_SCREENS + 1) * viewW;
  const spawnY = this.cameras.main.scrollY - OBSTACLE_HEIGHT;

  // Размещение камней (препятствий)
  for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
    this.placeRock(rangeStart, rangeEnd, spawnY);
  }
  
  // Размещение овец (бонусов)
  for (let i = 0; i < Phaser.Math.Between(0, 2); i++) {
    this.placeSheep(rangeStart, rangeEnd, spawnY);
  }
  
  // Спавн облаков для атмосферы
  if (Math.random() < 0.7) this.spawnCloud();
};
```

### Object Pooling

```typescript
// Пул скал для оптимизации
for (let i = 0; i < 50; i++) {
  const r = this.rocks.create(0, 0, "rock") as PooledObject;
  r.setOrigin(0.5).setActive(false)
    .setVisible(false)
    .setDepth(0);
  r.body.setAllowGravity(false); 
  r.body.enable = false;
}

// Получение объекта из пула
private getPooledRock(): PooledObject | null {
  const r = this.rocks.getFirstDead(false) as PooledObject | null;
  if (!r) return null;
  r.setActive(true).setVisible(true); 
  r.body.enable = true;
  return r;
}
```

### Коллизии и геймплей

```typescript
// Столкновение с препятствием
private hitObstacle = (): void => {
  this.gameOver = true;
  this.physics.pause();
  this.player.setTint(0xff0000);

  // Уведомляем React о завершении игры
  window.dispatchEvent(new CustomEvent("flying-game-over", { 
    detail: { score: this.score } 
  }));
};

// Сбор овец
private collectSheep = (_: PhysicsCallbackObject, sheepObj: PhysicsCallbackObject): void => {
  if (!(sheepObj instanceof Phaser.GameObjects.Sprite)) return;
  const s = sheepObj as PooledObject; 
  s.disableBody(true, true);
  this.score += 1;
  this.scoreText.setText(`Очки: ${this.score}`);
  
  // Увеличиваем энергию игрока каждые 10 очков
  if (this.score % 10 === 0) {
    usePlayerState.getState().increaseEnergy();
  }
};
```

## 4. Игра 2048

### React архитектура

```typescript
export function Game2048() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
```

### Игровое поле

```typescript
interface FieldProps {
  field: number[][];      // Двумерный массив чисел
  onMove: (direction: Direction) => void;
}

export const Field: React.FC<FieldProps> = ({ field, onMove }) => {
  // Обработка свайпов и нажатий клавиш
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        onMove('up');
        break;
      case 'ArrowDown':
        onMove('down');
        break;
      case 'ArrowLeft':
        onMove('left');
        break;
      case 'ArrowRight':
        onMove('right');
        break;
    }
  }, [onMove]);
};
```

### Логика игры

```typescript
export const useGameActions = () => {
  const { field, setField, score, setScore } = useGameContext();

  const moveUp = useCallback(() => {
    const newField = [...field];
    let newScore = score;
    
    // Логика движения вверх
    for (let col = 0; col < 4; col++) {
      const column = [];
      for (let row = 0; row < 4; row++) {
        if (newField[row][col] !== 0) {
          column.push(newField[row][col]);
        }
      }
      
      // Объединение одинаковых чисел
      for (let i = 0; i < column.length - 1; i++) {
        if (column[i] === column[i + 1]) {
          column[i] *= 2;
          newScore += column[i];
          column.splice(i + 1, 1);
        }
      }
      
      // Заполнение нулями
      while (column.length < 4) {
        column.push(0);
      }
      
      // Применение изменений
      for (let row = 0; row < 4; row++) {
        newField[row][col] = column[row];
      }
    }
    
    setField(newField);
    setScore(newScore);
  }, [field, score]);
};
```

## Интеграция с основной игрой

### Переходы между играми

```typescript
// В GameFlowManager
showDetectiveGame() {
  useSceneStore.getState().setScene(GameScene.DetectiveGame, null);
}

showGameCooking() {
  useSceneStore.getState().setScene(GameScene.CookingGame, null);
}

showFlyingGame() {
  this.startPhaserScene(GameScene.FlyingGame);
}
```

### Возврат к основной игре

```typescript
// Из детективной игры
const handleNext = () => {
  useSceneStore.getState().backToPrevScene();
};

// Завершение игры с результатом
if (foundCount === totalItems) {
  return (
    <div className={styles.completionMessage}>
      🎉 Поздравляем! Вы нашли все предметы!
      <Button text="Застегнуть рюкзак" onClick={handleNext} />
    </div>
  );
}
```

### Система прогресса

```typescript
// Обновление состояния игрока после мини-игр
if (this.score % 10 === 0) {
  usePlayerState.getState().increaseEnergy();
}

// Сохранение прогресса
await usePlayerState.getState().savePlayerState();
```

## Общие принципы мини-игр

### 1. Автономность
Каждая мини-игра может работать независимо, но интегрируется с общим состоянием.

### 2. Единый стиль
Все игры используют общую систему UI компонентов и стилей.

### 3. Прогрессия
Результаты мини-игр влияют на общий прогресс игрока.

### 4. Аналитика
Все действия в мини-играх логируются для анализа.

Мини-игры обеспечивают разнообразие геймплея и дополнительную интерактивность в рамках основной визуальной новеллы.
