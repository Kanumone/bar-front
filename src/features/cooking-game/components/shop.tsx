import styles from "./shop.module.css";
import { getIngredientImage } from "$/utils";
import { usePlayerState } from "$core/state";
import type { MarketItem } from "../types";

const marketData: MarketItem[] = [
  { id: "carrot",
    name: "морковь",
    price: 15,
    image: getIngredientImage("carrot") },
  { id: "tomato",
    name: "помидор",
    price: 25,
    image: getIngredientImage("tomato") },
  { id: "cucumber",
    name: "огурец",
    price: 20,
    image: getIngredientImage("cucumber") },
  { id: "onion",
    name: "лук",
    price: 12,
    image: getIngredientImage("onion") },
  { id: "onions",
    name: "зелёный лук",
    price: 10,
    image: getIngredientImage("onions") },
  { id: "potato",
    name: "картофель",
    price: 30,
    image: getIngredientImage("potato") },
  { id: "potato_puree",
    name: "картофельное пюре",
    price: 45,
    image: getIngredientImage("potato_puree") },
  { id: "egg",
    name: "яйцо",
    price: 8,
    image: getIngredientImage("egg") },
  { id: "sweet_dough",
    name: "сдобное тесто",
    price: 55,
    image: getIngredientImage("sweet_dough") },
  { id: "sugar",
    name: "сахар",
    price: 28,
    image: getIngredientImage("sugar") },
  { id: "salt",
    name: "соль",
    price: 8,
    image: getIngredientImage("salt") },
  { id: "pepper",
    name: "перец",
    price: 35,
    image: getIngredientImage("pepper") },
  { id: "spices",
    name: "специи",
    price: 42,
    image: getIngredientImage("spices") },
  { id: "oil",
    name: "растительное масло",
    price: 45,
    image: getIngredientImage("oil") },
  { id: "butter",
    name: "сливочное масло",
    price: 80,
    image: getIngredientImage("butter") },
  { id: "melted_butter",
    name: "топлёное масло",
    price: 95,
    image: getIngredientImage("melted_butter") },
  { id: "milk",
    name: "молоко",
    price: 55,
    image: getIngredientImage("milk") },
  { id: "kefir",
    name: "кефир",
    price: 48,
    image: getIngredientImage("kefir") },
  { id: "sour_cream",
    name: "сметана",
    price: 65,
    image: getIngredientImage("sour_cream") },
  { id: "cream",
    name: "сливки",
    price: 75,
    image: getIngredientImage("cream") },
  { id: "cottage_cheese",
    name: "творог",
    price: 85,
    image: getIngredientImage("cottage_cheese") },
  { id: "mayonnaise",
    name: "майонез",
    price: 38,
    image: getIngredientImage("mayonnaise") },
  { id: "chicken",
    name: "курица",
    price: 150,
    image: getIngredientImage("chicken") },
  { id: "beef",
    name: "говядина",
    price: 200,
    image: getIngredientImage("beef") },
  { id: "meat",
    name: "мясо",
    price: 180,
    image: getIngredientImage("meat") },
  { id: "mutton",
    name: "баранина",
    price: 220,
    image: getIngredientImage("mutton") },
  { id: "ground_meat",
    name: "фарш",
    price: 160,
    image: getIngredientImage("ground_meat") },
  { id: "fish",
    name: "рыба",
    price: 180,
    image: getIngredientImage("fish") },
  { id: "sausage",
    name: "колбаса",
    price: 120,
    image: getIngredientImage("sausage") },
  { id: "salami",
    name: "салями",
    price: 140,
    image: getIngredientImage("salami") },
  { id: "rice",
    name: "рис",
    price: 40,
    image: getIngredientImage("rice") },
  { id: "white_bread",
    name: "белый хлеб",
    price: 22,
    image: getIngredientImage("white_bread") },
  { id: "garlic",
    name: "чеснок",
    price: 18,
    image: getIngredientImage("garlic") },
  { id: "green",
    name: "зелень",
    price: 25,
    image: getIngredientImage("green") },
  { id: "lemon",
    name: "лимон",
    price: 25,
    image: getIngredientImage("lemon") },
  { id: "apple",
    name: "яблоко",
    price: 32,
    image: getIngredientImage("apple") },
  { id: "mushroom",
    name: "грибы",
    price: 85,
    image: getIngredientImage("mushroom") },
  { id: "radish",
    name: "свёкла",
    price: 28,
    image: getIngredientImage("radish") },
  { id: "raisin",
    name: "изюм",
    price: 95,
    image: getIngredientImage("raisin") },
  { id: "olives",
    name: "оливки",
    price: 110,
    image: getIngredientImage("olives") },
  { id: "sauerkraut",
    name: "квашеная капуста",
    price: 35,
    image: getIngredientImage("sauerkraut") },
  { id: "vinegar",
    name: "уксус",
    price: 15,
    image: getIngredientImage("vinegar") },
  { id: "mustard",
    name: "горчица",
    price: 22,
    image: getIngredientImage("mustard") },
  { id: "bay_leaf",
    name: "лавровый лист",
    price: 12,
    image: getIngredientImage("bay_leaf") },
  { id: "nutmeg",
    name: "мускатный орех",
    price: 45,
    image: getIngredientImage("nutmeg") },
  { id: "mint",
    name: "мята",
    price: 38,
    image: getIngredientImage("mint") },
  { id: "soup",
    name: "суп",
    price: 75,
    image: getIngredientImage("soup") },
  { id: "yeast_dough",
    name: "дрожжевое тесто",
    price: 50,
    image: getIngredientImage("yeast_dough") },
  { id: "pickled_cucumber",
    name: "солёные огурцы",
    price: 30,
    image: getIngredientImage("pickled_cucumber") },
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
        <span className={styles.moneyIcon}></span>
        <span className={styles.moneyAmount}>{money}</span>
      </div>
      <div className={`${styles.page} ${styles.shopPage}`}>
        <div className={styles.pageContent}>
          <h2 className={styles.pageTitle}>Маркет</h2>

          <div className={styles.itemsScrollContainer}>
            {marketData.map((item, idx) => {
              const canAfford = money >= item.price;
              return (
                <div
                  key={idx}
                  className={`${styles.itemCard} ${!canAfford ? styles.itemNotAvailable : ""}`}
                >
                  <div className={styles.itemImageContainer}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                  </div>
                  <div className={styles.itemBottom}>
                    <div className={styles.itemTitle} title={item.name}>
                      {item.name.split(" ").map((word, i) => (
                        <span key={i} className={styles.itemTitleWord}>{word}</span>
                      ))}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={`${styles.buyButton} ${!canAfford ? styles.buyButtonDisabled : ""}`}
                        onClick={() => handleBuyItem(item)}
                        disabled={!canAfford}
                        aria-label={`Купить ${item.name} за ${item.price} рублей`}
                      >
                        {item.price} ₽
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`${styles.page} ${styles.inventoryPage}`}>
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
                  
                    <img src={item.image} alt={item.name} className={styles.itemImage}/>
                  
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