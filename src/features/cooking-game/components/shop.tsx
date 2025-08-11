import styles from "./shop.module.css";
import { getIngredientImage } from "$/utils";
import { usePlayerState } from "$core/state";
import type { MarketItem } from "../types";

const marketData: MarketItem[] = [
  { id: "carrot",
    name: "морковь",
    price: 15,
    image: getIngredientImage("морковь") },
  { id: "tomato",
    name: "помидор",
    price: 25,
    image: getIngredientImage("помидор") },
  { id: "cucumber_fresh",
    name: "огурец свежий",
    price: 20,
    image: getIngredientImage("огурец свежий") },
  { id: "cucumber_pickled",
    name: "огурец маринованный",
    price: 18,
    image: getIngredientImage("огурец маринованный") },
  { id: "onion",
    name: "лук",
    price: 12,
    image: getIngredientImage("лук") },
  { id: "onion_bulb",
    name: "лук репчатый",
    price: 10,
    image: getIngredientImage("лук репчатый") },
  { id: "potato",
    name: "картофель",
    price: 30,
    image: getIngredientImage("картофель") },
  { id: "mashed_potato",
    name: "пюре картофельное",
    price: 45,
    image: getIngredientImage("пюре картофельное") },
  { id: "egg",
    name: "яйцо",
    price: 8,
    image: getIngredientImage("яйцо") },
  { id: "flour",
    name: "мука",
    price: 35,
    image: getIngredientImage("мука") },
  { id: "sweet_dough",
    name: "тесто сладкое",
    price: 55,
    image: getIngredientImage("тесто сладкое") },
  { id: "sugar",
    name: "сахар",
    price: 28,
    image: getIngredientImage("сахар") },
  { id: "salt",
    name: "соль",
    price: 8,
    image: getIngredientImage("соль") },
  { id: "pepper",
    name: "перец",
    price: 35,
    image: getIngredientImage("перец") },
  { id: "spices",
    name: "специи",
    price: 42,
    image: getIngredientImage("специи") },
  { id: "vegetable_oil",
    name: "масло растительное",
    price: 45,
    image: getIngredientImage("масло растительное") },
  { id: "butter",
    name: "масло сливочное",
    price: 80,
    image: getIngredientImage("масло сливочное") },
  { id: "ghee",
    name: "масло топленое",
    price: 95,
    image: getIngredientImage("масло топленое") },
  { id: "milk",
    name: "молоко",
    price: 55,
    image: getIngredientImage("молоко") },
  { id: "kefir",
    name: "кефир",
    price: 48,
    image: getIngredientImage("кефир") },
  { id: "sour_cream",
    name: "сметана",
    price: 65,
    image: getIngredientImage("сметана") },
  { id: "cream",
    name: "сливки",
    price: 75,
    image: getIngredientImage("сливки") },
  { id: "cottage_cheese",
    name: "творог",
    price: 85,
    image: getIngredientImage("творог") },
  { id: "mayonnaise",
    name: "майонез",
    price: 38,
    image: getIngredientImage("майонез") },
  { id: "chicken",
    name: "курица",
    price: 150,
    image: getIngredientImage("курица") },
  { id: "beef",
    name: "говядина",
    price: 200,
    image: getIngredientImage("говядина") },
  { id: "pork",
    name: "свинина",
    price: 180,
    image: getIngredientImage("свинина") },
  { id: "lamb",
    name: "баранина",
    price: 220,
    image: getIngredientImage("баранина") },
  { id: "minced_meat",
    name: "фарш",
    price: 160,
    image: getIngredientImage("фарш") },
  { id: "fish",
    name: "рыба",
    price: 180,
    image: getIngredientImage("рыба") },
  { id: "sausage",
    name: "колбаса",
    price: 120,
    image: getIngredientImage("колбаса") },
  { id: "salami",
    name: "салями",
    price: 140,
    image: getIngredientImage("салями") },
  { id: "rice",
    name: "рис",
    price: 40,
    image: getIngredientImage("рис") },
  { id: "white_bread",
    name: "хлеб белый",
    price: 22,
    image: getIngredientImage("хлеб белый") },
  { id: "garlic",
    name: "чеснок",
    price: 18,
    image: getIngredientImage("чеснок") },
  { id: "herbs",
    name: "зелень",
    price: 25,
    image: getIngredientImage("зелень") },
  { id: "lemon",
    name: "лимон",
    price: 25,
    image: getIngredientImage("лимон") },
  { id: "apple",
    name: "яблоко",
    price: 32,
    image: getIngredientImage("яблоко") },
  { id: "mushrooms",
    name: "грибы",
    price: 85,
    image: getIngredientImage("грибы") },
  { id: "radish",
    name: "редис",
    price: 28,
    image: getIngredientImage("редис") },
  { id: "raisins",
    name: "изюм",
    price: 95,
    image: getIngredientImage("изюм") },
  { id: "olives",
    name: "оливки",
    price: 110,
    image: getIngredientImage("оливки") },
  { id: "sauerkraut",
    name: "капуста квашеная",
    price: 35,
    image: getIngredientImage("капуста квашеная") },
  { id: "vinegar",
    name: "уксус",
    price: 15,
    image: getIngredientImage("уксус") },
  { id: "mustard",
    name: "горчица",
    price: 22,
    image: getIngredientImage("горчица") },
  { id: "bay_leaf",
    name: "лавровый лист",
    price: 12,
    image: getIngredientImage("лавровый лист") },
  { id: "nutmeg",
    name: "мускатный орех",
    price: 45,
    image: getIngredientImage("мускатный орех") },
  { id: "mint",
    name: "мята",
    price: 38,
    image: getIngredientImage("мята") },
  { id: "soup",
    name: "суп",
    price: 75,
    image: getIngredientImage("суп") },
];

