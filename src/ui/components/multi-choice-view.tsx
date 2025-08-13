import { Button } from "$ui/components/button";
import styles from "$ui/scenes/slides-wrapper.module.css";
import type { Action } from "$features/slides";

interface MultiChoiceViewProps {
  action: Extract<Action, { type: "multi-choice" }>;
  onSelect: (groupId: string, option: string) => void;
  onSubmit: () => void;
}

export const MultiChoiceView = ({ action, onSelect, onSubmit }: MultiChoiceViewProps) => {
  return (
    <div className={styles.choiceContainer} onPointerDown={(e) => e.stopPropagation()}>
      {action.groups.map((g) => (
        <div key={g.id} className={styles.choiceOptions}>
          {g.prompt && <div className={styles.choiceMessage}>{g.prompt}</div>}
          {g.options.map((o) => (
            <Button key={`${g.id}-${o}`} text={o} onClick={() => onSelect(g.id, o)} className={styles.choiceButton} />
          ))}
        </div>
      ))}
      {action.submitMode !== "auto" && (
        <div className={styles.actionButtonContainer}>
          <Button text={action.submitButtonText || "Продолжить"} onClick={onSubmit} className={styles.actionButton} />
        </div>
      )}
    </div>
  );
};


