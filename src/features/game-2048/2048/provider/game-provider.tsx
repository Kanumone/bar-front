import { useEffect, useRef, type PropsWithChildren } from "react";
import { Game2048Context } from "../context/game-context";
import { useAuth } from "@core/hooks/use-auth/use-auth";

const GRID_SIZE = 4;

export interface GameInterface {
  state: GameState;
  moveLeft(): void;
  moveRight(): void;
  moveUp(): void;
  moveDown(): void;
  restart(): void;
  spawn(): void;
  subscribe(callback: (state: GameState) => void): void;
  unsubscribe(callback: (state: GameState) => void): void;
}

export interface GameState {
  highScore: number;
  score: number;
  level?: number;
  field: FieldItem[][];
  over: boolean;
  won?: boolean;
}

export interface FieldItem {
  value: number;
  key: string;
}

const defaultState: GameState = {
  highScore: 0,
  score: 0,
  field: [],
  over: false,
  won: false,
};

class Game implements GameInterface {
  state: GameState = { ...defaultState };
  subscribers = new Set<(state: GameState) => void>();
  idKey = 0;

  constructor() {
    this.init(); const storedHighScore = Number(localStorage.getItem("highScore"));
    if (!isNaN(storedHighScore) && storedHighScore > 0) {
      this.state.highScore = storedHighScore; }
  }

  init() {
    this.state = {
      ...defaultState,
      highScore: this.state.highScore };
    this.state.field = this.generateField();
  }

  subscribe(callback: (state: GameState) => void) {
    this.subscribers.add(callback);
  }

  unsubscribe(callback: (state: GameState) => void): void {
    this.subscribers.delete(callback);
  }

  on() {
    this.subscribers.forEach((callback) => callback({ ...this.state,
      field: structuredClone(this.state.field) }));
  }

