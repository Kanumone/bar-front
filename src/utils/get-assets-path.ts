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

const ingredientMap: { [key: string]: string } = {
  // Мясные продукты
  'говядина': 'assets/images/scenes/cooking/ingredients/beef.png',
  'говяжья вырезка': 'assets/images/scenes/cooking/ingredients/beef.png',
  'говяжий фарш': 'assets/images/scenes/cooking/ingredients/ground_meat.png',
  'куриное филе': 'assets/images/scenes/cooking/ingredients/chicken.png',
  'свиная шея': 'assets/images/scenes/cooking/ingredients/meat.png',
  'баранина': 'assets/images/scenes/cooking/ingredients/mutton.png',
  'рыба': 'assets/images/scenes/cooking/ingredients/fish.png',
  'варёная колбаса': 'assets/images/scenes/cooking/ingredients/sausage.png',
  'копчёности': 'assets/images/scenes/cooking/ingredients/salami.png',
  
  // Овощи
  'картофель': 'assets/images/scenes/cooking/ingredients/potato.png',
  'картофельное пюре': 'assets/images/scenes/cooking/ingredients/potato_puree.png',
  'морковь': 'assets/images/scenes/cooking/ingredients/carrot.png',
  'лук': 'assets/images/scenes/cooking/ingredients/onion.png',
  'зелёный лук': 'assets/images/scenes/cooking/ingredients/onions.png',
  'огурцы': 'assets/images/scenes/cooking/ingredients/cucumber.png',
  'солёные огурцы': 'assets/images/scenes/cooking/ingredients/pickled_cucumber.png',
  'томат': 'assets/images/scenes/cooking/ingredients/tomato.png',
  'помидор': 'assets/images/scenes/cooking/ingredients/tomato.png',
  'свёкла': 'assets/images/scenes/cooking/ingredients/radish_.png',
  'болгарский перец': 'assets/images/scenes/cooking/ingredients/pepper.png',
  'яблоко': 'assets/images/scenes/cooking/ingredients/apple.png',
  
  // Крупы и мука
  'мука': 'assets/images/scenes/cooking/ingredients/sugar.png', // используем сахар как муку
  'рис': 'assets/images/scenes/cooking/ingredients/rice.png',
  'белый хлеб': 'assets/images/scenes/cooking/ingredients/white_bread.png',
  'дрожжевое тесто': 'assets/images/scenes/cooking/ingredients/yeast_dough.png',
  'пресное тесто': 'assets/images/scenes/cooking/ingredients/white_bread.png',
  'сдобное тесто': 'assets/images/scenes/cooking/ingredients/sweet_dough.png',
  
  // Молочные продукты
  'молоко': 'assets/images/scenes/cooking/ingredients/milk.png',
  'кефир': 'assets/images/scenes/cooking/ingredients/kefir.png',
  'сметана': 'assets/images/scenes/cooking/ingredients/sour_cream.png',
  'сливки': 'assets/images/scenes/cooking/ingredients/cream.png',
  'творог': 'assets/images/scenes/cooking/ingredients/cottage_cheese.png',
  'сливочное масло': 'assets/images/scenes/cooking/ingredients/butter.png',
  'топлёное масло': 'assets/images/scenes/cooking/ingredients/melted_butter.png',
  'растительное масло': 'assets/images/scenes/cooking/ingredients/oil.png',
  
  // Другие ингредиенты
  'яйцо': 'assets/images/scenes/cooking/ingredients/egg.png',
  'яйца': 'assets/images/scenes/cooking/ingredients/egg.png',
  'майонез': 'assets/images/scenes/cooking/ingredients/mayonnaise.png',
  'горчица': 'assets/images/scenes/cooking/ingredients/mustard.png',
  'уксус': 'assets/images/scenes/cooking/ingredients/vinegar.png',
  'лимон': 'assets/images/scenes/cooking/ingredients/lemon.png',
  'чеснок': 'assets/images/scenes/cooking/ingredients/garlic.png',
  'специи': 'assets/images/scenes/cooking/ingredients/spices.png',
  'лавр': 'assets/images/scenes/cooking/ingredients/bay_leaf.png',
  'лавровый лист': 'assets/images/scenes/cooking/ingredients/bay_leaf.png',
  'специи/лавр': 'assets/images/scenes/cooking/ingredients/bay_leaf.png',
  'зелень': 'assets/images/scenes/cooking/ingredients/green.png',
  'маслины': 'assets/images/scenes/cooking/ingredients/olives.png',
  'изюм': 'assets/images/scenes/cooking/ingredients/raisin.png',
  'мёд': 'assets/images/scenes/cooking/ingredients/sugar.png', // используем сахар как мёд
  'сахар': 'assets/images/scenes/cooking/ingredients/sugar.png',
  'томатная паста': 'assets/images/scenes/cooking/ingredients/tomato.png',
  'квашеная капуста': 'assets/images/scenes/cooking/ingredients/sauerkraut.png',
  'кислая капуста': 'assets/images/scenes/cooking/ingredients/sauerkraut.png',
  'тушёная капуста': 'assets/images/scenes/cooking/ingredients/sauerkraut.png',
  'грибы': 'assets/images/scenes/cooking/ingredients/mushroom.png',
  'бульон': 'assets/images/scenes/cooking/ingredients/soup.png',
  'мускатный орех': 'assets/images/scenes/cooking/ingredients/nutmeg.png',
  'мята': 'assets/images/scenes/cooking/ingredients/mint.png',
  'соль': 'assets/images/scenes/cooking/ingredients/salt.png'
};

export const getIngredientImage = (ingredientName: string): string => {
  return ingredientMap[ingredientName] || 'assets/images/scenes/cooking/ingredients/sugar.png';
};
