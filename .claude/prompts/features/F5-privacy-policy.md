# F5: Privacy Policy Implementation

> **Priority**: HIGH | **Complexity**: LOW | **Est. Time**: 30 min

---

## Quick Start

```bash
# 1. Read project documentation first
# 2. Claim this feature in PROGRESS.md
# 3. Follow implementation steps below
```

---

## Pre-Implementation Checklist

- [ ] Read `DEVELOPMENT_PLAN.md` for architecture overview
- [ ] Read `PROGRESS.md` and update status to `IN_PROGRESS`
- [ ] Read `CLAUDE.md` for coding standards

---

## Task Description

Create Privacy Policy screen for Google Play Store compliance.

### Why This Is Needed
Google Play requires a privacy policy URL for apps that collect user data. WeighPay collects PromptPay numbers and transaction history.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `app/privacy-policy.tsx` | CREATE | Privacy policy screen |
| `app/(tabs)/profile.tsx` | MODIFY | Add menu item link |

---

## Implementation Steps

### Step 1: Create Privacy Policy Screen

Create `app/privacy-policy.tsx`:

```typescript
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>นโยบายความเป็นส่วนตัว</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content sections here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Follow existing app patterns
});
```

### Step 2: Privacy Policy Content (Thai)

Include these sections:
1. **ข้อมูลที่เราเก็บรวบรวม** (Data We Collect)
   - หมายเลข PromptPay
   - ประวัติการขาย (ผลไม้, น้ำหนัก, ราคา)
   - ข้อมูลผลไม้ที่ตั้งค่า

2. **วัตถุประสงค์ในการใช้ข้อมูล** (Purpose)
   - คำนวณราคาสินค้า
   - สร้าง QR Code สำหรับชำระเงิน
   - แสดงประวัติการขาย

3. **การเก็บรักษาข้อมูล** (Data Storage)
   - เก็บบนเซิร์ฟเวอร์ที่ปลอดภัย
   - ใช้การเข้ารหัส SSL

4. **สิทธิ์ของผู้ใช้** (User Rights)
   - ขอลบข้อมูลได้
   - ติดต่อผู้ดูแลระบบ

5. **ติดต่อเรา** (Contact)
   - Email: support@werapun.com

### Step 3: Add Menu Item in Profile

Update `app/(tabs)/profile.tsx`:

```typescript
// Add in the settings section, after "สลับบัญชี" menu item:

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

## Styling Requirements

- **Font**: Kanit family (Regular for body, SemiBold for headings)
- **Primary Color**: #B46A07
- **Background**: #f9fafb or white
- **Section Cards**: White with shadow, rounded corners (16px)
- **Header**: Match profile.tsx header style

---

## Validation

Run these commands before marking complete:

```bash
npm run lint:fix
npm run lint
npm run typecheck
```

---

## Testing Instructions

1. Open Profile tab
2. Tap "นโยบายความเป็นส่วนตัว" menu item
3. Should navigate to privacy policy screen
4. Scroll through all content
5. Back button should return to profile

---

## Completion Checklist

- [ ] Privacy policy screen created with all sections
- [ ] Menu item added in profile
- [ ] Thai text displays correctly (Kanit font)
- [ ] Navigation works both ways
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] PROGRESS.md updated to DONE

---

## Commit Message Template

```
feat(privacy): add privacy policy screen for Google Play compliance

- Create privacy policy page with Thai content
- Add menu item in profile tab
- Include data collection, storage, and user rights sections

Testing: Profile tab → นโยบายความเป็นส่วนตัว → Should display privacy policy
```
