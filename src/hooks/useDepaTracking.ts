import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

/**
 * Hook to track app usage for DEPA reporting
 * - Records app open when app becomes active
 * - Records session duration when app goes to background
 */
export function useDepaTracking() {
  const { isAuthenticated } = useAuth();
  const startTimeRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Record initial app open
    apiClient.post('/depa/open').catch((err) => {
      console.log('[DEPA] Failed to record open:', err.message);
    });
    startTimeRef.current = Date.now();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background - send duration
        const minutes = Math.round((Date.now() - startTimeRef.current) / 60000);
        if (minutes > 0) {
          apiClient.post('/depa/close', { minutes }).catch((err) => {
            console.log('[DEPA] Failed to record close:', err.message);
          });
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App coming to foreground - record new open
        apiClient.post('/depa/open').catch((err) => {
          console.log('[DEPA] Failed to record open:', err.message);
        });
        startTimeRef.current = Date.now();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      // Send final duration on unmount
      const minutes = Math.round((Date.now() - startTimeRef.current) / 60000);
      if (minutes > 0) {
        apiClient.post('/depa/close', { minutes }).catch(() => {});
      }
    };
  }, [isAuthenticated]);
}
