export const getAssetsPath = (filename?: string) => {
  const basePath = `${import.meta.env.BASE_URL}assets`;

  return filename ? `${basePath}/${filename}` : basePath;
};

export function getAssetsPathByType({
  type,
  filename,
  scene,
}: {
  type: "images" | "sounds" | "json" | "tiled" | "fonts";
  filename: string;
  scene?: string;
}) {
  const scenePath = scene ? `scenes/${scene}` : "";

  return `${getAssetsPath()}/${type}/${scenePath}/${filename}`;
}

// Функция для получения пути к изображению овоща
export const getVegetableImagePath = (type: string): string => {
  const imageMap: Record<string, string> = {
    carrot: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/carrot.png" }),
    tomato: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/tomato.png" }),
    cucumber: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/cucumber.png" }),
    pepper: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/pepper.png" }),
    mushroom: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/mushroom.png" }),
    potato: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/potato.png" }),
    onion: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/onion.png" }),
    garlic: getAssetsPathByType({ type: "images",
      scene: "cooking",
      filename: "ingredients/garlic.png" }),
  };

  return imageMap[type] || imageMap.carrot; // fallback на морковь
};

const ingredientMap: Record<string, string> = {
  // Мясные продукты
  "beef": "assets/images/scenes/cooking/ingredients/beef.png",
  "chicken": "assets/images/scenes/cooking/ingredients/chicken.png",
  "fish": "assets/images/scenes/cooking/ingredients/fish.png",
  "ground_meat": "assets/images/scenes/cooking/ingredients/ground_meat.png",
  "meat": "assets/images/scenes/cooking/ingredients/meat.png",
  "mutton": "assets/images/scenes/cooking/ingredients/mutton.png",
  "salami": "assets/images/scenes/cooking/ingredients/salami.png",
  "sausage": "assets/images/scenes/cooking/ingredients/sausage.png",

  // Овощи
  "apple": "assets/images/scenes/cooking/ingredients/apple.png",
  "carrot": "assets/images/scenes/cooking/ingredients/carrot.png",
  "cucumber": "assets/images/scenes/cooking/ingredients/cucumber.png",
  "garlic": "assets/images/scenes/cooking/ingredients/garlic.png",
  "green": "assets/images/scenes/cooking/ingredients/green.png",
  "lemon": "assets/images/scenes/cooking/ingredients/lemon.png",
  "mushroom": "assets/images/scenes/cooking/ingredients/mushroom.png",
  "olives": "assets/images/scenes/cooking/ingredients/olives.png",
  "onion": "assets/images/scenes/cooking/ingredients/onion.png",
  "onions": "assets/images/scenes/cooking/ingredients/onions.png",
  "pepper": "assets/images/scenes/cooking/ingredients/pepper.png",
  "pickled_cucumber": "assets/images/scenes/cooking/ingredients/pickled_cucumber.png",
  "potato": "assets/images/scenes/cooking/ingredients/potato.png",
  "potato_puree": "assets/images/scenes/cooking/ingredients/potato_puree.png",
  "radish": "assets/images/scenes/cooking/ingredients/radish.png",
  "tomato": "assets/images/scenes/cooking/ingredients/tomato.png",

  // Крупы и мука
  "rice": "assets/images/scenes/cooking/ingredients/rice.png",
  "sweet_dough": "assets/images/scenes/cooking/ingredients/sweet_dough.png",
  "white_bread": "assets/images/scenes/cooking/ingredients/white_bread.png",
  "yeast_dough": "assets/images/scenes/cooking/ingredients/yeast_dough.png",

  // Молочные продукты
  "butter": "assets/images/scenes/cooking/ingredients/butter.png",
  "cottage_cheese": "assets/images/scenes/cooking/ingredients/cottage_cheese.png",
  "cream": "assets/images/scenes/cooking/ingredients/cream.png",
  "kefir": "assets/images/scenes/cooking/ingredients/kefir.png",
  "melted_butter": "assets/images/scenes/cooking/ingredients/melted_butter.png",
  "milk": "assets/images/scenes/cooking/ingredients/milk.png",
  "oil": "assets/images/scenes/cooking/ingredients/oil.png",
  "sour_cream": "assets/images/scenes/cooking/ingredients/sour_cream.png",

  // Другие ингредиенты
  "bay_leaf": "assets/images/scenes/cooking/ingredients/bay_leaf.png",
  "egg": "assets/images/scenes/cooking/ingredients/egg.png",
  "mayonnaise": "assets/images/scenes/cooking/ingredients/mayonnaise.png",
  "mint": "assets/images/scenes/cooking/ingredients/mint.png",
  "mustard": "assets/images/scenes/cooking/ingredients/mustard.png",
  "nutmeg": "assets/images/scenes/cooking/ingredients/nutmeg.png",
  "raisin": "assets/images/scenes/cooking/ingredients/raisin.png",
  "salt": "assets/images/scenes/cooking/ingredients/salt.png",
  "sauerkraut": "assets/images/scenes/cooking/ingredients/sauerkraut.png",
  "soup": "assets/images/scenes/cooking/ingredients/soup.png",
  "spices": "assets/images/scenes/cooking/ingredients/spices.png",
  "sugar": "assets/images/scenes/cooking/ingredients/sugar.png",
  "vinegar": "assets/images/scenes/cooking/ingredients/vinegar.png",
};

export const getIngredientImage = (ingredientName: string): string => {
  return ingredientMap[ingredientName] || "assets/images/scenes/cooking/ingredients/sugar.png";
};