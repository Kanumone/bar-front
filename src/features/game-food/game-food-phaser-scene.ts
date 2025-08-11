import Phaser from "phaser";
import { gameFlowManager } from "$services/game-flow";
import { getAssetsPath } from "@utils/get-assets-path";
import { setBackground } from "@utils/set-background";

export default class GameFoodPhaserScene extends Phaser.Scene {
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private timerEvent!: Phaser.Time.TimerEvent;
  private timeLeft = 30;

  constructor() {
    super("GameFood");
  }

  init(): void {
    this.score = 0;
    this.timeLeft = 30;
  }

  preload(): void {
    this.load.image("food-game-background", getAssetsPath("images/food-game-bg.png"));
    this.load.image("apple", getAssetsPath("items/apple.png"));
    this.load.image("banana", getAssetsPath("items/banana.png"));
    this.load.image("rotten-apple", getAssetsPath("items/rotten-apple.png"));
  }

  create(): void {
    const { width, height } = this.scale;

    setBackground(this, "food-game-background");

    this.add.text(width / 2, 50, `Уровень: ${this.levelData.levelId}`, { fontSize: "32px",
      color: "#fff" })
      .setOrigin(0.5);

    this.scoreText = this.add.text(50, 50, `Счет: ${this.score}`, { fontSize: "24px",
      color: "#fff" });

    const timerText = this.add.text(width - 50, 50, `Время: ${this.timeLeft}`, { fontSize: "24px",
      color: "#fff" })
      .setOrigin(1, 0);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        timerText.setText(`Время: ${this.timeLeft}`);
        if (this.timeLeft <= 0) {
          this.endGame();
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.time.addEvent({
      delay: 1500,
      callback: () => this.spawnItem(),
      callbackScope: this,
      loop: true,
    });

    const exitButton = this.add.text(width / 2, height - 50, "Выйти на карту", { fontSize: "24px",
      color: "#fff",
      backgroundColor: "#880000",
      padding: { x: 10,
        y: 5 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    exitButton.on("pointerdown", () => {
      this.endGame(true);
    });
  }

  spawnItem(): void {
    const { width, height } = this.scale;
    const itemType = Math.random() < 0.8 ? "good" : "bad";
    const itemKey = itemType === "good" ? (Math.random() < 0.5 ? "apple" : "banana") : "rotten-apple";

    const x = Phaser.Math.Between(50, width - 50);
    const y = Phaser.Math.Between(150, height - 100);

    const item = this.add.image(x, y, itemKey)
      .setInteractive()
      .setScale(0)
      .setRotation(Phaser.Math.Between(-15, 15) * 0.0174533);

    this.tweens.add({
      targets: item,
      scale: 1,
      duration: 200,
      ease: "Back.easeOut",
    });

    item.on("pointerdown", () => {
      this.collectItem(item, itemType);
    });

    this.time.delayedCall(3000, () => {
      if (item.active) {
        this.tweens.add({
          targets: item,
          alpha: 0,
          duration: 300,
          onComplete: () => item.destroy(),
        });
      }
    });
  }

  collectItem(item: Phaser.GameObjects.Image, type: "good" | "bad"): void {
    this.tweens.add({
      targets: item,
      y: item.y - 20,
      alpha: 0,
      scale: item.scale * 1.2,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: () => {
        item.destroy();
        if (type === "good") {
          this.score += 10;
        } else {
          this.score -= 5;
        }
        this.scoreText.setText(`Счет: ${this.score}`);
      },
    });
  }

  endGame(forceExit = false): void {
    this.timerEvent.destroy();

    if (!forceExit) {
      this.add.text(this.scale.width / 2, this.scale.height / 2, `Игра окончена! Ваш счет: ${this.score}`, { fontSize: "48px",
        color: "#ff0",
        backgroundColor: "#000",
        padding: { x: 20,
          y: 10 } })
        .setOrigin(0.5)
        .setDepth(100);

      this.time.delayedCall(3000, () => {
        gameFlowManager.showGameMap();
      });
    } else {
      gameFlowManager.showGameMap();
    }
  }

  update(): void {
    /* */
  }
}
