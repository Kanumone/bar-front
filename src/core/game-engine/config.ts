import Phaser from "phaser";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  // Стартуем с минимального размера — далее режим RESIZE подгонит под родителя
  width: 1,
  height: 1,
  backgroundColor: "#f9f6f2",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0,
        y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
