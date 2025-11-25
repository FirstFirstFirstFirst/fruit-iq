# F3: Bulk Pricing Calculation

> **Priority**: MEDIUM | **Complexity**: MEDIUM | **Est. Time**: 1-2 hours

---

## Quick Start

1. Read DEVELOPMENT_PLAN.md for architecture overview
2. Read PROGRESS.md and update status to IN_PROGRESS
3. Read CLAUDE.md for coding standards

---

## Task Description

Support bulk pricing (e.g., "3 kg for 100 baht") and custom price override for special customers.

### Current Behavior
Simple calculation: total = weight x pricePerKg

### New Behavior
Three pricing options:
1. Normal: weight x pricePerKg
2. Bulk: X kg for Y baht (calculates effective rate)
3. Custom: user enters total price directly

---

## Files to Create/Modify

| File | Action |
|------|--------|
| src/components/camera/modals/BulkPriceModal.tsx | CREATE |
| src/components/camera/screens/WeightConfirmationScreen.tsx | MODIFY |

---

## Step 1: Create BulkPriceModal

File: src/components/camera/modals/BulkPriceModal.tsx

Props:
- visible: boolean
- currentWeight: number
- defaultPricePerKg: number
- onClose: () => void
- onConfirm: (finalPrice: number, priceType: string) => void

State:
- selectedType: "normal" | "bulk" | "custom"
- bulkKg: string (input)
- bulkPrice: string (input)
- customPrice: string (input)

Calculations:
- Normal: currentWeight * defaultPricePerKg
- Bulk: effectiveRate = bulkPrice / bulkKg; total = currentWeight * effectiveRate
- Custom: parseFloat(customPrice)

UI Layout:
- Modal with transparent background
- White card with rounded corners
- Header: "Set Special Price" with close button
- Three radio-style options with details
- Confirm button at bottom

---

## Step 2: Update WeightConfirmationScreen

Add state:
- showBulkPriceModal: boolean
- customTotal: number | null
- priceType: "normal" | "bulk" | "custom"

Add button:
- "Edit Price" button near total display
- Opens BulkPriceModal

Display changes:
- Show price type indicator if not normal
- Use customTotal for display if set

Pass to transaction:
- Final calculated total (normal or custom)

---

## UI Design Reference

### BulkPriceModal
```
+----------------------------------+
|       Set Special Price      [X] |
+----------------------------------+
| (o) Normal Price                 |
|     2.50 kg x 80 baht/kg         |
|     = 200.00 baht                |
+----------------------------------+
| ( ) Bulk Price                   |
|     [  3  ] kg for [ 100 ] baht  |
|     = 33.33 baht/kg              |
|     For 2.50 kg = 83.33 baht     |
+----------------------------------+
| ( ) Custom Price                 |
|     [      150.00      ] baht    |
+----------------------------------+
| +------------------------------+ |
| |          Confirm             | |
| +------------------------------+ |
+----------------------------------+
```

---

## Styling Guidelines

- Modal background: rgba(0,0,0,0.5)
- Card: white, borderRadius 20, padding 24
- Radio buttons: circle border, filled when selected (#B46A07)
- Input fields: borderWidth 1, borderRadius 12, padding 12
- Confirm button: #B46A07, borderRadius 16

---

## Validation

Run: npm run lint:fix && npm run lint && npm run typecheck

---

## Testing

1. Go to weight confirmation screen
2. Tap "Edit Price" button
3. Select "Bulk" option
4. Enter "3" kg for "100" baht
5. Confirm
6. Total should recalculate based on effective rate
7. Test "Custom" option with fixed price
8. Proceed to QR - should show final price

---

## Commit Message

feat(pricing): add bulk and custom pricing options

- Create BulkPriceModal with three pricing modes
- Add "Edit Price" button in weight confirmation
- Support normal, bulk (X kg for Y baht), and custom pricing
- Calculate effective rates for bulk pricing

Testing: Weight confirmation -> Edit Price -> Select bulk 3kg=100B -> Total recalculates
