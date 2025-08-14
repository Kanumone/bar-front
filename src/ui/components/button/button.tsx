import clsx from "clsx";
import styles from "./style.module.css";

interface Props {
  className?: string;
  text: string;
  onClick: () => void;
}

export const Button = ({ className, text, onClick }: Props) => {

  const clickHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  return (
    <button onClick={clickHandler} className={clsx(className, styles.button)}>
      {text}
    </button>
  );
};
