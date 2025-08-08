import type { SlidesConfig } from "@core/types/common-types";
import { getIntroSlides } from "./intro";
import { getRailwayStationSlides } from "./railway-station";
import { getMoscowSlides } from "./moscow";

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
    scene: "to-train-move",
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
    scene: "to-train-move",
    backgroundMusic: "Звук утреннего города.mp3",
    effects: {
      canSkipDelay: 800,
      imageLoadDelay: 300,
    },
  },
};

// ✅ Фабрика конфигураций
export const slidesConfigs = {
  intro: introSlidesConfig,
  railway: railwayStationSlidesConfig,
} as const;

export type SlidesConfigType = keyof typeof slidesConfigs;
