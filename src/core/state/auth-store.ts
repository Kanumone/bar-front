import { create } from "zustand";
import WebApp from "@twa-dev/sdk";
import { type AuthControllerGetUserInfo200Response, apiClient } from "$/api";
import { logAppError } from "@utils/log-app-error";
import { logActivity } from "../../api/log-activity";
import { usePlayerState } from "./player-store"; // ✅ добавлено

interface AuthState {
  isTelegram: boolean | null;
  user: AuthControllerGetUserInfo200Response | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  setUser: (user: AuthControllerGetUserInfo200Response) => void;
  setSessionId: (sessionId: string) => void;
  authenticateUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isTelegram: null,
  user: JSON.parse(localStorage.getItem("user") || "null") as AuthControllerGetUserInfo200Response | null,
  sessionId: localStorage.getItem("sessionId") || null,
  isAuthenticated: !!localStorage.getItem("sessionId"),
  isVerifying: false,

  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },
  setSessionId: (sessionId) => {
    set({ sessionId, isAuthenticated: !!sessionId });
    localStorage.setItem("sessionId", sessionId);
  },

  authenticateUser: async () => {
    let isTelegram = get().isTelegram;
    if (isTelegram === null && !WebApp.initData) {
      isTelegram = false;
      set({ isTelegram });
      console.error("Telegram initData not available");
      return;
    }

    set({ isTelegram: true });

    if (get().isVerifying) return;

    set({ isVerifying: true });

    try {
      const existingSessionId = get().sessionId;

      if (existingSessionId) {
        // Валидация текущей сессии
        const { data: validation } = await apiClient.auth.authControllerValidateSession(existingSessionId);
        if (!validation.valid) {
          // Не валидна — создаем новую
          set({ sessionId: null, isAuthenticated: false });
        }
      }

      let sessionId = get().sessionId;

      if (!sessionId) {
        const tgUser = WebApp.initDataUnsafe.user;
        if (!tgUser) {
          throw new Error("Telegram user is not available in initDataUnsafe");
        }

        const { data: sessionResp } = await apiClient.auth.authControllerCreateSession({
          telegramId: String(tgUser.id),
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          userAgent: navigator.userAgent,
          telegramVersion: WebApp.version,
        });

        sessionId = sessionResp.sessionId;
        get().setSessionId(sessionId);
      }

      // Получаем профиль пользователя по sessionId
      const { data: userInfo } = await apiClient.auth.authControllerGetUserInfo(sessionId!);
      get().setUser(userInfo);

      try {
        const details: Record<string, string> = {
          userAgent: navigator.userAgent,
          userId: String(userInfo.id ?? "unknown"),
          telegramVersion: WebApp.version,
          sessionId: sessionId!,
        };

        await logActivity("user_authenticated", details, "Auth");

        console.log("Logged user agent and Telegram version on authentication.");
      } catch (logError: unknown) {
        logAppError("Authentication Logging", logError);
      }

      // ✅ после успешной аутентификации загружаем состояние игрока
      try {
        // Сначала загружаем из localStorage
        usePlayerState.getState().loadPlayerStateFromLocal();
        
        // Затем загружаем с сервера и запускаем автосинхронизацию
        await usePlayerState.getState().loadPlayerStateFromServer();
        usePlayerState.getState().startAutoSync();
        
        // Отправляем накопленные логи
        const { LoggingService } = await import("$/services/logging-service");
        LoggingService.sendPendingLogs();
      } catch (loadError: unknown) {
        logAppError("LoadPlayerState", loadError);
      }

      set({ isVerifying: false });
    } catch (error: unknown) {
      logAppError("Authentication", error);
      get().logout();
      throw error;
    } finally {
      set({ isVerifying: false });
    }
  },

  logout: () => {
    // Останавливаем автосинхронизацию при выходе
    usePlayerState.getState().stopAutoSync();
    
    set({ user: null,
      sessionId: null,
      isAuthenticated: false });
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");
  },
}));
