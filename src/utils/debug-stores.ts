// ВАЖНО: не импортируем сторы на верхнем уровне, чтобы избежать
// цикла зависимостей и ошибки вида
// "ReferenceError: can't access lexical declaration 'useSceneStore' before initialization".
// Сторы подгружаются динамически внутри initDebugStores().

/**
 * Утилита для отладки Zustand-сторов через консоль браузера
 *
 * Использование:
 * 1. В консоли браузера доступны:
 *    - window.__STORES__ - все сторы
 *    - window.__getState__ - получить текущее состояние стора
 *    - window.__setState__ - изменить состояние стора
 *    - window.__resetState__ - сбросить состояние игрока
 *
 * Примеры:
 * - window.__getState__('scene') - получить состояние сцены
 * - window.__setState__('player', { energy: 100 }) - установить энергию игрока
 * - window.__resetState__() - сбросить прогресс игрока
 */

interface StoreHook {
  getState: () => unknown;
  setState: (newState: Record<string, unknown>) => void;
}

interface StoreRegistry {
  scene: StoreHook;
  player: StoreHook;
  auth: StoreHook;
  story: StoreHook;
  move: StoreHook;
  settings: StoreHook;
  // Индекс-сигнатура для доступа по строковому ключу
  [key: string]: StoreHook;
}

let stores: StoreRegistry | null = null;

const ensureStores = (): StoreRegistry => {
  if (!stores) {
    throw new Error(
      "Debug stores are not initialized yet. Call initDebugStores() after app mount.",
    );
  }
  return stores;
};

// Получить состояние стора
const getState = (storeName: keyof StoreRegistry) => {
  const registry = ensureStores();
  if (!registry[storeName]) {
    console.error(`Стор "${storeName}" не найден. Доступные сторы:`, Object.keys(registry));
    return null;
  }
  return registry[storeName].getState();
};

// Изменить состояние стора
const setState = (storeName: keyof StoreRegistry, newState: Record<string, any>) => {
  const registry = ensureStores();
  if (!registry[storeName]) {
    console.error(`Стор "${storeName}" не найден. Доступные сторы:`, Object.keys(registry));
    return;
  }

  try {
    registry[storeName].setState(newState);
    console.log(`✅ Состояние "${storeName}" обновлено:`, newState);
    console.log("📊 Текущее состояние:", getState(storeName));
  } catch (error) {
    console.error(`❌ Ошибка при обновлении состояния "${storeName}":`, error);
  }
};

// Сбросить состояние игрока
const resetState = async () => {
  try {
    const registry = ensureStores();
    const player = registry.player.getState() as Record<string, unknown>;
    const reset = player["resetProgress"] as (() => Promise<void>) | undefined;
    if (typeof reset === "function") {
      await reset();
    } else {
      throw new Error("Метод resetProgress не найден в player store");
    }
    console.log("✅ Прогресс игрока сброшен");
    console.log("📊 Текущее состояние:", getState("player"));
  } catch (error) {
    console.error("❌ Ошибка при сбросе прогресса:", error);
  }
};

// Вызов методов стора
const callStoreMethod = (
  storeName: keyof StoreRegistry,
  methodName: string,
  ...args: any[]
) => {
  const registry = ensureStores();
  if (!registry[storeName]) {
    console.error(`Стор "${storeName}" не найден. Доступные сторы:`, Object.keys(registry));
    return;
  }

  const store = registry[storeName].getState() as Record<string, unknown>;

  const method = store[methodName];
  if (typeof method !== "function") {
    console.error(
      `Метод "${methodName}" не найден в сторе "${storeName}". Доступные методы:`,
      Object.keys(store).filter((key) => typeof store[key] === "function"),
    );
    return;
  }

  try {
    const result = (method as (...params: unknown[]) => unknown)(...args);
    console.log(`✅ Метод "${methodName}" стора "${storeName}" вызван с аргументами:`, args);
    return result;
  } catch (error) {
    console.error(`❌ Ошибка при вызове метода "${methodName}" стора "${storeName}":`, error);
  }
};

// Экспортируем функции в глобальное пространство имен
declare global {
  interface Window {
    __STORES__: StoreRegistry;
    __getState__: typeof getState;
    __setState__: typeof setState;
    __resetState__: typeof resetState;
    __callStoreMethod__: typeof callStoreMethod;
  }
}

export const initDebugStores = (): void => {
  // Динамически подгружаем сторы, чтобы исключить циклические зависимости на этапе
  // загрузки модулей. Выполняем асинхронно, не блокируя рендер.
  void (async () => {
    const state = await import("@core/state");
    stores = {
      scene: state.useSceneStore as unknown as StoreHook,
      player: state.usePlayerState as unknown as StoreHook,
      auth: state.useAuthStore as unknown as StoreHook,
      story: state.useStoryStore as unknown as StoreHook,
      move: state.useMoveSceneStore as unknown as StoreHook,
      settings: state.useSettingsStore as unknown as StoreHook,
    };

    window.__STORES__ = ensureStores();
    window.__getState__ = getState;
    window.__setState__ = setState;
    window.__resetState__ = resetState;
    window.__callStoreMethod__ = callStoreMethod;

    console.log("🛠️ Инструменты отладки сторов инициализированы");
    console.log("📚 Доступные сторы:", Object.keys(ensureStores()));
    console.log("📖 Документация по использованию:");
    console.log("  • window.__getState__(storeName) - получить состояние стора");
    console.log("  • window.__setState__(storeName, newState) - изменить состояние стора");
    console.log("  • window.__resetState__() - сбросить прогресс игрока");
    console.log("  • window.__callStoreMethod__(storeName, methodName, ...args) - вызвать метод стора");
    console.log("  • window.__STORES__ - доступ ко всем сторам");
  })();
};
