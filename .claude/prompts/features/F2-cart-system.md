# F2: Cart System (Multiple Items Before Checkout)

> **Priority**: HIGH | **Complexity**: HIGH | **Est. Time**: 3-4 hours

---

## Quick Start

1. Read DEVELOPMENT_PLAN.md for architecture overview
2. Read PROGRESS.md and update status to IN_PROGRESS  
3. Read CLAUDE.md for coding standards

---

## Task Description

Enable adding multiple items to a cart before checkout, generating a single QR payment for the total.

### Current Flow (Single Item)
Scan -> Select -> Weight -> QR Payment (single item)

### New Flow (Cart)
Scan -> Select -> Weight -> Add to Cart -> Cart Review -> QR Payment (total)
                                    |
                              Add More (loops back to Scan)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| src/hooks/useCart.ts | CREATE |
| src/components/camera/screens/CartScreen.tsx | CREATE |
| src/components/camera/CartItem.tsx | CREATE |
| src/components/camera/constants.ts | MODIFY - add cart-review step |
| src/components/camera/screens/WeightConfirmationScreen.tsx | MODIFY |
| src/components/QRPaymentScreen.tsx | MODIFY |
| app/(tabs)/camera.tsx | MODIFY |

---

## Step 1: Create Cart Hook

File: src/hooks/useCart.ts

Create a hook with:
- items: CartItem[] state
- addItem(item) - adds item with generated UUID and calculated subtotal
- removeItem(id) - removes by id
- clearCart() - empties cart
- total - computed sum of subtotals
- itemCount - number of items
- isEmpty - boolean

CartItem interface:
- id: string (UUID)
- fruitId: number
- fruitName: string
- emoji: string  
- weight: number
- pricePerKg: number
- subtotal: number (weight * pricePerKg)

Note: Install uuid if needed: npx expo install uuid react-native-get-random-values

---

## Step 2: Update CameraStep

File: src/components/camera/constants.ts

Add "cart-review" to the CameraStep type union.

---

## Step 3: Create CartItem Component

File: src/components/camera/CartItem.tsx

Display single cart item with:
- Emoji/image on left
- Fruit name (Kanit-SemiBold)
- Weight and price per kg details
- Subtotal on right (Kanit-Bold, #B46A07)
- Delete button (trash icon)

---

## Step 4: Create CartScreen

File: src/components/camera/screens/CartScreen.tsx

Props:
- items: CartItem[]
- total: number
- onAddMore: () => void
- onCheckout: () => void
- onRemoveItem: (id: string) => void
- onClearCart: () => void
- onBack: () => void

Layout:
- Header: back button, title, clear all button
- ScrollView with CartItem list
- Empty state if no items
- Summary: item count and total
- Two buttons: Add More (secondary), Checkout (primary)

---

## Step 5: Modify WeightConfirmationScreen

Add props:
- onAddToCart?: (weight: number) => void
- cartItemCount?: number

Changes:
- Show cart badge if items in cart
- Primary button: "Add to Cart" if onAddToCart provided
- Secondary option: "Checkout Now" for single item

---

## Step 6: Update QRPaymentScreen

Add optional prop:
- cartItems?: CartItem[]

Changes:
- If cartItems, show all items in summary
- Calculate total from cart
- Handle multiple transaction creation on save

---

## Step 7: Update camera.tsx

- Import and initialize useCart hook
- Add cart-review step rendering CartScreen
- Pass cart functions to WeightConfirmationScreen
- Update flow: Add to Cart -> cart-review OR scan (if adding more)
- Clear cart after successful payment

---

## Validation

Run: npm run lint:fix && npm run lint && npm run typecheck

---

## Testing

1. Add first item to cart
2. Add second item to cart  
3. View cart with both items
4. Remove one item
5. Checkout with remaining item
6. QR should show correct total

---

## Commit Message

feat(cart): add multi-item cart system before checkout

- Create useCart hook for cart state management
- Add CartScreen for reviewing items before payment
- Update weight confirmation with Add to Cart option
- Support cart items in QR payment screen

Testing: Add 2 fruits to cart, remove one, checkout shows correct total
