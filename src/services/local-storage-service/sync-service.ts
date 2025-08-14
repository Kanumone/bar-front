import { logAppError } from "$utils/log-app-error";
import { GameConstants } from "$core/constants/constants";
import { useAuthStore } from "$core/state/auth-store";
import { usePlayerState } from "$core/state/player-store";
import { useSceneStore } from "$core/state/scene-store";
import { useSettingsStore } from "$core/state/settings-store";
import { useMoveSceneStore } from "$core/state/move-scene-store";
import { useStoryStore } from "$core/state/story-store";

/**
 * Сервис автосохранения локального состояния.
 * Раз в минуту сохраняет все zustand-сторы в localStorage.
 * Также умеет восстановить все состояния из localStorage.
 */
export class SyncService {
  private static instance: SyncService | null = null;
  private syncIntervalId: number | null = null;
  private isRunning = false;

  private static readonly PERSIST_KEY = "bar-game-stores-v1";

  /**
   * Получить единственный экземпляр сервиса (Singleton)
   */
  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Запустить автосохранение
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[SyncService]: Already running");
      return;
    }

    this.isRunning = true;
    console.log("[SyncService]: Starting autosave every", GameConstants.SYNC_INTERVAL / 1000, "seconds");

    // Сразу выполняем первое сохранение
    this.saveAllStores();

    // Устанавливаем интервал для регулярного сохранения
    this.syncIntervalId = setInterval(() => {
      this.saveAllStores();
    }, GameConstants.SYNC_INTERVAL);
  }

  /**
   * Остановить автосохранение
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }

    console.log("[SyncService]: Stopped");
  }

  /**
   * Принудительно сохранить все сторы сейчас
   */
  async forcSync(): Promise<boolean> {
    try {
      this.saveAllStores();
      return true;
    } catch (error) {
      logAppError("SyncService.forceSync", error);
      return false;
    }
  }

  /**
   * Сохранить все zustand-сторы в localStorage
   */
  private saveAllStores(): void {
    try {
      const snapshot = this.buildSnapshot();
      localStorage.setItem(SyncService.PERSIST_KEY, JSON.stringify(snapshot));
      console.log("[SyncService]: Autosaved stores at", new Date(snapshot.lastSaved).toISOString());
    } catch (error) {
      logAppError("SyncService.saveAllStores", error);
      throw error;
    }
  }

  /**
   * Построить снимок состояния для сохранения
   */
  private buildSnapshot(): { auth: unknown; player: unknown; scene: unknown; settings: unknown; move: unknown; story: unknown; lastSaved: number } {
    const authState = useAuthStore.getState();
    const playerState = usePlayerState.getState();
    const sceneState = useSceneStore.getState();
    const settingsState = useSettingsStore.getState();
    const moveState = useMoveSceneStore.getState();
    const storyState = useStoryStore.getState();

    const auth = {
      isTelegram: authState.isTelegram,
      userID: authState.userID,
      user: authState.user,
      sessionId: authState.sessionId,
      isAuthenticated: authState.isAuthenticated,
    };

    const player = {
      playerName: playerState.playerName,
      playerGender: playerState.playerGender,
      energy: playerState.energy,
      hunger: playerState.hunger,
      money: playerState.money,
      inventory: playerState.inventory,
      checkPoint: playerState.checkPoint,
    };

    const scene = {
      prevScene: sceneState.prevScene,
      currentScene: sceneState.currentScene,
      sceneData: sceneState.sceneData,
      backgroundLayers: sceneState.backgroundLayers,
      slidesConfig: sceneState.slidesConfig,
    };

    const settings = {
      isSoundEnabled: settingsState.isSoundEnabled,
    };

    const move = {
      questions: moveState.questions,
      currentIndex: moveState.currentIndex,
      isQuizVisible: moveState.isQuizVisible,
      stage: moveState.stage,
      selected: moveState.selected,
      canSkip: moveState.canSkip,
      remainTime: moveState.remainTime,
      backgroundMusic: moveState.backgroundMusic,
    };

    const story = {
      slideIndex: storyState.slideIndex,
      actionIndex: storyState.actionIndex,
      imageLoaded: storyState.imageLoaded,
      canSkip: storyState.canSkip,
      currentActions: storyState.currentActions,
      slides: storyState.slides,
      slidesScene: storyState.slidesScene,
      backgroundOverrideSrc: storyState.backgroundOverrideSrc,
      backgroundOverrideCarry: storyState.backgroundOverrideCarry,
      actionLocalState: storyState.actionLocalState,
    };

    return {
      auth,
      player,
      scene,
      settings,
      move,
      story,
      lastSaved: Date.now(),
    };
  }

  /**
   * Восстановить все zustand-сторы из localStorage
   */
  loadAllStoresFromLocal(): boolean {
    try {
      const raw = localStorage.getItem(SyncService.PERSIST_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Record<string, unknown> & { lastSaved?: number };

      type StoreLike = { setState: (updater: (state: unknown) => unknown) => void };
      const mergeIntoStore = (store: StoreLike | unknown, incoming: unknown) => {
        if (!incoming || typeof incoming !== "object") return;
        const st = store as StoreLike | undefined;
        if (!st || typeof st.setState !== "function") return;
        const data = incoming as Record<string, unknown>;
        st.setState((prev: unknown) => ({ ...(prev as Record<string, unknown>), ...data }));
      };

      // Восстанавливаем по частям
      mergeIntoStore(useAuthStore, parsed.auth);
      mergeIntoStore(usePlayerState, parsed.player);
      mergeIntoStore(useSceneStore, parsed.scene);
      mergeIntoStore(useSettingsStore, parsed.settings);
      mergeIntoStore(useMoveSceneStore, parsed.move);
      mergeIntoStore(useStoryStore, parsed.story);

      // Гарантируем безопасное состояние таймеров и движения
      useMoveSceneStore.setState({ timerId: null, consumptionTimerId: null, isMoving: false });

      console.log("[SyncService]: Restored stores from localStorage", parsed.lastSaved ? new Date(parsed.lastSaved).toISOString() : "");
      return true;
    } catch (error) {
      logAppError("SyncService.loadAllStoresFromLocal", error);
      return false;
    }
  }

  /**
   * Получить информацию о состоянии сервиса
   */
  getStatus(): {
    isRunning: boolean;
    lastSaveTimestamp: number;
  } {
    let lastSaved = 0;
    try {
      const raw = localStorage.getItem(SyncService.PERSIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { lastSaved?: number };
        lastSaved = parsed.lastSaved || 0;
      }
    } catch {
      lastSaved = 0;
    }
    return {
      isRunning: this.isRunning,
      lastSaveTimestamp: lastSaved,
    };
  }
}

/**
 * Глобальный экземпляр сервиса синхронизации
 */
export const syncService = SyncService.getInstance();
