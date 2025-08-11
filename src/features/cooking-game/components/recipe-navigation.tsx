import clsx from "clsx";
import styles from "./recipe-navigation.module.css";

interface RecipeNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  className?: string;
}

export const RecipeNavigation = ({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  className,
}: RecipeNavigationProps) => {
  const handlePrevious = (event: React.MouseEvent) => {
    event.preventDefault();
    if (hasPrevious) {
      onPrevious();
    }
  };

  const handleNext = (event: React.MouseEvent) => {
    event.preventDefault();
    if (hasNext) {
      onNext();
    }
  };

  return (
    <div className={clsx(styles.navigation, className)}>
      <button
        onClick={handlePrevious}
        className={clsx(
          styles.navButton,
          styles.leftButton,
          !hasPrevious && styles.disabled,
        )}
        disabled={!hasPrevious}
      >
        <svg
          className={styles.chevronIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>

      <button
        onClick={handleNext}
        className={clsx(
          styles.navButton,
          styles.rightButton,
          !hasNext && styles.disabled,
        )}
        disabled={!hasNext}
      >
        <svg
          className={styles.chevronIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </div>
  );
};
