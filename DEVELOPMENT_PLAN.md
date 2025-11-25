# WeighPay Feature Development Plan

> **Multi-Session Development Guide**
> This document is designed for parallel Claude Code sessions. Each session should start by reading this file to understand the current state and claim a feature to work on.

---

## Quick Start for New Sessions

```bash
# 1. Read this file first
# 2. Check PROGRESS.md for current status
# 3. Claim a feature by updating PROGRESS.md
# 4. Follow the feature implementation guide below
```

---

## Current System Architecture

### Tab Structure
| Tab | File | Purpose |
|-----|------|---------|
| Home | `app/(tabs)/index.tsx` | Landing page, PromptPay setup |
| Camera | `app/(tabs)/camera.tsx` | Main sales workflow orchestrator |
| History | `app/(tabs)/history.tsx` | Sales history, daily summary |
| Profile | `app/(tabs)/profile.tsx` | User settings, logout |

### Current Sales Flow
```
┌──────────┐    ┌────────┐    ┌──────────┐    ┌────────────────┐    ┌────────────┐
│   Scan   │───▶│ Camera │───▶│  Select  │───▶│    Weight      │───▶│ QR Payment │
│  Screen  │    │  (OCR) │    │  Fruit   │    │  Confirmation  │    │   Screen   │
└──────────┘    └────────┘    └──────────┘    └────────────────┘    └────────────┘
```

### Key Files Reference
| Category | File Path | Description |
|----------|-----------|-------------|
| State Machine | `src/hooks/useCameraState.ts` | Camera step state: scan → camera → select → weight → qr-payment → success |
| Camera Actions | `src/hooks/useCameraActions.ts` | Photo handling, OCR, transaction creation |
| Camera Constants | `src/components/camera/constants.ts` | CameraStep types, PRESET_EMOJIS |
| Fruit API | `src/lib/api.ts` | FruitAPI, TransactionAPI, SettingsAPI |
| Utils | `src/lib/utils.ts` | formatThaiCurrency, formatWeight, getEmojiById |
| Scanner Screen | `src/components/camera/CleanScannerScreen.tsx` | Initial scan instructions |
| Fruit Selection | `src/components/camera/screens/FruitSelectionScreen.tsx` | Fruit grid selection |
| Weight Confirm | `src/components/camera/screens/WeightConfirmationScreen.tsx` | Weight input, price calculation |
| QR Payment | `src/components/QRPaymentScreen.tsx` | PromptPay QR display |
| Emoji Picker | `src/components/camera/modals/EmojiPickerModal.tsx` | Emoji/image selection |

### Styling Conventions
- **Primary Color**: `#B46A07` (amber/orange)
- **Secondary Color**: `#D97706`
- **Destructive**: `#ef4444`
- **Gray Scale**: `#1f2937`, `#374151`, `#6b7280`, `#9ca3af`, `#d1d5db`
- **Font Family**: `Kanit-Regular`, `Kanit-Medium`, `Kanit-SemiBold`, `Kanit-Bold`, `Kanit-ExtraBold`
- **Border Radius**: 12-20px for cards, 16px for buttons
- **Shadow**: `shadowOpacity: 0.08-0.15`, `elevation: 3-8`

---

## Feature Implementation Guide

---

### FEATURE 1: Manual Weight Input Before Scan
**Priority**: HIGH | **Complexity**: MEDIUM | **Estimated LOC**: ~200

#### Owner Files (DO NOT modify without coordination)
```
src/components/camera/screens/ManualWeightEntryScreen.tsx  [NEW - CREATE]
src/hooks/useCameraActions.ts                              [MODIFY]
src/components/camera/constants.ts                         [MODIFY]
```

#### Supporting Files (Minimal changes)
```
src/components/camera/CleanScannerScreen.tsx  [MODIFY - button visibility]
app/(tabs)/camera.tsx                         [MODIFY - add step case]
```

#### Current Behavior
User must scan weight via camera OCR first, then select fruit. Manual entry only available after OCR failure.

#### Desired Behavior
Users can enter weight manually BEFORE selecting fruit, completely bypassing camera scan.

#### Implementation Steps

**Step 1: Update CameraStep enum** (`src/components/camera/constants.ts`)
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

