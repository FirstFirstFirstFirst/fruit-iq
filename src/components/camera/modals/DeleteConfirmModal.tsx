import React from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { modalStyles } from '../modalStyles'

interface DeleteConfirmModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modernModal}>
        <View style={modalStyles.modernModalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>ยืนยันการลบ</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.deleteConfirmContent}>
            <MaterialIcons name="warning" size={48} color="#ef4444" />
            <Text style={modalStyles.deleteConfirmText}>
              คุณต้องการลบผลไม้นี้ออกจากระบบหรือไม่?
            </Text>
            <Text style={modalStyles.deleteConfirmSubtext}>
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </Text>
          </View>

          <View style={modalStyles.deleteActions}>
            <TouchableOpacity
              style={modalStyles.cancelDeleteButton}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelDeleteText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.confirmDeleteButton}
              onPress={onConfirm}
            >
              <Text style={modalStyles.confirmDeleteText}>ลบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}