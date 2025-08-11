import { apiClient, UpdateGameProgressDtoCurrentSceneEnum } from "$/api";
import { LocalStorageService } from "./local-storage-service";
import { logAppError } from "$utils/log-app-error";
import { useAuthStore } from "$core/state";
import { GameConstants } from "$core/constants/constants";

/**
 * Сервис для автоматической синхронизации данных с backend
 * Отправляет накопленные изменения каждую минуту
 */
export class SyncService {
  private static instance: SyncService | null = null;
  private syncIntervalId: number | null = null;
  private isRunning = false;
  private retryCount = 0;

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
   * Запустить автоматическую синхронизацию
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[SyncService]: Already running');
      return;
    }

    this.isRunning = true;
    console.log('[SyncService]: Starting automatic sync every', GameConstants.SYNC_INTERVAL / 1000, 'seconds');

    // Запускаем первую синхронизацию сразу
    this.performSync();

    // Устанавливаем интервал для регулярной синхронизации
    this.syncIntervalId = setInterval(() => {
      this.performSync();
    }, GameConstants.SYNC_INTERVAL);
  }

  /**
   * Остановить автоматическую синхронизацию
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

    console.log('[SyncService]: Stopped');
  }

  /**
   * Выполнить принудительную синхронизацию
   */
  async forcSync(): Promise<boolean> {
    return this.performSync();
  }

  /**
   * Основной метод синхронизации
   */
  private async performSync(): Promise<boolean> {
    try {
      // Проверяем, авторизован ли пользователь
      const { user, sessionId } = useAuthStore.getState();
      if (!user?.id || !sessionId) {
        console.log('[SyncService]: Skipping sync - user not authenticated');
        return false;
      }

      // Проверяем, есть ли данные для синхронизации
      if (!LocalStorageService.needsSynchronization()) {
        console.log('[SyncService]: No data to sync');
        return true;
      }

      console.log('[SyncService]: Starting sync...');

      // Получаем данные для синхронизации
      const { playerState, gameProgress } = LocalStorageService.getDataForSync();

      // Синхронизируем состояние игрока, если нужно
      if (playerState) {
        await this.syncPlayerState(playerState);
        console.log('[SyncService]: Player state synchronized');
      }

      // Синхронизируем прогресс игры, если нужно
      if (gameProgress) {
        await this.syncGameProgress(gameProgress.checkPoint);
        console.log('[SyncService]: Game progress synchronized');
      }

      // Отмечаем данные как синхронизированные
      LocalStorageService.markAsSynced();

      // Сбрасываем счетчик попыток при успешной синхронизации
      this.retryCount = 0;

      console.log('[SyncService]: Sync completed successfully');
      return true;

    } catch (error) {
      logAppError('SyncService', error);
      
      // Увеличиваем счетчик неудачных попыток
      this.retryCount++;

      // Если превышено максимальное количество попыток, ждем до следующего интервала
      if (this.retryCount >= GameConstants.MAX_RETRY_ATTEMPTS) {
        console.error('[SyncService]: Max retry attempts reached. Will retry on next interval.');
        this.retryCount = 0;
        return false;
      }

      // Повторяем попытку через задержку
      console.log(`[SyncService]: Retry attempt ${this.retryCount}/${GameConstants.MAX_RETRY_ATTEMPTS} in ${GameConstants.RETRY_DELAY/1000} seconds`);
      setTimeout(() => {
        if (this.isRunning) {
          this.performSync();
        }
      }, GameConstants.RETRY_DELAY);

      return false;
    }
  }

  /**
   * Синхронизация состояния игрока с backend
   */
  private async syncPlayerState(playerState: any): Promise<void> {
    try {
      await apiClient.gameState.gameStateControllerUpdatePlayerState({
        energy: playerState.energy,
        hunger: playerState.hunger,
        money: playerState.money,
        inventory: playerState.inventory,
      });
    } catch (error) {
      throw new Error(`Failed to sync player state: ${error}`);
    }
  }

  /**
   * Синхронизация прогресса игры с backend
   */
  private async syncGameProgress(checkPoint: string | null): Promise<void> {
    try {
      const sceneValue: UpdateGameProgressDtoCurrentSceneEnum | undefined = (() => {
        switch (checkPoint) {
          case UpdateGameProgressDtoCurrentSceneEnum.Intro:
          case UpdateGameProgressDtoCurrentSceneEnum.Moscow:
          case UpdateGameProgressDtoCurrentSceneEnum.Kazan:
            return checkPoint as UpdateGameProgressDtoCurrentSceneEnum;
          default:
            return UpdateGameProgressDtoCurrentSceneEnum.Intro;
        }
      })();

      await apiClient.gameState.gameStateControllerUpdateGameProgress({
        currentScene: sceneValue,
      });
    } catch (error) {
      throw new Error(`Failed to sync game progress: ${error}`);
    }
  }

  /**
   * Получить информацию о состоянии сервиса
   */
  getStatus(): {
    isRunning: boolean;
    needsSync: boolean;
    lastSaveTimestamp: number;
    retryCount: number;
  } {
    return {
      isRunning: this.isRunning,
      needsSync: LocalStorageService.needsSynchronization(),
      lastSaveTimestamp: LocalStorageService.getLastSaveTimestamp(),
      retryCount: this.retryCount,
    };
  }
}

/**
 * Глобальный экземпляр сервиса синхронизации
 */
export const syncService = SyncService.getInstance();
