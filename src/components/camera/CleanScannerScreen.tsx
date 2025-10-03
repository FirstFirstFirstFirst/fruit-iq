import { THAI_TEXT } from '@/src/lib/constants'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProcessingOverlay from './ProcessingOverlay'
import { cameraStyles } from './styles'

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
  const renderInstructions = () => (
    <View style={cameraStyles.instructionsContainer}>
      <View style={cameraStyles.instructionsHeader}>
        <MaterialIcons name="scale" size={32} color="#B46A07" />
        <Text style={cameraStyles.instructionsTitle}>เตรียมถ่ายรูปตาชั่ง</Text>
      </View>

      <ScrollView style={cameraStyles.instructionsScrollView} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      {renderQuickTips()}
    </View>
  )

  const renderQuickTips = () => (
    <View style={cameraStyles.quickTipsContainer}>
      <Text style={cameraStyles.quickTipsTitle}>เคล็ดลับการถ่ายรูป</Text>
      <View style={cameraStyles.tipsList}>
        <View style={cameraStyles.tipItem}>
          <MaterialIcons name="wb-sunny" size={16} color="#6b7280" />
          <Text style={cameraStyles.tipText}>ใช้แสงสว่างเพียงพอ</Text>
        </View>
        <View style={cameraStyles.tipItem}>
          <MaterialIcons name="center-focus-strong" size={16} color="#6b7280" />
          <Text style={cameraStyles.tipText}>ให้ตัวเลขอยู่ตรงกลาง</Text>
        </View>
        <View style={cameraStyles.tipItem}>
          <MaterialIcons name="visibility" size={16} color="#6b7280" />
          <Text style={cameraStyles.tipText}>ตรวจสอบความชัดเจน</Text>
        </View>
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

        {!isProcessingPhoto && renderInstructions()}

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
          {!isProcessingPhoto && (
            <Text style={cameraStyles.scanButtonText}>เริ่มถ่ายรูป</Text>
          )}
        </View>

        {/* Manual entry button */}
        {!isProcessingPhoto && onManualEntry && (
          <TouchableOpacity
            style={cameraStyles.manualEntryButton}
            onPress={onManualEntry}
          >
            <MaterialIcons name="edit" size={20} color="#B46A07" />
            <Text style={cameraStyles.manualEntryButtonText}>{THAI_TEXT.enterManually}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}