**Step 2: Create ManualWeightEntryScreen** (`src/components/camera/screens/ManualWeightEntryScreen.tsx`)
```typescript
interface ManualWeightEntryScreenProps {
  onConfirm: (weight: number) => void;
  onBack: () => void;
  onCancel?: () => void;
}
```

UI Components:
- Header with back button and "กรอกน้ำหนัก" title
- Large numeric display showing current input
- Numeric keypad (0-9, decimal point, backspace)
- "เลือกผลไม้" (Select Fruit) button

**Step 3: Update useCameraActions** (`src/hooks/useCameraActions.ts`)
```typescript
const handleManualEntry = () => {
  setStep("manual-weight");  // Changed from "select"
};

const handleManualWeightConfirm = (weight: number) => {
  setDetectedWeight(weight);
  setStep("select");
};
```

**Step 4: Update camera.tsx** - Add case for manual-weight step

#### UI Design
```
┌─────────────────────────────────┐
│  ◀  กรอกน้ำหนัก           [X]  │
├─────────────────────────────────┤
│                                 │
│         ┌─────────────┐         │
│         │   0.00      │  กก.   │
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

### FEATURE 2: Multiple Items Before Checkout (Cart System)
**Priority**: HIGH | **Complexity**: HIGH | **Estimated LOC**: ~500

#### Owner Files (DO NOT modify without coordination)
```
src/hooks/useCart.ts                            [NEW - CREATE]
src/components/camera/screens/CartScreen.tsx    [NEW - CREATE]
src/components/camera/CartItem.tsx              [NEW - CREATE]
```

#### Supporting Files (Coordinate changes)
```
src/hooks/useCameraState.ts                              [MODIFY]
src/components/camera/constants.ts                       [MODIFY]
src/components/camera/screens/WeightConfirmationScreen.tsx [MODIFY]
src/components/QRPaymentScreen.tsx                       [MODIFY]
app/(tabs)/camera.tsx                                    [MODIFY]
src/lib/api.ts                                          [MODIFY - transaction type]
```

#### Current Behavior
Single item per transaction. After confirming weight, goes directly to QR payment.

#### Desired Behavior
- Add multiple items to cart before checkout
- Show running total
- Ability to remove items from cart
- Generate single QR for total amount
- Create multiple transactions (one per item) on save

#### Implementation Steps

**Step 1: Create Cart Hook** (`src/hooks/useCart.ts`)
```typescript
interface CartItem {
  id: string;              // UUID for React key
  fruitId: number;
  fruitName: string;
  emoji: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'id' | 'subtotal'>) => {...};
  const removeItem = (id: string) => {...};
  const clearCart = () => {...};
  const total = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);

  return { items, total, addItem, removeItem, clearCart };
}
```

**Step 2: Add CameraStep** (`src/components/camera/constants.ts`)
```typescript
| "cart-review"  // ADD THIS
```

**Step 3: Create CartScreen** (`src/components/camera/screens/CartScreen.tsx`)
Components:
- CartItem list with swipe-to-delete or trash button
- Running total display at bottom
- "เพิ่มสินค้า" (Add More) button → returns to scan
- "ชำระเงิน" (Checkout) button → goes to QR payment

**Step 4: Modify WeightConfirmationScreen**
- Change primary button text: "เพิ่มลงตะกร้า" (Add to Cart)
- Add secondary action: "ชำระเงินตอนนี้" (Checkout Now) for single item

**Step 5: Update QRPaymentScreen**
- Accept `cartItems: CartItem[]` OR legacy single `fruit` prop
- Display all items in summary section
- Calculate total from cart items

**Step 6: Update Transaction API**
- Modify save logic to create multiple transactions (one per cart item)
- Or create batch transaction endpoint in backend

#### Cart UI Design
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
│ │       + เพิ่มสินค้า         │ │ ← Secondary style
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │       💳 ชำระเงิน           │ │ ← Primary style
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### FEATURE 3: Bulk Pricing Calculation
**Priority**: MEDIUM | **Complexity**: MEDIUM | **Estimated LOC**: ~250

#### Owner Files (DO NOT modify without coordination)
```
src/components/camera/modals/BulkPriceModal.tsx  [NEW - CREATE]
```

#### Supporting Files (Coordinate changes)
```
src/components/camera/screens/WeightConfirmationScreen.tsx  [MODIFY]
src/lib/api.ts                                              [MODIFY - Fruit type extension]
```

#### Current Behavior
Simple calculation: `total = weight × pricePerKg`

#### Desired Behavior
Support special pricing:
- Bulk pricing: "3 kg for 100 baht" → 33.33 baht/kg
- Custom total override for special customers

#### Implementation Steps

**Step 1: Extend Fruit Type** (Optional - for saved bulk pricing)
```typescript
interface Fruit {
  // ... existing fields
  bulkPricing?: {
    minKg: number;
    priceTotal: number;
  } | null;
}
```

**Step 2: Create BulkPriceModal** (`src/components/camera/modals/BulkPriceModal.tsx`)
```typescript
interface BulkPriceModalProps {
  visible: boolean;
  currentWeight: number;
  defaultPricePerKg: number;
  onClose: () => void;
  onConfirm: (finalPrice: number, priceType: 'normal' | 'bulk' | 'custom') => void;
}
```

**Step 3: Update WeightConfirmationScreen**
- Add "แก้ไขราคา" (Edit Price) button near total
- Show price type indicator (normal/bulk/custom)
- Store selected pricing for transaction

#### Bulk Price Modal UI
```
┌─────────────────────────────────┐
│       ตั้งราคาพิเศษ        [X] │
├─────────────────────────────────┤
│ ◉ ราคาปกติ                     │
│   2.50 กก. × ฿80/กก.           │
│   = ฿200.00                    │
├─────────────────────────────────┤
│ ○ ราคาแบบชุด                   │
│   ┌─────┐      ┌─────────┐     │
│   │  3  │ กก.  │   100   │ บาท │
│   └─────┘      └─────────┘     │
│   = ฿33.33/กก.                 │
│   สำหรับ 2.50 กก. = ฿83.33     │
├─────────────────────────────────┤
│ ○ กำหนดราคาเอง                 │
│   ┌───────────────────────┐    │
│   │       150.00          │ บาท│
│   └───────────────────────┘    │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │          ยืนยัน             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### FEATURE 4: Custom Emoji/Image Upload
**Priority**: MEDIUM | **Complexity**: MEDIUM | **Estimated LOC**: ~300

