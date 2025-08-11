import React from "react";
import { gameFlowManager } from "$services/game-flow";
import { useSceneStore } from "@core/state/scene-store";
import type { GameFoodLevelData } from "@core/types/common-types";

export const GameFoodSceneWrapper: React.FC = () => {
  const sceneData = useSceneStore((state) => state.sceneData);
  const gameFoodLevelData = sceneData as GameFoodLevelData;

  const handleGoToMap = () => {
    gameFlowManager.showGameMap();
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="absolute top-4 left-4 bg-yellow-800 bg-opacity-75 p-4 rounded-lg text-white pointer-events-auto">
        <h2 className="text-xl font-bold">Food Game</h2>
        <p className="text-md">Уровень: {gameFoodLevelData?.levelId || "Загрузка..."}</p>
      </div>

      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={handleGoToMap}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-md transition-colors"
        >
          Вернуться на карту (UI)
        </button>
      </div>
    </div>
  );
};
