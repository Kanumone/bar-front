import { getAssetsPathByType } from "$/utils";
import { getIngredientImage } from "./ingredients";
import type { Recipe } from "$features/cooking-game/types";

export const recipes: Recipe[] = [
  {
    id: "kalach",
    title: "Калач",
    energy: 30,
    imageSrc: getAssetsPathByType({
      type: "images",
      scene: "cooking",
      filename: "recipes/kalach.png",
    }),
    ingredients: [
      {
        id: "yeast_dough",
        imageSrc: getIngredientImage("yeast_dough"),
        count: 1,
        color: "#90CAF9"
      },
      {
        id: "sugar",
        imageSrc: getIngredientImage("sugar"),
        count: 1,
        color: "#90CAF9"
      },
      {
        id: "salt",
        imageSrc: getIngredientImage("salt"),
        count: 1,
        color: "#90CAF9"
      },
    ],
    isAvailable: false,
  },
  {
    id: "chak_chak",
    title: "Чак-чак",
    energy: 35,
    imageSrc: getAssetsPathByType({
      type: "images",
      scene: "cooking",
      filename: "recipes/chakchak.png",
    }),
    ingredients: [
      {
        id: "egg",
        imageSrc: getIngredientImage("egg"),
        count: 2,
        color: "#90CAF9"
      },
      {
        id: "salt",
        imageSrc: getIngredientImage("salt"),
        count: 1,
        color: "#90CAF9"
      },
      {
        id: "oil",
        imageSrc: getIngredientImage("oil"),
        count: 1,
        color: "#90CAF9"
      },
    ],
    isAvailable: false,
  },
  {
    id: "yukola",
    title: "Юкола",
    energy: 50,
    imageSrc: getAssetsPathByType({
      type: "images",
      scene: "cooking",
      filename: "recipes/yukola.png",
    }),
    ingredients: [
      {
        id: "fish",
        imageSrc: getIngredientImage("fish"),
        count: 1,
        color: "#90CAF9"
      },
      {
        id: "salt",
        imageSrc: getIngredientImage("salt"),
        count: 1,
        color: "#90CAF9"
      },
    ],
    isAvailable: false,
  },
];
