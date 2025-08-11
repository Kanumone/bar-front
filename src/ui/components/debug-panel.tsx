import React, { useState, useEffect } from "react";
import { usePlayerState } from "@core/state";
import { LocalStorageService, syncService, LoggingService } from "$services/local-storage-service";
import { logActivity } from "$/api/log-activity";

import styles from "./debug-panel.module.css";

interface DebugPanelProps {
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState(syncService.getStatus());
  const [logsStatus, setLogsStatus] = useState(LoggingService.getPendingLogsStatus());

  const playerState = usePlayerState();

  // Обновляем статусы каждые 2 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncService.getStatus());
      setLogsStatus(LoggingService.getPendingLogsStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTestLocalStorage = () => {
    console.log("Testing localStorage...");

    // Сохраняем тестовые данные
    playerState.setEnergy(15);
    playerState.addMoney(100);
    playerState.setProgress("TestScene");

    console.log("Local storage test completed");
  };

  const handleTestLogging = async () => {
    console.log("Testing logging...");

    await logActivity("debug_test", {
      testData: "This is a test log",
      timestamp: new Date().toISOString(),
    }, "DebugPanel");

    console.log("Logging test completed");
  };

  const handleForceSync = async () => {
    console.log("Force syncing...");
    const success = await playerState.forceSync();
    console.log("Force sync result:", success);
  };

  const handleClearLocalData = () => {
    LocalStorageService.clearGameData();
    LoggingService.clearPendingLogs();
    console.log("Local data cleared");
  };

  const handleLoadFromLocal = () => {
    playerState.loadPlayerStateFromLocal();
    console.log("Loaded from localStorage");
  };

  return (
    <div className={styles.debugPanel}>
      <div className={styles.header}>
        <h3>Debug Panel</h3>
        <button onClick={onClose} className={styles.closeButton}>×</button>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h4>Player State</h4>
          <div className={styles.info}>
            <p>Energy: {playerState.energy}</p>
            <p>Money: {playerState.money}</p>
            <p>CheckPoint: {playerState.checkPoint || "None"}</p>
            <p>Inventory Items: {playerState.inventory.length}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Sync Status</h4>
          <div className={styles.info}>
            <p>Running: {syncStatus.isRunning ? "✅" : "❌"}</p>
            <p>Needs Sync: {syncStatus.needsSync ? "⚠️" : "✅"}</p>
            <p>Retry Count: {syncStatus.retryCount}</p>
            <p>Last Save: {syncStatus.lastSaveTimestamp ? new Date(syncStatus.lastSaveTimestamp).toLocaleTimeString() : "Never"}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Pending Logs</h4>
          <div className={styles.info}>
            <p>Count: {logsStatus.count}</p>
            <p>Oldest: {logsStatus.oldestTimestamp ? new Date(logsStatus.oldestTimestamp).toLocaleTimeString() : "N/A"}</p>
            <p>Newest: {logsStatus.newestTimestamp ? new Date(logsStatus.newestTimestamp).toLocaleTimeString() : "N/A"}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h4>Actions</h4>
          <div className={styles.actions}>
            <button onClick={handleTestLocalStorage} className={styles.button}>
              Test localStorage
            </button>
            <button onClick={handleTestLogging} className={styles.button}>
              Test Logging
            </button>
            <button onClick={handleForceSync} className={styles.button}>
              Force Sync
            </button>
            <button onClick={handleLoadFromLocal} className={styles.button}>
              Load from Local
            </button>
            <button onClick={handleClearLocalData} className={styles.buttonDanger}>
              Clear Local Data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
