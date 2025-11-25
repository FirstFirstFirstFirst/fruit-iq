import React, { useState, useEffect } from 'react'
import { Text, Image, View, StyleSheet } from 'react-native'
import { PRESET_EMOJIS } from './constants'
import { EmojiUploadAPI } from '../../lib/api'

interface EmojiDisplayProps {
  emojiId: string
  size?: number
  style?: object
}

export default function EmojiDisplay({ emojiId, size = 40, style }: EmojiDisplayProps) {
  const [customUrl, setCustomUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if this is a custom uploaded emoji
  const isCustom = emojiId?.startsWith('custom:')

  // Load custom emoji URL from storage
  useEffect(() => {
    if (!isCustom || !emojiId) return

    let mounted = true
    const loadCustomEmoji = async () => {
      setLoading(true)
      try {
        const uploadedEmojis = await EmojiUploadAPI.getUploadedEmojis()
        const found = uploadedEmojis.find((e) => e.id === emojiId)
        if (mounted && found) {
          setCustomUrl(found.url)
        }
      } catch (error) {
        console.error('Failed to load custom emoji:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCustomEmoji()
    return () => {
      mounted = false
    }
  }, [emojiId, isCustom])

  // Handle custom uploaded emoji
  if (isCustom) {
    if (loading || !customUrl) {
      return (
        <View style={[styles.placeholder, { width: size, height: size }, style]}>
          <Text style={{ fontSize: size * 0.5 }}>📷</Text>
        </View>
      )
    }
    return (
      <Image
        source={{ uri: customUrl }}
        style={[{ width: size, height: size, borderRadius: size * 0.2 }, style]}
        resizeMode="cover"
      />
    )
  }

  // Handle direct URL (http/https)
  if (emojiId?.startsWith('http://') || emojiId?.startsWith('https://')) {
    return (
      <Image
        source={{ uri: emojiId }}
        style={[{ width: size, height: size, borderRadius: size * 0.2 }, style]}
        resizeMode="cover"
      />
    )
  }

  // Handle preset emoji/image
  const presetItem = PRESET_EMOJIS.find((item) => item.id === emojiId)

  if (presetItem?.type === 'emoji') {
    return <Text style={[{ fontSize: size }, style]}>{presetItem.value}</Text>
  }

  if (presetItem?.type === 'image') {
    return (
      <Image
        source={presetItem.source}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
      />
    )
  }

  // Fallback
  return <Text style={[{ fontSize: size }, style]}>🍎</Text>
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
