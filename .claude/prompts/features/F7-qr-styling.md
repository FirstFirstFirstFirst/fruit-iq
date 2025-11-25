# F7: QR Code Styling Enhancement

> **Priority**: LOW | **Complexity**: LOW | **Est. Time**: 30 min

---

## Quick Start

1. Read DEVELOPMENT_PLAN.md for architecture overview
2. Read PROGRESS.md and update status to IN_PROGRESS
3. Read CLAUDE.md for coding standards

---

## Task Description

Enhance QR code display with PromptPay branding and dark blue theme.

### Current Design
Plain white QR code on white background with basic styling.

### New Design
- PromptPay logo banner above QR
- Dark blue container (#1e4068)
- White QR code with rounded corners
- Professional payment appearance

---

## Files to Modify

| File | Action |
|------|--------|
| src/components/QRPaymentScreen.tsx | MODIFY |

Assets available:
- assets/images/prompt-pay-logo.png

---

## Implementation Steps

### Step 1: Import PromptPay Logo

At the top of QRPaymentScreen.tsx:
```typescript
import PromptPayLogo from '../../assets/images/prompt-pay-logo.png';
```

### Step 2: Update QR Container Section

Replace the current qrCard section with enhanced styling.

Add PromptPay logo above QR:
```tsx
<View style={styles.qrCard}>
  {/* PromptPay Logo */}
  <Image
    source={PromptPayLogo}
    style={styles.promptPayLogo}
    resizeMode="contain"
  />

  <Text style={styles.qrTitle}>Scan to Pay</Text>
  <Text style={styles.qrSubtitle}>PromptPay QR Code</Text>

  {/* QR Code Container */}
  <View style={styles.qrCodeWrapper}>
    <View style={styles.qrCodeContainer}>
      {qrGenerated && qrCodeData ? (
        <QRCode
          value={qrCodeData}
          size={width * 0.5}
          backgroundColor="white"
          color="#1e4068"
        />
      ) : (
        // placeholder
      )}
    </View>
  </View>

  {/* Amount Display */}
  <View style={styles.amountContainer}>
    <Text style={styles.amountLabel}>Amount</Text>
    <Text style={styles.amountValue}>
      {formatThaiCurrency(totalAmount)}
    </Text>
  </View>
</View>
```

### Step 3: Update Styles

Update/add these styles in StyleSheet:

```typescript
qrCard: {
  backgroundColor: '#1e4068',  // Dark blue
  borderRadius: 24,
  padding: 24,
  alignItems: 'center',
  marginHorizontal: 20,
  marginBottom: 20,
  shadowColor: '#1e4068',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 10,
},

promptPayLogo: {
  width: '70%',
  height: 40,
  marginBottom: 16,
},

qrTitle: {
  fontSize: 18,
  fontFamily: 'Kanit-SemiBold',
  color: '#ffffff',
  marginBottom: 4,
},

qrSubtitle: {
  fontSize: 14,
  fontFamily: 'Kanit-Regular',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: 20,
},

qrCodeWrapper: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 20,
  padding: 8,
  marginBottom: 20,
},

qrCodeContainer: {
  padding: 16,
  backgroundColor: '#ffffff',
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
},

amountContainer: {
  alignItems: 'center',
},

amountLabel: {
  fontSize: 14,
  fontFamily: 'Kanit-Regular',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: 4,
},

amountValue: {
  fontSize: 28,
  fontFamily: 'Kanit-Bold',
  color: '#ffffff',
},
```

---

## UI Design Reference

```
+----------------------------------+
|                                  |
|  +----------------------------+  |
|  |                            |  |
|  |  [  PromptPay Logo   ]     |  |  <- White logo
|  |                            |  |
|  |     Scan to Pay            |  |  <- White text
|  |   PromptPay QR Code        |  |  <- Light text
|  |                            |  |
|  |  +----------------------+  |  |
|  |  | +------------------+ |  |  |  <- Outer glow effect
|  |  | |                  | |  |  |
|  |  | |    QR CODE       | |  |  |  <- Dark blue QR
|  |  | |                  | |  |  |
|  |  | +------------------+ |  |  |  <- White background
|  |  +----------------------+  |  |  <- Rounded corners
|  |                            |  |
|  |        Amount              |  |
|  |       B 272.00             |  |  <- Large white text
|  |                            |  |
|  +----------------------------+  |  <- Dark blue: #1e4068
|                                  |
+----------------------------------+
```

---

## Color Reference

- Dark Blue Container: #1e4068
- QR Code Color: #1e4068
- QR Background: #ffffff
- Text on Dark: #ffffff
- Subtitle Text: rgba(255, 255, 255, 0.8)
- Outer Glow: rgba(255, 255, 255, 0.1)

---

## Validation

Run: npm run lint:fix && npm run lint && npm run typecheck

---

## Testing

1. Complete a sale flow to reach QR payment screen
2. Verify PromptPay logo displays correctly
3. Verify dark blue theme applied
4. Verify QR code is readable (test with banking app)
5. Verify amount displays in white text
6. Check on different screen sizes

---

## Commit Message

feat(qr): enhance QR payment screen with PromptPay branding

- Add PromptPay logo banner above QR code
- Apply dark blue theme (#1e4068) to QR container
- Update text colors for dark background
- Add subtle glow effect around QR code
- Improve visual hierarchy for payment screen

Testing: Complete sale -> QR screen shows dark blue themed QR with PromptPay logo
