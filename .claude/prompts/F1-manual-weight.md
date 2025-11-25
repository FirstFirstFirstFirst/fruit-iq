# F1: Manual Weight Input Before Scan

> **Priority**: HIGH | **Complexity**: MEDIUM | **Can Run Parallel**: YES (avoid F2)

---

## Pre-Flight Checklist

```bash
cat DEVELOPMENT_PLAN.md
cat PROGRESS.md
# Update PROGRESS.md: F1 status → IN_PROGRESS
```

---

## Task Description

Allow users to enter weight manually BEFORE selecting fruit, bypassing camera scan entirely.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/camera/screens/ManualWeightEntryScreen.tsx` | CREATE |
| `src/components/camera/constants.ts` | MODIFY - Add step |
| `src/hooks/useCameraActions.ts` | MODIFY |
| `app/(tabs)/camera.tsx` | MODIFY - Add case |

---

## Implementation

### Step 1: Update `constants.ts`

```typescript
export type CameraStep =
  | "scan"
  | "camera"
  | "manual-weight"  // ADD THIS
  | "select"
  | "weight"
  | "confirm"
  | "qr-payment"
  | "success"
  | "add-fruit";
```

### Step 2: Create `ManualWeightEntryScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface ManualWeightEntryScreenProps {
  onConfirm: (weight: number) => void;
  onBack: () => void;
  onCancel?: () => void;
}

export default function ManualWeightEntryScreen({
  onConfirm,
  onBack,
  onCancel,
}: ManualWeightEntryScreenProps) {
  const [weightInput, setWeightInput] = useState('0');

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setWeightInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (key === '.') {
      if (!weightInput.includes('.')) {
        setWeightInput(prev => prev + '.');
      }
    } else {
      setWeightInput(prev => prev === '0' ? key : prev + key);
    }
  };

  const handleConfirm = () => {
    const weight = parseFloat(weightInput);
    if (weight > 0) {
      onConfirm(weight);
    }
  };

  // Render numeric keypad with keys 0-9, '.', backspace
  // Render weight display
  // Render "เลือกผลไม้" button
}
```

### Step 3: Update `useCameraActions.ts`

```typescript
const handleManualEntry = () => {
  setStep("manual-weight");  // Changed from "select"
};

const handleManualWeightConfirm = (weight: number) => {
  setDetectedWeight(weight);
  setStep("select");
};

// Add to return object:
return {
  // ... existing
  handleManualWeightConfirm,
};
```

### Step 4: Update `camera.tsx`

```typescript
// Add case for manual-weight step
if (cameraState.step === "manual-weight") {
  return (
    <ManualWeightEntryScreen
      onConfirm={cameraActions.handleManualWeightConfirm}
      onBack={() => cameraState.setStep("scan")}
      onCancel={handleCancelFlow}
    />
  );
}
```

---

## UI Design

```
┌─────────────────────────────────┐
│  ◀  กรอกน้ำหนัก           [X]  │
├─────────────────────────────────┤
│         ┌─────────────┐         │
│         │   2.50      │  กก.    │
│         └─────────────┘         │
│                                 │
│    ┌───┐  ┌───┐  ┌───┐         │
│    │ 1 │  │ 2 │  │ 3 │         │
│    └───┘  └───┘  └───┘         │
│    ┌───┐  ┌───┐  ┌───┐         │
│    │ 4 │  │ 5 │  │ 6 │         │
│    └───┘  └───┘  └───┘         │
│    ┌───┐  ┌───┐  ┌───┐         │
│    │ 7 │  │ 8 │  │ 9 │         │
│    └───┘  └───┘  └───┘         │
│    ┌───┐  ┌───┐  ┌───┐         │
│    │ . │  │ 0 │  │ ⌫ │         │
│    └───┘  └───┘  └───┘         │
│                                 │
│    ┌───────────────────────┐    │
│    │     เลือกผลไม้        │    │
│    └───────────────────────┘    │
└─────────────────────────────────┘
```

---

## Validation & Completion

```bash
npm run lint:fix && npm run lint && npm run typecheck
```

**Testing**: Camera tab → "กรอกน้ำหนักเอง" → Enter 2.50 → เลือกผลไม้ → Weight shows 2.50

**Commit**:
```
feat: add manual weight entry before fruit selection

- Create ManualWeightEntryScreen with numeric keypad
- Add manual-weight step to camera flow
- Update useCameraActions for manual entry flow

Testing: Camera → กรอกน้ำหนักเอง → Enter weight → Select fruit → Weight pre-filled
```
