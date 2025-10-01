import React from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { modalStyles } from '../modalStyles'

interface AddFruitModalProps {
  visible: boolean
  editingFruit: any
  newFruitName: string
  newFruitPrice: string
  newFruitEmoji: string
  onClose: () => void
  onNameChange: (text: string) => void
  onPriceChange: (text: string) => void
  onEmojiChange: (emoji: string) => void
  onShowEmojiPicker: () => void
  onSubmit: () => void
  isFormValid: boolean
}

export default function AddFruitModal({
  visible,
  editingFruit,
  newFruitName,
  newFruitPrice,
  newFruitEmoji,
  onClose,
  onNameChange,
  onPriceChange,
  onEmojiChange,
  onShowEmojiPicker,
  onSubmit,
  isFormValid,
}: AddFruitModalProps) {
  const handlePriceChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '')
    const parts = numericText.split('.')
    if (parts.length <= 2) {
      onPriceChange(numericText)
    }
  }

  const handleEmojiChange = (text: string) => {
    const emojiOnly = text.replace(/[^\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/gu, '')
    onEmojiChange(emojiOnly.slice(0, 2))
  }

  const handlePhotoOption = () => {
    Alert.alert(
      'รูปภาพ',
      'ฟีเจอร์การเลือกรูปภาพยังไม่พร้อมใช้งาน\nกรุณาใช้อีโมจิแทน',
      [{ text: 'ตกลง' }]
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={modalStyles.modernModal}>
        <View style={modalStyles.modernModalContent}>
        <View style={modalStyles.modalHeader}>
          <Text style={modalStyles.modalTitle}>
            {editingFruit ? 'แก้ไขผลไม้' : 'เพิ่มผลไม้ใหม่'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={modalStyles.inputGroup}>
          <Text style={modalStyles.inputLabel}>ชื่อผลไม้</Text>
          <TextInput
            style={modalStyles.modernInput}
            placeholder="เช่น มะม่วง, สับปะรด"
            value={newFruitName}
            onChangeText={onNameChange}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={modalStyles.inputGroup}>
          <Text style={modalStyles.inputLabel}>อีโมจิ</Text>

          <TouchableOpacity
            style={modalStyles.emojiPickerButton}
            onPress={onShowEmojiPicker}
          >
            <Text style={modalStyles.emojiDisplay}>
              {newFruitEmoji || '🍎'}
            </Text>
            <Text style={modalStyles.emojiPickerText}>แตะเพื่อเลือกอีโมจิ</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={modalStyles.photoOptionContainer}>
            <TouchableOpacity
              style={modalStyles.photoOptionButton}
              onPress={handlePhotoOption}
            >
              <MaterialIcons name="photo-camera" size={20} color="#6b7280" />
              <Text style={modalStyles.photoOptionText}>หรือเลือกรูปภาพ</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[modalStyles.modernInput, modalStyles.customEmojiInput]}
            placeholder="หรือใส่อีโมจิเอง"
            value={newFruitEmoji}
            onChangeText={handleEmojiChange}
            placeholderTextColor="#9ca3af"
            maxLength={2}
          />
        </View>

        <View style={modalStyles.inputGroup}>
          <Text style={modalStyles.inputLabel}>ราคาต่อกิโลกรัม (บาท)</Text>
          <TextInput
            style={modalStyles.modernInput}
            placeholder="120"
            value={newFruitPrice}
            onChangeText={handlePriceChange}
            keyboardType="decimal-pad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={modalStyles.modernAddButton}
          onPress={onSubmit}
          disabled={!isFormValid}
        >
          <Text style={modalStyles.modernAddButtonText}>
            {editingFruit ? 'บันทึกการแก้ไข' : 'เพิ่มผลไม้'}
          </Text>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}