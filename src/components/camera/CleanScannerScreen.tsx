import { THAI_TEXT } from '@/src/lib/constants'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { SafeAreaView, TouchableOpacity, View } from 'react-native'
import ProcessingOverlay from './ProcessingOverlay'
import { cameraStyles } from './styles'

interface CleanScannerScreenProps {
  isProcessingPhoto: boolean
  onScan: () => void
}

export default function CleanScannerScreen({
  isProcessingPhoto,
  onScan,
}: CleanScannerScreenProps) {
  return (
    <SafeAreaView style={cameraStyles.container}>
      <View style={cameraStyles.cleanScannerContainer}>
        <View style={cameraStyles.cleanCameraArea}>
          {isProcessingPhoto && (
            <ProcessingOverlay text={THAI_TEXT.ocrProcessing} />
          )}
        </View>

        <View style={cameraStyles.cleanButtonContainer}>
          <TouchableOpacity
            style={[
              cameraStyles.cleanScanButton,
              isProcessingPhoto && cameraStyles.scanButtonDisabled,
            ]}
            onPress={onScan}
            disabled={isProcessingPhoto}
          >
            {isProcessingPhoto ? (
              <MaterialIcons name="hourglass-empty" size={32} color="rgba(255, 255, 255, 0.6)" />
            ) : (
              <MaterialIcons name="camera-alt" size={32} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}