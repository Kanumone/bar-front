import { ActivityLogsApi, AuthApi, Configuration, GameStateApi, QuizAnswersApi } from "./generated";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Конфигурация использует X-Session-Id (apiKey) вместо Bearer токена
const config = new Configuration({
  basePath: API_BASE_URL,
  apiKey: (name: string) => {
    if (name === "X-Session-Id") {
      return localStorage.getItem("sessionId") || "";
    }
    return "";
  },
});

const authApi = new AuthApi(config);
const activityLogsApi = new ActivityLogsApi(config);
const gameStateApi = new GameStateApi(config);
const quizApi = new QuizAnswersApi(config);

export const apiClient = {
  auth: authApi,
  activityLogs: activityLogsApi,
  gameState: gameStateApi,
  quiz: quizApi,
};
