import { useMemo } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "$ui/components/sortable-item";
import styles from "$ui/scenes/slides-wrapper.module.css";

export interface OrderMessagesViewProps {
  items: Array<{ id: string; text: string }>;
  correctOrder: string[];
  checked?: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onCheck: () => boolean;
}

export const OrderMessagesView = ({ items, correctOrder, checked, onReorder, onCheck }: OrderMessagesViewProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  // dnd-ids берём из стабильных id стора
  const itemIds = useMemo(() => items.map((it) => it.id), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(String(active.id));
    const to = itemIds.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onReorder(from, to);
  };

  return (
    <div className={styles.orderList} onPointerDown={(e) => e.stopPropagation()}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((it, idx) => {
            const isCorrect = checked ? it.text === correctOrder[idx] : undefined;
            const className = [
              styles.orderItem,
              checked && isCorrect === true ? styles.orderItemCorrect : "",
              checked && isCorrect === false ? styles.orderItemWrong : "",
            ].filter(Boolean).join(" ");
            return (
              <SortableItem key={it.id} id={it.id} className={className}>
                <span>{it.text}</span>
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
      <button className={styles.checkButton} onClick={(e) => { 
        e.stopPropagation(); 
        const isCorrect = onCheck();
        if (!isCorrect) {
          e.preventDefault();
        }
      }}>
        Проверить
      </button>
    </div>
  );
};