#### Owner Files (DO NOT modify without coordination)
```
src/components/camera/modals/EmojiPickerModal.tsx  [MODIFY - major changes]
```

#### Supporting Files (Coordinate changes)
```
src/components/camera/constants.ts  [MODIFY]
src/lib/api.ts                      [MODIFY - add upload endpoint]
src/lib/utils.ts                    [MODIFY - getEmojiById]
```

#### Backend Requirements
- New endpoint: `POST /upload/emoji` → returns URL
- Store in cloud storage (S3/Cloudinary)

#### Current Behavior
Limited to 20 preset emojis in `PRESET_EMOJIS` array.

#### Desired Behavior
- Keep all preset emojis
- Add "Upload Custom Image" option
- Store uploaded images on server
- Reference by URL in fruit.emoji field

#### Implementation Steps

**Step 1: Install expo-image-picker**
```bash
npx expo install expo-image-picker
```

**Step 2: Create upload API** (`src/lib/api.ts`)
```typescript
export const EmojiUploadAPI = {
  async uploadImage(imageUri: string): Promise<{ url: string; id: string }> {
    // Upload image, return URL
  }
};
```

**Step 3: Update EmojiPickerModal**
- Add "📷 อัปโหลดรูปภาพ" button at bottom
- Show uploaded images section
- Handle image picker and upload flow

**Step 4: Update getEmojiById** (`src/lib/utils.ts`)
```typescript
export function getEmojiById(emojiId: string): PresetEmojiItem | undefined {
  // Check if it's a URL (custom upload)
  if (emojiId.startsWith('http') || emojiId.startsWith('custom:')) {
    return {
      type: 'image',
      source: { uri: emojiId.replace('custom:', '') },
      id: emojiId
    };
  }
  // Fallback to preset lookup
  return PRESET_EMOJIS.find((item) => item.id === emojiId);
}
```

