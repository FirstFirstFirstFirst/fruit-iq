import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { PRESET_EMOJIS } from '../constants'
import { modalStyles } from '../modalStyles'

interface EmojiPickerModalProps {
  visible: boolean
  selectedEmoji: string
  onClose: () => void
  onSelectEmoji: (emoji: string) => void
}

export default function EmojiPickerModal({
  visible,
  selectedEmoji,
  onClose,
  onSelectEmoji,
}: EmojiPickerModalProps) {
  if (!visible) return null

  const handleSelectEmoji = (emoji: string) => {
    onSelectEmoji(emoji)
    onClose()
  }

  return (
    <View style={modalStyles.modernModal}>
      <View style={[modalStyles.modernModalContent, modalStyles.emojiPickerModal]}>
        <View style={modalStyles.modalHeader}>
          <Text style={modalStyles.modalTitle}>เลือกอีโมจิ</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={modalStyles.emojiGrid} showsVerticalScrollIndicator={false}>
          <View style={modalStyles.emojiGridContainer}>
            {PRESET_EMOJIS.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  modalStyles.emojiGridItem,
                  selectedEmoji === emoji && modalStyles.selectedEmojiItem
                ]}
                onPress={() => handleSelectEmoji(emoji)}
              >
                <Text style={modalStyles.emojiGridEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}