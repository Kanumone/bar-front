import { useState, useMemo } from "react";
import clsx from "clsx";
import type { Ingredient, Recipe } from "../types";
import { RecipeCard } from "./recipe-card";
// навигация больше не используется, скролл по аналогии с shop
import { CookingNotification } from "./cooking-notification";
import { usePlayerState } from "$core/state";
import styles from "./recipe-selector.module.css";
import { GameConstants } from "$core/constants/constants";

interface RecipeSelectorProps {
  recipes: Recipe[];
  className?: string;
  back: () => void;
}

// пагинация не нужна при горизонтальном скролле

export const RecipeSelector = ({
  recipes,
  className,
  back,
}: RecipeSelectorProps) => {
  const [showNotification, setShowNotification] = useState(false);

  const { hunger, inventory, removeHunger, removeFromInventory } = usePlayerState();

  // Мемоизированные рецепты с проверкой доступности
  const recipesWithAvailability = useMemo(() => {
    // check can cook
    const canCookRecipe = (ingredients: Ingredient[]) => {
      return ingredients.every((required) => {
        const inventoryItem = inventory.find((item) => item.id === required.id);
        return inventoryItem && inventoryItem.quantity >= required.count;
      });
    };
    return recipes.map((recipe) => ({
      ...recipe,
      isAvailable: canCookRecipe(recipe.ingredients),
    }));
  }, [recipes, inventory]);

  const currentRecipes = recipesWithAvailability;

  const handleRecipeCook = (recipe: Recipe) => {
    removeHunger(recipe.energy);
    recipe.ingredients.forEach((ingredient) => {
      removeFromInventory(ingredient.id, ingredient.count);
    });
    setShowNotification(true);
  };

  const handleNotificationComplete = () => {
    setShowNotification(false);
  };

  return (
    <div className={clsx(styles.container, className)}>
      {/* Декоративные элементы фона */}
      <div className={styles.backgroundDecorations}></div>

      {/* Хедер: кнопка назад слева и текущая энергия справа */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={back} aria-label="Назад">
          <span className={styles.backArrow}>←</span>
        </button>
        <div className={styles.energyCounter} aria-label={`Голод: ${hunger}`}>
          <span className={styles.energyIcon}>🍗</span>
          <span className={styles.energyAmount}>{hunger}</span>
        </div>
      </div>

      {/* Основной контент */}
      <div className={styles.content}>
        {/* Сетка рецептов */}
        <div className={styles.recipesGrid}>
          {currentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              imageSrc={recipe.imageSrc}
              ingredients={recipe.ingredients}
              isAvailable={recipe.isAvailable}
              energy={recipe.energy}
              onCook={() => handleRecipeCook(recipe)}
            />
          ))}
        </div>

        {/* Инвентарь как в shop.tsx */}
        <div className={styles.inventorySection}>
          <h3 className={styles.inventoryTitle}>Инвентарь</h3>
          <div className={styles.inventoryScrollContainer}>
            {inventory.length === 0 ? (
              <div className={styles.emptyInventory}>Инвентарь пуст</div>
            ) : (
              inventory.map((item) => (
                <div key={item.id} className={styles.inventoryItem}>
                  <img src={item.image} alt={item.name} className={styles.inventoryItemImage} />
                  <span className={styles.inventoryItemLabel}>
                    {item.quantity} {item.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Уведомление о готовке */}
      <CookingNotification
        isVisible={showNotification}
        currentHunger={hunger}
        maxHunger={GameConstants.MAX_HUNGER}
        onAnimationComplete={handleNotificationComplete}
      />
    </div>
  );
};
