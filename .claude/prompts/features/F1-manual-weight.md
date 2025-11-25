# F1: Manual Weight Input Before Scan

> **Priority**: HIGH | **Complexity**: MEDIUM | **Est. Time**: 1-2 hours

---

## Quick Start

```bash
# 1. Read project documentation first
# 2. Claim this feature in PROGRESS.md
# 3. Follow implementation steps below
```

---

## Pre-Implementation Checklist

- [ ] Read DEVELOPMENT_PLAN.md for architecture overview
- [ ] Read PROGRESS.md and update status to IN_PROGRESS
- [ ] Read CLAUDE.md for coding standards
- [ ] Read existing files: CleanScannerScreen.tsx, WeightConfirmationScreen.tsx

---

## Task Description

Allow users to enter weight manually BEFORE selecting fruit, completely bypassing the camera scan step.

### Current Flow
```
Scan → Camera (OCR) → Select Fruit → Weight Confirmation → QR Payment
```

### New Flow
```
Scan → [Manual Weight Entry] → Select Fruit → Weight Confirmation → QR Payment
       ↑
       User taps "กรอกน้ำหนักเอง" button
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| src/components/camera/screens/ManualWeightEntryScreen.tsx | CREATE | Numeric keypad for weight input |
| src/components/camera/constants.ts | MODIFY | Add "manual-weight" step |
| src/hooks/useCameraActions.ts | MODIFY | Update handleManualEntry |
| app/(tabs)/camera.tsx | MODIFY | Add case for manual-weight step |

---

## Implementation Steps

### Step 1: Update CameraStep Type

File: src/components/camera/constants.ts

Add "manual-weight" to the CameraStep type union after "camera".

### Step 2: Create ManualWeightEntryScreen

File: src/components/camera/screens/ManualWeightEntryScreen.tsx

Components needed:
- Header with back button and "กรอกน้ำหนัก" title
- Large weight display (64px font) with "กก." unit
- Numeric keypad (1-9, 0, decimal point, backspace)
- "เลือกผลไม้" primary button (disabled when weight is 0)

Interface:
```typescript
interface ManualWeightEntryScreenProps {
  onConfirm: (weight: number) => void;
  onBack: () => void;
  onCancel?: () => void;
}
```

Keypad logic:
- Track weightString state
- Limit to 2 decimal places
- Only allow one decimal point
- Backspace removes last character

### Step 3: Update useCameraActions

File: src/hooks/useCameraActions.ts

Modify handleManualEntry to setStep("manual-weight") instead of "select".

Add new function handleManualWeightConfirm(weight: number) that:
1. Sets detectedWeight to the weight
2. Sets step to "select"

Add handleManualWeightConfirm to the return object.

### Step 4: Update camera.tsx

File: app/(tabs)/camera.tsx

Add case for step === "manual-weight" before the "select" case:
- Render ManualWeightEntryScreen
- Pass onConfirm={cameraActions.handleManualWeightConfirm}
- Pass onBack={() => cameraState.setStep("scan")}
- Pass onCancel={handleCancelFlow}

Import ManualWeightEntryScreen at the top.

---

## UI Design Reference

```
┌─────────────────────────────────┐
│  ◀  กรอกน้ำหนัก           [X]  │
├─────────────────────────────────┤
│                                 │
│         ┌─────────────┐         │
│         │   2.50      │  กก.   │
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
│    │     เลือกผลไม้   →    │    │
│    └───────────────────────┘    │
└─────────────────────────────────┘
```

---

## Styling Guidelines

- Container: white background
- Header: borderBottomWidth 1, borderBottomColor #e5e7eb
- Weight display: fontSize 64, Kanit-Bold, color #1f2937
- Unit text: fontSize 24, Kanit-Medium, color #6b7280
- Keypad buttons: 80x80, borderRadius 40, backgroundColor #f3f4f6
- Keypad text: fontSize 28, Kanit-SemiBold, color #374151
- Confirm button: backgroundColor #B46A07, borderRadius 16, paddingVertical 18
- Disabled button: backgroundColor #d1d5db

---

## Validation

```bash
npm run lint:fix
npm run lint
npm run typecheck
```

---

## Testing Instructions

1. Open Camera tab
2. Tap "กรอกน้ำหนักเอง" button
3. Enter weight using keypad (e.g., 2.50)
4. Tap "เลือกผลไม้" button
5. Should navigate to fruit selection with weight pre-set
6. Select a fruit
7. Weight confirmation should show the manually entered weight

---

## Completion Checklist

- [ ] ManualWeightEntryScreen created with all UI elements
- [ ] CameraStep type updated with "manual-weight"
- [ ] useCameraActions handleManualEntry updated
- [ ] useCameraActions handleManualWeightConfirm added
- [ ] camera.tsx renders ManualWeightEntryScreen for manual-weight step
- [ ] Keypad works: numbers, decimal (max 2 places), backspace
- [ ] Weight carries through to fruit selection and confirmation
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] PROGRESS.md updated to DONE

---

## Commit Message Template

```
feat(camera): add manual weight entry before fruit selection

- Create ManualWeightEntryScreen with numeric keypad
- Add "manual-weight" step to camera flow
- Update useCameraActions for manual weight handling
- Allow bypassing camera OCR for direct weight entry

Testing: Camera tab → กรอกน้ำหนักเอง → Enter 2.50 → เลือกผลไม้ → Weight shown in confirmation
```
