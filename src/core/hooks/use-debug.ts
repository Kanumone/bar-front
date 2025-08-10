import { useState, useEffect } from 'react';

/**
 * Хук для управления дебаг режимом
 * Активируется комбинацией клавиш Ctrl+Shift+D или тройным кликом в правом углу
 */
export const useDebug = () => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+Shift+D для открытия дебаг панели
      if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
        event.preventDefault();
        setIsDebugOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Добавляем дополнительную активацию через localStorage для разработки
  useEffect(() => {
    const debugMode = localStorage.getItem('debug-mode');
    if (debugMode === 'true') {
      setIsDebugOpen(true);
    }
  }, []);

  const toggleDebug = () => {
    const newState = !isDebugOpen;
    setIsDebugOpen(newState);
    localStorage.setItem('debug-mode', newState.toString());
  };

  const closeDebug = () => {
    setIsDebugOpen(false);
    localStorage.setItem('debug-mode', 'false');
  };

  return {
    isDebugOpen,
    toggleDebug,
    closeDebug,
  };
};
