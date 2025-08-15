function seconds(sec: number) {
  return sec * 1000;
}

export const GameConstants = {
  SLIDE_TIMEOUT: seconds(2),
  TIMEOUT_FOR_QUESTION: seconds(15),
  SHOW_ITEMS_DESCRIPTION_TIMEOUT: seconds(4),

  // player stats
  MAX_ENERGY: 100,
  MAX_HUNGER: 50,
  ENERGY_FOR_SHEEP: 4,

  ENERGY_POINTS_PER_SECOND: 1,
  HUNGER_POINTS_PER_SECOND: 1,

  // system
  SYNC_INTERVAL: seconds(20), // Интервал синхронизации данных на сервер
  MAX_RETRY_ATTEMPTS: 3, // Максимальное количество попыток синхронизации при ошибке
  RETRY_DELAY: seconds(5), // Задержка между попытками при ошибке

  DEBUG_MODE: false,
};

if (GameConstants.DEBUG_MODE) {
  GameConstants.SLIDE_TIMEOUT = 1;
  GameConstants.TIMEOUT_FOR_QUESTION = 1;
  GameConstants.SHOW_ITEMS_DESCRIPTION_TIMEOUT = 1;
  // GameConstants.SYNC_INTERVAL = 1000;

  // GameConstants.MAX_HUNGER = 5;
}

export function lifeStatsOff() {
  GameConstants.HUNGER_POINTS_PER_SECOND = 0;
  GameConstants.ENERGY_POINTS_PER_SECOND = 0;
}

export function lifeStatsOn() {
  GameConstants.HUNGER_POINTS_PER_SECOND = 1;
  GameConstants.ENERGY_POINTS_PER_SECOND = 1;
}
