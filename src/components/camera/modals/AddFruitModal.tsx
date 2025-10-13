import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PRESET_EMOJIS } from "../constants";
import { modalStyles } from "../modalStyles";

interface AddFruitModalProps {
  visible: boolean;
  editingFruit: any;
  newFruitName: string;
  newFruitPrice: string;
  newFruitEmoji: string; // Now stores emoji ID (e.g., 'apple', 'durian')
  onClose: () => void;
  onNameChange: (text: string) => void;
  onPriceChange: (text: string) => void;
  onEmojiChange: (emojiId: string) => void;
  onShowEmojiPicker: () => void;
  onSubmit: () => void;
  isFormValid: boolean;
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
  // Get the emoji/image item by ID
  const selectedEmojiItem = PRESET_EMOJIS.find(
    (item) => item.id === newFruitEmoji
  );
  const defaultEmojiItem = PRESET_EMOJIS.find((item) => item.id === "apple");

  const handlePriceChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, "");
    const parts = numericText.split(".");
    if (parts.length <= 2) {
      onPriceChange(numericText);
    }
  };

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
              {editingFruit ? "แก้ไขผลไม้" : "เพิ่มผลไม้ใหม่"}
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
              <View style={modalStyles.emojiDisplay}>
                {selectedEmojiItem ? (
                  selectedEmojiItem.type === "emoji" ? (
                    <Text style={{ fontSize: 40 }}>
                      {selectedEmojiItem.value}
                    </Text>
                  ) : (
                    <Image
                      source={selectedEmojiItem.source}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  )
                ) : defaultEmojiItem?.type === "emoji" ? (
                  <Text style={{ fontSize: 40 }}>{defaultEmojiItem.value}</Text>
                ) : null}
              </View>
              <Text style={modalStyles.emojiPickerText}>
                แตะเพื่อเลือกอีโมจิ
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
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
            style={[
              modalStyles.modernAddButton,
              !isFormValid && modalStyles.modernAddButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={!isFormValid}
          >
            <Text
              style={[
                modalStyles.modernAddButtonText,
                !isFormValid && modalStyles.modernAddButtonTextDisabled,
              ]}
            >
              {editingFruit ? "บันทึกการแก้ไข" : "เพิ่มผลไม้"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
