# F6: Offline/Timeout Handling

> **Priority**: MEDIUM | **Complexity**: MEDIUM | **Est. Time**: 2 hours

---

## Quick Start

1. Read DEVELOPMENT_PLAN.md for architecture overview
2. Read PROGRESS.md and update status to IN_PROGRESS
3. Read CLAUDE.md for coding standards

---

## Prerequisites

Install netinfo:
```bash
npx expo install @react-native-community/netinfo
```

---

## Task Description

Improve UX when offline - immediately enable manual mode instead of waiting for API timeout.

### Current Behavior
User must wait for API timeout (30+ seconds) before seeing error and manual entry option.

### New Behavior
- Detect offline status proactively
- Show offline indicator immediately
- Enable manual entry mode when offline
- Reduce API timeout to 8 seconds

---

## Files to Create/Modify

| File | Action |
|------|--------|
| src/hooks/useNetworkStatus.ts | CREATE |
| src/components/OfflineBanner.tsx | CREATE |
| src/lib/api.ts | MODIFY - add timeout |
| src/components/camera/CleanScannerScreen.tsx | MODIFY |
| app/_layout.tsx | MODIFY - optional global banner |

---

## Step 1: Create Network Status Hook

File: src/hooks/useNetworkStatus.ts

```typescript
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Get initial state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  const isOffline = isConnected === false || isInternetReachable === false;

  return {
    isConnected,
    isInternetReachable,
    isOffline,
    isOnline: isConnected === true && isInternetReachable !== false,
  };
}
```

---

## Step 2: Create Offline Banner

File: src/components/OfflineBanner.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <MaterialIcons name="wifi-off" size={20} color="#92400e" />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#fcd34d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#92400e',
  },
});
```

---

## Step 3: Update API Client with Timeout

File: src/lib/api.ts

Add AbortController to fetch requests:

```typescript
private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;
  const headers = await this.getAuthHeaders();

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    // ... rest of handling
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    throw error;
  }
}
```

---

## Step 4: Update CleanScannerScreen

File: src/components/camera/CleanScannerScreen.tsx

Add imports:
```typescript
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
```

Add in component:
```typescript
const { isOffline } = useNetworkStatus();
```

UI changes:
- If offline, show offline message prominently
- Disable camera scan button when offline
- Make manual entry button more prominent
- Show suggestion: "Use manual entry mode"

Example:
```typescript
{isOffline && (
  <View style={styles.offlineNotice}>
    <MaterialIcons name="wifi-off" size={24} color="#f59e0b" />
    <Text style={styles.offlineText}>
      No internet - use manual entry
    </Text>
  </View>
)}

<TouchableOpacity
  style={[
    cameraStyles.cleanScanButton,
    isOffline && cameraStyles.scanButtonDisabled,
  ]}
  onPress={onScan}
  disabled={isProcessingPhoto || isOffline}
>
```

---

## Step 5: Optional - Add Global Banner

File: app/_layout.tsx

Add OfflineBanner at the top of the app:
```typescript
import { OfflineBanner } from '../src/components/OfflineBanner';

// In render:
<>
  <OfflineBanner />
  <Stack>...</Stack>
</>
```

---

## UI Design Reference

### Offline Notice in Scanner Screen
```
+----------------------------------+
|   [wifi-off icon]                |
|   No Internet Connection         |
|   Please use manual entry        |
+----------------------------------+
|                                  |
|   [Camera button - disabled]     |
|                                  |
+----------------------------------+
| +------------------------------+ |
| |   Enter Weight Manually     | |  <- Prominent
| +------------------------------+ |
+----------------------------------+
```

---

## Validation

Run: npm run lint:fix && npm run lint && npm run typecheck

---

## Testing

1. Turn off internet/airplane mode on device
2. Open Camera tab
3. Should immediately show offline indicator
4. Camera scan button should be disabled
5. Manual entry should be prominently available
6. Turn internet back on
7. Offline indicator should disappear
8. Camera scan should work again

---

## Commit Message

feat(offline): improve offline detection and UX

- Create useNetworkStatus hook for connection monitoring
- Add OfflineBanner component for visual feedback
- Add 8 second timeout to API requests
- Disable camera scan when offline
- Promote manual entry option when offline

Testing: Turn off internet -> Camera tab -> Shows offline mode immediately
