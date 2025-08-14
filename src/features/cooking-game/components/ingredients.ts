import { getAssetsPathByType } from "$/utils";
import type { IngredientID, MarketItem } from "../types";

// Функция для получения пути к изображению овоща
export const getVegetableImagePath = (type: string): string => {
    const imageMap: Record<string, string> = {
        carrot: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/carrot.png"
        }),
        tomato: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/tomato.png"
        }),
        cucumber: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/cucumber.png"
        }),
        pepper: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/pepper.png"
        }),
        mushroom: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/mushroom.png"
        }),
        potato: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/potato.png"
        }),
        onion: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/onion.png"
        }),
        garlic: getAssetsPathByType({
            type: "images",
            scene: "cooking",
            filename: "ingredients/garlic.png"
        }),
    };

    return imageMap[type] || imageMap.carrot; // fallback на морковь
};

const ingredientMap: Record<IngredientID, string> = {
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

export const getIngredientImage = (ingredientName: IngredientID): string => {
    return ingredientMap[ingredientName] || "";
};

export const marketData: MarketItem[] = [
    {
        id: "carrot",
        name: "морковь",
        price: 15,
        image: getIngredientImage("carrot")
    },
    {
        id: "tomato",
        name: "помидор",
        price: 25,
        image: getIngredientImage("tomato")
    },
    {
        id: "cucumber",
        name: "огурец",
        price: 20,
        image: getIngredientImage("cucumber")
    },
    {
        id: "onion",
        name: "лук",
        price: 12,
        image: getIngredientImage("onion")
    },
    {
        id: "onions",
        name: "зелёный лук",
        price: 10,
        image: getIngredientImage("onions")
    },
    {
        id: "potato",
        name: "картофель",
        price: 30,
        image: getIngredientImage("potato")
    },
    {
        id: "potato_puree",
        name: "картофельное пюре",
        price: 45,
        image: getIngredientImage("potato_puree")
    },
    {
        id: "egg",
        name: "яйцо",
        price: 8,
        image: getIngredientImage("egg")
    },
    {
        id: "sweet_dough",
        name: "сдобное тесто",
        price: 55,
        image: getIngredientImage("sweet_dough")
    },
    {
        id: "sugar",
        name: "сахар",
        price: 28,
        image: getIngredientImage("sugar")
    },
    {
        id: "salt",
        name: "соль",
        price: 8,
        image: getIngredientImage("salt")
    },
    {
        id: "pepper",
        name: "перец",
        price: 35,
        image: getIngredientImage("pepper")
    },
    {
        id: "spices",
        name: "специи",
        price: 42,
        image: getIngredientImage("spices")
    },
    {
        id: "oil",
        name: "растительное масло",
        price: 45,
        image: getIngredientImage("oil")
    },
    {
        id: "butter",
        name: "сливочное масло",
        price: 80,
        image: getIngredientImage("butter")
    },
    {
        id: "melted_butter",
        name: "топлёное масло",
        price: 95,
        image: getIngredientImage("melted_butter")
    },
    {
        id: "milk",
        name: "молоко",
        price: 55,
        image: getIngredientImage("milk")
    },
    {
        id: "kefir",
        name: "кефир",
        price: 48,
        image: getIngredientImage("kefir")
    },
    {
        id: "sour_cream",
        name: "сметана",
        price: 65,
        image: getIngredientImage("sour_cream")
    },
    {
        id: "cream",
        name: "сливки",
        price: 75,
        image: getIngredientImage("cream")
    },
    {
        id: "cottage_cheese",
        name: "творог",
        price: 85,
        image: getIngredientImage("cottage_cheese")
    },
    {
        id: "mayonnaise",
        name: "майонез",
        price: 38,
        image: getIngredientImage("mayonnaise")
    },
    {
        id: "chicken",
        name: "курица",
        price: 150,
        image: getIngredientImage("chicken")
    },
    {
        id: "beef",
        name: "говядина",
        price: 200,
        image: getIngredientImage("beef")
    },
    {
        id: "meat",
        name: "мясо",
        price: 180,
        image: getIngredientImage("meat")
    },
    {
        id: "mutton",
        name: "баранина",
        price: 220,
        image: getIngredientImage("mutton")
    },
    {
        id: "ground_meat",
        name: "фарш",
        price: 160,
        image: getIngredientImage("ground_meat")
    },
    {
        id: "fish",
        name: "рыба",
        price: 180,
        image: getIngredientImage("fish")
    },
    {
        id: "sausage",
        name: "колбаса",
        price: 120,
        image: getIngredientImage("sausage")
    },
    {
        id: "salami",
        name: "салями",
        price: 140,
        image: getIngredientImage("salami")
    },
    {
        id: "rice",
        name: "рис",
        price: 40,
        image: getIngredientImage("rice")
    },
    {
        id: "white_bread",
        name: "белый хлеб",
        price: 22,
        image: getIngredientImage("white_bread")
    },
    {
        id: "garlic",
        name: "чеснок",
        price: 18,
        image: getIngredientImage("garlic")
    },
    {
        id: "green",
        name: "зелень",
        price: 25,
        image: getIngredientImage("green")
    },
    {
        id: "lemon",
        name: "лимон",
        price: 25,
        image: getIngredientImage("lemon")
    },
    {
        id: "apple",
        name: "яблоко",
        price: 32,
        image: getIngredientImage("apple")
    },
    {
        id: "mushroom",
        name: "грибы",
        price: 85,
        image: getIngredientImage("mushroom")
    },
    {
        id: "radish",
        name: "свёкла",
        price: 28,
        image: getIngredientImage("radish")
    },
    {
        id: "raisin",
        name: "изюм",
        price: 95,
        image: getIngredientImage("raisin")
    },
    {
        id: "olives",
        name: "оливки",
        price: 110,
        image: getIngredientImage("olives")
    },
    {
        id: "sauerkraut",
        name: "квашеная капуста",
        price: 35,
        image: getIngredientImage("sauerkraut")
    },
    {
        id: "vinegar",
        name: "уксус",
        price: 15,
        image: getIngredientImage("vinegar")
    },
    {
        id: "mustard",
        name: "горчица",
        price: 22,
        image: getIngredientImage("mustard")
    },
    {
        id: "bay_leaf",
        name: "лавровый лист",
        price: 12,
        image: getIngredientImage("bay_leaf")
    },
    {
        id: "nutmeg",
        name: "мускатный орех",
        price: 45,
        image: getIngredientImage("nutmeg")
    },
    {
        id: "mint",
        name: "мята",
        price: 38,
        image: getIngredientImage("mint")
    },
    {
        id: "soup",
        name: "суп",
        price: 75,
        image: getIngredientImage("soup")
    },
    {
        id: "yeast_dough",
        name: "дрожжевое тесто",
        price: 50,
        image: getIngredientImage("yeast_dough")
    },
];