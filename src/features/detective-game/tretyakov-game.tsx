import React, { useState, useCallback } from "react";
import styles from "./detective-game.module.css";
import { TretyakovRoom } from "./tretyakov-room.tsx";
import { Button } from "$ui/components/button";
import { useSceneStore } from "../../core/state";
import { GameConstants } from "$core/constants/constants";

interface Item {
  id: string;
  name: string;
  description: string;
  emoji: string;
  found: boolean;
}

const SHOW_MESSAGE_TIMEOUT = GameConstants.SHOW_ITEMS_DESCRIPTION_TIMEOUT;

// TODO: доделать. Нужно искать код под картиной, карту под книгами, пульт в вазе
// При находке карты:
//   Смотри-ка, план музея! Служебный выход находится за залом ХХ века. Ирония судьбы — нам нужно пройти через самое современное искусство, чтобы выбраться из классики.
// При находке кода:
//  1856... Год основания галереи! Дед говорил, что в истории всегда есть ответы на современные вопросы. Не думал, что это так буквально!
const ITEMS: Item[] = [
  {
    id: "portrait",
    name: "Портрет",
    description: "Знаменитая картина, от которой невозможно отвести взгляд. Кажется, будто глаза следят за тобой.",
    emoji: "🖼️",
    found: false,
  },
  {
    id: "vase",
    name: "Ваза",
    description: "Старинная ваза с изящным орнаментом. Говорят, она была подарена галерее самим императором.",
    emoji: "🏺",
    found: false,
  },
  {
    id: "lamp",
    name: "Фонарь",
    description: "Отлично! Я вижу больше, чем просто силуэты картин.",
    emoji: "🔦",
    found: false,
  },
  {
    id: "key",
    name: "Ключ",
    description: "Ключ от камеры хранения. Похоже, что он открывает камеру хранения.",
    emoji: "🔑",
    found: false,
  },
  {
    id: "books",
    name: "Книги",
    description: "Старинные фолианты с историей искусства. В них хранятся секреты великих мастеров.",
    emoji: "📚",
    found: false,
  },
];

export const TretyakovGame: React.FC = () => {
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
      setItems([...items]);
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
        📋 Список экспонатов ({foundCount}/{totalItems})
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
        ><TretyakovRoom handleClick={handleItemClick} /></div>
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
              🎉 Поздравляем! Вы нашли все экспонаты!
            </div>
            <div style={{ marginTop: "5%",
              display: "flex",
              justifyContent: "center" }}>
              <Button text="К выходу" onClick={() => handleNext()} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
