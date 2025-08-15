import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThoughtBubble } from "$ui/components/thought-bubble";
import { useBackgroundMusic } from "../../core/hooks/use-background-music/use-music";
import type { Episode } from "../../features/slides";
import { Button } from "../components/button";
import { Messagebox } from "../components/messagebox";
import { OrderMessagesView } from "../components/order-messages-view";
import { MultiChoiceView } from "../components/multi-choice-view";
import { useSlidesNavigation } from "./use-slides-navigation";

import styles from "./slides-wrapper.module.css";
import { useSlideEffects } from "./use-slides-effects";
import { useSlideSounds } from "./use-slides-sounds";
import type { SlidesConfig } from "$core/types/common-types";
import { useStoryStore } from "$core/state";

export const SlidesWrapper = ({ config }: { config: SlidesConfig }) => {
  // ✅ Получаем слайды из конфигурации
  const slides: Episode[] = useMemo(() => {
    if (!config) return [];
    return config.getSlides();
  }, [config]);

  // ✅ Хук звуков — передаем первый слайд (или undefined, если пусто)
  const { playSceneSound, setCurrentSlide } = useSlideSounds();

  // ✅ Хук навигации
  const {
    slideIndex,
    actionIndex,
    currentSlide,
    currentActions,
    canSkip,
    setCanSkip,
    imageLoaded,
    setImageLoaded,
    goNext,
    handleActionButtonClick,
    handleChoiceSelect,
    // new
    backgroundOverrideSrc,
    handleImagePick2Select,
    initOrderMessages,
    handleOrderMessagesReorder,
    handleOrderMessagesCheck,
    handleMultiChoiceSelect,
    handleMultiChoiceSubmit,
  } = useSlidesNavigation(slides, playSceneSound, config.sceneConfig.scene);

  const currentAction = currentActions[actionIndex];
  const orderLocal = useStoryStore((s) => s.getOrderMessagesLocal(slideIndex, actionIndex));

  // ✅ обновляем currentSlide для звуков
  useEffect(() => {
    if (currentSlide) setCurrentSlide(currentSlide);
  }, [currentSlide, setCurrentSlide]);

  // ✅ Фоновая музыка из конфигурации
  useBackgroundMusic({
    filename: config.sceneConfig.backgroundMusic || "rain-on-window-29298.mp3",
    scene: config.sceneConfig.scene || "intro",
  });

  const showSkipButton = currentAction?.type === "message" || currentAction?.type === "speech" || currentAction?.type === "thoughts" || actionIndex === -1;

  // ✅ Эффекты (canSkip и т.д.) с настройками из конфигурации
  useSlideEffects({
    imageLoaded,
    actionIndex,
    currentActions,
    showSkipButton,
    setCanSkip,
    config: config.sceneConfig.effects,
  });

  // ✅ Безопасный рендер
  if (!config || slides.length === 0) return <div />;

  const translateX = -currentSlide.originX * 100;
  const translateY = -currentSlide.originY * 100;

  // Обработка клика по фону для перехода к следующему слайду/action
  const handleWrapperClick = () => {
    // Проверяем, что текущий action не требует взаимодействия
    if (currentAction?.type === "order-messages" && orderLocal && !orderLocal.correct) {
      return; // Блокируем переход, пока не собран правильный порядок
    }
    goNext();
  };

  // Инициализация порядка сообщений при входе в action
  useEffect(() => {
    if (currentAction?.type === "order-messages") {
      initOrderMessages();
    }
  }, [currentAction, initOrderMessages]);

  return (
    <div
      className={styles.wrapper}
      onClick={handleWrapperClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.key}
          className={styles.slideLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={backgroundOverrideSrc ?? currentSlide.src}
            className={styles.image}
            style={{
              objectPosition: `${currentSlide.originX * 100}% ${currentSlide.originY * 100}%`,
              left: `${currentSlide.positionX * 100}%`,
              top: `${currentSlide.positionY * 100}%`,
              transform: `translate(${translateX}%, ${translateY}%)`,
            }}
            draggable={false}
            onLoad={() => setImageLoaded(true)}
          />

          {canSkip && showSkipButton && (
            <motion.button
              className={styles.nextBtn}
              initial={{
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: 1.2,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
              }}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentAction && (
          <motion.div
            key={`${slideIndex}-${actionIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: 5 }}
          >
            {currentAction.type === "message" && currentAction.text && (
              <div className={styles.messageContainer}>
                <Messagebox text={currentAction.text} />
              </div>
            )}

            {currentAction.type === "thoughts" && currentAction.text && (
              <ThoughtBubble
                message={currentAction.text}
                bubbleType="thought"
                characterName={currentAction.characterName}
              />
            )}

            {currentAction.type === "speech" && currentAction.text && (
              <ThoughtBubble
                message={currentAction.text}
                bubbleType="speech"
                characterName={currentAction.characterName}
              />
            )}

            {currentAction.type === "choice" && (currentAction as any).options && (
              <div className={styles.choiceContainer}>
                <div className={styles.choiceMessage}>
                  <Messagebox
                    text={
                      "Выберите вариант:"
                    }
                  />
                </div>
                <div className={styles.choiceOptions}>
                  {currentAction.options.map((o: string, idx: number) => (
                    <Button
                      key={`choice-${o}`}
                      text={o}
                      onClick={() => handleChoiceSelect(o, idx)}
                      className={styles.choiceButton}
                    />
                  ))}
                </div>
              </div>
            )}

            {currentAction.type === "button" && currentAction.button && (
              <div className={styles.actionButtonContainer}>
                <Button
                  text={currentAction.button.text}
                  onClick={() => handleActionButtonClick(currentAction)}
                  className={styles.actionButton}
                />
              </div>
            )}

            {currentAction.type === "image-pick-2" && (
              <div className={styles.imagePick2Container}>
                <div className={styles.orderItem}>Какая картина шедевр?</div>
                <div className={styles.imagePick2Top}>
                  <img
                    src={currentAction.topImage}
                    className={styles.imagePick2}
                    onClick={(e) => { e.stopPropagation(); handleImagePick2Select("top"); }}
                  />
                </div>
                <div className={styles.imagePick2Bottom}>
                  <img
                    src={currentAction.bottomImage}
                    className={styles.imagePick2}
                    onClick={(e) => { e.stopPropagation(); handleImagePick2Select("bottom"); }}
                  />
                </div>
              </div>
            )}

            {currentAction.type === "order-messages" && orderLocal && (
              <div className={styles.orderMessagesContainer}>
                <OrderMessagesView
                  items={orderLocal.currentOrder}
                  correctOrder={currentAction.messages}
                  checked={orderLocal.checked}
                  onReorder={handleOrderMessagesReorder}
                  onCheck={() => {
                    const isCorrect = handleOrderMessagesCheck();
                    return isCorrect;
                  }}
                />
              </div>
            )}

            {currentAction.type === "multi-choice" && (
              <div className={styles.multiChoiceContainer}>
                <MultiChoiceView
                  action={currentAction}
                  onSelect={(option) => handleMultiChoiceSelect(option)}
                  onSubmit={() => handleMultiChoiceSubmit()}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
