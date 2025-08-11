import { useState, useMemo } from "react";
import clsx from "clsx";
import type { Ingredient, Recipe } from "../types";
import { RecipeCard } from "./recipe-card";
import { RecipeNavigation } from "./recipe-navigation";
import { CookingNotification } from "./cooking-notification";
import { usePlayerState } from "$core/state";
import styles from "./recipe-selector.module.css";

interface RecipeSelectorProps {
  recipes: Recipe[];
  className?: string;
  back: () => void;
}

const RECIPES_PER_PAGE = 4;

export const RecipeSelector = ({
  recipes,
  className,
  back,
}: RecipeSelectorProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const { energy, inventory, addEnergy } = usePlayerState();

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const startIndex = currentPage * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;

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

  const currentRecipes = recipesWithAvailability.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleRecipeCook = (recipe: Recipe) => {
    addEnergy(recipe.energy);
    setShowNotification(true);
  };

  const handleNotificationComplete = () => {
    setShowNotification(false);
  };

  return (
    <div className={clsx(styles.container, className)}>
      {/* Декоративные элементы фона */}
      <div className={styles.backgroundDecorations}></div>

      {/* Основной контент */}
      <div className={styles.content}>
        <button className={styles.backButton} onClick={back}>
          <span className={styles.backArrow}>←</span>
        </button>
        {/* Сетка рецептов */}
        <div className={styles.recipesGrid}>
          {currentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              ingredients={recipe.ingredients}
              isAvailable={recipe.isAvailable}
              energy={recipe.energy}
              onCook={() => handleRecipeCook(recipe)}
            />
          ))}
        </div>

        {/* Область навигации (всегда резервирует место) */}
        <div className={styles.navigationArea}>
          {totalPages > 1 && (
            <RecipeNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={currentPage > 0}
              hasNext={currentPage < totalPages - 1}
            />
          )}
        </div>
      </div>

      {/* Уведомление о готовке */}
      <CookingNotification
        isVisible={showNotification}
        currentEnergy={energy}
        maxEnergy={20}
        onAnimationComplete={handleNotificationComplete}
      />
    </div>
  );
};
