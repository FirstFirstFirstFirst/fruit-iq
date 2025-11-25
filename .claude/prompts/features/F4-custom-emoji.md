# F4: Custom Emoji/Image Upload

> **Priority**: MEDIUM | **Complexity**: MEDIUM | **Est. Time**: 2-3 hours

---

## Quick Start

1. Read DEVELOPMENT_PLAN.md for architecture overview
2. Read PROGRESS.md and update status to IN_PROGRESS
3. Read CLAUDE.md for coding standards

---

## Prerequisites

Install expo-image-picker:
```bash
npx expo install expo-image-picker
```

---

## Task Description

Allow uploading custom product images beyond the preset emojis (for pork vendors, etc.).

### Current Behavior
Limited to 20 preset emojis in PRESET_EMOJIS array.

### New Behavior
- Keep all preset emojis
- Add "Upload Custom Image" option
- Store uploaded images on server
- Display uploaded images in picker

---

## Files to Create/Modify

| File | Action |
|------|--------|
| src/components/camera/modals/EmojiPickerModal.tsx | MODIFY - major changes |
| src/lib/api.ts | MODIFY - add upload API |
| src/lib/utils.ts | MODIFY - update getEmojiById |
| src/components/camera/constants.ts | MODIFY - optional helper types |

---

## Step 1: Add Upload API

File: src/lib/api.ts

Add EmojiUploadAPI object:
```typescript
export const EmojiUploadAPI = {
  async uploadImage(imageUri: string): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'emoji.jpg',
    } as any);

    return apiClient.postFormData('/upload/emoji', formData);
  },

  async getUploadedEmojis(): Promise<Array<{ id: string; url: string }>> {
    return apiClient.get('/upload/emojis');
  }
};
```

Note: If backend not ready, use mock implementation storing in AsyncStorage.

---

## Step 2: Update EmojiPickerModal

File: src/components/camera/modals/EmojiPickerModal.tsx

Add imports:
```typescript
import * as ImagePicker from 'expo-image-picker';
import { Image, ActivityIndicator } from 'react-native';
```

Add state:
- uploadedEmojis: Array of uploaded images
- uploading: boolean
- loadingEmojis: boolean

Add functions:
- loadUploadedEmojis() - fetch from API/storage
- handleUploadImage() - pick and upload image

UI changes:
- After preset emoji grid, add divider
- Add "Upload Image" button with camera icon
- Add "Uploaded Images" section showing user uploads
- Show loading indicator during upload

---

## Step 3: Update getEmojiById

File: src/lib/utils.ts

```typescript
export function getEmojiById(emojiId: string): PresetEmojiItem | undefined {
  // Handle custom uploaded images (URLs)
  if (emojiId.startsWith('http') || emojiId.startsWith('custom:')) {
    const url = emojiId.replace('custom:', '');
    return {
      type: 'image',
      source: { uri: url },
      id: emojiId
    };
  }

  // Fallback to preset lookup
  return PRESET_EMOJIS.find((item) => item.id === emojiId);
}
```

---

## UI Design Reference

### Updated EmojiPickerModal
```
+----------------------------------+
|        Select Icon           [X] |
+----------------------------------+
| [A][O][B][M][G][S]               |
| [C][P][B][M][P][K]               |
| [L][P][A][T][C][P]               |
| [C][D]                           |
+----------------------------------+
| +------------------------------+ |
| |   Upload Image               | |
| +------------------------------+ |
+----------------------------------+
| Uploaded Images:                 |
| [img1][img2][img3]               |
+----------------------------------+
```

---

## Image Picker Configuration

```typescript
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Upload result.assets[0].uri
  }
};
```

---

## Mock Implementation (if backend not ready)

Use AsyncStorage to store uploaded images locally:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const UPLOADED_EMOJIS_KEY = 'uploaded_emojis';

// Save: store base64 or local URI
// Load: retrieve and display
```

---

## Validation

Run: npm run lint:fix && npm run lint && npm run typecheck

---

## Testing

1. Open Add Fruit modal
2. Tap emoji picker
3. Scroll down to "Upload Image" button
4. Select image from gallery
5. Image should upload and appear in uploaded section
6. Select the uploaded image
7. Create fruit with custom image
8. Fruit should display the custom image throughout app

---

## Commit Message

feat(emoji): add custom image upload for product icons

- Add image upload capability in emoji picker
- Support uploaded images alongside preset emojis
- Update getEmojiById to handle custom image URLs
- Store uploaded images for reuse

Testing: Add fruit -> Emoji picker -> Upload image -> Select -> Fruit shows custom image
