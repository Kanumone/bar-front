import React, { useEffect, useState } from "react";
import { useSceneStore } from "../../core/state/scene-store";
import { GameScene } from "@core/types/common-types";
import styles from "./flying-game-scene-wrapper.module.css";

export const FlyingGameSceneWrapper: React.FC = () => {
  const [gameOver, setGameOver] = useState<{ score: number } | null>(null);
  const sceneStore = useSceneStore.getState();

  useEffect(() => {
    void sceneStore.setScene(GameScene.FlyingGame, null);
  }, [sceneStore]);

  useEffect(() => {
    const handleGameOver = (e: Event) => {
      const custom = e as CustomEvent<{ score: number }>;
      setGameOver({ score: custom.detail.score });
    };
    window.addEventListener("flying-game-over", handleGameOver);
    return () => window.removeEventListener("flying-game-over", handleGameOver);
  }, []);

  const restart = () => {
    setGameOver(null);
    window.dispatchEvent(new Event("flying-game-restart"));
  };

  const goToMap = () => {
    setGameOver(null);
    void sceneStore.setScene(GameScene.GameMap, {}); // ✅ переход на карту
  };

  return (
    <>
      {gameOver && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Игра окончена!</h2>
            <p>Очки: {gameOver.score}</p>
            <div className={styles.buttons}>
              <button onClick={restart}>Рестарт</button>
              <button onClick={goToMap}>Перейти к карте</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
