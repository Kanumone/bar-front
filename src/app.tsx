import React, { useCallback, useEffect, useRef, useState } from "react";
import "./global.css";
import { gameFlowManager } from "$services/game-flow";
import { useSceneStore } from "./core/state/scene-store";
import { initDebugStores } from "./utils/debug-stores";
import {
  AuthSceneWrapper,
  GameMapSceneWrapper,
  Game2048SceneWrapper,
  SlidesWrapper,
  CookingGameSceneWrapper,
} from "./ui/scenes";
import { DetectiveGame, TretyakovGame } from "$features/detective-game";
import { useAuth } from "./core/hooks";
import { FlyingGameSceneWrapper } from "./ui/scenes/flying-game-scene-wrapper";
import { GameScene } from "@core/types/common-types";
import { Layout } from "./ui/layout/";
import { introSlidesConfig, railwayStationSlidesConfig, moscowSlidesConfig, kazanSlidesConfig } from "$features/slides/configs";
import { MoveWrapper } from "$ui/scenes/move-wrapper";
import { GameConstants } from "$core/constants/constants";
import { getAssetsPathByType } from "$utils/get-assets-path";

export const App: React.FC = () => {
  useAuth();
  const phaserCanvasRef = useRef<HTMLDivElement>(null);
  const currentScene = useSceneStore((state) => state.currentScene);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (phaserCanvasRef.current) {
      // Стартуем воркер автосохранения на всякий случай (идемпотентно)
      gameFlowManager.initializeGame(phaserCanvasRef.current.id)
      .catch(() => {})
      .finally(() => {
        setIsInitializing(false);
      });
    }

    // Инициализация инструментов отладки
    if (GameConstants.DEBUG_MODE) {
      initDebugStores();
    }
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
      case GameScene.Kazan:
        return <SlidesWrapper config={kazanSlidesConfig} />;
        
      // games
      case GameScene.CookingGame:
        return <CookingGameSceneWrapper />;
      case GameScene.FlyingGame:
        return <FlyingGameSceneWrapper />;
      case GameScene.DetectiveGame:
        return <DetectiveGame />;
      case GameScene.TretyakovGame:
        return <TretyakovGame />;

      // move scenes
      case GameScene.MoveToTrain:
      case GameScene.MoveAfterTrain:
      case GameScene.MoveToVdnh:
      case GameScene.MoveToGallery:
      case GameScene.MoveToKazan:
        return <MoveWrapper />;

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
      {isInitializing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `url(${getAssetsPathByType({ type: "images", filename: "ui/login-background.png" })})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 1000,
          }}
        />
      )}
      {currentScene === GameScene.Auth ? scene : <Layout>{scene}</Layout>}
    </div>
  );
};
