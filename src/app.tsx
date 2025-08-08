import React, { useCallback, useEffect, useRef } from "react";
import "./global.css";
import { gameFlowManager } from "./processes/game-flow/game-flow-manager";
import { useSceneStore } from "./core/state/scene-store";
import { initDebugStores } from "./utils/debug-stores";
import {
  AuthSceneWrapper,
  GameMapSceneWrapper,
  GameFoodSceneWrapper,
  Game2048SceneWrapper,
  DetectiveGameSceneWrapper,
  SlidesWrapper,
  MoveAfterTrainWrapper,
} from "./ui/scenes";
import { useAuth } from "./core/hooks";
import { FlyingGameSceneWrapper } from "./ui/scenes/flying-game-scene-wrapper";
import { GameScene } from "@core/types/common-types";
import { MoveToTrainSceneWrapper } from "./ui/scenes/move-to-train-scene-wrapper";
import { Layout } from "./ui/layout/";
import { introSlidesConfig, railwayStationSlidesConfig, moscowSlidesConfig } from "$features/slides/configs";

export const App: React.FC = () => {
  useAuth();
  const phaserCanvasRef = useRef<HTMLDivElement>(null);
  const currentScene = useSceneStore((state) => state.currentScene);

  useEffect(() => {
    if (phaserCanvasRef.current) {
      void gameFlowManager.initializeGame(phaserCanvasRef.current.id);
    }

    // Инициализация инструментов отладки
    initDebugStores();
  }, []);

  const renderSceneWrapper = useCallback(() => {
    switch (currentScene) {
      // novel slides
      case GameScene.Intro:
        return <SlidesWrapper config={introSlidesConfig} />;
      case GameScene.RailwayStation:
        return <SlidesWrapper config={railwayStationSlidesConfig} />;
      case GameScene.Moscow:
        return <SlidesWrapper config={moscowSlidesConfig} />;
      // games
      case GameScene.CookingGame:
        return <GameFoodSceneWrapper />;
      case GameScene.FlyingGame:
        return <FlyingGameSceneWrapper />;
      case GameScene.DetectiveGame:
        return <DetectiveGameSceneWrapper />;

      // move scenes
      case GameScene.MoveToTrain:
        return <MoveToTrainSceneWrapper />;
      case GameScene.MoveAfterTrain:
        return <MoveAfterTrainWrapper />;

      // others
      case GameScene.GameMap:
        return <GameMapSceneWrapper />;
      case GameScene.Game2048:
        return <Game2048SceneWrapper />;
      case GameScene.Auth:
        return <AuthSceneWrapper />;

      default:
        return null;
    }
  }, [currentScene]);

  const scene = renderSceneWrapper();

  return (
    <div id="game-container" ref={phaserCanvasRef}>
      {/* ✅ Оборачиваем сцену в Layout, кроме Auth */}
      {currentScene === GameScene.Auth ? scene : <Layout>{scene}</Layout>}
    </div>
  );
};
