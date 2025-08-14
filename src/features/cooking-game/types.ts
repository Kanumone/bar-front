export type IngredientID = 
  | "beef" | "chicken" | "fish" | "ground_meat" | "meat" | "mutton" | "salami" | "sausage"
  | "apple" | "carrot" | "cucumber" | "garlic" | "green" | "lemon" | "mushroom" | "olives" 
  | "onion" | "onions" | "pepper" | "pickled_cucumber" | "potato" | "potato_puree" | "radish" | "tomato"
  | "rice" | "sweet_dough" | "white_bread" | "yeast_dough"
  | "butter" | "cottage_cheese" | "cream" | "kefir" | "melted_butter" | "milk" | "oil" | "sour_cream"
  | "bay_leaf" | "egg" | "mayonnaise" | "mint" | "mustard" | "nutmeg" | "raisin" | "salt" 
  | "sauerkraut" | "soup" | "spices" | "sugar" | "vinegar";

export interface Ingredient {
  id: IngredientID;
  imageSrc: string;
  count: number;
  color: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageSrc: string;
  ingredients: Ingredient[];
  isAvailable: boolean;
  energy: number; // количество энергии, которое восстанавливает рецепт
}

export interface MarketItem {
  id: IngredientID;
  name: string;
  price: number;
  image: string;
}


