import React, { useState, useCallback } from "react";
import styles from "./detective-game.module.css";
import { Room } from "./room";
import { Button } from "$ui/components/button";
import { GameConstants } from "$core/constants/constants";
import { useSceneStore } from "$core/state";

interface Item {
  id: string;
  name: string;
  description: string;
  emoji: string;
  found: boolean;
}

const SHOW_MESSAGE_TIMEOUT = GameConstants.SHOW_ITEMS_DESCRIPTION_TIMEOUT;

const ITEMS: Item[] = [
  {
    id: "metro",
    name: "Значок метро",
    description: "Я сам его придумал. И с гордостью ношу.",
    emoji: "📍",
    found: false,
  },
  {
    id: "earpods",
    name: "Наушники с изолентой",
    description: "Хрипят, но ближе всех. Как будто шепчут тайны.",
    emoji: "🎧",
    found: false,
  },
  {
    id: "photo",
    name: "Открытка от отца",
    description: "Без текста. Но и так понятно.",
    emoji: "🎴",
    found: false,
  },
  {
    id: "bottle",
    name: "Бутылка \"Хочу в ...\"",
    description: "Когда-то хотел в Казань. Потом — не знаю куда. Может, просто на диван.",
    emoji: "🧃",
    found: false,
  },
  {
    id: "cassette",
    name: "Кассета деда",
    description: "Всё важное всегда звучало не в словах, а между.",
    emoji: "📹",
    found: false,
  },
  {
    id: "book",
    name: "Книга \"Путь\"",
    description: "Я не знаю, кто её написал. Но каждый раз, как открываю — попадаю в точку.",
    emoji: "📖",
    found: false,
  },
  {
    id: "diary",
    name: "Блокнот",
    description: "Когда не знаешь, что делать — записывай кадры или хотя бы странные мысли.",
    emoji: "📓",
    found: false,
  },
];

export const DetectiveGame: React.FC = () => {
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [showInventory, setShowInventory] = useState(false);
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [showFoundMessage, setShowFoundMessage] = useState(false);

  // Обработчик клика по конкретному элементу
  const handleItemClick = useCallback((event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    const target = (event.target as HTMLElement).parentElement as HTMLElement;
    const itemID = target.id;

    const clickedItem = items.find((item) => item.id === itemID && !item.found);

    if (clickedItem) {
      clickedItem.found = true;
      setItems(items);
      setFoundItem(clickedItem);
      setShowFoundMessage(true);

      target.classList.add(styles.highLight);

      setTimeout(() => {
        setShowFoundMessage(false);
        target.classList.remove(styles.highLight);
      }, SHOW_MESSAGE_TIMEOUT);
    }
  }, [items]);

  const foundCount = items.filter((item) => item.found).length;
  const totalItems = items.length;

  const handleNext = () => {
    useSceneStore.getState().backToPrevScene();
  };

  return (
    <div className={styles.container}>
      {/* Кнопка инвентаря */}
      <button
        className={styles.inventoryButton}
        onClick={() => setShowInventory(!showInventory)}
      >
        📋 Список предметов ({foundCount}/{totalItems})
      </button>

      {/* Инвентарь */}
      {showInventory && (
        <div className={styles.inventory} onClick={() => setShowInventory(false)}>
          <h3>Ищем:</h3>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div
                key={item.id}
                className={`${styles.inventoryItem} ${item.found ? styles.found : ""}`}
              >
                <span className={styles.emoji}>{item.emoji}</span>
                <span className={styles.itemName}>{item.name}</span>
                {item.found && <span className={styles.checkmark}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SVG комната */}
      <div className={styles.roomContainer}>
        <div
          className={styles.svgContainer}
        ><Room handleClick={handleItemClick} /></div>
      </div>

      {/* Сообщение о найденном предмете */}
      {showFoundMessage && foundItem && (
        <div className={styles.foundMessage}>
          <div className={styles.foundContent}>
            <div className={styles.foundEmoji}>{foundItem.emoji}</div>
            <div className={styles.foundName}>{foundItem.name}</div>
            <div className={styles.foundDescription}>{foundItem.description}</div>
          </div>
        </div>
      )}

      <div className={styles.progress}>
        Найдено: {foundCount} из {totalItems}
        {foundCount === totalItems && (
          <>
            <div className={styles.completionMessage}>
              🎉 Поздравляем! Вы нашли все предметы!
            </div>
            <div style={{
              marginTop: "5%",
              display: "flex",
              justifyContent: "center",
            }}>
              <Button text="Застегнуть рюкзак" onClick={() => handleNext()} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
