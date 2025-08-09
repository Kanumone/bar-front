# Управление состоянием

Проект использует **Zustand** для управления глобальным состоянием приложения. Состояние разделено на несколько специализированных stores для лучшей организации и производительности.

## Архитектура состояния

### Основные stores

1. **SceneStore** - управление сценами и переходами
2. **PlayerStore** - состояние игрока (здоровье, энергия, прогресс)
3. **AuthStore** - авторизация и пользовательские данные
4. **MoveSceneStore** - состояние сцен движения
5. **SettingsStore** - настройки игры
6. **StoryStore** - прогресс по сюжету

## 1. SceneStore

### Интерфейс состояния

```typescript
interface SceneState {
  prevScene: SceneName | null;              // Предыдущая сцена
  currentScene: SceneName;                  // Текущая сцена
  sceneData: SceneDataMap[SceneName];      // Данные сцены
  backgroundLayers: SceneBackground | null; // Фоновые слои
  slidesConfig?: SlidesConfig;             // Конфигурация слайдов
  
  // Методы
  setScene: <T extends SceneName>(scene: T, data: SceneDataMap[T] | null) => Promise<void>;
  setBackgroundLayers: (layers: SceneBackground) => void;
  setSlidesConfig: (config?: SlidesConfig) => void;
  backToPrevScene: () => void;
}
```

### Типизированные данные сцен

```typescript
interface SceneDataMap {
  Auth: null;
  Intro: null;
  MoveScene: MoveSceneData;
  GameMap: GameMapSceneData;
  Game2048: null;
  MoveToTrain: MoveSceneData | null;
  DetectiveGame: null;
  TretyakovGame: null;
  RailwayStation: null;
  CookingGame: null;
  MoveAfterTrain: null;
  FlyingGame: null;
  GameFood: null;
  Moscow: null;
  Move: MoveSceneData;
}

type SceneName = keyof SceneDataMap;
```

### Логика переключения сцен

```typescript
setScene: async (scene, data) => {
  const prevScene = get().currentScene;

  set({
    prevScene,
    currentScene: scene,
    sceneData: data
  });
  
  try {
    const { user, sessionId, token } = useAuthStore.getState();

    if (user?.id && sessionId && token) {
      await logActivity("scene_change", {
        userId: user.id,
        sessionId,
        action: "scene_change",
        fromScene: prevScene,
        toScene: scene,
        sceneData: data,
      }, scene);

      console.log(`[Scene Change]: ${prevScene} → ${scene}`);
    }
  } catch (err: unknown) {
    logAppError("Scene Change Logging", err);
  }
},
```

## 2. PlayerStore

### Состояние игрока

```typescript
interface PlayerState {
  // Основные характеристики
  health: number;           // Здоровье (0-100)
  energy: number;          // Энергия (0-100)
  hunger: number;          // Голод (0-100)
  
  // Прогресс
  currentEpisode: Episode | null;
  checkPoint: string | null;
  unlockedAchievements: string[];
  
  // Методы управления
  increaseHealth: (amount?: number) => void;
  decreaseHealth: (amount?: number) => void;
  increaseEnergy: (amount?: number) => void;
  decreaseEnergy: (amount?: number) => void;
  setHunger: (value: number) => void;
  
  // Прогресс и сохранение
  setCurrentEpisode: (episode: Episode) => void;
  setCheckPoint: (checkpoint: string) => void;
  loadPlayerState: () => Promise<void>;
  savePlayerState: () => Promise<void>;
}
```

### Автоматическое сохранение

```typescript
// Сохранение состояния при изменении ключевых параметров
const saveState = async () => {
  try {
    const { user, sessionId, token } = useAuthStore.getState();
    if (!user?.id || !sessionId || !token) return;

    const currentState = get();
    await createOrUpdatePlayerState({
      userId: user.id,
      sessionId,
      health: currentState.health,
      energy: currentState.energy,
      hunger: currentState.hunger,
      currentEpisode: currentState.currentEpisode,
      checkPoint: currentState.checkPoint,
    });
  } catch (error) {
    logAppError("Player State Save", error);
  }
};

// Автовызов при изменении важных полей
increaseHealth: (amount = 10) => {
  set((state) => ({
    health: Math.min(100, state.health + amount)
  }));
  saveState();
},
```

## 3. AuthStore

### Авторизация пользователя

```typescript
interface AuthState {
  user: UserResponseDto | null;
  token: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Методы авторизации
  login: (userData: LoginData) => Promise<void>;
  logout: () => void;
  setUser: (user: UserResponseDto) => void;
  setToken: (token: string) => void;
  setSessionId: (sessionId: string) => void;
  clearError: () => void;
}
```

### Интеграция с Telegram

```typescript
login: async (userData: LoginData) => {
  set({ isLoading: true, error: null });
  
  try {
    const response = await authApi.login(userData);
    
    set({
      user: response.user,
      token: response.token,
      sessionId: response.sessionId,
      isAuthenticated: true,
      isLoading: false,
    });
    
    // Сохранение в localStorage
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('sessionId', response.sessionId);
    
  } catch (error) {
    set({ 
      error: error.message,
      isLoading: false,
      isAuthenticated: false 
    });
    logAppError("Auth Login", error);
  }
},
```