  spawn(): void {
    const emptyCells: { row: number;
      col: number }[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.state.field[i][j].value === 0) {
          emptyCells.push({ row: i,
            col: j });
        }
      }
    }

    if (emptyCells.length === 0) {
      this.state.over = true;
    } else {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.state.field[row][col] = { value: Math.floor(Math.random() > 0.5 ? 4 : 2),
        key: this.generateUniqueKey() }; }
    this.on();
  }

  private processRow(row: FieldItem[]): { newRow: FieldItem[],
    scoreIncrease: number } {
    const filteredRow = row.filter(({ value }) => value !== 0);
    const mergedRow: FieldItem[] = [];
    let scoreIncrease = 0;
    let j = 0;

    while (j < filteredRow.length) {
      if (j + 1 < filteredRow.length && filteredRow[j].value === filteredRow[j + 1].value) {
        const newValue = filteredRow[j].value * 2;
        mergedRow.push({ value: newValue,
          key: filteredRow[j + 1].key });
        scoreIncrease += newValue;
        j += 2;
      } else {
        mergedRow.push({ ...filteredRow[j] }); j += 1;
      }
    }

    while (mergedRow.length < GRID_SIZE) {
      mergedRow.push({ value: 0,
        key: this.generateUniqueKey() }); }
    return { newRow: mergedRow,
      scoreIncrease };
  }

  moveLeft(): void {
    const originalField = structuredClone(this.state.field);
    let newScore = this.state.score;
    const newField: FieldItem[][] = originalField.map(() => []);
    for (let i = 0; i < GRID_SIZE; i++) {
      const { newRow, scoreIncrease } = this.processRow(originalField[i]); newField[i] = newRow;
      newScore += scoreIncrease;
    }

    const changed = !this.areArraysEqual(newField, originalField);
    if (changed) {
      this.state.field = newField;
      this.state.score = newScore;
      this.spawn();
    }
    const shouldNotify = this.checkIsOver() || changed;
    if (shouldNotify) {
      this.on();
    }
  }

  moveRight(): void {
    const originalField = structuredClone(this.state.field);
    let newScore = this.state.score;
    const newField: FieldItem[][] = originalField.map(() => []);

    for (let i = 0; i < GRID_SIZE; i++) {
      const reversedRow = [...originalField[i]].reverse();
      const { newRow, scoreIncrease } = this.processRow(reversedRow); newField[i] = newRow.reverse(); newScore += scoreIncrease;
    }

    const changed = !this.areArraysEqual(newField, originalField);
    if (changed) {
      this.state.field = newField;
      this.state.score = newScore;
      this.spawn();
    }
    const shouldNotify = this.checkIsOver() || changed;
    if (shouldNotify) {
      this.on();
    }
  }

  moveUp(): void {
    const originalField = structuredClone(this.state.field);
    let newScore = this.state.score;
    const transposed = this.transpose(originalField);
    const newTransposed: FieldItem[][] = transposed.map(() => []);

    for (let i = 0; i < GRID_SIZE; i++) {
      const { newRow, scoreIncrease } = this.processRow(transposed[i]); newTransposed[i] = newRow;
      newScore += scoreIncrease;
    }

    const newField = this.transpose(newTransposed); const changed = !this.areArraysEqual(newField, originalField);
    if (changed) {
      this.state.field = newField;
      this.state.score = newScore;
      this.spawn();
    }
    const shouldNotify = this.checkIsOver() || changed;
    if (shouldNotify) {
      this.on();
    }
  }

  moveDown(): void {
    const originalField = structuredClone(this.state.field);
    let newScore = this.state.score;
    const transposed = this.transpose(originalField);
    const newTransposed: FieldItem[][] = transposed.map(() => []);

    for (let i = 0; i < GRID_SIZE; i++) {
      const reversedCol = [...transposed[i]].reverse();
      const { newRow, scoreIncrease } = this.processRow(reversedCol); newTransposed[i] = newRow.reverse(); newScore += scoreIncrease;
    }

    const newField = this.transpose(newTransposed);
    const changed = !this.areArraysEqual(newField, originalField);
    if (changed) {
      this.state.field = newField;
      this.state.score = newScore;
      this.spawn();
    }
    const shouldNotify = this.checkIsOver() || changed;
    if (shouldNotify) {
      this.on();
    }
  }

  private checkScore(): void {
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      localStorage.setItem("highScore", String(this.state.highScore)); }
  }

  private checkIsOver(): boolean {
    this.checkScore();

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (this.state.field[i][j].value === 0) {
          this.state.over = false;
          return this.state.over;
        }
      }
    }

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        if (this.state.field[i][j].value === this.state.field[i][j + 1].value) {
          this.state.over = false;
          return this.state.over;
        }
      }
    }

    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = 0; i < GRID_SIZE - 1; i++) {
        if (this.state.field[i][j].value === this.state.field[i + 1][j].value) {
          this.state.over = false;
          return this.state.over;
        }
      }
    }

    this.state.over = true;
    return this.state.over;
  }

  restart(): void {
    this.init();
    this.spawn();
    this.spawn();
    this.on(); }

  private transpose<T>(matrix: T[][]): T[][] {
    if (matrix.length === 0 || matrix[0].length === 0) return [];
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  }

  private generateField(): FieldItem[][] {
    return Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({ value: 0,
        key: this.generateUniqueKey() })),
    );
  }

  private areArraysEqual(a: FieldItem[][], b: FieldItem[][]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].length !== b[i].length) return false;
      for (let j = 0; j < a[i].length; j++) {
        if (a[i][j].value !== b[i][j].value) return false;
      }
    }
    return true;
  }

  generateUniqueKey(): string {
    this.idKey += 1;
    return String(this.idKey);
  }
}

export const GameProvider = ({ children }: PropsWithChildren) => {
  const sessionId = useAuth();
  const gameRef = useRef<GameInterface | null>(null);

  if (!gameRef.current) {
    gameRef.current = new Game();
    gameRef.current.spawn();
    gameRef.current.spawn();
  }

  // Загрузка рекорда
  useEffect(() => {
    if (!sessionId) return;

    const loadHighScore = /* async */ () => {
      const highScore = 0; // await get2048HighScore(sessionId);
      if (gameRef.current && highScore > gameRef.current.state.highScore) {
        gameRef.current.state.highScore = highScore;
      }
    };

    void loadHighScore();
  }, [sessionId]);

  // Обновление рекорда
  useEffect(() => {
    const game = gameRef.current;
    if (!game || !sessionId) return;

    const listener = (state: GameState) => {
      if (state.score > state.highScore) {
        // void update2048HighScore(sessionId, state.score);
      }
    };

    game.subscribe(listener);
    return () => game.unsubscribe(listener);
  }, [sessionId]);

  return (
    <Game2048Context value={gameRef.current}>
      {children}
    </Game2048Context>
  );
};
