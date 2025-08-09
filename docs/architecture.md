# Архитектура проекта

## Общая архитектура

Проект построен по принципам **Clean Architecture** и **Feature-Based Architecture**, где каждая игровая функция инкапсулирована в отдельный модуль.

## Основные слои

### 1. Presentation Layer (UI)
- **React компоненты** для отображения интерфейса
- **Scene Wrappers** для интеграции Phaser с React
- **Layout система** для общего оформления

### 2. Application Layer (Core)
- **State Management** с Zustand
- **Game Flow Manager** для управления переходами между сценами
- **Hooks** для бизнес-логики

### 3. Domain Layer (Features)
- **Slides System** - механизм визуальной новеллы
- **Movement System** - система перемещения персонажа
- **Minigames** - аркадные игры
- **Interactive Map** - навигация по миру игры

### 4. Infrastructure Layer
- **API Client** для взаимодействия с бэкендом
- **Assets Management** для загрузки ресурсов
- **Sound System** для аудио
- **Analytics** для отслеживания действий игрока

## Принципы архитектуры

### 1. Разделение ответственности

#### React слой (UI)
```typescript
// Отвечает за:
- Отображение интерфейса
- Обработка пользовательского ввода
- Состояние UI компонентов
- Анимации интерфейса
```

#### Phaser слой (Game Engine)
```typescript
// Отвечает за:
- Игровую физику
- Отрисовку игровых объектов
- Игровые анимации
- Коллизии и взаимодействия
```

### 2. Управление состоянием

Используется **Zustand** для глобального состояния:

- `sceneStore` - текущая сцена и её данные
- `playerStore` - состояние игрока (здоровье, энергия, прогресс)
- `authStore` - авторизация пользователя
- `moveSceneStore` - состояние сцен движения

### 3. Feature-based организация

Каждая игровая функция является самодостаточным модулем:

```
features/
├── slides/              # Визуальная новелла
├── detective-game/      # Детективная игра
├── cooking-game/        # Кулинарная игра
├── flying-game/         # Игра-полет
├── game-map/           # Интерактивная карта
└── move-phaser-scene/  # Сцены движения
```

## Интеграция React + Phaser

### Гибридный подход

1. **React управляет** общим состоянием и UI
2. **Phaser отвечает** за игровые сцены
3. **GameFlowManager** координирует переходы

### Механизм интеграции

```typescript
// 1. React компонент создает контейнер для Phaser
<div id="game-container" ref={phaserCanvasRef}>
  {/* React UI накладывается поверх Phaser */}
  <Layout>{scene}</Layout>
</div>

// 2. GameFlowManager инициализирует Phaser игру
gameFlowManager.initializeGame(phaserCanvasRef.current.id);

// 3. Переключение сцен через единый интерфейс
gameFlowManager.showGameMap();
gameFlowManager.showMoveToTrainScene();
```

## Управление ресурсами

### Централизованная загрузка ассетов

```typescript
// utils/get-assets-path.ts
export function getAssetsPathByType({
  type,    // images, sounds, levels
  scene,   // intro, cooking, detective
  filename // конкретный файл
}): string
```

### Оптимизация загрузки

- **Lazy loading** ресурсов по сценам
- **Preloading** критических ассетов
- **Asset pooling** для переиспользования объектов

## Типизация

### Строгая типизация состояний сцен

```typescript
interface SceneDataMap {
  Auth: null;
  Intro: null;
  GameMap: GameMapSceneData;
  MoveToTrain: MoveSceneData | null;
  DetectiveGame: null;
  // ...
}

type SceneName = keyof SceneDataMap;
```

### Типизированные конфигурации

```typescript
interface SlidesConfig {
  getSlides: () => Episode[];
  sceneConfig: SlidesSceneConfig;
}
```

## Производительность

### 1. Оптимизация React
- Мемоизация компонентов
- Virtualization для больших списков
- Debouncing пользовательского ввода

### 2. Оптимизация Phaser
- Object pooling для игровых объектов
- Эффективная отрисовка спрайтов
- Управление памятью

### 3. Общие оптимизации
- Code splitting по сценам
- Сжатие ассетов
- Service Worker для кэширования

## Масштабируемость

### Добавление новых мини-игр

1. Создать feature модуль
2. Реализовать интерфейс игры
3. Добавить в GameFlowManager
4. Зарегистрировать в App.tsx

### Добавление новых сцен слайдов

1. Создать конфигурацию в `slides/configs.ts`
2. Описать эпизоды в соответствующем файле
3. Добавить метод в GameFlowManager

Архитектура позволяет легко расширять функциональность игры, поддерживая при этом чистоту кода и разделение ответственности.
