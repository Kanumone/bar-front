import { create } from "zustand";
import WebApp from "@twa-dev/sdk";
import { type UserInfoDto, apiClient } from "$/api";
import { logAppError } from "@utils/log-app-error";
import { logActivity } from "../../api/log-activity";
import { usePlayerState } from "./player-store"; // ✅ добавлено

interface AuthState {
  isTelegram: boolean | null;
  token: string | null;
  user: UserInfoDto | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  setToken: (token: string) => void;
  setUser: (user: UserInfoDto) => void;
  setSessionId: (sessionId: string) => void;
  authenticateUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isTelegram: null,
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null") as UserInfoDto | null,
  sessionId: localStorage.getItem("sessionId") || null,
  isAuthenticated: false,
  isVerifying: false,

  setToken: (token) => {
    set({ token,
      isAuthenticated: !!token });
    localStorage.setItem("token", token);
  },
  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },
  setSessionId: (sessionId) => {
    set({ sessionId });
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
      const authResponse = await apiClient.auth.authControllerLogin({
        initData: WebApp.initData,
      });

      const { accessToken, user, sessionId } = authResponse.data;

      get().setToken(accessToken);
      get().setUser(user);
      get().setSessionId(sessionId);

      try {
        const details: Record<string, string> = {
          userAgent: navigator.userAgent,
          userId: String(user.id),
          telegramVersion: WebApp.version,
          sessionId,
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
    
    set({ token: null,
      user: null,
      sessionId: null,
      isAuthenticated: false });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");
  },
}));
