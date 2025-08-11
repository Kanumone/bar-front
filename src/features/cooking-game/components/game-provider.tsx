import React, { createContext, use, useReducer } from "react";

// Типы для игры
export interface VegetablePiece {
  id: string;
  type: "carrot" | "tomato" | "cucumber" | "pepper" | "mushroom" | "potato" | "onion" | "garlic";
  shape: number[][];
  color: string;
}

// Типы для навигации
export type GameScreen = "tetris" | "shop" | "recipe-book";

// Типы для ингредиентов
export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  color: string;
  price: number;
  description: string;
}

// Типы для инвентаря
export interface InventoryItem {
  ingredient: Ingredient;
  count: number;
}

// Типы для рецептов
export interface Recipe {
  id: string;
  title: string;
  ingredients: {
    ingredientId: string;
    count: number;
  }[];
  isAvailable: boolean;
  description: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GameState {
  // Существующие поля для Tetris
  board: (VegetablePiece | null)[][];
  currentPiece: VegetablePiece | null;
  score: number;
  isGameOver: boolean;
  clearingCells: Set<string>;

  // Новые поля для навигации и экономики
  currentScreen: GameScreen;
  coins: number;
  inventory: InventoryItem[];

  // Магазин и рецепты
  availableIngredients: Ingredient[];
  recipes: Recipe[];
}

export interface GameAction {
  type:
    // Существующие actions для Tetris
    | "PLACE_PIECE"
    | "CLEAR_LINES"
    | "NEW_PIECE"
    | "GAME_OVER"
    | "RESTART"
    | "UPDATE_SCORE"
    | "START_CLEAR_ANIMATION"
    | "FINISH_CLEAR_ANIMATION"
    // Новые actions для навигации и экономики
    | "NAVIGATE_TO_SCREEN"
    | "ADD_COINS"
    | "SPEND_COINS"
    | "BUY_INGREDIENT"
    | "USE_INGREDIENT"
    | "ADD_INGREDIENT"
    | "UNLOCK_RECIPE"
    | "COOK_RECIPE"
    | "UPDATE_RECIPE_AVAILABILITY"
    | "RESET_GAME";
  payload?: any;
}

// Фигуры овощей
export const vegetableShapes: VegetablePiece[] = [
  {
    id: "carrot-1",
    type: "carrot",
    shape: [[1, 1], [1, 0]],
    color: "#FF6B35",
  },
  {
    id: "carrot-2",
    type: "carrot",
    shape: [[1, 1, 1], [0, 1, 0]],
    color: "#FF6B35",
  },
  {
    id: "tomato-1",
    type: "tomato",
    shape: [[1, 1, 1]],
    color: "#FF4444",
  },
  {
    id: "tomato-2",
    type: "tomato",
    shape: [[1, 1], [1, 1]],
    color: "#FF4444",
  },
  {
    id: "cucumber-1",
    type: "cucumber",
    shape: [[1], [1], [1]],
    color: "#4CAF50",
  },
  {
    id: "cucumber-2",
    type: "cucumber",
    shape: [[1, 1, 1, 1]],
    color: "#4CAF50",
  },
  {
    id: "pepper-1",
    type: "pepper",
    shape: [[1, 1], [0, 1]],
    color: "#FF9800",
  },
  {
    id: "pepper-2",
    type: "pepper",
    shape: [[1, 0], [1, 1], [1, 0]],
    color: "#FF9800",
  },
  {
    id: "mushroom-1",
    type: "mushroom",
    shape: [[1, 1], [1, 1]],
    color: "#8D6E63",
  },
  {
    id: "mushroom-2",
    type: "mushroom",
    shape: [[1, 1, 1], [0, 1, 0], [0, 1, 0]],
    color: "#8D6E63",
  },
  {
    id: "potato-1",
    type: "potato",
    shape: [[1, 1, 1], [0, 1, 0]],
    color: "#795548",
  },
  {
    id: "potato-2",
    type: "potato",
    shape: [[1, 1], [1, 1], [1, 1]],
    color: "#795548",
  },
  // 1 ячейка
  {
    id: "onion-1",
    type: "onion",
    shape: [[1]],
    color: "#9C27B0",
  },
  // 2 ячейки по вертикали
  {
    id: "garlic-1",
    type: "garlic",
    shape: [[1], [1]],
    color: "#FFEB3B",
  },
  // Зигзаг cucumber
  {
    id: "cucumber-1",
    type: "cucumber",
    shape: [[1, 1, 0], [0, 1, 1]],
    color: "#8BC34A",
  },
  {
    id: "cucumber-2",
    type: "cucumber",
    shape: [[0, 1, 1], [1, 1, 0]],
    color: "#8BC34A",
  },
];

// Доступные ингредиенты в магазине
export const availableIngredients: Ingredient[] = [
  {
    id: "carrot",
    name: "Морковь",
    emoji: "🥕",
    color: "#FF6B35",
    price: 10,
    description: "Сладкая и хрустящая морковь",
  },
  {
    id: "tomato",
    name: "Помидор",
    emoji: "🍅",
    color: "#FF4444",
    price: 15,
    description: "Сочный красный помидор",
  },
  {
    id: "cucumber",
    name: "Огурец",
    emoji: "🥒",
    color: "#4CAF50",
    price: 12,
    description: "Свежий зеленый огурец",
  },
  {
    id: "pepper",
    name: "Перец",
    emoji: "🫑",
    color: "#FF9800",
    price: 18,
    description: "Ароматный болгарский перец",
  },
  {
    id: "mushroom",
    name: "Гриб",
    emoji: "🍄",
    color: "#8D6E63",
    price: 20,
    description: "Вкусный шампиньон",
  },
  {
    id: "potato",
    name: "Картофель",
    emoji: "🥔",
    color: "#795548",
    price: 8,
    description: "Сытный картофель",
  },
  {
    id: "onion",
    name: "Лук",
    emoji: "🧅",
    color: "#9C27B0",
    price: 5,
    description: "Острый репчатый лук",
  },
  {
    id: "garlic",
    name: "Чеснок",
    emoji: "🧄",
    color: "#FFEB3B",
    price: 7,
    description: "Ароматный чеснок",
  },
];

// Рецепты
export const recipes: Recipe[] = [
  {
    id: "simple-salad",
    title: "Простой салат",
    ingredients: [
      { ingredientId: "cucumber",
        count: 2 },
      { ingredientId: "tomato",
        count: 1 },
    ],
    isAvailable: true,
    description: "Легкий и освежающий салат",
    difficulty: "easy",
  },
  {
    id: "carrot-soup",
    title: "Морковный суп",
    ingredients: [
      { ingredientId: "carrot",
        count: 3 },
      { ingredientId: "onion",
        count: 1 },
      { ingredientId: "garlic",
        count: 1 },
    ],
    isAvailable: false,
    description: "Питательный морковный суп",
    difficulty: "medium",
  },
  {
    id: "stew",
    title: "Рагу",
    ingredients: [
      { ingredientId: "potato",
        count: 2 },
      { ingredientId: "carrot",
        count: 2 },
      { ingredientId: "onion",
        count: 1 },
      { ingredientId: "mushroom",
        count: 1 },
    ],
    isAvailable: false,
    description: "Сытное овощное рагу",
    difficulty: "hard",
  },
];

// Начальное состояние
const initialState: GameState = {
  // Существующие поля для Tetris
  board: Array(8).fill(null)
    .map(() => Array(8).fill(null)),
  currentPiece: null,
  score: 0,
  isGameOver: false,
  clearingCells: new Set(),

  // Новые поля
  currentScreen: "tetris",
  coins: 100, // Начальные монеты
  inventory: [],
  availableIngredients,
  recipes,
};

// Утилитарные функции для работы с инвентарем и рецептами
export const GameUtils = {
  // Проверяет, есть ли достаточно ингредиентов для рецепта
  canCookRecipe: (recipe: Recipe, inventory: InventoryItem[]): boolean => {
    return recipe.ingredients.every((required) => {
      const inventoryItem = inventory.find(
        (item) => item.ingredient.id === required.ingredientId,
      );
      return inventoryItem && inventoryItem.count >= required.count;
    });
  },

  // Получает количество ингредиента в инвентаре
  getIngredientCount: (ingredientId: string, inventory: InventoryItem[]): number => {
    const item = inventory.find((item) => item.ingredient.id === ingredientId);
    return item ? item.count : 0;
  },

  // Проверяет, можно ли купить ингредиент
  canBuyIngredient: (ingredientId: string, coins: number, availableIngredients: Ingredient[]): boolean => {
    const ingredient = availableIngredients.find((ing) => ing.id === ingredientId);
    return ingredient ? coins >= ingredient.price : false;
  },

  // Вычисляет обновленные рецепты на основе инвентаря
  updateRecipeAvailability: (recipes: Recipe[], inventory: InventoryItem[]): Recipe[] => {
    return recipes.map((recipe) => ({
      ...recipe,
      isAvailable: GameUtils.canCookRecipe(recipe, inventory),
    }));
  },
};

// Редьюсер
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
  case "PLACE_PIECE":
    return {
      ...state,
      board: action.payload.board,
      currentPiece: null,
    };

