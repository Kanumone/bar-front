import React from "react";
import { gameFlowManager } from "$services/game-flow";

export const Game2048SceneWrapper: React.FC = () => {
  const handleGoToMap = () => {
    gameFlowManager.showGameMap();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-opacity-70 z-10 text-white">
      <div className="text-center p-8 bg-black bg-opacity-70 rounded-lg">
        <h2 className="text-4xl font-bold mb-4">Игра: 2048!</h2>
        <p className="text-xl mb-6">Здесь будет игра 2048.</p>
        <button
          onClick={handleGoToMap}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors"
        >
          Вернуться на карту
        </button>
      </div>
    </div>
  );
};
