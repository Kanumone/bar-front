import { Button } from "$ui/components/button";
import styles from "$ui/scenes/slides-wrapper.module.css";
import type { Action } from "$features/slides";
import { useStoryStore } from "$core/state";

interface MultiChoiceViewProps {
  action: Extract<Action, { type: "multi-choice" }>;
  onSelect: (option: string) => void;
  onSubmit: () => void;
}

export const MultiChoiceView = ({ action, onSelect, onSubmit }: MultiChoiceViewProps) => {
  const slideIndex = useStoryStore((s) => s.slideIndex);
  const actionIndex = useStoryStore((s) => s.actionIndex);
  const getMultiChoiceLocalByKey = useStoryStore((s) => s.getMultiChoiceLocalByKey);
  const key = `s${slideIndex}:a${actionIndex}`;
  const local = getMultiChoiceLocalByKey(key);
  const visited = local?.visited || [];
  console.log("visited", visited);
  console.log("action", action);
  const allVisited = action.options.every((o) => visited.includes(o));

  return (
    <div className={styles.choiceContainer} onPointerDown={(e) => e.stopPropagation()}>
      <div className={styles.choiceOptions}>
        {action.options.map((o) => {
          const disabled = visited.includes(o);
          return (
            <Button key={o} text={o} onClick={() => onSelect(o)} className={styles.choiceButton} disabled={disabled} />
          );
        })}
      </div>
      {action.submitMode !== "auto" && (
        <div className={styles.actionButtonContainer}>
          <Button text={action.submitButtonText || "Продолжить"} onClick={onSubmit} className={styles.actionButton} disabled={!allVisited} />
        </div>
      )}
    </div>
  );
};


