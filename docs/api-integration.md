# API интеграция

Проект включает полную интеграцию с бэкенд API для управления пользователями, прогрессом игры и аналитикой действий игроков.

## Архитектура API

### Структура API клиента

```
src/api/
├── api-client.ts          # Основной HTTP клиент
├── log-activity.ts        # Логирование активности
├── generated/            # Автогенерируемые типы и клиенты
│   ├── api.ts           # OpenAPI клиент
│   ├── base.ts          # Базовые классы
│   ├── common.ts        # Общие типы
│   ├── configuration.ts  # Конфигурация
│   └── docs/           # API документация
└── index.ts            # Экспорты
```

## Основной API клиент

### Конфигурация клиента

```typescript
// api-client.ts
import axios from 'axios';
import { Configuration, AuthApi, GameStateApi, QuizAnswersApi, ActivityLogsApi } from './generated';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Настройка Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсепторы для авторизации
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Редирект на авторизацию
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
```

### API клиенты

```typescript
const configuration = new Configuration({
  basePath: API_BASE_URL,
  apiKey: (name: string) => {
    if (name === 'bearerAuth') {
      return localStorage.getItem('authToken') || '';
    }
    return '';
  },
});

// Экспорт API клиентов
export const authApi = new AuthApi(configuration, API_BASE_URL, axiosInstance);
export const gameStateApi = new GameStateApi(configuration, API_BASE_URL, axiosInstance);
export const quizAnswersApi = new QuizAnswersApi(configuration, API_BASE_URL, axiosInstance);
export const activityLogsApi = new ActivityLogsApi(configuration, API_BASE_URL, axiosInstance);
```

## Авторизация

### AuthApi - управление пользователями

```typescript
interface LoginData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  authDate: number;
  hash: string;
}

interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  sessionId: string;
}

// Авторизация через Telegram
export const loginUser = async (userData: LoginData): Promise<AuthResponseDto> => {
  try {
    const response = await authApi.login(userData);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Ошибка авторизации');
  }
};

// Получение информации о пользователе
export const getUserInfo = async (): Promise<UserResponseDto> => {
  try {
    const response = await authApi.getUserInfo();
    return response.data;
  } catch (error) {
    console.error('Failed to get user info:', error);
    throw error;
  }
};
```

### Интеграция с Telegram Web Apps

```typescript
// hooks/use-telegram.tsx
export const useTelegram = () => {
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setWebApp(tg);
    }
  }, []);

  const login = useCallback(async () => {
    if (!webApp?.initDataUnsafe?.user) {
      throw new Error('Telegram user data not available');
    }

    const userData: LoginData = {
      telegramId: webApp.initDataUnsafe.user.id.toString(),
      username: webApp.initDataUnsafe.user.username,
      firstName: webApp.initDataUnsafe.user.first_name,
      lastName: webApp.initDataUnsafe.user.last_name,
      photoUrl: webApp.initDataUnsafe.user.photo_url,
      authDate: webApp.initDataUnsafe.auth_date || Date.now(),
      hash: webApp.initDataUnsafe.hash || '',
    };

    return await authApi.login(userData);
  }, [webApp]);

  return { webApp, login };
};
```

## Управление состоянием игры

### GameStateApi - прогресс игрока

```typescript
interface CreatePlayerStateDto {
  userId: string;
  sessionId: string;
  health: number;
  energy: number;
  hunger: number;
  currentEpisode?: Episode;
  checkPoint?: string;
}

interface UpdatePlayerStateDto {
  health?: number;
  energy?: number;
  hunger?: number;
  currentEpisode?: Episode;
  checkPoint?: string;
}

// Создание/обновление состояния игрока
export const createOrUpdatePlayerState = async (data: CreatePlayerStateDto) => {
  try {
    const response = await gameStateApi.createOrUpdatePlayerState(data);
    return response.data;
  } catch (error) {
    console.error('Failed to save player state:', error);
    throw error;
  }
};

// Получение состояния игрока
export const getPlayerState = async (): Promise<PlayerStateResponseDto> => {
  try {
    const response = await gameStateApi.getPlayerState();
    return response.data;
  } catch (error) {
    console.error('Failed to get player state:', error);
    throw error;
  }
};
```

### Автоматическое сохранение

```typescript
// В PlayerStore
savePlayerState: async () => {
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

    console.log('Player state saved successfully');
  } catch (error) {
    logAppError("Player State Save", error);
  }
},
```

## Система аналитики

### ActivityLogsApi - логирование действий

