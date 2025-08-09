import { create } from "zustand";
import { apiClient } from "$/api";
import type { SceneName, InventoryItem } from "@core/types/common-types";
import { logAppError } from "@utils/log-app-error";

interface PlayerState {
  playerName: string;
  playerGender: "boy" | "girl" | null;
  energy: number;
  hunger: number;
  money: number;
  inventory: InventoryItem[];
  checkPoint: string | null;

  setPlayerName: (name: string) => void;
  setPlayerGender: (gender: "boy" | "girl" | null) => void;

  setEnergy: (value: number) => void;
  setHunger: (value: number) => void;

  increaseEnergy: () => void;
  decreaseEnergy: () => void;
  addEnergy: (amount: number) => void;

  setMoney: (value: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;

  // Методы для работы с инвентарем
  addToInventory: (item: Omit<InventoryItem, 'quantity'>, quantity?: number) => void;
  removeFromInventory: (itemId: string, quantity?: number) => void;
  getInventoryItem: (itemId: string) => InventoryItem | undefined;
  getInventoryItemQuantity: (itemId: string) => number;
  setInventory: (items: InventoryItem[]) => void;

  setProgress: (scene: SceneName, episode: number) => void;

  loadPlayerState: () => Promise<void>;
  savePlayerState: () => Promise<void>;
  saveGameProgress: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

export const usePlayerState = create<PlayerState>((set, get) => ({
  playerName: "",
  playerGender: null,
  energy: 20,
  hunger: 0,
  money: 0,
  inventory: [],
  checkPoint: null,

  setPlayerName: (name) => set({ playerName: name }),
  setPlayerGender: (gender) => set({ playerGender: gender }),

  setEnergy: (value) => {
    set({ energy: value });
    get().savePlayerState()
      .catch((err) => logAppError("autoSaveEnergy", err));
  },

  increaseEnergy() {
    if (get().energy < 20) {
      set((state) => ({ energy: state.energy + 1 }));
      get().savePlayerState()
        .catch((err) => logAppError("autoSaveEnergy", err));
    }
  },

  decreaseEnergy() {
    if (get().energy > 1) {
      set((state) => ({ energy: state.energy - 1 }));
      get().savePlayerState()
        .catch((err) => logAppError("autoSaveEnergy", err));
    }
  },

  addEnergy(amount) {
    const maxEnergy = 20;
    set((state) => ({ 
      energy: Math.min(maxEnergy, state.energy + amount) 
    }));
    get().savePlayerState()
      .catch((err) => logAppError("autoSaveEnergy", err));
  },

  setHunger: (value) => {
    set({ hunger: value });
    get().savePlayerState()
      .catch((err) => logAppError("autoSaveHunger", err));
  },

  setMoney: (value) => {
    set({ money: Math.max(0, value) });
    get().savePlayerState()
      .catch((err) => logAppError("autoSaveMoney", err));
  },

  addMoney: (amount) => {
    if (amount > 0) {
      set((state) => ({ money: state.money + amount }));
      get().savePlayerState()
        .catch((err) => logAppError("autoSaveMoney", err));
    }
  },

  spendMoney: (amount) => {
    const currentMoney = get().money;
    if (currentMoney >= amount && amount > 0) {
      set({ money: currentMoney - amount });
      get().savePlayerState()
        .catch((err) => logAppError("autoSaveMoney", err));
      return true;
    }
    return false;
  },

  // Методы для работы с инвентарем
  addToInventory: (item, quantity = 1) => {
    const currentInventory = get().inventory;
    const existingItemIndex = currentInventory.findIndex(inv => inv.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Предмет уже есть в инвентаре, увеличиваем количество
      const newInventory = [...currentInventory];
      newInventory[existingItemIndex] = {
        ...newInventory[existingItemIndex],
        quantity: newInventory[existingItemIndex].quantity + quantity
      };
      set({ inventory: newInventory });
    } else {
      // Добавляем новый предмет
      const newItem: InventoryItem = {
        ...item,
        quantity
      };
      set({ inventory: [...currentInventory, newItem] });
    }
    
    get().savePlayerState()
      .catch((err) => logAppError("autoSaveInventory", err));
  },

  removeFromInventory: (itemId, quantity = 1) => {
    const currentInventory = get().inventory;
    const existingItemIndex = currentInventory.findIndex(inv => inv.id === itemId);
    
    if (existingItemIndex >= 0) {
      const newInventory = [...currentInventory];
      const currentItem = newInventory[existingItemIndex];
      
      if (currentItem.quantity <= quantity) {
        // Удаляем предмет полностью
        newInventory.splice(existingItemIndex, 1);
      } else {
        // Уменьшаем количество
        newInventory[existingItemIndex] = {
          ...currentItem,
          quantity: currentItem.quantity - quantity
        };
      }
      
      set({ inventory: newInventory });
      get().savePlayerState()
        .catch((err) => logAppError("autoSaveInventory", err));
    }
  },

  getInventoryItem: (itemId) => {
    return get().inventory.find(item => item.id === itemId);
  },

  getInventoryItemQuantity: (itemId) => {
    const item = get().inventory.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  },

  setInventory: (items) => {
    set({ inventory: items });
    get().savePlayerState()
      .catch((err) => logAppError("autoSaveInventory", err));
  },

  setProgress: (checkPoint) => {
    set({ checkPoint });
    get().saveGameProgress()
      .catch((err) => logAppError("autoSaveProgress", err));
  },

  /** 🔹 Загрузка состояния игрока с сервера */
  loadPlayerState: async () => {
    try {
      const [playerRes, progressRes] = await Promise.all([
        apiClient.gameState.gameStateControllerGetPlayerState(),
        apiClient.gameState.gameStateControllerGetGameProgress(),
      ]);

      const player = playerRes.data;
      const progress = progressRes.data;

      if (!player || !progress) {
        return;
      }

      set({
        energy: player.energy,
        hunger: player.hunger,
        money: 0, // TODO: реализовать поддержку money в API
        inventory: [], // // TODO: реализовать поддержку money в API
        checkPoint: progress.currentScene as SceneName || null,
      });
    } catch (err) {
      logAppError("loadPlayerState", err);
    }
  },

  /** 🔹 Сохранение состояния игрока */
  savePlayerState: async () => {
    try {
      const { energy, hunger, money, inventory } = get();
      await apiClient.gameState.gameStateControllerUpdatePlayerState({ 
        energy,
        hunger,
        data: { 
          money, // TODO: перенести в отдельное поле когда API будет поддерживать
          inventory 
        }
      });
    } catch (err) {
      logAppError("savePlayerState", err);
    }
  },

  /** 🔹 Сохранение прогресса игры */
  saveGameProgress: async () => {
    try {
      const { checkPoint } = get();
      await apiClient.gameState.gameStateControllerUpdateGameProgress({
        currentScene: checkPoint || "",
      });
    } catch (err) {
      logAppError("saveGameProgress", err);
    }
  },

  /** 🔹 Дев-функция сброса прогресса */
  resetProgress: async () => {
    try {
      await Promise.all([
        apiClient.gameState.gameStateControllerDeletePlayerState(),
        apiClient.gameState.gameStateControllerDeleteGameProgress(),
      ]);
      set({
        energy: 100,
        hunger: 0,
        money: 0,
        inventory: [],
        checkPoint: null,
      });
    } catch (err) {
      logAppError("resetProgress", err);
    }
  },
}));
