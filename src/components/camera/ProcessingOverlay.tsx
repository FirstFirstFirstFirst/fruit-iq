import React from 'react'
import { View, Text } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { cameraStyles } from './styles'

interface ProcessingOverlayProps {
  text: string
}

export default function ProcessingOverlay({ text }: ProcessingOverlayProps) {
  return (
    <View style={cameraStyles.processingOverlay}>
      <MaterialIcons name="hourglass-empty" size={60} color="#B46A07" />
      <Text style={cameraStyles.processingText}>{text}</Text>
    </View>
  )
}