interface ShopProps {
  back: () => void;
}

export const Shop = ({ back }: ShopProps) => {
  const { money, spendMoney, inventory, addToInventory } = usePlayerState();

  const handleBuyItem = (item: MarketItem) => {
    // Проверяем, достаточно ли денег
    if (money >= item.price) {
      const success = spendMoney(item.price);
      if (success) {
        // Добавляем предмет в инвентарь
        addToInventory({
          id: item.id,
          name: item.name,
          image: item.image,
        }, 1);

        console.log("Покупка успешна:", item.name, "за", item.price, "₽");
      } else {
        console.log("Ошибка при покупке:", item.name);
      }
    } else {
      console.log("Недостаточно денег для покупки:", item.name, "Нужно:", item.price, "Есть:", money);
    }
  };

  return (
    <div className={styles.book}>
      <button className={styles.backButton} onClick={back}>
        <span className={styles.backArrow}>←</span>
      </button>
      <div className={styles.moneyCounter}>
        <span className={styles.moneyIcon}>💰</span>
        <span className={styles.moneyAmount}>{money}</span>
      </div>
      <div className={styles.page}>
        <div className={styles.pageContent}>
          <h2 className={styles.pageTitle}>Маркет</h2>

          <div className={styles.itemsScrollContainer}>
            {marketData.map((item, idx) => {
              const canAfford = money >= item.price;
              return (
                <div
                  key={idx}
                  className={`${styles.itemWrapper} ${!canAfford ? styles.itemNotAvailable : ""}`}
                  onClick={() => handleBuyItem(item)}
                >
                  <div className={styles.itemIcon}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <span className={styles.itemLabel}>{item.name}</span>
                  <span className={`${styles.itemPrice} ${!canAfford ? styles.priceNotAvailable : ""}`}>
                    {item.price} ₽
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.page}>
        <div className={styles.pageContent}>
          <h2 className={styles.pageTitle}>Инвентарь</h2>

          <div className={styles.itemsScrollContainer}>
            {inventory.length === 0 ? (
              <div className={styles.emptyInventory}>
                <p>Инвентарь пуст</p>
                <p>Покупайте предметы в магазине!</p>
              </div>
            ) : (
              inventory.map((item, idx) => (
                <div key={idx} className={styles.itemWrapper}>
                  <div className={styles.itemIcon}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <span className={styles.itemLabel}>{item.quantity} {item.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
