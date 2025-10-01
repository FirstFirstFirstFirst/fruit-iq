import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, farms } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      // Still checking authentication status
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inFarmGroup = segments[0] === 'farm';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated) {
      // User is not authenticated, redirect to login
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
    } else {
      // User is authenticated
      // Allow explicit navigation to auth screens (for switching accounts)
      // Only auto-redirect if they're navigating FROM tabs, not TO auth explicitly
      if (inAuthGroup && inTabsGroup) {
        // User clicked "Switch Account" from tabs, allow it
        return;
      }

      if (inAuthGroup && segments[1] === 'login') {
        // Allow manual navigation to login screen (for switch account)
        return;
      }

      if (inAuthGroup) {
        // User is in auth screens (signup) but authenticated, redirect to main app
        if (farms.length === 0) {
          // No farms, redirect to farm setup
          router.replace('/farm/setup');
        } else {
          // Has farms, redirect to main app
          router.replace('/(tabs)');
        }
      } else if (farms.length === 0 && !inFarmGroup) {
        // User has no farms and not in farm setup, redirect to farm setup
        router.replace('/farm/setup');
      }
    }
  }, [isAuthenticated, isLoading, farms, segments, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B46A07" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});