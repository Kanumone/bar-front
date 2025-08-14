import { create } from "zustand";
import { apiClient } from "$/api";
import type { SceneName, InventoryItem } from "@core/types/common-types";
import { logAppError } from "@utils/log-app-error";
import { LocalStorageService } from "$/services/local-storage-service";
import { syncService } from "$services/local-storage-service/sync-service";
import { GameConstants } from "$/core/constants/constants";
import { getIngredientImage } from "$/features/cooking-game/components/ingredients";
import type { IngredientID } from "$features/cooking-game/types";

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

  setHunger: (value: number) => void;
  addHunger: (amount: number) => void;
  removeHunger: (amount: number) => void;

  setEnergy: (value: number) => void;
  increaseEnergy: () => void;
  decreaseEnergy: () => void;
  addEnergy: (amount: number) => void;
  removeEnergy: (amount: number) => void;

  setMoney: (value: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;

  // Утилитарные методы
  canMove: () => boolean;

  // Методы для работы с инвентарем
  addToInventory: (item: Omit<InventoryItem, "quantity">, quantity?: number) => void;
  removeFromInventory: (itemId: string, quantity?: number) => void;
  getInventoryItem: (itemId: string) => InventoryItem | undefined;
  getInventoryItemQuantity: (itemId: string) => number;
  setInventory: (items: InventoryItem[]) => void;

  setProgress: (checkPoint: string) => void;

  // Методы для работы с localStorage
  loadPlayerStateFromLocal: () => void;
  savePlayerStateToLocal: () => void;
  saveGameProgressToLocal: () => void;

  // Методы для работы с backend (загрузка и сброс)
  loadPlayerStateFromServer: () => Promise<void>;
  resetProgress: () => Promise<void>;

  // Управление синхронизацией
  startAutoSync: () => void;
  stopAutoSync: () => void;
  forceSync: () => Promise<boolean>;
}

