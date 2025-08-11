import { LoggingService } from "$services/local-storage-service/logging-service";

/**
 * Отправляет лог активности на сервер с резервным сохранением в localStorage.
 * @param action Действие, которое произошло (например, "scene_enter", "city_selected").
 * @param details Дополнительные детали в виде объекта.
 * @param sceneName Имя сцены, из которой происходит логирование (для контекста).
 */
export async function logActivity(action: string, details: Record<string, unknown> = {}, sceneName = "Unknown"): Promise<void> {
  return LoggingService.logActivity(action, details, sceneName);
}
