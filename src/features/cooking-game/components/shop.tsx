import styles from "./shop.module.css";
import { usePlayerState } from "$core/state";
import { marketData } from "./ingredients";
import type { MarketItem } from "../types";

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

                  <img src={item.image} alt={item.name} className={styles.itemImage} />

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