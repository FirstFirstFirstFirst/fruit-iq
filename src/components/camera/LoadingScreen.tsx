import React from 'react'
import { View, Text, SafeAreaView } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { cameraStyles } from './styles'

export default function LoadingScreen() {
  return (
    <SafeAreaView style={cameraStyles.container}>
      <View style={cameraStyles.loadingContainer}>
        <MaterialIcons name="hourglass-empty" size={48} color="#B46A07" />
        <Text style={cameraStyles.loadingText}>กำลังโหลด...</Text>
      </View>
    </SafeAreaView>
  )
}