import { useEffect, useState } from "react";
import styles from "./cooking-notification.module.css";

interface CookingNotificationProps {
  isVisible: boolean;
  currentEnergy: number;
  maxEnergy: number;
  onAnimationComplete: () => void;
}

export const CookingNotification = ({
  isVisible,
  currentEnergy,
  maxEnergy,
  onAnimationComplete,
}: CookingNotificationProps) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Запускаем исчезновение через 2 секунды
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Дополнительное время для завершения анимации исчезновения
        setTimeout(onAnimationComplete, 300);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  if (!isVisible && !shouldRender) return null;

  return (
    <div className={`${styles.overlay} ${shouldRender ? styles.visible : styles.hidden}`}>
      <div className={styles.notification}>
        <div className={styles.title}>Приготовлено!</div>
        <div className={styles.energyDisplay}>
          <span className={styles.energyIcon}>⚡</span>
          <span className={styles.energyText}>
            {currentEnergy}/{maxEnergy}
          </span>
        </div>
      </div>
    </div>
  );
};