  case "NEW_PIECE":
    return {
      ...state,
      currentPiece: action.payload.piece,
    };

  case "START_CLEAR_ANIMATION":
    return {
      ...state,
      clearingCells: new Set(action.payload.cellIds),
    };

  case "FINISH_CLEAR_ANIMATION":
    const newScore = state.score + action.payload.points;
    const coinsEarned = Math.floor(action.payload.points / 10); // 10 очков = 1 монета
    return {
      ...state,
      board: action.payload.board,
      score: newScore,
      coins: state.coins + coinsEarned,
      clearingCells: new Set(),
    };

  case "CLEAR_LINES":
    return {
      ...state,
      board: action.payload.board,
      score: state.score + action.payload.points,
    };

  case "UPDATE_SCORE":
    return {
      ...state,
      score: action.payload.score,
    };

  case "GAME_OVER":
    return {
      ...state,
      isGameOver: true,
    };

  case "RESTART":
    return initialState;

  case "NAVIGATE_TO_SCREEN":
    return {
      ...state,
      currentScreen: action.payload.screen,
    };

  case "ADD_COINS":
    return {
      ...state,
      coins: state.coins + action.payload.amount,
    };

  case "SPEND_COINS":
    return {
      ...state,
      coins: state.coins - action.payload.amount,
    };

