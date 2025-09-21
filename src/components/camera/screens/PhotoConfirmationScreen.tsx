import React from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { cameraStyles } from '../styles'

interface PhotoConfirmationScreenProps {
  capturedPhotoPath: string
  isProcessingPhoto: boolean
  onBack: () => void
  onConfirmAndProcess: () => void
  onSkipCrop: () => void
}

export default function PhotoConfirmationScreen({
  capturedPhotoPath,
  isProcessingPhoto,
  onBack,
  onConfirmAndProcess,
  onSkipCrop,
}: PhotoConfirmationScreenProps) {
  return (
    <SafeAreaView style={cameraStyles.container}>
      <View style={cameraStyles.confirmPhotoContainer}>
        {/* Header */}
        <View style={cameraStyles.confirmPhotoHeader}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={cameraStyles.confirmPhotoTitle}>เลือกพื้นที่ตัวเลข</Text>
          <TouchableOpacity onPress={onConfirmAndProcess} disabled={isProcessingPhoto}>
            <Text style={[
              cameraStyles.confirmPhotoAction,
              isProcessingPhoto && cameraStyles.disabledAction
            ]}>
              {isProcessingPhoto ? 'กำลังประมวลผล...' : 'ดำเนินการ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo with crop overlay */}
        <View style={cameraStyles.photoContainer}>
          <Image
            source={{ uri: capturedPhotoPath }}
            style={cameraStyles.capturedPhoto}
            resizeMode="contain"
          />

          {/* Crop selection overlay */}
          <View style={cameraStyles.cropOverlay}>
            {/* Helpful suggestions */}
            <View style={cameraStyles.cropSuggestions}>
              <Text style={cameraStyles.suggestionText}>เลือกเฉพาะพื้นที่ตัวเลขน้ำหนัก</Text>
              <Text style={cameraStyles.suggestionSubtext}>ลากมุมเพื่อปรับขนาดกรอบ</Text>
            </View>

            {/* Default crop selection area */}
            <View style={cameraStyles.cropSelectionBox}>
              <View style={cameraStyles.cropCorner} />
              <View style={[cameraStyles.cropCorner, cameraStyles.topRight]} />
              <View style={[cameraStyles.cropCorner, cameraStyles.bottomLeft]} />
              <View style={[cameraStyles.cropCorner, cameraStyles.bottomRight]} />

              <View style={cameraStyles.cropCenter}>
                <MaterialIcons name="crop" size={32} color="rgba(255, 255, 255, 0.8)" />
                <Text style={cameraStyles.cropCenterText}>พื้นที่ตัวเลข</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional suggestions */}
        <View style={cameraStyles.cropInstructions}>
          <View style={cameraStyles.instructionRow}>
            <MaterialIcons name="info" size={20} color="#B46A07" />
            <Text style={cameraStyles.instructionText}>
              เลือกเฉพาะส่วนที่มีตัวเลขน้ำหนักเพื่อความแม่นยำสูงสุด
            </Text>
          </View>
          <View style={cameraStyles.instructionRow}>
            <MaterialIcons name="touch-app" size={20} color="#6b7280" />
            <Text style={cameraStyles.instructionText}>
              หากไม่เลือก ระบบจะใช้รูปภาพทั้งหมด
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={cameraStyles.confirmPhotoActions}>
          <TouchableOpacity
            style={cameraStyles.skipCropButton}
            onPress={onSkipCrop}
            disabled={isProcessingPhoto}
          >
            <Text style={cameraStyles.skipCropText}>ข้ามการเลือก</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              cameraStyles.processWithCropButton,
              isProcessingPhoto && cameraStyles.disabledButton
            ]}
            onPress={onConfirmAndProcess}
            disabled={isProcessingPhoto}
          >
            {isProcessingPhoto ? (
              <MaterialIcons name="hourglass-empty" size={20} color="rgba(255, 255, 255, 0.6)" />
            ) : (
              <MaterialIcons name="check" size={20} color="white" />
            )}
            <Text style={cameraStyles.processWithCropText}>
              {isProcessingPhoto ? 'กำลังประมวลผล...' : 'ประมวลผลด้วยการเลือก'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}