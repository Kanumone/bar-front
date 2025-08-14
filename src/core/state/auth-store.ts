import { create } from "zustand";
import WebApp from "@twa-dev/sdk";
import { type AuthControllerGetUserInfo200Response, type CreateSessionDto, apiClient } from "$/api";
import { logAppError } from "@utils/log-app-error";
import { logActivity } from "../../api/log-activity";
import { usePlayerState } from "./player-store"; // ✅ добавлено
import { GameConstants } from "$core/constants/constants";

interface AuthState {
  isTelegram: boolean | null;
  userID: string | null;
  user: AuthControllerGetUserInfo200Response | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthControllerGetUserInfo200Response) => void;
  setSessionId: (sessionId: string) => void;
  authenticateUser: () => Promise<void>;
  requestSession: () => Promise<string>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isTelegram: null,
  user: null,
  userID: localStorage.getItem("userID") || null,
  sessionId: localStorage.getItem("sessionId") || null,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },

  setSessionId: (sessionId) => {
    set({ sessionId,
      isAuthenticated: !!sessionId });
    localStorage.setItem("sessionId", sessionId);
  },

  authenticateUser: async () => {
    // if (!WebApp.initData) {
    //   if (!GameConstants.DEBUG_MODE) {
    //     set({ isTelegram: false });
    //     console.error("Telegram initData not available");
    //     return;
    //   }
    // }
    // console.log("authenticateUser", get().userID);

    // set({ isTelegram: true });

    // if (!get().userID) {
    //   set({ userID: String(WebApp.initDataUnsafe.user?.id) });
    // }

    // try {
    //   const existingSessionId = get().sessionId;
    //   let sessionId = "";

    //   if (existingSessionId) {
    //     const { data: validation } = await apiClient.auth.authControllerValidateSession(existingSessionId);
    //     if (!validation.valid) {
    //       sessionId = await get().requestSession();
    //     }
    //   } else {
    //     sessionId = await get().requestSession();
    //   }
    //   console.log("sessionId", sessionId);

    //   try {
    //     const details: Record<string, string> = {
    //       userAgent: navigator.userAgent,
    //       userId: String(get().userID ?? "unknown"),
    //       telegramVersion: WebApp.version,
    //       sessionId: sessionId,
    //     };

    //     await logActivity("user_authenticated", details, "Auth");

    //     console.log("Logged user agent and Telegram version on authentication.");
    //   } catch (logError: unknown) {
    //     logAppError("Authentication Logging", logError);
    //   }

    //   // ✅ после успешной аутентификации загружаем состояние игрока
    //   try {
    //     // Сначала загружаем из localStorage
    //     usePlayerState.getState().loadPlayerStateFromLocal();

    //     // Затем загружаем с сервера и запускаем автосинхронизацию
    //     await usePlayerState.getState().loadPlayerStateFromServer();
    //     usePlayerState.getState().startAutoSync();

    //     // Отправляем накопленные логи
    //     const { LoggingService } = await import("$services/local-storage-service/logging-service");
    //     LoggingService.sendPendingLogs();
    //   } catch (loadError: unknown) {
    //     logAppError("LoadPlayerState", loadError);
    //   }
    // } catch (error: unknown) {
    //   logAppError("Authentication", error);
    //   get().logout();
    // }
  },

  requestSession: async () => {
    const userID = get().userID;
    if (!userID) {
      throw new Error("User ID is not set");
    }
    let request: CreateSessionDto = {
      telegramId: userID,
    };
    if (WebApp.initDataUnsafe.user) {
      request = {
        ...request,
        username: WebApp.initDataUnsafe.user.username,
        firstName: WebApp.initDataUnsafe.user.first_name,
        lastName: WebApp.initDataUnsafe.user.last_name,
        userAgent: navigator.userAgent,
        telegramVersion: WebApp.version,
      };
    }

    const { data: sessionResp } = await apiClient.auth.authControllerCreateSession(request);

    const sessionId = sessionResp.sessionId;
    get().setSessionId(sessionId);

    // Получаем профиль пользователя по sessionId
    const { data: userInfo } = await apiClient.auth.authControllerGetUserInfo(sessionId);
    get().setUser(userInfo);

    return sessionId;
  },

  logout: () => {
    // Останавливаем автосинхронизацию при выходе
    usePlayerState.getState().stopAutoSync();

    set({
      user: null,
      sessionId: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");
  },
}));
