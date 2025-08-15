import React from "react";
import styles from "./style.module.css";
import { gameFlowManager } from "$services/game-flow";
import { usePlayerState } from "$core/state";
import { GameConstants } from "$core/constants/constants";

interface GameMenuProps {
  visible: boolean;
  onClose: () => void;
  onSettings: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  onDebugAction?: (action: string) => void;
}

const chooseDebugScene = (scene: string) => {
  switch (scene) {
    case "flight":
      gameFlowManager.showFlyingGame();
      break;
    case "game-map":
      gameFlowManager.showGameMap();
      break;
    case "cooking":
      gameFlowManager.showCookingGame();
      break;
    case "after-train":
      gameFlowManager.showMoveAfterTrain();
      break;
    case "train-move":
      gameFlowManager.showMoveToTrainScene();
      break;
    case "move-to-vdnh":
      gameFlowManager.showMoveToVdnh();
      break;
    case "move-to-gallery":
      gameFlowManager.showMoveToGallery();
      break;
    case "move-to-kazan":
      gameFlowManager.showMoveToKazan();
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
    case "tretyakov":
      gameFlowManager.showMoveToGallery();
      break;
    case "kazan":
      gameFlowManager.showKazan();
      break;
    case "kazan-move":
      gameFlowManager.showMoveInKazan();
      break;
    case "kazan-village":
      gameFlowManager.showMoveInKazanVillage();
      break;
    case "ekb":
      gameFlowManager.showEkb();
      break;
    case "ekb-move":
      gameFlowManager.showMoveInEkb();
      break;
    case "irkutsk":
      gameFlowManager.showIrkutsk();
      break;
    case "kamchatka":
      gameFlowManager.showKamchatka();
      break;
    case "final":
      gameFlowManager.showFinal();
      break;
    default:
      break;
  }
};

export const GameMenu: React.FC<GameMenuProps> = ({
  visible,
  onClose,
  onToggleSound,
  soundEnabled,
}) => {
  if (!visible) return null;


  const upFuel = () => {
    usePlayerState.getState().addEnergy(1000);
    usePlayerState.getState().removeHunger(1000);
  };
  const newGame = () => {
    localStorage.clear();
    location.reload();
  };
  const onSceneSelection = (scene: string) => {
    chooseDebugScene(scene);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        <div className={styles.menuHeader}>
          <span className={styles.menuTitle}>Меню</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.item} onClick={() => {
          gameFlowManager.showGameMap();
          onClose();
        }}>
          🧭 Карта
        </div>
        <div className={styles.item} onClick={onToggleSound}>
          🔊 Звук: {soundEnabled ? "Вкл" : "Выкл"}
        </div>
        <div className={styles.item} onClick={newGame}>
          Новая игра
        </div>

        {GameConstants.DEBUG_MODE && (
          <>
            <div className={styles.subHeader}>Debug</div>
            <div className={styles.item} onClick={() => localStorage.clear()}>Сбросить прогресс</div>
            <div className={styles.item} onClick={() => upFuel()}>Пополнить энергию и сытость</div>
            <div className={styles.item} onClick={() => onSceneSelection("ekb")}>✅ Екатеринбург</div>
            <div className={styles.item} onClick={() => onSceneSelection("ekb-move")}>✅ Екатеринбург: переход</div>
            <div className={styles.item} onClick={() => onSceneSelection("irkutsk")}>✅ Иркутск</div>
            <div className={styles.item} onClick={() => onSceneSelection("kamchatka")}>✅ Камчатка</div>
            <div className={styles.item} onClick={() => onSceneSelection("final")}>✅ Финал</div>
            {/* <div className={styles.item} onClick={() => onSceneSelection("kazan-move")}>🕌 Казань: переход</div>
            <div className={styles.item} onClick={() => onSceneSelection("flight")}>🛩️ Игра полёт</div>
            <div className={styles.item} onClick={() => onSceneSelection("cooking")}>🍳 Игра готовка</div>
            <div className={styles.item} onClick={() => onSceneSelection("train-move")}>🚉 Сцена переход к вокзалу</div>
            <div className={styles.item} onClick={() => onSceneSelection("after-train")}> Сцена после поезда</div>
            <div className={styles.item} onClick={() => onSceneSelection("move-to-vdnh")}>🏛️ Сцена: в ВДНХ</div>
            <div className={styles.item} onClick={() => onSceneSelection("move-to-gallery")}>🖼️ Сцена: в Галерею</div>
            <div className={styles.item} onClick={() => onSceneSelection("move-to-kazan")}>🕌 Сцена: в Казань</div>
            <div className={styles.item} onClick={() => onSceneSelection("detective")}>🕵️ Детектив</div>
            <div className={styles.item} onClick={() => onSceneSelection("game-map")}>🧭 Карта</div>
            <div className={styles.item} onClick={() => onSceneSelection("railway-station")}>🚉 Вокзал</div>
            <div className={styles.item} onClick={() => onSceneSelection("tretyakov")}>🎨 Третьяков</div> */}
          </>
        )}

      </div>
    </div>
  );
};
