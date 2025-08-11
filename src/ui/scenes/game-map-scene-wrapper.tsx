import React, { useEffect } from "react";
import { gameFlowManager } from "$services/game-flow";
import { useSceneStore } from "@core/state";
import { GoButton } from "@ui/components/go-button";
import { logActivity } from "$/api/log-activity"; // Импортируем logActivity

import type { GameMapSceneData } from "../../core/types/common-types";

export const GameMapSceneWrapper: React.FC = () => {
  const sceneData = useSceneStore((state) => state.sceneData);

  const gameMapSceneData = sceneData as GameMapSceneData | undefined;

  useEffect(() => {
    // Логируем монтирование компонента-враппера MapScene
    void logActivity("wrapper_mounted", { wrapper: "GameMapSceneWrapper" }, "GameMap");
    return () => {
      // Логируем размонтирование компонента-враппера MapScene
      void logActivity("wrapper_unmounted", { wrapper: "GameMapSceneWrapper" }, "GameMap");
    };
  }, []);

  const handleGoToMoveScene = (event: React.MouseEvent) => {
    event.preventDefault();
    if (gameMapSceneData && gameMapSceneData.targetX !== undefined && gameMapSceneData.targetY !== undefined) {
      void logActivity("go_to_move_scene_button_clicked", {
        selectedCity: gameMapSceneData.selectedCity,
        targetX: gameMapSceneData.targetX,
        targetY: gameMapSceneData.targetY,
      }, "GameMap");
      gameFlowManager.showMoveScene({
        targetX: gameMapSceneData.targetX,
        targetY: gameMapSceneData.targetY,
      });
    } else {
      console.error("Недостаточно данных для перехода в MoveScene.");
      void logActivity("go_to_move_scene_data_missing", {
        selectedCity: gameMapSceneData?.selectedCity || "N/A",
        targetX: gameMapSceneData?.targetX || "N/A",
        targetY: gameMapSceneData?.targetY || "N/A",
      }, "GameMap");
    }
  };

  const showGoButton = gameMapSceneData && gameMapSceneData.selectedCity;

  return (
    <>
      {showGoButton && gameMapSceneData && (
        <GoButton
          onClick={handleGoToMoveScene}
          text={`Идти в ${gameMapSceneData.selectedCity}`}
        />
      )}
    </>
  );
};
