import { THAI_TEXT } from '@/src/lib/constants'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProcessingOverlay from './ProcessingOverlay'
import { cameraStyles } from './styles'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

interface CleanScannerScreenProps {
  isProcessingPhoto: boolean
  onScan: () => void
  onManualEntry?: () => void
  onCancel?: () => void
}

export default function CleanScannerScreen({
  isProcessingPhoto,
  onScan,
  onManualEntry,
  onCancel,
}: CleanScannerScreenProps) {
  const { isOffline } = useNetworkStatus();

  const renderOfflineNotice = () => (
    <View style={cameraStyles.offlineNotice}>
      <MaterialIcons name="wifi-off" size={28} color="#f59e0b" />
      <View style={cameraStyles.offlineTextContainer}>
        <Text style={cameraStyles.offlineTitle}>ไม่มีอินเทอร์เน็ต</Text>
        <Text style={cameraStyles.offlineText}>กรุณาใช้โหมดกรอกน้ำหนักด้วยตนเอง</Text>
      </View>
    </View>
  );

  const renderInstructions = () => (
    <View style={cameraStyles.instructionsContainer}>
      <View style={cameraStyles.instructionsHeader}>
        <MaterialIcons name="scale" size={32} color="#B46A07" />
        <Text style={cameraStyles.instructionsTitle}>เตรียมถ่ายรูปตาชั่ง</Text>
      </View>

      <View style={cameraStyles.stepsList}>
        <View style={cameraStyles.instructionStep}>
          <View style={cameraStyles.stepNumber}>
            <Text style={cameraStyles.stepNumberText}>1</Text>
          </View>
          <Text style={cameraStyles.stepText}>วางผลไม้บนตาชั่งดิจิทัล</Text>
        </View>

        <View style={cameraStyles.instructionStep}>
          <View style={cameraStyles.stepNumber}>
            <Text style={cameraStyles.stepNumberText}>2</Text>
          </View>
          <Text style={cameraStyles.stepText}>รอให้ตัวเลขน้ำหนักแสดงผลชัดเจน</Text>
        </View>

        <View style={cameraStyles.instructionStep}>
          <View style={cameraStyles.stepNumber}>
            <Text style={cameraStyles.stepNumberText}>3</Text>
          </View>
          <Text style={cameraStyles.stepText}>กดปุ่มถ่ายรูปเพื่อเริ่มต้น</Text>
        </View>
      </View>

      <View style={cameraStyles.tipHintContainer}>
        <MaterialIcons name="lightbulb" size={16} color="#B46A07" />
        <Text style={cameraStyles.tipHintText}>โปรดถ่ายในที่แสงสว่างเพียงพอ</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={cameraStyles.modernContainer}>
      <View style={cameraStyles.cleanScannerContainer}>
        {/* Cancel button */}
        {onCancel && (
          <TouchableOpacity
            style={cameraStyles.cancelFlowButton}
            onPress={onCancel}
            disabled={isProcessingPhoto}
          >
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}

        {/* Offline notice */}
        {isOffline && renderOfflineNotice()}

        {/* Instructions - only show when online and not processing */}
        {!isProcessingPhoto && !isOffline && renderInstructions()}

        <View style={cameraStyles.cleanCameraArea}>
          {isProcessingPhoto && (
            <ProcessingOverlay text={THAI_TEXT.ocrProcessing} />
          )}
        </View>

        <View style={cameraStyles.cleanButtonContainer}>
          <TouchableOpacity
            style={[
              cameraStyles.cleanScanButton,
              (isProcessingPhoto || isOffline) && cameraStyles.scanButtonDisabled,
            ]}
            onPress={onScan}
            disabled={isProcessingPhoto || isOffline}
          >
            {isProcessingPhoto ? (
              <MaterialIcons name="hourglass-empty" size={32} color="rgba(255, 255, 255, 0.6)" />
            ) : isOffline ? (
              <MaterialIcons name="wifi-off" size={32} color="rgba(255, 255, 255, 0.6)" />
            ) : (
              <MaterialIcons name="camera-alt" size={32} color="white" />
            )}
          </TouchableOpacity>
          {!isProcessingPhoto && (
            <Text style={cameraStyles.scanButtonText}>
              {isOffline ? 'ต้องเชื่อมต่ออินเทอร์เน็ต' : 'เริ่มถ่ายรูป'}
            </Text>
          )}

          {/* Manual entry button - prominent when offline */}
          {!isProcessingPhoto && onManualEntry && (
            <TouchableOpacity
              style={isOffline ? cameraStyles.manualEntryButtonProminent : cameraStyles.manualEntryButton}
              onPress={onManualEntry}
            >
              <MaterialIcons name="edit" size={20} color={isOffline ? 'white' : '#B46A07'} />
              <Text style={isOffline ? cameraStyles.manualEntryButtonProminentText : cameraStyles.manualEntryButtonText}>
                {THAI_TEXT.enterManually}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}