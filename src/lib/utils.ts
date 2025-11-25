import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PRESET_EMOJIS, PresetEmojiItem } from '../components/camera/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThaiCurrency(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(safeAmount)
}

export function formatWeight(weight: number): string {
  const safeWeight = typeof weight === 'number' && !isNaN(weight) ? weight : 0
  return `${safeWeight.toFixed(2)} กก.`
}

export function getEmojiById(emojiId: string): PresetEmojiItem | undefined {
  // Handle custom uploaded images (URLs stored with 'custom:' prefix)
  if (emojiId.startsWith('custom:')) {
    // For custom emojis, we need to look up the URL from storage
    // The URL is stored separately, so we return a placeholder that signals
    // the caller to fetch the actual URL from the uploaded emojis list
    return {
      type: 'image',
      source: { uri: '' }, // Placeholder - actual URL fetched at runtime
      id: emojiId
    }
  }

  // Handle direct HTTP URLs (for backwards compatibility)
  if (emojiId.startsWith('http://') || emojiId.startsWith('https://')) {
    return {
      type: 'image',
      source: { uri: emojiId },
      id: emojiId
    }
  }

  // Fallback to preset emoji lookup
  return PRESET_EMOJIS.find((item) => item.id === emojiId)
}

// Helper to check if an emoji ID is a custom uploaded image
export function isCustomEmoji(emojiId: string): boolean {
  return emojiId.startsWith('custom:') || emojiId.startsWith('http://') || emojiId.startsWith('https://')
}