#### Updated Emoji Picker UI
```
┌─────────────────────────────────┐
│         เลือกไอคอน         [X] │
├─────────────────────────────────┤
│ [🍎][🍊][🍌][🥭][🍇][🍓]       │
│ [🥥][🍍][🫐][🍈][🍑][🥝]       │
│ [🍋][🍐][🥑][🍅][🥒][🌶️]       │
│ [🥕][🥩]                       │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  📷 อัปโหลดรูปภาพ          │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ รูปที่อัปโหลดแล้ว:               │
│ [🖼️][🖼️][🖼️]                   │
└─────────────────────────────────┘
```

---

### FEATURE 5: Privacy Policy URL
**Priority**: HIGH (Google Play requirement) | **Complexity**: LOW | **Estimated LOC**: ~100

#### Owner Files (DO NOT modify without coordination)
```
app/privacy-policy.tsx  [NEW - CREATE]
```

#### Supporting Files (Minimal changes)
```
app/(tabs)/profile.tsx  [MODIFY - add menu item]
```

#### Implementation Options

**Option A: External URL (Recommended)**
```typescript
// app/privacy-policy.tsx
import { WebView } from 'react-native-webview';

export default function PrivacyPolicyScreen() {
  return (
    <WebView
      source={{ uri: 'https://dapi.werapun.com/privacy-policy' }}
      style={{ flex: 1 }}
    />
  );
}
```

**Option B: Local Markdown**
```typescript
// app/privacy-policy.tsx
import Markdown from 'react-native-markdown-display';

const PRIVACY_POLICY_TH = `
# นโยบายความเป็นส่วนตัว
...
`;

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView>
      <Markdown>{PRIVACY_POLICY_TH}</Markdown>
    </ScrollView>
  );
}
```

#### Profile Tab Addition
```typescript
// Add in profile.tsx menu section
<TouchableOpacity
  style={styles.menuItem}
  onPress={() => router.push('/privacy-policy')}
>
  <MaterialIcons name="policy" size={24} color="#374151" />
  <Text style={styles.menuItemText}>นโยบายความเป็นส่วนตัว</Text>
  <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
</TouchableOpacity>
```

---

### FEATURE 6: Offline/Timeout Handling
**Priority**: MEDIUM | **Complexity**: MEDIUM | **Estimated LOC**: ~250

#### Owner Files (DO NOT modify without coordination)
```
src/hooks/useNetworkStatus.ts  [NEW - CREATE]
src/components/OfflineBanner.tsx  [NEW - CREATE]
```

#### Supporting Files (Coordinate changes)
```
src/lib/api.ts                              [MODIFY - timeout handling]
src/components/camera/CleanScannerScreen.tsx [MODIFY - offline mode]
app/_layout.tsx                             [MODIFY - add banner]
```

#### Installation
```bash
npx expo install @react-native-community/netinfo
```

#### Implementation Steps

**Step 1: Create Network Status Hook** (`src/hooks/useNetworkStatus.ts`)
```typescript
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    isInternetReachable,
    isOffline: isConnected === false || isInternetReachable === false
  };
}
```

**Step 2: Create Offline Banner** (`src/components/OfflineBanner.tsx`)
```typescript
export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <MaterialIcons name="wifi-off" size={20} color="#f59e0b" />
      <Text style={styles.text}>ไม่มีการเชื่อมต่ออินเทอร์เน็ต</Text>
    </View>
  );
}
```

**Step 3: Update CleanScannerScreen**
- Check network status on mount
- If offline, show offline mode with direct manual entry
- Disable camera scan button when offline

**Step 4: Update API Client**
- Reduce timeout to 5-8 seconds (from default 30+)
- Add retry logic with exponential backoff
- Queue failed transactions in AsyncStorage

#### Offline Banner Design
```
┌─────────────────────────────────┐
│ ⚠️ ไม่มีการเชื่อมต่ออินเทอร์เน็ต   │
│    กรุณากรอกน้ำหนักด้วยตัวเอง     │
└─────────────────────────────────┘
```

---

### FEATURE 7: QR Code Styling Enhancement
**Priority**: LOW | **Complexity**: LOW | **Estimated LOC**: ~50

