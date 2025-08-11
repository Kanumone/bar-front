import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { useGameContext, type VegetablePiece } from "./game-provider.tsx";
import { GameBoard } from "./game-board.tsx";
import { NextPiece } from "./next-piece.tsx";
import { DraggedPiece } from "./dragged-piece.tsx";
import styles from "./game-content.module.css";
import { usePlayerState } from "$/core/state";

// Константы
const BOARD_SIZE = 8;
const POINTS_PER_LINE = 100;

// Типы
interface Position {
  row: number;
  col: number;
}

interface DragState {
  piece: VegetablePiece | null;
  previewPosition: Position | null;
  isValidPosition: boolean;
}

// Утилиты для работы с фигурами
const PieceUtils = {
  // Определяет, является ли фигура угловой
  isCornerPiece: (shape: number[][]): boolean => {
    const hasHoles = shape.some((row) => row.includes(0));
    const isSmall = shape.length <= 2 && shape[0].length <= 2;
    return hasHoles && isSmall;
  },

  // Получает размеры фигуры
  getPieceDimensions: (piece: VegetablePiece) => ({
    height: piece.shape.length,
    width: piece.shape[0].length,
  }),

  // Получает размер ячейки в зависимости от размера экрана
  getCellSize: (): number => {
    if (window.innerWidth <= 480) return 25;
    if (window.innerWidth <= 768) return 28;
    return 35;
  },
};

