import clsx from "clsx";
import styles from "./style.module.css";

interface Props {
  className?: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ className, text, onClick, disabled }: Props) => {

  const clickHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) onClick();
  };

  return (
    <button onClick={clickHandler} className={clsx(className, styles.button)} disabled={disabled}>
      {text}
    </button>
  );
};
