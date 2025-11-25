# F2: Multiple Items Before Checkout (Cart System)

> **Priority**: HIGH | **Complexity**: HIGH | **Can Run Parallel**: NO (many shared files)

---

## Pre-Flight Checklist

```bash
cat DEVELOPMENT_PLAN.md
cat PROGRESS.md
# Update PROGRESS.md: F2 status → IN_PROGRESS
# IMPORTANT: Run this AFTER F1 is complete (shared files)
```

---

## Task Description

Enable adding multiple items to cart before checkout with single QR payment for total.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useCart.ts` | CREATE |
| `src/components/camera/screens/CartScreen.tsx` | CREATE |
| `src/components/camera/CartItem.tsx` | CREATE |
| `src/components/camera/constants.ts` | MODIFY |
| `src/hooks/useCameraState.ts` | MODIFY |
| `src/components/camera/screens/WeightConfirmationScreen.tsx` | MODIFY |
| `src/components/QRPaymentScreen.tsx` | MODIFY |
| `app/(tabs)/camera.tsx` | MODIFY |

---

## Implementation

### Step 1: Create `src/hooks/useCart.ts`

```typescript
import { useState, useMemo, useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  fruitId: number;
  fruitName: string;
  emoji: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'subtotal'>) => {
    const newItem: CartItem = {
      ...item,
      id: uuidv4(),
      subtotal: item.weight * item.pricePerKg,
    };
    setItems(prev => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + item.subtotal, 0), 
    [items]
  );

  const itemCount = items.length;

  return { items, total, itemCount, addItem, removeItem, clearCart };
}
```

### Step 2: Update `constants.ts`

```typescript
export type CameraStep =
  | "scan"
  | "camera"
  | "manual-weight"
  | "select"
  | "weight"
  | "cart-review"  // ADD THIS
  | "confirm"
  | "qr-payment"
  | "success"
  | "add-fruit";
```

### Step 3: Create `CartScreen.tsx`

- List cart items with delete button
- Show item count and total
- "เพิ่มสินค้า" button → back to scan
- "ชำระเงิน" button → QR payment

### Step 4: Create `CartItem.tsx`

```typescript
interface CartItemProps {
  item: CartItem;
  onRemove: (id: string) => void;
}
```

### Step 5: Update `WeightConfirmationScreen.tsx`

- Change button: "เพิ่มลงตะกร้า" (Add to Cart)
- Add: "ชำระเงินตอนนี้" for single item checkout
- Pass cart add callback

### Step 6: Update `QRPaymentScreen.tsx`

```typescript
interface QRPaymentScreenProps {
  // Option A: Single item (legacy)
  fruit?: Fruit;
  weight?: number;
  totalAmount?: number;
  
  // Option B: Cart items
  cartItems?: CartItem[];
  cartTotal?: number;
  
  transactionId?: number;
  onSave: () => void;
  onCancel: () => void;
}
```

### Step 7: Update `camera.tsx`

- Import and use useCart hook
- Add cart-review step case
- Wire up cart callbacks throughout flow

---

## New Flow

```
Scan → Select → Weight → [Add to Cart]
                              ↓
                         Cart Review → QR Payment
                              ↓
                         [Add More] → Back to Scan
```

---

## Cart UI Design

```
┌─────────────────────────────────┐
│  ◀  ตะกร้าสินค้า     [ล้างทั้งหมด]│
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🍎 แอปเปิ้ล           [🗑️] │ │
│ │ 2.50 กก. × ฿80/กก.         │ │
│ │                    ฿200.00 │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 🥭 มะม่วง             [🗑️] │ │
│ │ 1.20 กก. × ฿60/กก.         │ │
│ │                     ฿72.00 │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│         2 รายการ               │
│  ยอดรวม            ฿272.00     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │       + เพิ่มสินค้า         │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │       💳 ชำระเงิน           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## Dependencies

```bash
npm install react-native-get-random-values uuid
npm install --save-dev @types/uuid
```

---

## Validation & Completion

```bash
npm run lint:fix && npm run lint && npm run typecheck
```

**Testing**: 
1. Add item 1 → Cart → Add More → Add item 2
2. View cart with 2 items
3. Remove item 1
4. Checkout → QR shows remaining total

**Commit**:
```
feat: implement cart system for multiple items before checkout

- Create useCart hook with add/remove/clear
- Create CartScreen and CartItem components
- Update flow to support cart review step
- Modify QR screen to handle cart items

Testing: Add 2+ items → Cart review → Remove one → Checkout → QR shows correct total
```