  case "BUY_INGREDIENT":
    const ingredientToBuy = state.availableIngredients.find(
      (ing) => ing.id === action.payload.ingredientId,
    );
    if (ingredientToBuy && state.coins >= ingredientToBuy.price) {
      const existingItem = state.inventory.find(
        (item) => item.ingredient.id === action.payload.ingredientId,
      );

      if (existingItem) {
        // Увеличиваем количество существующего ингредиента
        return {
          ...state,
          coins: state.coins - ingredientToBuy.price,
          inventory: state.inventory.map((item) =>
            item.ingredient.id === action.payload.ingredientId
              ? { ...item,
                count: item.count + 1 }
              : item,
          ),
        };
      } else {
        // Добавляем новый ингредиент
        return {
          ...state,
          coins: state.coins - ingredientToBuy.price,
          inventory: [...state.inventory, { ingredient: ingredientToBuy,
            count: 1 }],
        };
      }
    }
    return state;

  case "USE_INGREDIENT":
    return {
      ...state,
      inventory: state.inventory.map((item) =>
        item.ingredient.id === action.payload.ingredientId
          ? { ...item,
            count: item.count - 1 }
          : item,
      ),
    };

  case "ADD_INGREDIENT":
    return {
      ...state,
      inventory: state.inventory.map((item) =>
        item.ingredient.id === action.payload.ingredientId
          ? { ...item,
            count: item.count + 1 }
          : item,
      ),
    };

