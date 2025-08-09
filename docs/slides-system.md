# Система слайдов (Визуальная новелла)

Система слайдов является основой визуальной новеллы и обеспечивает показ истории через последовательность изображений с текстом, выборами и интерактивными элементами.

## Архитектура системы

### Основные компоненты

1. **Episode** - базовый класс слайда
2. **SlidesConfig** - конфигурация сцены слайдов  
3. **SlidesWrapper** - React компонент для отображения
4. **Navigation hooks** - логика навигации и эффектов

## Структура слайда (Episode)

### Базовая конфигурация

```typescript
interface EpisodeConfig {
  slideIndex: number;           // Индекс слайда
  filename: string;            // Имя файла изображения
  originX?: number;           // Точка фокуса по X (0-1)
  originY?: number;           // Точка фокуса по Y (0-1)  
  positionX?: number;         // Позиция слайда по X (0-1)
  positionY?: number;         // Позиция слайда по Y (0-1)
  startSound?: string;        // Звук при начале слайда
  backgroundSound?: string;   // Фоновый звук
  actions?: EpisodeAction[];  // Интерактивные действия
}
```

### Типы действий

#### 1. Сообщения
```typescript
{
  type: "message",
  characterName: "Алексей", 
  text: "Текст сообщения от персонажа"
}
```

#### 2. Мысли персонажа
```typescript
{
  type: "thoughts",
  characterName: "Алексей",
  text: "Внутренний монолог персонажа"
}
```

#### 3. Речь персонажа
```typescript
{
  type: "speech", 
  characterName: "Мама",
  text: "Диалог с другими персонажами"
}
```

#### 4. Выбор ответа
```typescript
{
  type: "choice",
  characterName: "Алексей",
  options: [
    "Вариант ответа 1",
    "Вариант ответа 2", 
    "Вариант ответа 3"
  ]
}
```

#### 5. Интерактивная кнопка
```typescript
{
  type: "button",
  characterName: "Алексей",
  button: {
    text: "▶ Включить кассету",
    sound: "sound-file.mp3",  // Опциональный звук
    action: () => {
      // Действие при нажатии
      gameFlowManager.showNextScene();
    }
  }
}
```

## Конфигурация сцены

### SlidesConfig

```typescript
interface SlidesConfig {
  getSlides: () => Episode[];      // Функция получения слайдов
  sceneConfig: SlidesSceneConfig;  // Настройки сцены
}

interface SlidesSceneConfig {
  scene: string;              // Идентификатор сцены
  backgroundMusic?: string;   // Фоновая музыка
  effects?: {
    canSkipDelay?: number;      // Задержка перед возможностью пропуска
    imageLoadDelay?: number;    // Задержка загрузки изображения
  };
}
```

### Пример конфигурации

```typescript
export const introSlidesConfig: SlidesConfig = {
  getSlides: getIntroSlides,
  sceneConfig: {
    scene: "intro",
    backgroundMusic: "rain-on-window-29298.mp3",
    effects: {
      canSkipDelay: 1000,    // 1 секунда до появления кнопки пропуска
      imageLoadDelay: 500,   // 0.5 секунды на загрузку изображения
    },
  },
};
```

## Создание слайдов

### Определение эпизодов

```typescript
const introConfig: EpisodeConfig[] = [
  {
    slideIndex: 1,
    filename: "frame-36.jpg",
    originX: 0,
    positionX: 0,
    actions: [{
      type: "message",
      characterName: "Алексей", 
      text: "Ты дома. Это твоя комната..."
    }],
  },
  {
    slideIndex: 2,
    filename: "frame-28.jpg",
    originX: 0.7,
    positionX: 0.7,
    actions: [{
      type: "choice",
      characterName: "Алексей",
      options: [
        "Похоже на квест.",
        "Ну... допустим. Раз уж посылка пришла - надо ехать.",
        "Ладно, дед, я в игре."
      ]
    }]
  }
];
```

### Генерация Episode объектов

```typescript
export function getIntroSlides(): Episode[] {
  const episodes: Episode[] = [];
  introConfig.forEach((config) => {
    const episode = new Episode({
      ...config,
      scene: "intro",  // Добавляем контекст сцены
    });
    episodes.push(episode);
  });
  return episodes;
}
```

## Навигация и эффекты

### Хук навигации

```typescript
const {
  slideIndex,      // Текущий индекс слайда
  actionIndex,     // Текущий индекс действия
  currentSlide,    // Текущий слайд
  currentActions,  // Действия текущего слайда
  canSkip,         // Можно ли пропустить
  goNext,          // Переход к следующему
  handleActionButtonClick,  // Обработка кнопок
  handleChoiceSelect,       // Обработка выборов
} = useSlidesNavigation(slides, playSceneSound, sceneId);
```

### Система звуков

```typescript
const { playSceneSound, setCurrentSlide } = useSlideSounds();

// Звуки привязываются к слайдам и действиям
useEffect(() => {
  if (currentSlide) setCurrentSlide(currentSlide);
}, [currentSlide, setCurrentSlide]);
```

### Фоновая музыка

```typescript
useBackgroundMusic({
  filename: config.sceneConfig.backgroundMusic || "default.mp3",
  scene: config.sceneConfig.scene || "intro",
});
```

## Позиционирование и анимации

### Система позиционирования

- **originX/originY** - точка фокуса изображения (0-1)
- **positionX/positionY** - позиция слайда в окне (0-1)

```typescript
// CSS Transform для позиционирования
const translateX = -currentSlide.originX * 100;
const translateY = -currentSlide.originY * 100;

<img 
  style={{
    objectPosition: `${currentSlide.originX * 100}% ${currentSlide.originY * 100}%`,
    left: `${currentSlide.positionX * 100}%`,
    top: `${currentSlide.positionY * 100}%`,
    transform: `translate(${translateX}%, ${translateY}%)`,
  }}
/>
```

### Анимации переходов

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentSlide.key}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
```

## Интеграция с игровым процессом

### Переходы между сценами

```typescript
{
  type: "button",
  button: {
    text: "▶ Начать путь",
    action: () => {
      gameFlowManager.showDetectiveGame();  // Переход к мини-игре
    },
  },
}
```

### Логирование активности

Система автоматически логирует:
- Переходы между слайдами
- Выборы игрока
- Время просмотра слайдов

```typescript
await logActivity("slide_viewed", {
  slideIndex,
  timeSpent,
  choices: selectedChoices
}, currentScene);
```

## Локализация и ассеты

### Путь к ресурсам

```typescript
// Автоматическое определение пути к изображениям сцены
const imagePath = getAssetsPathByType({
  type: "images",
  scene: "intro",           // Папка сцены
  filename: "frame-36.jpg"  // Файл изображения
});
```

### Поддержка разных форматов

- **Изображения**: JPG, PNG, SVG
- **Звуки**: MP3, WAV
- **Анимации**: CSS + Framer Motion

Система слайдов обеспечивает гибкий и расширяемый механизм для создания визуальных новелл с богатыми интерактивными возможностями.
