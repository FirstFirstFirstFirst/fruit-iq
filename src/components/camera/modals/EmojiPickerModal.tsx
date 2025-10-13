import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { PRESET_EMOJIS } from '../constants'
import { modalStyles } from '../modalStyles'

interface EmojiPickerModalProps {
  visible: boolean
  selectedEmoji: string
  onClose: () => void
  onSelectEmoji: (emojiId: string) => void
}

export default function EmojiPickerModal({
  visible,
  selectedEmoji,
  onClose,
  onSelectEmoji,
}: EmojiPickerModalProps) {
  const handleSelectEmoji = (emojiId: string) => {
    onSelectEmoji(emojiId)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
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
              {PRESET_EMOJIS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    modalStyles.emojiGridItem,
                    selectedEmoji === item.id && modalStyles.selectedEmojiItem
                  ]}
                  onPress={() => handleSelectEmoji(item.id)}
                >
                  {item.type === 'emoji' ? (
                    <Text style={modalStyles.emojiGridEmoji}>{item.value}</Text>
                  ) : (
                    <Image
                      source={item.source}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}