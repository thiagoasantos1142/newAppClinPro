import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export default function OTAUpdateManager() {
  const appStateRef = useRef(AppState.currentState);
  const checkingRef = useRef(false);
  const lastCheckRef = useRef(0);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    const checkAndApplyUpdate = async () => {
      if (checkingRef.current) return;
      const now = Date.now();
      if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;

      checkingRef.current = true;
      lastCheckRef.current = now;

      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) return;

        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch (error) {
        console.warn('Falha ao verificar OTA update:', error);
      } finally {
        checkingRef.current = false;
      }
    };

    checkAndApplyUpdate();

    const sub = AppState.addEventListener('change', (nextState) => {
      const becameActive =
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active';

      appStateRef.current = nextState;
      if (becameActive) checkAndApplyUpdate();
    });

    return () => {
      sub.remove();
    };
  }, []);

  return null;
}
