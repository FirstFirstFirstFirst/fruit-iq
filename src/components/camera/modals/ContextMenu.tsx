import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { modalStyles } from '../modalStyles'

interface ContextMenuProps {
  visible: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ContextMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
}: ContextMenuProps) {
  if (!visible) return null

  const handleEdit = () => {
    onEdit()
    onClose()
  }

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  return (
    <TouchableOpacity
      style={modalStyles.contextMenuOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={modalStyles.contextMenuContainer}>
        <TouchableOpacity style={modalStyles.contextMenuItem} onPress={handleEdit}>
          <MaterialIcons name="edit" size={20} color="#3b82f6" />
          <Text style={modalStyles.contextMenuText}>แก้ไข</Text>
        </TouchableOpacity>

        <View style={modalStyles.contextMenuDivider} />

        <TouchableOpacity style={modalStyles.contextMenuItem} onPress={handleDelete}>
          <MaterialIcons name="delete" size={20} color="#ef4444" />
          <Text style={[modalStyles.contextMenuText, { color: '#ef4444' }]}>ลบ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}