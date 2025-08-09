export interface Ingredient {
  id: string;
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
  id: string;
  name: string;
  price: number;
  image: string;
}