export const usePlayerState = create<PlayerState>((set, get) => ({
  playerName: "",
  playerGender: null,
  energy: GameConstants.MAX_ENERGY,
  hunger: 0,
  money: 0,
  inventory: [],
  checkPoint: null,

  setPlayerName: (name) => set({ playerName: name }),
  setPlayerGender: (gender) => set({ playerGender: gender }),

  setEnergy: (value) => {
    const clamped = Math.max(0, Math.min(GameConstants.MAX_ENERGY, value));
    set({ energy: clamped });
  },

  increaseEnergy() {
    if (get().energy < GameConstants.MAX_ENERGY) {
      set((state) => ({ energy: Math.min(GameConstants.MAX_ENERGY, state.energy + 1) }));
    }
  },

  decreaseEnergy() {
    if (get().energy > 0) {
      set((state) => ({ energy: Math.max(0, state.energy - 1) }));
    }
  },

  addEnergy(amount) {
    set((state) => ({
      energy: Math.min(GameConstants.MAX_ENERGY, state.energy + amount),
    }));
  },

  removeEnergy: (amount) => {
    set((state) => ({
      energy: Math.max(0, state.energy - amount),
    }));
  },

  setHunger: (value) => {
    const clamped = Math.max(0, Math.min(GameConstants.MAX_HUNGER, value));
    set({ hunger: clamped });

  },

  addHunger: (amount) => {
    set((state) => ({
      hunger: Math.max(0, Math.min(GameConstants.MAX_HUNGER, state.hunger + amount)),
    }));
  },

  removeHunger: (amount) => {
    set((state) => ({
      hunger: Math.max(0, Math.min(GameConstants.MAX_HUNGER, state.hunger - amount)),
    }));
  },

  setMoney: (value) => {
    set({ money: Math.max(0, value) });

  },

  addMoney: (amount) => {
    if (amount > 0) {
      set((state) => ({ money: state.money + amount }));

    }
  },

  spendMoney: (amount) => {
    const currentMoney = get().money;
    if (currentMoney >= amount && amount > 0) {
      set({ money: currentMoney - amount });

      return true;
    }
    return false;
  },

  // Методы для работы с инвентарем
  addToInventory: (item, quantity = 1) => {
    const currentInventory = get().inventory;
    const existingItemIndex = currentInventory.findIndex((inv) => inv.id === item.id);

    if (existingItemIndex >= 0) {
      // Предмет уже есть в инвентаре, увеличиваем количество
      const newInventory = [...currentInventory];
      newInventory[existingItemIndex] = {
        ...newInventory[existingItemIndex],
        quantity: newInventory[existingItemIndex].quantity + quantity,
      };
      set({ inventory: newInventory });
    } else {
      // Добавляем новый предмет
      const newItem: InventoryItem = {
        ...item,
        quantity,
      };
      set({ inventory: [...currentInventory, newItem] });
    }

  },

  removeFromInventory: (itemId, quantity = 1) => {
    const currentInventory = get().inventory;
    const existingItemIndex = currentInventory.findIndex((inv) => inv.id === itemId);

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
          quantity: currentItem.quantity - quantity,
        };
      }

      set({ inventory: newInventory });

    }
  },

  getInventoryItem: (itemId) => {
    return get().inventory.find((item) => item.id === itemId);
  },

  getInventoryItemQuantity: (itemId) => {
    const item = get().inventory.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  },

  setInventory: (items) => {
    set({ inventory: items });

  },

  setProgress: (checkPoint) => {
    set({ checkPoint });
    get().saveGameProgressToLocal();
  },

  canMove: () => {
    const { energy, hunger } = get();
    return energy > 0 && hunger < GameConstants.MAX_HUNGER;
  },

  // Загрузка состояния из localStorage
  loadPlayerStateFromLocal: () => {
    try {
      const localState = LocalStorageService.getPlayerState();
      const localProgress = LocalStorageService.getGameProgress();

      if (localState) {
        set({
          playerName: localState.playerName,
          playerGender: localState.playerGender,
          energy: localState.energy,
          hunger: localState.hunger,
          money: localState.money,
          inventory: localState.inventory,
          checkPoint: localState.checkPoint,
        });
      }

      if (localProgress) {
        set({ checkPoint: localProgress.checkPoint });
      }
    } catch (err) {
      logAppError("loadPlayerStateFromLocal", err);
    }
  },

  // Сохранение состояния в localStorage
  savePlayerStateToLocal: () => {
    try {
      const currentState = get();
      LocalStorageService.savePlayerState({
        playerName: currentState.playerName,
        playerGender: currentState.playerGender,
        energy: currentState.energy,
        hunger: currentState.hunger,
        money: currentState.money,
        inventory: currentState.inventory,
        checkPoint: currentState.checkPoint,
      });
    } catch (err) {
      logAppError("savePlayerStateToLocal", err);
    }
  },

  // Сохранение прогресса в localStorage
  saveGameProgressToLocal: () => {
    try {
      const { checkPoint } = get();
      LocalStorageService.saveGameProgress(checkPoint);
    } catch (err) {
      logAppError("saveGameProgressToLocal", err);
    }
  },

  /** 🔹 Загрузка состояния игрока с сервера */
  loadPlayerStateFromServer: async () => {
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

      const inventory = player.inventory.map((item) => ({
        id: item.name,
        name: item.name,
        image: getIngredientImage(item.name as IngredientID),
        quantity: item.quantity,
      }));

      set({
        energy: player.energy,
        hunger: player.hunger,
        money: player.money,
        inventory: inventory,
        checkPoint: progress.currentScene as SceneName || null,
      });

      // Сохраняем загруженное состояние в localStorage
      get().savePlayerStateToLocal();
    } catch (err) {
      logAppError("loadPlayerStateFromServer", err);
    }
  },

  // Управление синхронизацией
  startAutoSync: () => {
    syncService.start();
  },

  stopAutoSync: () => {
    syncService.stop();
  },

  forceSync: async () => {
    return syncService.forcSync();
  },

  /** 🔹 Дев-функция сброса прогресса */
  resetProgress: async () => {
    try {
      await Promise.all([
        apiClient.gameState.gameStateControllerDeletePlayerState(),
        apiClient.gameState.gameStateControllerDeleteGameProgress(),
      ]);

      // Очищаем localStorage
      LocalStorageService.clearGameData();

      // Сбрасываем состояние
      set({
        playerName: "",
        playerGender: null,
        energy: 20,
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