  case "UNLOCK_RECIPE":
    return {
      ...state,
      recipes: state.recipes.map((recipe) =>
        recipe.id === action.payload.recipeId ? { ...recipe,
          isAvailable: true } : recipe,
      ),
    };

  case "COOK_RECIPE":
    const recipeToCook = state.recipes.find(
      (recipe) => recipe.id === action.payload.recipeId,
    );
    if (recipeToCook && GameUtils.canCookRecipe(recipeToCook, state.inventory)) {
      // Уменьшаем количество ингредиентов в инвентаре
      const updatedInventory = state.inventory.map((item) => {
        const requiredIngredient = recipeToCook.ingredients.find(
          (req) => req.ingredientId === item.ingredient.id,
        );
        if (requiredIngredient) {
          return { ...item,
            count: item.count - requiredIngredient.count };
        }
        return item;
      }).filter((item) => item.count > 0); // Удаляем пустые позиции

      return {
        ...state,
        inventory: updatedInventory,
        // Обновляем доступность рецептов после приготовления
        recipes: GameUtils.updateRecipeAvailability(state.recipes, updatedInventory),
      };
    }
    return state;

  case "UPDATE_RECIPE_AVAILABILITY":
    return {
      ...state,
      recipes: GameUtils.updateRecipeAvailability(state.recipes, state.inventory),
    };

  case "RESET_GAME":
    return initialState;

  default:
    return state;
  }
}

// Контекст
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Хук для использования контекста
export function useGameContext() {
  const context = use(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

// Хук для удобной навигации
export function useGameNavigation() {
  const { state, dispatch } = useGameContext();

  return {
    currentScreen: state.currentScreen,
    navigateTo: (screen: GameScreen) => {
      dispatch({ type: "NAVIGATE_TO_SCREEN",
        payload: { screen } });
    },
    goToTetris: () => dispatch({ type: "NAVIGATE_TO_SCREEN",
      payload: { screen: "tetris" } }),
    goToShop: () => dispatch({ type: "NAVIGATE_TO_SCREEN",
      payload: { screen: "shop" } }),
    goToRecipeBook: () => dispatch({ type: "NAVIGATE_TO_SCREEN",
      payload: { screen: "recipe-book" } }),
  };
}

// Хук для работы с магазином
export function useShop() {
  const { state, dispatch } = useGameContext();

  return {
    coins: state.coins,
    availableIngredients: state.availableIngredients,
    buyIngredient: (ingredientId: string) => {
      dispatch({ type: "BUY_INGREDIENT",
        payload: { ingredientId } });
    },
    canBuyIngredient: (ingredientId: string) => {
      return GameUtils.canBuyIngredient(ingredientId, state.coins, state.availableIngredients);
    },
  };
}

// Хук для работы с инвентарем
export function useInventory() {
  const { state } = useGameContext();

  return {
    inventory: state.inventory,
    getIngredientCount: (ingredientId: string) => {
      return GameUtils.getIngredientCount(ingredientId, state.inventory);
    },
  };
}

// Хук для работы с рецептами
export function useRecipes() {
  const { state, dispatch } = useGameContext();

  return {
    recipes: state.recipes,
    cookRecipe: (recipeId: string) => {
      dispatch({ type: "COOK_RECIPE",
        payload: { recipeId } });
    },
    canCookRecipe: (recipe: Recipe) => {
      return GameUtils.canCookRecipe(recipe, state.inventory);
    },
  };
}

// Провайдер
interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext value={{ state,
      dispatch }}>
      {children}
    </GameContext>
  );
}
