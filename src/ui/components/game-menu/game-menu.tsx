import React from "react";
import styles from "./style.module.css";
import { gameFlowManager } from "../../../processes";

interface GameMenuProps {
  visible: boolean;
  onClose: () => void;
  onSettings: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  onDebugAction?: (action: string) => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  visible,
  onClose,
  onSettings,
  onToggleSound,
  soundEnabled,
}) => {
  if (!visible) return null;

  const onSceneSelection = (scene: string) => {
    switch (scene) {
    case "flight":
      gameFlowManager.showFlyingGame();
      break;
    case "game-map":
      gameFlowManager.showGameMap();
      break;
    case "cooking":
      gameFlowManager.showGameCooking();
      break;
    case "game-2048":
      gameFlowManager.showGame2048();
      break;
    case "after-train":
      gameFlowManager.showMoveAfterTrain();
      break;
    case "train-move":
      gameFlowManager.showMoveToTrainScene();
      break;
    case "detective":
      gameFlowManager.showDetectiveGame();
      break;
    case "railway-station":
      gameFlowManager.showRailwayStation();
      break;
    case "moscow":
      gameFlowManager.showMoscow();
      break;
    default:
      break;
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        <div className={styles.menuHeader}>
          <span className={styles.menuTitle}>Меню</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.item} onClick={onSettings}>⚙️ Настройки</div>
        <div className={styles.item} onClick={onToggleSound}>
          🔊 Звук: {soundEnabled ? "Вкл" : "Выкл"}
        </div>

        <div className={styles.subHeader}>Debug</div>
        <div className={styles.item} onClick={() => onSceneSelection("flight")}>🛩️ Игра полёт</div>
        <div className={styles.item} onClick={() => onSceneSelection("cooking")}>🍳 Игра готовка</div>
        <div className={styles.item} onClick={() => onSceneSelection("train-move")}>🚉 Сцена переход к вокзалу</div>
        <div className={styles.item} onClick={() => onSceneSelection("after-train")}> Сцена после поезда</div>
        <div className={styles.item} onClick={() => onSceneSelection("detective")}>🕵️ Детектив</div>
        <div className={styles.item} onClick={() => onSceneSelection("game-map")}>🧭 Карта</div>
        <div className={styles.item} onClick={() => onSceneSelection("railway-station")}>🚉 Вокзал</div>
        <div className={styles.item} onClick={() => onSceneSelection("moscow")}>🇷🇺 Москва</div>
      </div>
    </div>
  );
};