## 4. MoveSceneStore

### Состояние сцен движения

```typescript
interface MoveSceneState {
  isMoving: boolean;                    // Двигается ли персонаж
  isQuizVisible: boolean;              // Видим ли квиз
  backgroundMusic: string | null;       // Фоновая музыка
  
  setMoving: (moving: boolean) => void;
  setQuizVisible: (visible: boolean) => void;
  setBackgroundMusic: (music: string | null) => void;
}
```

### Синхронизация с Phaser

```typescript
// В MovePhaserScene
handleMovementState(isMoving: boolean): void {
  if (isMoving !== this.isMovingInternal) {
    this.isMovingInternal = isMoving;
    // Обновляем Zustand store
    useMoveSceneStore.getState().setMoving(isMoving);
    
    // Логика анимации
    if (isMoving) {
      this.player.play(`${this.prefix}-start_walking`, true);
    } else {
      this.player.play(`${this.prefix}-idle`, true);
    }
  }
}
```

## 5. SettingsStore

### Настройки игры

```typescript
interface SettingsState {
  // Аудио настройки
  musicVolume: number;        // Громкость музыки (0-1)
  soundVolume: number;        // Громкость звуков (0-1)
  isMusicEnabled: boolean;    // Включена ли музыка
  isSoundEnabled: boolean;    // Включены ли звуки
  
  // Игровые настройки
  textSpeed: number;          // Скорость текста (1-5)
  autoPlay: boolean;          // Автопроигрывание
  skipSeenText: boolean;      // Пропуск прочитанного
  
  // Настройки интерфейса
  language: string;           // Язык интерфейса
  theme: 'light' | 'dark';   // Тема оформления
  
  // Методы
  setMusicVolume: (volume: number) => void;
  setSoundVolume: (volume: number) => void;
  toggleMusic: () => void;
  toggleSound: () => void;
  setTextSpeed: (speed: number) => void;
  setLanguage: (lang: string) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}
```

## 6. StoryStore

### Прогресс по сюжету

```typescript
interface StoryState {
  // Прогресс
  completedScenes: string[];      // Завершенные сцены
  unlockedCities: string[];       // Открытые города
  collectedItems: string[];       // Собранные предметы
  madeChoices: Record<string, string>; // Сделанные выборы
  
  // Статистика
  totalPlayTime: number;          // Общее время игры
  currentSession: number;         // Время текущей сессии
  scenesVisited: number;         // Количество посещенных сцен
  
  // Методы
  completeScene: (sceneId: string) => void;
  unlockCity: (cityId: string) => void;
  collectItem: (itemId: string) => void;
  makeChoice: (choiceId: string, choice: string) => void;
  updatePlayTime: () => void;
  getProgress: () => number;      // Процент прохождения
}
```

## Хуки для доступа к состоянию

### Типизированные селекторы

```typescript
// Базовые хуки
export const useSceneStore = create<SceneState>(...);
export const usePlayerState = create<PlayerState>(...);
export const useAuthStore = create<AuthState>(...);

// Кастомные хуки с селекторами
export const useCurrentScene = () => {
  return useSceneStore(state => state.currentScene);
};

export const usePlayerStats = () => {
  return usePlayerState(state => ({
    health: state.health,
    energy: state.energy,
    hunger: state.hunger,
  }));
};

export const useIsAuthenticated = () => {
  return useAuthStore(state => state.isAuthenticated);
};
```

### Композитные хуки

```typescript
// Хук для игрового состояния
export const useGameState = () => {
  const currentScene = useCurrentScene();
  const playerStats = usePlayerStats();
  const isAuth = useIsAuthenticated();
  
  return {
    currentScene,
    playerStats,
    isAuth,
    canPlay: isAuth && playerStats.health > 0,
  };
};
```

## Middleware и DevTools

### Логирование изменений

```typescript
const loggerMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get());
      set(...args);
      console.log('New state:', get());
    },
    get,
    api
  );

export const useSceneStore = create(
  loggerMiddleware(
    (set, get) => ({
      // store logic
    })
  )
);
```

### Персистентность

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // settings logic
    }),
    {
      name: 'game-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

## Оптимизация производительности

### Селекторы для предотвращения лишних рендеров

```typescript
// Плохо - компонент перерендерится при любом изменении store
const Component = () => {
  const store = usePlayerState();
  return <div>{store.health}</div>;
};

// Хорошо - перерендер только при изменении health
const Component = () => {
  const health = usePlayerState(state => state.health);
  return <div>{health}</div>;
};
```

### Подписка на изменения

```typescript
// Подписка на конкретные изменения
useEffect(() => {
  const unsubscribe = usePlayerState.subscribe(
    (state) => state.health,
    (health) => {
      if (health <= 0) {
        gameFlowManager.showGameOver();
      }
    }
  );
  
  return unsubscribe;
}, []);
```

Система управления состоянием обеспечивает централизованное, типизированное и реактивное управление всеми аспектами игры.
