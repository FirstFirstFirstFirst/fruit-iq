import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { PRESET_EMOJIS } from '../constants'
import { modalStyles } from '../modalStyles'
import { EmojiUploadAPI, UploadedEmoji } from '../../../lib/api'

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
  const [uploadedEmojis, setUploadedEmojis] = useState<UploadedEmoji[]>([])
  const [uploading, setUploading] = useState(false)
  const [loadingEmojis, setLoadingEmojis] = useState(false)

  // Load uploaded emojis when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadUploadedEmojis()
    }
  }, [visible])

  const loadUploadedEmojis = async () => {
    setLoadingEmojis(true)
    try {
      const emojis = await EmojiUploadAPI.getUploadedEmojis()
      setUploadedEmojis(emojis)
    } catch (error) {
      console.error('Failed to load uploaded emojis:', error)
    } finally {
      setLoadingEmojis(false)
    }
  }

  const handleUploadImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        alert('ต้องการสิทธิ์ในการเข้าถึงคลังภาพ')
        return
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled || !result.assets?.[0]) {
        return
      }

      setUploading(true)
      const imageUri = result.assets[0].uri

      // Upload the image
      const uploaded = await EmojiUploadAPI.uploadImage(imageUri)

      // Refresh the list
      await loadUploadedEmojis()

      // Auto-select the newly uploaded emoji
      onSelectEmoji(uploaded.id)
      onClose()
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('ไม่สามารถอัปโหลดรูปภาพได้')
    } finally {
      setUploading(false)
    }
  }

  const handleSelectEmoji = (emojiId: string) => {
    onSelectEmoji(emojiId)
    onClose()
  }

  const handleSelectUploadedEmoji = (emoji: UploadedEmoji) => {
    onSelectEmoji(emoji.id)
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
            <Text style={modalStyles.modalTitle}>เลือกไอคอน</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.emojiGrid} showsVerticalScrollIndicator={false}>
            {/* Preset Emojis Section */}
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

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 }} />

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                modalStyles.photoOptionButton,
                { marginBottom: 16 },
                uploading && { opacity: 0.6 }
              ]}
              onPress={handleUploadImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#B46A07" />
              ) : (
                <MaterialIcons name="add-photo-alternate" size={24} color="#6b7280" />
              )}
              <Text style={modalStyles.photoOptionText}>
                {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
              </Text>
            </TouchableOpacity>

            {/* Uploaded Images Section */}
            {(uploadedEmojis.length > 0 || loadingEmojis) && (
              <>
                <Text style={{
                  fontSize: 14,
                  fontFamily: 'Kanit-Medium',
                  color: '#6b7280',
                  marginBottom: 12,
                }}>
                  รูปภาพที่อัปโหลด
                </Text>

                {loadingEmojis ? (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#B46A07" />
                  </View>
                ) : (
                  <View style={modalStyles.emojiGridContainer}>
                    {uploadedEmojis.map((emoji) => (
                      <TouchableOpacity
                        key={emoji.id}
                        style={[
                          modalStyles.emojiGridItem,
                          selectedEmoji === emoji.id && modalStyles.selectedEmojiItem
                        ]}
                        onPress={() => handleSelectUploadedEmoji(emoji)}
                      >
                        <Image
                          source={{ uri: emoji.url }}
                          style={{ width: 40, height: 40, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
