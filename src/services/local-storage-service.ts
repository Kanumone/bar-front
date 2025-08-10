import { logAppError } from "@utils/log-app-error";
import type { InventoryItem } from "@core/types/common-types";

/**
 * Интерфейс для состояния игрока в localStorage
 */
interface LocalPlayerState {
  playerName: string;
  playerGender: "boy" | "girl" | null;
  energy: number;
  hunger: number;
  money: number;
  inventory: InventoryItem[];
  checkPoint: string | null;
  lastSaved: number; // timestamp последнего сохранения
  needsSync: boolean; // флаг необходимости синхронизации
}

/**
 * Ключи для localStorage
 */
const STORAGE_KEYS = {
  PLAYER_STATE: 'bar-game-player-state',
  GAME_PROGRESS: 'bar-game-progress',
} as const;

/**
 * Сервис для работы с localStorage
 * Обеспечивает типизированное сохранение и загрузку состояния игры
 */
export class LocalStorageService {
  /**
   * Получить состояние игрока из localStorage
   */
  static getPlayerState(): LocalPlayerState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_STATE);
      if (!stored) return null;

      const state = JSON.parse(stored) as LocalPlayerState;
      
      // Валидация структуры данных
      if (this.validatePlayerState(state)) {
        return state;
      }
      
      logAppError("LocalStorage", new Error("Invalid player state structure in localStorage"));
      return null;
    } catch (error) {
      logAppError("LocalStorage", error);
      return null;
    }
  }

  /**
   * Сохранить состояние игрока в localStorage
   */
  static savePlayerState(state: Omit<LocalPlayerState, 'lastSaved' | 'needsSync'>): void {
    try {
      const stateToSave: LocalPlayerState = {
        ...state,
        lastSaved: Date.now(),
        needsSync: true,
      };

      localStorage.setItem(STORAGE_KEYS.PLAYER_STATE, JSON.stringify(stateToSave));
    } catch (error) {
      logAppError("LocalStorage", error);
    }
  }

  /**
   * Получить прогресс игры из localStorage
   */
  static getGameProgress(): { checkPoint: string | null; lastSaved: number; needsSync: boolean } | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_PROGRESS);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      logAppError("LocalStorage", error);
      return null;
    }
  }

  /**
   * Сохранить прогресс игры в localStorage
   */
  static saveGameProgress(checkPoint: string | null): void {
    try {
      const progressToSave = {
        checkPoint,
        lastSaved: Date.now(),
        needsSync: true,
      };

      localStorage.setItem(STORAGE_KEYS.GAME_PROGRESS, JSON.stringify(progressToSave));
    } catch (error) {
      logAppError("LocalStorage", error);
    }
  }

  /**
   * Получить все данные, которые нужно синхронизировать с backend
   */
  static getDataForSync(): {
    playerState: LocalPlayerState | null;
    gameProgress: { checkPoint: string | null; lastSaved: number; needsSync: boolean } | null;
  } {
    const playerState = this.getPlayerState();
    const gameProgress = this.getGameProgress();

    return {
      playerState: playerState?.needsSync ? playerState : null,
      gameProgress: gameProgress?.needsSync ? gameProgress : null,
    };
  }

  /**
   * Отметить данные как синхронизированные
   */
  static markAsSynced(): void {
    try {
      // Обновляем флаг синхронизации для состояния игрока
      const playerState = this.getPlayerState();
      if (playerState) {
        const updatedPlayerState: LocalPlayerState = {
          ...playerState,
          needsSync: false,
        };
        localStorage.setItem(STORAGE_KEYS.PLAYER_STATE, JSON.stringify(updatedPlayerState));
      }

      // Обновляем флаг синхронизации для прогресса игры
      const gameProgress = this.getGameProgress();
      if (gameProgress) {
        const updatedProgress = {
          ...gameProgress,
          needsSync: false,
        };
        localStorage.setItem(STORAGE_KEYS.GAME_PROGRESS, JSON.stringify(updatedProgress));
      }
    } catch (error) {
      logAppError("LocalStorage", error);
    }
  }

  /**
   * Очистить все данные игры из localStorage
   */
  static clearGameData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYER_STATE);
      localStorage.removeItem(STORAGE_KEYS.GAME_PROGRESS);
    } catch (error) {
      logAppError("LocalStorage", error);
    }
  }

  /**
   * Валидация структуры состояния игрока
   */
  private static validatePlayerState(state: any): state is LocalPlayerState {
    return (
      typeof state === 'object' &&
      state !== null &&
      typeof state.playerName === 'string' &&
      (state.playerGender === 'boy' || state.playerGender === 'girl' || state.playerGender === null) &&
      typeof state.energy === 'number' &&
      typeof state.hunger === 'number' &&
      typeof state.money === 'number' &&
      Array.isArray(state.inventory) &&
      (typeof state.checkPoint === 'string' || state.checkPoint === null) &&
      typeof state.lastSaved === 'number' &&
      typeof state.needsSync === 'boolean'
    );
  }

  /**
   * Проверить, нужна ли синхронизация
   */
  static needsSynchronization(): boolean {
    const playerState = this.getPlayerState();
    const gameProgress = this.getGameProgress();

    return (playerState?.needsSync === true) || (gameProgress?.needsSync === true);
  }

  /**
   * Получить timestamp последнего сохранения
   */
  static getLastSaveTimestamp(): number {
    const playerState = this.getPlayerState();
    const gameProgress = this.getGameProgress();

    const playerTimestamp = playerState?.lastSaved || 0;
    const progressTimestamp = gameProgress?.lastSaved || 0;

    return Math.max(playerTimestamp, progressTimestamp);
  }
}
