import { useEffect } from "react";
import { useAuthStore } from "@core/state";
import { useTelegram } from "../use-telegram";

export const useAuth = () => {
  const { webApp: { initData } } = useTelegram();

  const { sessionId, authenticateUser } = useAuthStore();

  useEffect(() => {
    if (initData) {
      void authenticateUser();
    }
  }, [authenticateUser, initData]);

  return sessionId;
};
