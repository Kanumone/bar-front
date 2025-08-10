function seconds(sec: number) {
  return sec * 1000;
}

export const GameConstants = {
  SLIDE_TIMEOUT: 0,
  TIMEOUT_FOR_QUESTION: 10000,
  SHOW_ITEMS_DESCRIPTION_TIMEOUT: 5000,

  // system
  SYNC_INTERVAL: seconds(60), // Интервал синхронизации данных на сервер
  MAX_RETRY_ATTEMPTS: 3, // Максимальное количество попыток синхронизации при ошибке
  RETRY_DELAY: seconds(5), // Задержка между попытками при ошибке
};
