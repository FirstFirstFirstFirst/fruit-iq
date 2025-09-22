import React, { useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity, Image, Dimensions, GestureResponderEvent } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { cameraStyles } from '../styles'

const { width: screenWidth } = Dimensions.get('window')

interface CropSelection {
  x: number
  y: number
  width: number
  height: number
}

interface PhotoConfirmationScreenProps {
  capturedPhotoPath: string
  isProcessingPhoto: boolean
  onBack: () => void
  onConfirmAndProcess: () => void
  onSkipCrop: () => void
  onCropChange?: (crop: CropSelection | null) => void
}

export default function PhotoConfirmationScreen({
  capturedPhotoPath,
  isProcessingPhoto,
  onBack,
  onConfirmAndProcess,
  onSkipCrop,
  onCropChange,
}: PhotoConfirmationScreenProps) {
  // Crop selection state
  const [cropSelection, setCropSelection] = useState<CropSelection>({
    x: screenWidth * 0.2,
    y: 100,
    width: screenWidth * 0.6,
    height: 120,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleCropSelection = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent

    if (!isDragging) {
      // Start drag
      setIsDragging(true)
      setDragStart({ x: locationX, y: locationY })
      setCropSelection({
        x: locationX - 50,
        y: locationY - 30,
        width: 100,
        height: 60,
      })
    }
  }

  const handleCropMove = (event: GestureResponderEvent) => {
    if (!isDragging) return

    const { locationX, locationY } = event.nativeEvent
    const deltaX = locationX - dragStart.x
    const deltaY = locationY - dragStart.y

    setCropSelection(prev => ({
      ...prev,
      width: Math.max(80, Math.abs(deltaX) * 2),
      height: Math.max(40, Math.abs(deltaY) * 2),
    }))
  }

  const handleCropEnd = () => {
    setIsDragging(false)
    // Notify parent component of crop selection change
    if (onCropChange) {
      const normalizedCrop = calculateCropCoordinates()
      onCropChange(normalizedCrop)
    }
  }

  const calculateCropCoordinates = (): CropSelection => {
    // Normalize crop coordinates relative to image container
    const containerWidth = screenWidth - 40 // accounting for margins
    const containerHeight = 400 // approximate image container height

    return {
      x: Math.max(0, cropSelection.x / containerWidth),
      y: Math.max(0, cropSelection.y / containerHeight),
      width: Math.min(1, cropSelection.width / containerWidth),
      height: Math.min(1, cropSelection.height / containerHeight),
    }
  }

  const renderCropOverlay = () => (
    <View
      style={cameraStyles.cropOverlay}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleCropSelection}
      onResponderMove={handleCropMove}
      onResponderRelease={handleCropEnd}
    >
      {/* Helpful suggestions */}
      <View style={cameraStyles.cropSuggestions}>
        <Text style={cameraStyles.suggestionText}>เลือกเฉพาะพื้นที่ตัวเลขน้ำหนัก</Text>
        <Text style={cameraStyles.suggestionSubtext}>แตะและลากเพื่อเลือกพื้นที่</Text>
      </View>

      {/* Interactive crop selection area */}
      <View style={[
        cameraStyles.cropSelectionBox,
        {
          left: cropSelection.x,
          top: cropSelection.y,
          width: cropSelection.width,
          height: cropSelection.height,
        }
      ]}>
        <View style={cameraStyles.cropCorner} />
        <View style={[cameraStyles.cropCorner, cameraStyles.topRight]} />
        <View style={[cameraStyles.cropCorner, cameraStyles.bottomLeft]} />
        <View style={[cameraStyles.cropCorner, cameraStyles.bottomRight]} />

        <View style={cameraStyles.cropCenter}>
          <MaterialIcons name="crop" size={24} color="rgba(255, 255, 255, 0.8)" />
          <Text style={cameraStyles.cropCenterText}>พื้นที่ตัวเลข</Text>
        </View>
      </View>
    </View>
  )
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

        {/* Photo with interactive crop overlay */}
        <View style={cameraStyles.photoContainer}>
          <Image
            source={{ uri: capturedPhotoPath }}
            style={cameraStyles.capturedPhoto}
            resizeMode="contain"
          />

          {/* Interactive crop selection overlay */}
          {renderCropOverlay()}
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