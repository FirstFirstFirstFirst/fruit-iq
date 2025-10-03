import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, farms, farmsLoading, selectedFarm } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log('[...DEBUG] AuthGuard useEffect triggered', {
      isLoading,
      farmsLoading,
      farmsLength: farms.length,
      isAuthenticated,
      segments: segments.join('/'),
      selectedFarm: selectedFarm?.farmName ?? 'none'
    });

    if (isLoading || farmsLoading) {
      console.log('[...DEBUG] AuthGuard: Waiting for auth/farms to load');
      // Still checking authentication status or loading farms
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
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
        console.log('[...DEBUG] AuthGuard: Redirecting to tabs (from auth)');
        router.replace('/(tabs)');
      }
      // Note: We no longer force users to farm setup screen
      // Users can create farms from the app when they're ready
    }
  }, [isAuthenticated, isLoading, farms, farmsLoading, segments, router, selectedFarm]);

  // Show loading screen while checking authentication or loading farms
  if (isLoading || farmsLoading) {
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