#### Owner Files (DO NOT modify without coordination)
```
src/components/QRPaymentScreen.tsx  [MODIFY]
```

#### Current Design
Plain white QR code with white background.

#### Desired Design
- PromptPay logo banner above QR
- Dark blue container: `#1a3a5c` or `#1e4068`
- Rounded corners on QR container
- White QR on dark background for contrast

#### Implementation Steps

**Step 1: Update QR Container Styles**
```typescript
qrCard: {
  backgroundColor: '#1e4068',  // Dark blue
  borderRadius: 20,
  padding: 24,
  alignItems: 'center',
},
qrCodeContainer: {
  padding: 16,
  backgroundColor: '#ffffff',
  borderRadius: 12,
},
```

**Step 2: Add PromptPay Logo**
```typescript
import PromptPayLogo from '../../assets/images/prompt-pay-logo.png';

// In render:
<Image
  source={PromptPayLogo}
  style={styles.promptPayLogo}
  resizeMode="contain"
/>
<View style={styles.qrCodeContainer}>
  <QRCode
    value={qrCodeData}
    size={width * 0.5}
    backgroundColor="white"
    color="#1e4068"
  />
</View>
```

#### Styled QR Design
```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │  [PromptPay Logo Banner]  │  │ ← White logo on dark
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ██████████████████████████│  │
│  │ █                        █│  │
│  │ █       QR CODE          █│  │ ← Dark blue QR on white
│  │ █                        █│  │
│  │ ██████████████████████████│  │
│  └───────────────────────────┘  │ ← Rounded corners
│                                 │
│  ยอดเงิน: ฿272.00               │ ← White text
└─────────────────────────────────┘ ← Dark blue: #1e4068
```

---

## File Ownership Map (Conflict Prevention)

| Feature | Primary Owner Files | Shared Files (Coordinate) |
|---------|-------------------|---------------------------|
| F1 | `ManualWeightEntryScreen.tsx` | `constants.ts`, `camera.tsx` |
| F2 | `useCart.ts`, `CartScreen.tsx`, `CartItem.tsx` | `useCameraState.ts`, `camera.tsx`, `QRPaymentScreen.tsx` |
| F3 | `BulkPriceModal.tsx` | `WeightConfirmationScreen.tsx` |
| F4 | `EmojiPickerModal.tsx` | `constants.ts`, `utils.ts`, `api.ts` |
| F5 | `privacy-policy.tsx` | `profile.tsx` |
| F6 | `useNetworkStatus.ts`, `OfflineBanner.tsx` | `api.ts`, `CleanScannerScreen.tsx` |
| F7 | `QRPaymentScreen.tsx` | None |

---

## Development Rules

### Before Starting
1. Read this file (`DEVELOPMENT_PLAN.md`)
2. Read `PROGRESS.md` for current status
3. Update `PROGRESS.md` with your session ID and claimed feature
4. Create feature branch if needed: `feature/F[X]-short-name`

### While Working
1. Follow patterns in `CLAUDE.md`
2. TypeScript with proper interfaces
3. Run frequently: `npm run lint:fix && npm run lint && npm run typecheck`
4. Test on Android (primary target)
5. Avoid modifying files owned by other features without coordination

### After Completing
1. Update `PROGRESS.md` with completion status
2. Run final validation: `npm run lint:fix && npm run lint && npm run typecheck`
3. Provide commit message:
   ```
   feat: [feature name]

   - [change 1]
   - [change 2]

   Testing: [screen], [functionality], [expected behavior]
   ```

---

## Dependencies to Install

| Feature | Package | Command |
|---------|---------|---------|
| F4 | expo-image-picker | `npx expo install expo-image-picker` |
| F5 | react-native-webview (if WebView option) | `npx expo install react-native-webview` |
| F6 | @react-native-community/netinfo | `npx expo install @react-native-community/netinfo` |

---

## Testing Checklist

Before marking complete:
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] Test on Android device/emulator
- [ ] Test Thai text renders correctly (Kanit font)
- [ ] Test edge cases (empty states, errors)
- [ ] No console errors/warnings
- [ ] UI matches design specs above
