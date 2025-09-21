import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { cameraStyles } from './styles'

interface AddFruitCardProps {
  onPress: () => void
}

export default function AddFruitCard({ onPress }: AddFruitCardProps) {
  return (
    <TouchableOpacity style={cameraStyles.modernAddCard} onPress={onPress}>
      <View style={cameraStyles.addIconContainer}>
        <MaterialIcons name="add" size={32} color="#B46A07" />
      </View>
      <View style={cameraStyles.addFruitInfo}>
        <Text style={cameraStyles.addFruitLabel}>เพิ่มผลไม้ใหม่</Text>
        <Text style={cameraStyles.addFruitSubtext}>สร้างรายการใหม่</Text>
      </View>
    </TouchableOpacity>
  )
}