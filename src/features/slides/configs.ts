import type { SlidesConfig } from "@core/types/common-types";
import { getIntroSlides } from "./intro";
import { getRailwayStationSlides } from "./railway-station";
import { getMoscowSlides } from "./moscow";
import { getKazanSlides } from "./kazan";
import { getEkbSlides } from "./ekb";
import { getIrkutskSlides } from "./irkutsk";
import { getKamchatkaSlides } from "./kamchatka";
import { getFinalSlides } from "./final";

// ✅ Конфигурация для Intro сцены
export const introSlidesConfig: SlidesConfig = {
  getSlides: getIntroSlides,
  sceneConfig: {
    scene: "intro",
    backgroundMusic: "rain-on-window-29298.mp3",
    effects: {
      canSkipDelay: 1000,
      imageLoadDelay: 500,
    },
  },
};

// ✅ Конфигурация для Railway Station сцены
export const railwayStationSlidesConfig: SlidesConfig = {
  getSlides: getRailwayStationSlides,
  sceneConfig: {
    scene: "railway-station",
    backgroundMusic: "Звук утреннего города.mp3",
    effects: {
      canSkipDelay: 800,
      imageLoadDelay: 300,
    },
  },
};

// ✅ Конфигурация для Moscow сцены
export const moscowSlidesConfig: SlidesConfig = {
  getSlides: getMoscowSlides,
  sceneConfig: {
    scene: "moscow",
    backgroundMusic: "Звук утреннего города.mp3",
    effects: {
      canSkipDelay: 800,
      imageLoadDelay: 300,
    },
  },
};

// ✅ Конфигурация для Kazan сцены
export const kazanSlidesConfig: SlidesConfig = {
  getSlides: getKazanSlides,
  sceneConfig: {
    scene: "kazan",
    backgroundMusic: "kazan-city-ambient.mp3", // TODO: подтвердить имя файла
  },
};

export const ekbSlidesConfig: SlidesConfig = {
  getSlides: getEkbSlides,
  sceneConfig: {
    scene: "ekb",
  },
};

export const irkutskSlidesConfig: SlidesConfig = {
  getSlides: getIrkutskSlides,
  sceneConfig: {
    scene: "irkutsk",
  },
};

export const kamchatkaSlidesConfig: SlidesConfig = {
  getSlides: getKamchatkaSlides,
  sceneConfig: {
    scene: "kamchatka",
  },
};

export const finalSlidesConfig: SlidesConfig = {
  getSlides: getFinalSlides,
  sceneConfig: {
    scene: "final",
  },
};

// ✅ Фабрика конфигураций
export const slidesConfigs = {
  intro: introSlidesConfig,
  railway: railwayStationSlidesConfig,
  ekb: ekbSlidesConfig,
  irkutsk: irkutskSlidesConfig,
  kamchatka: kamchatkaSlidesConfig,
  final: finalSlidesConfig,
} as const;

export type SlidesConfigType = keyof typeof slidesConfigs;
