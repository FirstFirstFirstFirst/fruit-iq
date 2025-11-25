# F5: Privacy Policy Implementation

> **Priority**: HIGH | **Complexity**: LOW | **Can Run Parallel**: YES

---

## Pre-Flight Checklist

```bash
# 1. Read the development plan
cat DEVELOPMENT_PLAN.md

# 2. Check current progress  
cat PROGRESS.md

# 3. Claim this feature - Update PROGRESS.md:
#    Change F5 status from READY to IN_PROGRESS
#    Add your session info to Session Log
```

---

## Task Description

Create Privacy Policy screen for Google Play Store compliance.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `app/privacy-policy.tsx` | CREATE |
| `app/(tabs)/profile.tsx` | MODIFY - Add menu item |

---

## Implementation

### Step 1: Create `app/privacy-policy.tsx`

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>นโยบายความเป็นส่วนตัว</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Thai privacy policy content sections */}
        {/* 1. ข้อมูลที่เราเก็บรวบรวม */}
        {/* 2. วัตถุประสงค์ในการใช้ข้อมูล */}
        {/* 3. การเก็บรักษาข้อมูล */}
        {/* 4. สิทธิ์ของผู้ใช้ */}
        {/* 5. ติดต่อเรา */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 2: Add Menu Item in `app/(tabs)/profile.tsx`

Add after the "สลับบัญชี" menu item:

```typescript
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

## Privacy Content to Include

1. **ข้อมูลที่เราเก็บรวบรวม**: หมายเลข PromptPay, ประวัติการขาย, ข้อมูลผลไม้
2. **วัตถุประสงค์**: คำนวณราคา, สร้าง QR Code, แสดงประวัติ
3. **การเก็บรักษา**: เซิร์ฟเวอร์ที่ปลอดภัย, การเข้ารหัส SSL
4. **สิทธิ์ผู้ใช้**: ลบบัญชี, ขอข้อมูล
5. **ติดต่อ**: support@werapun.com

---

## Validation & Completion

```bash
npm run lint:fix && npm run lint && npm run typecheck
```

**Testing**: Profile → นโยบายความเป็นส่วนตัว → View content → Back button works

**Commit**:
```
feat: add privacy policy screen for Google Play compliance

- Create privacy policy page with Thai content
- Add menu item in profile settings

Testing: Profile tab → นโยบายความเป็นส่วนตัว → Should display policy
```
