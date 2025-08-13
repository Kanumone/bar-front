import { type PropsWithChildren } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableItemProps {
  id: string;
  className?: string;
}

export const SortableItem = ({ id, className, children }: PropsWithChildren<SortableItemProps>) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {children}
    </div>
  );
};