export function TetrisGame() {
  const { state, dispatch } = useGameContext();
  const { addMoney } = usePlayerState();
  const [dragState, setDragState] = useState<DragState>({
    piece: null,
    previewPosition: null,
    isValidPosition: true,
  });
  const [availablePieces, setAvailablePieces] = useState<VegetablePiece[]>([]);

  // Отладочная информация о доступных фигурах
  useEffect(() => {
    checkGameOver();
  }, [availablePieces]);

  // Функция для добавления денег при заработке очков
  const addMoneyForPoints = useCallback((points: number) => {
    const moneyEarned = Math.floor(points / 10); // 10 очков = 1 рубль
    if (moneyEarned > 0) {
      addMoney(moneyEarned);
    }
  }, [addMoney]);

  // Проверка возможности размещения фигуры
  const canPlacePiece = useCallback((piece: VegetablePiece, position: Position): boolean => {
    const { height, width } = PieceUtils.getPieceDimensions(piece);

    // Проверяем, что фигура полностью помещается в поле
    if (position.row < 0 || position.col < 0 ||
            position.row + height > BOARD_SIZE ||
            position.col + width > BOARD_SIZE) {
      return false;
    }

    // Проверяем каждую ячейку фигуры
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (piece.shape[r][c]) {
          const newRow = position.row + r;
          const newCol = position.col + c;

          // Дополнительная проверка границ (на всякий случай)
          if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
            return false;
          }

          // Проверяем, что ячейка не занята
          if (state.board[newRow][newCol] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }, [state.board]);

  // Вычисление оптимальной позиции для размещения
  const calculateOptimalPosition = useCallback((piece: VegetablePiece, targetPosition: Position): Position => {
    const { height, width } = PieceUtils.getPieceDimensions(piece);

    let finalRow = targetPosition.row;
    let finalCol = targetPosition.col;

    // Для угловых фигур размещаем точно по точке клика, для остальных - центрируем
    if (!PieceUtils.isCornerPiece(piece.shape)) {
      finalRow = targetPosition.row - Math.floor(height / 2);
      finalCol = targetPosition.col - Math.floor(width / 2);
    }

    // Ограничиваем позицию границами поля
    const clampedRow = Math.max(0, Math.min(BOARD_SIZE - height, finalRow));
    const clampedCol = Math.max(0, Math.min(BOARD_SIZE - width, finalCol));

    return {
      row: clampedRow,
      col: clampedCol,
    };
  }, []);

  // Поиск ближайшей валидной позиции
  const findNearestValidPosition = useCallback((piece: VegetablePiece, targetPosition: Position): Position => {
    if (canPlacePiece(piece, targetPosition)) {
      return targetPosition;
    }

    const { height, width } = PieceUtils.getPieceDimensions(piece);
    const searchRadius = PieceUtils.isCornerPiece(piece.shape) ? 3 : 2;

    let bestPosition: Position | null = null;
    let bestDistance = Infinity;

    for (let r = Math.max(0, targetPosition.row - searchRadius);
      r <= Math.min(BOARD_SIZE - height, targetPosition.row + searchRadius); r++) {
      for (let c = Math.max(0, targetPosition.col - searchRadius);
        c <= Math.min(BOARD_SIZE - width, targetPosition.col + searchRadius); c++) {

        const position = {
          row: r,
          col: c,
        };
        if (canPlacePiece(piece, position)) {
          const distance = Math.sqrt((r - targetPosition.row) ** 2 + (c - targetPosition.col) ** 2);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestPosition = position;
          }
        }
      }
    }

    return bestPosition || targetPosition;
  }, [canPlacePiece]);

  // Размещение фигуры на поле
  const placePiece = useCallback((piece: VegetablePiece, position: Position): boolean => {
    if (!canPlacePiece(piece, position)) {
      return false;
    }

    const newBoard = state.board.map((row) => [...row]);
    const { height, width } = PieceUtils.getPieceDimensions(piece);

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (piece.shape[r][c]) {
          newBoard[position.row + r][position.col + c] = piece;
        }
      }
    }

    dispatch({
      type: "PLACE_PIECE",
      payload: { board: newBoard },
    });

    // Проверяем линии и окончание игры только после успешного размещения
    checkLines(newBoard);

    return true;
  }, [state.board, canPlacePiece]);

  // Проверка и очистка заполненных линий
  const checkLines = useCallback((board: (VegetablePiece | null)[][]) => {
    let linesCleared = 0;
    const newBoard = board.map((row) => [...row]);
    const cellsToClear: string[] = [];

    // Проверка строк
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (newBoard[row].every((cell) => cell !== null)) {
        // Добавляем все ячейки строки для анимации
        for (let col = 0; col < BOARD_SIZE; col++) {
          cellsToClear.push(`${row}-${col}-row`);
        }
        linesCleared++;
      }
    }

    // Проверка столбцов
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (newBoard.every((row) => row[col] !== null)) {
        // Добавляем все ячейки столбца для анимации
        for (let row = 0; row < BOARD_SIZE; row++) {
          cellsToClear.push(`${row}-${col}-column`);
        }
        linesCleared++;
      }
    }

    if (linesCleared > 0) {
      const points = linesCleared * POINTS_PER_LINE;

      // Добавляем деньги за заработанные очки
      addMoneyForPoints(points);

      // Запускаем анимацию
      dispatch({
        type: "START_CLEAR_ANIMATION",
        payload: { cellIds: cellsToClear },
      });

      // Ждем окончания анимации и очищаем ячейки
      setTimeout(() => {
        // Очищаем строки
        for (let row = 0; row < BOARD_SIZE; row++) {
          if (newBoard[row].every((cell) => cell !== null)) {
            newBoard[row] = Array(BOARD_SIZE).fill(null) as null[];
          }
        }

        // Очищаем столбцы
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (newBoard.every((row) => row[col] !== null)) {
            for (let row = 0; row < BOARD_SIZE; row++) {
              newBoard[row][col] = null;
            }
          }
        }

        dispatch({
          type: "FINISH_CLEAR_ANIMATION",
          payload: {
            board: newBoard,
            points,
          },
        });
      }, 800); // Время анимации
    }
  }, [addMoneyForPoints]);

  // Проверка окончания игры
  const checkGameOver = useCallback(() => {
    if (availablePieces.length === 0) {
      return;
    }

    // Проверяем, можно ли разместить хотя бы одну фигуру из доступных
    let canPlaceAnyPiece = false;
    let availablePositions = 0;

    // Если нет доступных фигур для проверки, игра не может продолжаться
    if (availablePieces.length === 0) {
      return;
    }

    for (const piece of availablePieces) {
      let pieceCanBePlaced = false;

      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (canPlacePiece(piece, {
            row,
            col,
          })) {
            canPlaceAnyPiece = true;
            availablePositions++;

            pieceCanBePlaced = true;
          }
        }
        if (canPlaceAnyPiece) {
          break;
        }
      }

      if (pieceCanBePlaced) {
        break;
      }
    }

    // Если нельзя разместить ни одной фигуры - игра окончена
    if (!canPlaceAnyPiece) {
      const gameStats = {
        availablePositions,
        score: state.score,
      };

      // Отправляем событие с детальной статистикой
      document.dispatchEvent(new CustomEvent("gameOver", {
        detail: gameStats,
      }));

      dispatch({ type: "GAME_OVER" });
    }
  }, [availablePieces, canPlacePiece, state.score]);

  // Обработчики событий перетаскивания
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const pieceData = event.active.data.current as VegetablePiece;
    if (pieceData) {
      setDragState((prev) => ({
        ...prev,
        piece: pieceData,
      }));
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !active) return;

    const pieceData = active.data.current as VegetablePiece;
    if (!pieceData) return;

    const overId = over.id as string;
    if (!overId.startsWith("cell-")) return;

    const [, rowStr, colStr] = overId.split("-");
    const row = parseInt(rowStr);
    const col = parseInt(colStr);

    if (isNaN(row) || isNaN(col)) return;

    // Проверяем, что ячейка не занята
    if (state.board[row][col] !== null) return;

    const targetPosition = {
      row,
      col,
    };
    const optimalPosition = calculateOptimalPosition(pieceData, targetPosition);
    const validPosition = findNearestValidPosition(pieceData, optimalPosition);
    const isValid = canPlacePiece(pieceData, validPosition);

    setDragState((prev) => ({
      ...prev,
      previewPosition: validPosition,
      isValidPosition: isValid,
    }));
  }, [state.board, calculateOptimalPosition, findNearestValidPosition, canPlacePiece]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active) {
      setDragState({
        piece: null,
        previewPosition: null,
        isValidPosition: true,
      });
      return;
    }

    const pieceData = active.data.current as VegetablePiece;
    if (!pieceData) return;

    const overId = over.id as string;
    if (!overId.startsWith("cell-")) return;

    const [, rowStr, colStr] = overId.split("-");
    const row = parseInt(rowStr);
    const col = parseInt(colStr);

    if (isNaN(row) || isNaN(col)) return;

    // Проверяем, что ячейка не занята
    if (state.board[row][col] !== null) {
      setDragState({
        piece: null,
        previewPosition: null,
        isValidPosition: true,
      });
      return;
    }

    const targetPosition = {
      row,
      col,
    };
    const optimalPosition = calculateOptimalPosition(pieceData, targetPosition);
    const validPosition = findNearestValidPosition(pieceData, optimalPosition);

    if (canPlacePiece(pieceData, validPosition)) {
      const success = placePiece(pieceData, validPosition);

      if (success) {
        document.dispatchEvent(new CustomEvent("piecePlaced", { detail: pieceData }));
      }
    }

    setDragState({
      piece: null,
      previewPosition: null,
      isValidPosition: true,
    });
  }, [state.board, calculateOptimalPosition, findNearestValidPosition, canPlacePiece, placePiece]);

  const handleRestart = useCallback(() => {
    // Сбрасываем состояние перетаскивания
    setDragState({
      piece: null,
      previewPosition: null,
      isValidPosition: true,
    });

    // Логируем статистику перед рестартом
    const finalStats = {
      finalScore: state.score,
      timestamp: new Date().toISOString(),
    };

    // Отправляем событие о рестарте
    document.dispatchEvent(new CustomEvent("gameRestart", {
      detail: finalStats,
    }));

    dispatch({ type: "RESTART" });
  }, [dispatch, state.score]);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.gameArea}>
        <div className={styles.gameBoardSection}>
          <GameBoard
            board={state.board}
            previewPosition={dragState.previewPosition}
            previewPiece={dragState.piece}
            isValidPosition={dragState.isValidPosition}
            isGameOver={state.isGameOver}
          />
        </div>

        <div className={styles.nextPiecesSection}>
          <NextPiece onPiecesChange={setAvailablePieces} />
        </div>
      </div>

      <DragOverlay>
        {dragState.piece && (
          <DraggedPiece piece={dragState.piece} />
        )}
      </DragOverlay>

      {state.isGameOver && (
        <div className={styles.gameOver}>
          <h3>Игра окончена!</h3>
          <p>Ваш счет: {state.score}</p>
          <button onClick={handleRestart}>Играть снова</button>
        </div>
      )}
    </DndContext>
  );
}
