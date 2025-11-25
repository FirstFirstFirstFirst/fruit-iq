# F7: QR Code Styling Enhancement

> **Priority**: LOW | **Complexity**: LOW | **Can Run Parallel**: YES

---

## Pre-Flight Checklist

```bash
cat DEVELOPMENT_PLAN.md
cat PROGRESS.md
# Update PROGRESS.md: F7 status → IN_PROGRESS
```

---

## Task Description

Enhance QR code display with PromptPay branding and dark blue theme.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/QRPaymentScreen.tsx` | MODIFY |

---

## Design Target

```
┌─────────────────────────────┐
│  [PromptPay Logo Banner]    │ ← assets/images/prompt-pay-logo.png
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │                       │  │
│  │      QR CODE          │  │ ← Dark blue #1e4068 on white
│  │                       │  │
│  └───────────────────────┘  │ ← White bg, rounded
│                             │
│  สแกนเพื่อชำระเงิน           │ ← White text
└─────────────────────────────┘ ← Dark blue bg #1e4068
```

---

## Implementation

### Step 1: Add Logo Import
```typescript
const PromptPayLogo = require('../../assets/images/prompt-pay-logo.png');
```

### Step 2: Update Styles
```typescript
qrCard: {
  backgroundColor: '#1e4068',
  borderRadius: 20,
  padding: 24,
  alignItems: 'center',
},
qrCodeContainer: {
  padding: 16,
  backgroundColor: '#ffffff',
  borderRadius: 16,
  marginVertical: 16,
},
promptPayLogo: {
  width: '80%',
  height: 50,
  marginBottom: 8,
},
qrTitle: {
  color: '#ffffff',
  // ... rest
},
qrSubtitle: {
  color: 'rgba(255, 255, 255, 0.8)',
  // ... rest
},
```

### Step 3: Add Logo in Render
```typescript
<Image
  source={PromptPayLogo}
  style={styles.promptPayLogo}
  resizeMode="contain"
/>
```

### Step 4: Update QRCode Props
```typescript
<QRCode
  value={qrCodeData}
  size={width * 0.5}
  backgroundColor="white"
  color="#1e4068"
/>
```

---

## Validation & Completion

```bash
npm run lint:fix && npm run lint && npm run typecheck
```

**Testing**: Complete sale → QR screen → Dark blue theme with PromptPay logo

**Commit**:
```
feat: enhance QR payment screen with PromptPay branding

- Add PromptPay logo banner
- Apply dark blue theme (#1e4068)
- Update QR and text colors

Testing: Complete sale → QR Payment → Should show branded QR
```
