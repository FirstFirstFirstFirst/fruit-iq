import { useState, useEffect } from 'react';
import { Platform, Dimensions, StatusBar } from 'react-native';

interface AndroidNavBarInfo {
  hasNavBar: boolean;
  navBarHeight: number;
  isGestureNavigation: boolean;
  safeBottomPadding: number;
}

/**
 * Hook to detect Android navigation bar and provide safe area adjustments
 * Helps prevent UI elements from being hidden behind the nav bar
 */
export const useAndroidNavBar = (): AndroidNavBarInfo => {
  const [navBarInfo, setNavBarInfo] = useState<AndroidNavBarInfo>({
    hasNavBar: false,
    navBarHeight: 0,
    isGestureNavigation: false,
    safeBottomPadding: 0,
  });

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const detectNavBar = () => {
      const screen = Dimensions.get('screen');
      const window = Dimensions.get('window');
      
      // Calculate the difference between screen and window dimensions
      const heightDiff = screen.height - window.height;
      const widthDiff = screen.width - window.width;
      
      // Get status bar height
      const statusBarHeight = StatusBar.currentHeight || 0;
      
      // Navigation bar is typically at the bottom, so height difference matters more
      const potentialNavBarHeight = heightDiff - statusBarHeight;
      
      // Android navigation bar detection logic
      const hasNavBar = potentialNavBarHeight > 0;
      
      // Gesture navigation typically has a smaller height (around 16-24dp)
      // Traditional nav bar is usually 48dp or more
      const isGestureNavigation = hasNavBar && potentialNavBarHeight < 40;
      
      // Safe padding recommendations
      let safeBottomPadding = 0;
      if (hasNavBar) {
        if (isGestureNavigation) {
          // For gesture navigation, add minimal padding
          safeBottomPadding = 8;
        } else {
          // For traditional nav bar, add more padding
          safeBottomPadding = 16;
        }
      }

      const newNavBarInfo: AndroidNavBarInfo = {
        hasNavBar,
        navBarHeight: Math.max(0, potentialNavBarHeight),
        isGestureNavigation,
        safeBottomPadding,
      };

      console.log('Android NavBar Detection:', {
        screen: { width: screen.width, height: screen.height },
        window: { width: window.width, height: window.height },
        statusBarHeight,
        heightDiff,
        widthDiff,
        ...newNavBarInfo,
      });

      setNavBarInfo(newNavBarInfo);
    };

    detectNavBar();

    // Listen for dimension changes (orientation, keyboard, etc.)
    const subscription = Dimensions.addEventListener('change', detectNavBar);

    return () => {
      subscription?.remove();
    };
  }, []);

  return navBarInfo;
};

/**
 * Hook to get safe tab bar styles for Android
 * Returns style object that can be applied to tab bar container
 */
export const useAndroidSafeTabBarStyle = () => {
  const { hasNavBar, safeBottomPadding, isGestureNavigation } = useAndroidNavBar();

  if (Platform.OS !== 'android' || !hasNavBar) {
    return {};
  }

  return {
    paddingBottom: safeBottomPadding,
    // Add subtle visual separator if there's a nav bar conflict
    borderTopWidth: 1,
    borderTopColor: isGestureNavigation ? 'transparent' : '#e5e7eb',
  };
};

/**
 * Get safe area insets for Android specifically
 * Useful for adjusting content that might conflict with nav bar
 */
export const getAndroidSafeInsets = () => {
  if (Platform.OS !== 'android') {
    return { bottom: 0, top: 0 };
  }

  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');
  const statusBarHeight = StatusBar.currentHeight || 0;
  
  return {
    top: statusBarHeight,
    bottom: Math.max(0, screen.height - window.height - statusBarHeight),
  };
};