import { create } from "zustand";

interface SettingsState {
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {

  const initial = localStorage.getItem("isSoundEnabled");

  return {
    isSoundEnabled: initial === null ? true : initial === "true",
    toggleSound: () => set((state) => {
      const next = !state.isSoundEnabled;
      localStorage.setItem("isSoundEnabled", String(next));
      return { isSoundEnabled: next };
    }),
  };
});
