import { useEffect } from "react";
import { getAssetsPathByType } from "../../../utils";
import { useSettingsStore } from "../../state";

interface HookProps{
  filename: string;
  scene: string;
  enabled?: boolean;
}

export const useBackgroundMusic = ({ filename, scene, enabled = true }: HookProps) => {

  const isSoundEnabled = useSettingsStore((s) => s.isSoundEnabled);

  useEffect(() => {
    // если фон отключен на уровне сцены/обертки — ничего не создаем
    if (!enabled) return;
    const audio = new Audio(getAssetsPathByType({
      type: "sounds",
      scene,
      filename }));
    audio.volume = 0.1;
    audio.loop = true;
    if (isSoundEnabled){
      void audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [filename, isSoundEnabled, scene, enabled]);

};

