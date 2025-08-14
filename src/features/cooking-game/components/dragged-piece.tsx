import { type VegetablePiece } from "./game-provider";
import { getVegetableImagePath } from "./ingredients";
import styles from "./dragged-piece.module.css";

interface DraggedPieceProps {
  piece: VegetablePiece;
  canPlace?: boolean;
}

export function DraggedPiece({ piece, canPlace = false }: DraggedPieceProps) {
  return (
    <div
      className={`${styles.draggedPiece} ${canPlace ? styles.canPlace : styles.cannotPlace}`}
      style={{
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {piece.shape.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.shapeRow}>
          {row.map((cell, colIndex) => (
            <div key={colIndex} className={styles.shapeCell}>
              {cell && (
                <div className={styles.cellWrapper}>
                  <div
                    className={styles.vegetableImage}
                    style={{
                      backgroundImage: `url(${getVegetableImagePath(piece.type)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
              ) || ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
