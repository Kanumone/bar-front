import clsx from "clsx";
import type { Ingredient } from "../types";
import styles from "./recipe-card.module.css";

interface RecipeCardProps {
  title: string;
  imageSrc: string;
  ingredients: Ingredient[];
  isAvailable: boolean;
  energy: number;
  onCook: () => void;
  className?: string;
}

export const RecipeCard = ({
  title,
  imageSrc,
  ingredients,
  isAvailable,
  energy,
  onCook,
  className,
}: RecipeCardProps) => {
  const handleCook = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isAvailable) {
      onCook();
    }
  };

  return (
    <div className={clsx(styles.card, className)}>
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.dishImageWrapper}>
          <img src={imageSrc} alt={title} className={styles.dishImage} />
          <div className={styles.energyInfo}>
            <span className={styles.energyIcon}>⚡</span>
            <span className={styles.energyValue}>{energy}</span>
          </div>
        </div>

        <p className={styles.ingredientsLabel}>Ингредиенты:</p>

        <div className={styles.ingredientsList}>
          {ingredients.map((ingredient, index) => (
            <div key={ingredient.id || index} className={styles.ingredientItem}>
              <div
                className={styles.ingredientIcon}
                style={{ backgroundColor: ingredient.color }}
              >
                <img
                  src={ingredient.imageSrc}
                  alt="ingredient"
                  className={styles.ingredientImage}
                />
              </div>
              <span className={styles.ingredientCount}>x{ingredient.count}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCook}
          className={clsx(
            styles.cookButton,
            isAvailable ? styles.available : styles.unavailable,
          )}
          disabled={!isAvailable}
        >
          ГОТОВИТЬ
        </button>
      </div>
    </div>
  );
};
