import { useAuthStore } from "@core/state";
import { logAppError } from "@utils/log-app-error";
import { apiClient } from "$/api";

/**
 * Интерфейс для лога активности
 */
interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown>;
  sceneName: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Сервис логирования с резервным сохранением в localStorage
 * При отсутствии интернета сохраняет логи локально и отправляет при восстановлении связи
 */
export class LoggingService {
  private static readonly STORAGE_KEY = "bar-game-pending-logs";
  private static readonly MAX_PENDING_LOGS = 100;

  /**
   * Отправляет лог активности на сервер с резервным сохранением
   */
  static async logActivity(
    action: string,
    details: Record<string, unknown> = {},
    sceneName = "Unknown",
  ): Promise<void> {
    const { user, sessionId } = useAuthStore.getState();

    // Создаем объект лога
    const logEntry: ActivityLog = {
      id: this.generateLogId(),
      action,
      details: {
        ...details,
        scene: sceneName,
      },
      sceneName,
      timestamp: Date.now(),
      userId: user?.id != null ? String(user.id) : undefined,
      sessionId: sessionId || undefined,
    };

    // Если пользователь не авторизован, сохраняем лог локально для отправки позже
    if (!user?.id || !sessionId) {
      console.warn(`[Logging]: Cannot send log "${action}" immediately - user not authenticated. Saving locally.`);
      this.savePendingLog(logEntry);
      return;
    }

    try {
      // Пытаемся отправить лог немедленно (batch с одним элементом)
      await apiClient.activityLogs.activityLogControllerCreateBatch({
        logs: [
          {
            action,
            details: logEntry.details,
            sceneName,
            timestamp: new Date(logEntry.timestamp).toISOString(),
          },
        ],
      });

      console.log(`[Activity Logged - ${sceneName}]: ${action}`, details);

      // Если удалось отправить, пытаемся отправить и накопленные логи
      this.sendPendingLogs();

    } catch (error: unknown) {
      // При ошибке отправки сохраняем лог локально
      console.warn(`[Logging]: Failed to send log "${action}" immediately. Saving locally.`, error);
      this.savePendingLog(logEntry);
      logAppError(`Activity Logging (${sceneName})`, error);
    }
  }

  /**
   * Сохраняет лог в localStorage для последующей отправки
   */
  private static savePendingLog(log: ActivityLog): void {
    try {
      const pendingLogs = this.getPendingLogs();
      pendingLogs.push(log);

      // Ограничиваем количество накопленных логов
      if (pendingLogs.length > this.MAX_PENDING_LOGS) {
        pendingLogs.splice(0, pendingLogs.length - this.MAX_PENDING_LOGS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pendingLogs));
    } catch (error) {
      logAppError("LoggingService", error);
    }
  }

  /**
   * Получает накопленные логи из localStorage
   */
  private static getPendingLogs(): ActivityLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const logs = JSON.parse(stored) as ActivityLog[];
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      logAppError("LoggingService", error);
      return [];
    }
  }

  /**
   * Отправляет накопленные логи на сервер
   */
  static async sendPendingLogs(): Promise<void> {
    const { user, sessionId } = useAuthStore.getState();

    if (!user?.id || !sessionId) {
      return;
    }

    const pendingLogs = this.getPendingLogs();
    if (pendingLogs.length === 0) {
      return;
    }

    console.log(`[Logging]: Sending ${pendingLogs.length} pending logs...`);

    try {
      await apiClient.activityLogs.activityLogControllerCreateBatch({
        logs: pendingLogs.map((log) => ({
          action: log.action,
          details: log.details,
          sceneName: log.sceneName,
          timestamp: new Date(log.timestamp).toISOString(),
        })),
      });

      // Очистим локальные логи после успешной отправки
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
      console.log(`[Logging]: Successfully sent ${pendingLogs.length} pending logs`);
    } catch (error) {
      console.warn("[Logging]: Failed to send pending logs batch:", error);
    }
  }

  /**
   * Очищает все накопленные логи (например, при выходе из системы)
   */
  static clearPendingLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("[Logging]: Cleared pending logs");
    } catch (error) {
      logAppError("LoggingService", error);
    }
  }

  /**
   * Генерирует уникальный ID для лога
   */
  private static generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36)
      .substr(2, 9)}`;
  }

  /**
   * Получает статистику накопленных логов
   */
  static getPendingLogsStatus(): {
    count: number;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
  } {
    const logs = this.getPendingLogs();

    if (logs.length === 0) {
      return {
        count: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
      };
    }

    const timestamps = logs.map((log) => log.timestamp);

    return {
      count: logs.length,
      oldestTimestamp: Math.min(...timestamps),
      newestTimestamp: Math.max(...timestamps),
    };
  }
}
