import React, { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { gameFlowManager } from "@processes/game-flow/game-flow-manager";
import { usePlayerState } from "@core/state/player-store";
import styles from "./auth-scene-wrapper.module.css";
import { useAuthStore } from "../../core/state";

interface Firefly {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  angle: string;
  lifeTime: number;
  createdAt: number;
}

interface FireflyZone {
  color: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function createFireflySpawner({ color, minX, maxX, minY, maxY, setState }: FireflyZone & { setState: React.Dispatch<React.SetStateAction<Firefly[]>> }) {
  return setInterval(() => {
    setState((fireflies) => [
      ...fireflies,
      {
        id: Math.random().toString(36)
          .slice(2),
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        dx: (Math.random() - 0.5) * 40,
        dy: -30 - Math.random() * 30,
        color,
        angle: `${Math.round(Math.random() * 60 - 30)}deg`,
        lifeTime: 1300 + Math.random() * 800,
        createdAt: Date.now(),
      },
    ]);
  }, 220);
}

function spawnFireflyBurst({ color, minX, maxX, minY, maxY, setState, count = 30 }: FireflyZone & { setState: React.Dispatch<React.SetStateAction<Firefly[]>>;
  count?: number }) {
  const now = Date.now();
  setState((fireflies) => [
    ...fireflies,
    ...Array.from({ length: count }).map(() => ({
      id: Math.random().toString(36)
        .slice(2),
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
      dx: (Math.random() - 0.5) * 80,
      dy: -30 - Math.random() * 60,
      color,
      angle: `${Math.round(Math.random() * 60 - 30)}deg`,
      lifeTime: 1000 + Math.random() * 800,
      createdAt: now,
    })),
  ]);
}

const boyZone: FireflyZone = { color: "#3b82f6",
  minX: 0,
  maxX: 50,
  minY: 40,
  maxY: 90 };
const girlZone: FireflyZone = { color: "#fb7185",
  minX: 50,
  maxX: 100,
  minY: 40,
  maxY: 90 };

export const AuthSceneWrapper: React.FC = () => {
  const setPlayerName = usePlayerState((state) => state.setPlayerName);
  const setPlayerGender = usePlayerState((state) => state.setPlayerGender);
  const playerName = usePlayerState((state) => state.playerName);
  const selectedGender = usePlayerState((state) => state.playerGender);
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [isAnimating, setIsAnimating] = useState<"boy" | "girl" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isVerifying } = useAuthStore();

  useEffect(() => {
    if (selectedGender) {
      setShowInput(true);
    } else {
      setShowInput(false);
    }
  }, [selectedGender]);

  useEffect(() => {
    let spawner: number | null = null;

    if (selectedGender === "boy") {
      spawner = createFireflySpawner({ ...boyZone,
        setState: setFireflies });
    } else if (selectedGender === "girl") {
      spawner = createFireflySpawner({ ...girlZone,
        setState: setFireflies });
    }
    return () => { if (spawner) clearInterval(spawner); };
  }, [selectedGender]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setFireflies((currentFireflies) =>
        currentFireflies.filter((fly) => now - fly.createdAt < fly.lifeTime),
      );
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleGenderSelect = (gender: "boy" | "girl") => {
    if (selectedGender === gender) return;

    // ✅ Запускаем анимацию
    setIsAnimating(gender);

    // ✅ Планируем сброс анимации после ее завершения (например, 500 мс)
    setTimeout(() => {
      setIsAnimating(null);
    }, 500); // Это значение нужно настроить в зависимости от длительности вашей CSS-анимации

    setFireflies([]);
    setPlayerGender(gender);
    if (gender === "boy") {
      spawnFireflyBurst({ ...boyZone,
        setState: setFireflies });
    } else if (gender === "girl") {
      spawnFireflyBurst({ ...girlZone,
        setState: setFireflies });
    }
  };

  const handleStartGame = () => {
    if (playerName && selectedGender) {
      void gameFlowManager.showIntro(0);
    }
  };

  const isStartButtonDisabled = !playerName || !selectedGender;

  if (isVerifying) {
    return <AuthWrapperContainer/>;
  }

  return (
    <AuthWrapperContainer>
      <div className={styles.contentWrapper}>
        <div className={styles.gameTitle}>
          <h1 className={styles.mainTitle}>Ветви и корни</h1>
          <p className={styles.subtitle}>Начни свое приключение</p>
        </div>
      </div>
      <div className={styles.squaresRow}>
        {/* ✅ Условное добавление класса анимации */}
        <div
          className={`${styles.squareGlowWrapper} ${isAnimating === "boy" ? styles.animateGlow : ""}`}
          onClick={() => handleGenderSelect("boy")}
        />
        <div
          className={`${styles.squareGlowWrapper} ${isAnimating === "girl" ? styles.animateGlow : ""}`}
          onClick={() => handleGenderSelect("girl")}
        />
      </div>
      {!selectedGender && (
        <div className={styles.chooseCharacterPulse}>
          Выбери персонажа
        </div>
      )}
      <div className={styles.inputButtonContainer + (showInput ? " " + styles.fadeIn : " " + styles.fadeOut)}>

        <div className={styles.inputLabel}>Введите ваше имя</div>
        <input
          ref={inputRef}
          className={styles.inputName}
          type="text"
          placeholder="Ваше имя"
          value={playerName}
          maxLength={32}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isStartButtonDisabled) handleStartGame();
          }}
        />
        <button
          className={styles.playButton}
          onClick={handleStartGame}
          disabled={isStartButtonDisabled}
        >
          <span className={styles.playButtonStarsBg} />
          <span className={styles.playButtonIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 513" width="48" height="48" fill="white">
              <g>
                <g>
                  <path fillRule="evenodd" d="M128.502 84.874a115.088 115.088 0 0 1 31.551-4.252c13.869.008 26.694 3.624 38.546 6.965 1.937.546 3.848 1.085 5.734 1.6 13.961 3.81 29.718 7.435 51.678 7.435 21.959 0 37.706-3.625 51.661-7.435 1.882-.513 3.789-1.051 5.722-1.596 11.854-3.343 24.685-6.962 38.576-6.969a107.498 107.498 0 0 1 30.601 4.3l.028.009.027.008c27.121 8.017 47.708 28.156 63.54 55.587 15.765 27.315 27.623 63.183 36.977 105.471 9.595 43.361 14.944 83.082 12.109 114.381-2.81 31.021-14.433 59.161-43.99 69.256l-.008.002c-18.126 6.181-35.324 2.247-50.156-6.376-14.419-8.383-27.4-21.579-38.905-35.912-10.844-13.513-22.059-21.758-37.381-26.967-16-5.439-37.284-7.849-68.801-7.849-31.506 0-53.132 2.406-69.469 7.873-15.681 5.248-27.129 13.534-37.865 26.932l-.016.021c-11.411 14.192-24.179 27.486-38.499 35.911-14.867 8.747-32.067 12.555-50.475 6.183l-.009-.003c-27.812-9.645-39.216-38.318-42.507-68.83-3.396-31.482.881-71.425 10.556-114.66v-.002c9.455-42.234 21.305-78.09 37.039-105.401 15.802-27.431 36.346-47.598 63.515-55.619l.11-.032zm8.731 30.786c-16.588 4.933-31.438 17.78-44.74 40.869-13.398 23.259-24.383 55.522-33.538 96.417m78.278-137.286a83.114 83.114 0 0 1 22.695-3.038h.083c9.139 0 17.271 2.264 29.35 5.626 2.06.573 4.234 1.179 6.547 1.81 15.355 4.19 34.173 8.564 60.103 8.564 25.931 0 44.739-4.374 60.088-8.564 2.305-.63 4.472-1.233 6.525-1.804 12.085-3.365 20.226-5.632 29.387-5.632h.08a75.493 75.493 0 0 1 21.491 3.012c16.608 4.919 31.528 17.774 44.869 40.888 13.414 23.242 24.402 55.494 33.447 96.386l.001.001c9.415 42.548 13.86 78.342 11.483 104.582-2.402 26.52-11 37.945-22.463 41.86-7.181 2.446-14.691 1.504-23.738-3.756-9.464-5.502-19.537-15.202-30.032-28.278-14.196-17.687-30.297-29.842-52.037-37.233-21.063-7.161-46.588-9.552-79.101-9.552-32.524 0-58.308 2.394-79.624 9.527-21.966 7.351-38.411 19.462-52.673 37.257-10.607 13.193-20.472 22.896-29.78 28.372-8.762 5.156-16.188 6.153-23.78 3.525-9.324-3.239-18.205-14.553-21.168-42.025-2.86-26.51.643-62.566 9.968-104.24" clipRule="evenodd" />
                  <path d="M292.011 244.622c11.045 0 20-8.954 20-20 0-11.045-8.955-20-20-20-11.046 0-20 8.955-20 20 0 11.046 8.954 20 20 20zM336.011 288.622a20 20 0 1 1-.002-39.998 20 20 0 0 1 .002 39.998zM336.011 200.622c11.045 0 20-8.954 20-20 0-11.045-8.955-20-20-20-11.046 0-20 8.955-20 20 0 11.046 8.954 20 20 20zM380.011 244.622c11.045 0 20-8.954 20-20 0-11.045-8.955-20-20-20-11.046 0-20 8.955-20 20 0 11.046 8.954 20 20 20z" />
                  <g fillRule="evenodd" clipRule="evenodd">
                    <path d="M160.011 160.622c8.836 0 16 7.164 16 16v96c0 8.837-7.164 16-16 16-8.837 0-16-7.163-16-16v-96c0-8.836 7.163-16 16-16z" />
                    <path d="M96.01 224.622c0-8.836 7.164-16 16.001-16h96c8.836 0 16 7.164 16 16 0 8.837-7.164 16-16 16h-96c-8.837 0-16-7.163-16-16z" />
                  </g>
                </g>
              </g>
            </svg>
          </span>
          ИГРАТЬ
          <span className={styles.playButtonStars}>
            <svg className={styles.playButtonStar} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2l3.09 8.26L28 12l-6 5.74L23.18 28 16 23.27 8.82 28 10 17.74 4 12l8.91-1.74L16 2z" fill="#fffbe6" /></svg>
            <svg className={styles.playButtonStar} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2l3.09 8.26L28 12l-6 5.74L23.18 28 16 23.27 8.82 28 10 17.74 4 12l8.91-1.74L16 2z" fill="#fffbe6" /></svg>
          </span>
        </button>
      </div>
      {selectedGender && fireflies.length > 0 &&
      <div className={styles.fireflies}>
        {fireflies.map((fly) => (
          <div
            key={fly.id}
            className={styles.firefly}
            style={{
              left: `${fly.x}%`,
              top: `${fly.y}%`,
              background: fly.color,
              animation: `${styles.fireflyAnim} ${fly.lifeTime}ms linear`,
              "--dx": `${fly.dx}px`,
              "--dy": `${fly.dy}px`,
              "--angle": fly.angle,
            } as React.CSSProperties}
          />
        ))}
      </div>}
    </AuthWrapperContainer>);
};

const AuthWrapperContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (<div className={styles.sceneWrapper}>
    <div className={styles.gameContainer}>
      {children}
    </div>
  </div>);
};
