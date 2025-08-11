import React, { useState, useEffect } from "react";
import { getAssetsPath } from "$utils";
import { gameFlowManager } from "$services/game-flow";
import { SlidingPanel } from "../components/sliding-panel";
import { PanelStack } from "../components/panel-stack";
import { GameMenu } from "../components/game-menu";
import { usePlayerState, useSceneStore, useSettingsStore } from "$core/state";
import { MenuButton } from "$ui/components/menu-button";
import { GameConstants } from "$core/constants/constants";
import { type SceneName } from "$core/types/common-types";

interface LayoutProps {
  children: React.ReactNode;
}

const needShowMenu = (scene: SceneName) => {
  return scene.startsWith("Move");
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isSoundEnabled = useSettingsStore((state) => state.isSoundEnabled);

  const hunger = usePlayerState((state) => state.hunger);
  const energy = usePlayerState((state) => state.energy);

  const onToggleSound = () => useSettingsStore.getState().toggleSound();

  const scene = useSceneStore.getState().currentScene;
  const showMenu = needShowMenu(scene);

  useEffect(() => {
    document.documentElement.style.setProperty("--tg-safe-top", "70px");
    document.documentElement.style.setProperty("--tg-safe-right", "80px");
  }, []);

  return (
    <>
      {showMenu &&
        <>
          {/* ✅ Правый стек с выезжающими панелями */}
          <PanelStack
            position={{
              top: "calc(var(--tg-safe-top) + 30px)",
              right: "0"
            }}
            gap="16px"
          >
            <SlidingPanel
              buttonText="СТРЯПАТЬ"
              buttonAction={() => gameFlowManager.showGameCooking()}
              infoText={`Голод: ${hunger}/${GameConstants.MAX_HUNGER}`}
              iconSrc={getAssetsPath("images/ui/hunger-icon.png")}
            />

            <SlidingPanel
              buttonText="СПАТЬ"
              buttonAction={() => gameFlowManager.showFlyingGame()}
              infoText={`Энергия: ${energy}/${GameConstants.MAX_ENERGY}`}
              iconSrc={getAssetsPath("images/ui/energy-icon.png")}
            />
          </PanelStack>
        </>}

      {GameConstants.DEBUG_MODE &&
        <>
          <PanelStack
            side="left"
            position={{
              top: "var(--tg-safe-top)",
              left: "0"
            }}
            gap="12px"
          >
            <MenuButton onOpen={() => setMenuOpen(true)} />
          </PanelStack>
          <GameMenu
            visible={menuOpen}
            onClose={() => setMenuOpen(false)}
            onSettings={() => { setMenuOpen(false); /* открыть настройки позже */ }}
            onToggleSound={onToggleSound}
            soundEnabled={isSoundEnabled}
            onDebugAction={(action) => { console.log("DEBUG:", action); setMenuOpen(false); }}
          />
        </>
      }

      {children}
    </>
  );
};