```typescript
interface CreateActivityLogDto {
  userId: string;
  sessionId: string;
  action: string;
  [key: string]: any;  // Дополнительные данные
}

interface ActivityLogResponseDto {
  id: string;
  userId: string;
  sessionId: string;
  action: string;
  metadata: Record<string, any>;
  timestamp: string;
}
```

### Централизованное логирование

```typescript
// log-activity.ts
export const logActivity = async (
  action: string,
  metadata: Record<string, any>,
  scene?: string
): Promise<void> => {
  try {
    const { user, sessionId, token } = useAuthStore.getState();
    
    if (!user?.id || !sessionId || !token) {
      console.warn('Cannot log activity: missing auth data');
      return;
    }

    const activityData: CreateActivityLogDto = {
      userId: user.id,
      sessionId,
      action,
      ...metadata,
      scene,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
    };

    await activityLogsApi.createActivityLog(activityData);
    console.log(`Activity logged: ${action}`, metadata);
    
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Не прерываем игру из-за ошибок аналитики
  }
};
```

### Типы событий аналитики

```typescript
// Переходы между сценами
await logActivity("scene_change", {
  fromScene: "Intro",
  toScene: "GameMap",
  transitionTime: 1500
});

// Действия игрока
await logActivity("player_choice", {
  choiceId: "intro_choice_1",
  selectedOption: "Ладно, дед, я в игре",
  availableOptions: ["Вариант 1", "Вариант 2", "Вариант 3"]
});

// Игровые события
await logActivity("minigame_completed", {
  gameType: "detective",
  score: 100,
  timeSpent: 120,
  itemsFound: 7
});

// Ошибки
await logActivity("error_occurred", {
  errorType: "network",
  errorMessage: "Failed to save state",
  stackTrace: error.stack
});
```

## Квизы и опросы

### QuizAnswersApi - система опросов

```typescript
interface CreateQuizAnswerDto {
  questionId: string;
  selectedAnswer: string;
  allAnswers: string[];
  timeSpent: number;
  scene: string;
}

interface QuizAnswerResponseDto {
  id: string;
  questionId: string;
  selectedAnswer: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// Сохранение ответа на квиз
export const submitQuizAnswer = async (answerData: CreateQuizAnswerDto) => {
  try {
    const response = await quizAnswersApi.createQuizAnswer(answerData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit quiz answer:', error);
    throw error;
  }
};

// Получение статистики ответов
export const getQuizStatistics = async (): Promise<QuizAnswerResponseDto[]> => {
  try {
    const response = await quizAnswersApi.getQuizAnswers();
    return response.data;
  } catch (error) {
    console.error('Failed to get quiz statistics:', error);
    throw error;
  }
};
```

## Обработка ошибок

### Централизованная обработка ошибок

```typescript
// utils/log-app-error.ts
export const logAppError = async (context: string, error: unknown) => {
  const errorData = {
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error(`[${context}]`, errorData);

  // Отправляем на сервер
  try {
    await logActivity("error_occurred", errorData);
  } catch (logError) {
    console.error('Failed to log error to server:', logError);
  }
};
```

### Retry механизм

```typescript
// Утилита для повторных попыток
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.warn(`API call failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Экспоненциальная задержка
    }
  }
  throw new Error('All retry attempts failed');
};
```

## Кэширование

### React Query интеграция

```typescript
// hooks/use-player-state.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';

export const usePlayerStateQuery = () => {
  return useQuery(
    'playerState',
    getPlayerState,
    {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      refetchOnWindowFocus: false,
    }
  );
};

export const useUpdatePlayerStateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    createOrUpdatePlayerState,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('playerState');
      },
      onError: (error) => {
        logAppError('Update Player State', error);
      },
    }
  );
};
```

## Типизация

### Автогенерация типов

API типы автоматически генерируются из OpenAPI спецификации:

```bash
# Генерация API клиента из OpenAPI схемы
npx openapi-generator-cli generate -i http://localhost:3000/api-docs-json -g typescript-axios -o src/api/generated
```

### Расширение типов

```typescript
// Расширение базовых типов для специфичных нужд
interface ExtendedPlayerState extends PlayerStateResponseDto {
  // Дополнительные поля для фронтенда
  lastSaveTime?: Date;
  isDirty?: boolean;
  syncStatus?: 'synced' | 'pending' | 'error';
}
```

API интеграция обеспечивает надежное взаимодействие с бэкендом, автоматическое сохранение прогресса и детальную аналитику действий игроков.
