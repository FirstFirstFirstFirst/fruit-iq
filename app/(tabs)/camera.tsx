import React from 'react'
import { Alert } from 'react-native'
import { useFruits, useDatabase } from '../../src/hooks/useDatabase'
import QRPaymentScreen from '../../src/components/QRPaymentScreen'
import WeighScaleCamera from '../../src/components/WeighScaleCamera'
import { useCameraState } from '../../src/hooks/useCameraState'
import { useFruitForm } from '../../src/hooks/useFruitForm'
import { useCameraActions } from '../../src/hooks/useCameraActions'
import LoadingScreen from '../../src/components/camera/LoadingScreen'
import SuccessScreen from '../../src/components/camera/SuccessScreen'
import CleanScannerScreen from '../../src/components/camera/CleanScannerScreen'
import FruitSelectionScreen from '../../src/components/camera/screens/FruitSelectionScreen'
import WeightConfirmationScreen from '../../src/components/camera/screens/WeightConfirmationScreen'
import AddFruitModal from '../../src/components/camera/modals/AddFruitModal'
import EmojiPickerModal from '../../src/components/camera/modals/EmojiPickerModal'
import DeleteConfirmModal from '../../src/components/camera/modals/DeleteConfirmModal'
import ContextMenu from '../../src/components/camera/modals/ContextMenu'

export default function CameraScreen() {
  const { isInitialized } = useDatabase()
  const { fruits, addFruit, updateFruit, deleteFruit, loading: fruitsLoading } = useFruits()

  // Custom hooks
  const cameraState = useCameraState()
  const fruitForm = useFruitForm()

  const selectedFruit = fruits?.find(f => f.id === cameraState.selectedFruitId)

  const cameraActions = useCameraActions({
    setCapturedPhotoPath: cameraState.setCapturedPhotoPath,
    setStep: cameraState.setStep,
    setDetectedWeight: cameraState.setDetectedWeight,
    setIsProcessingPhoto: cameraState.setIsProcessingPhoto,
    setSelectedFruitId: cameraState.setSelectedFruitId,
    setTotalAmount: cameraState.setTotalAmount,
    setCurrentTransactionId: cameraState.setCurrentTransactionId,
    selectedFruit,
    detectedWeight: cameraState.detectedWeight,
    capturedPhotoPath: cameraState.capturedPhotoPath,
  })

  // Show loading while database initializes
  if (!isInitialized || fruitsLoading) {
    return <LoadingScreen />
  }





  const handleNewScan = () => {
    cameraState.resetCameraState()
    fruitForm.closeAllModals()
  }

  const handleQRPaymentCancel = () => {
    handleNewScan()
  }

  const handleDeleteFruit = async (fruitId: number) => {
    try {
      await deleteFruit(fruitId)
      fruitForm.setShowDeleteConfirm(null)
      Alert.alert('ลบสำเร็จ', 'ผลไม้ได้รับการลบออกจากระบบแล้ว')
    } catch (error) {
      console.error('Error deleting fruit:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบผลไม้ได้ กรุณาลองอีกครั้ง')
    }
  }

  const handleAddNewFruit = async () => {
    if (!fruitForm.isFormValid()) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    const { price, isValid } = fruitForm.getParsedPrice()
    if (!isValid) {
      Alert.alert('ราคาไม่ถูกต้อง', 'กรุณากรอกราคาเป็นตัวเลขที่มากกว่า 0')
      return
    }

    try {
      if (fruitForm.editingFruit) {
        await updateFruit(fruitForm.editingFruit.id, {
          nameThai: fruitForm.newFruitName.trim(),
          nameEnglish: fruitForm.newFruitName.trim(),
          emoji: fruitForm.newFruitEmoji.trim(),
          pricePerKg: price,
          description: `ผลไม้ ${fruitForm.newFruitName.trim()}`
        })
        Alert.alert('แก้ไขสำเร็จ', 'ข้อมูลผลไม้ได้รับการอัปเดตแล้ว')
      } else {
        const newFruit = await addFruit({
          nameThai: fruitForm.newFruitName.trim(),
          nameEnglish: fruitForm.newFruitName.trim(),
          emoji: fruitForm.newFruitEmoji.trim(),
          pricePerKg: price,
          category: 'other',
          description: `ผลไม้ ${fruitForm.newFruitName.trim()}`,
          nutritionFacts: {
            calories: 50,
            carbs: 12,
            fiber: 2,
            sugar: 8,
            protein: 1,
            fat: 0.2,
            vitamin_c: 20
          }
        })

        cameraState.setSelectedFruitId(newFruit.id)
        cameraState.setStep('weight')
      }

      fruitForm.setShowAddFruit(false)
      fruitForm.resetFruitForm()
    } catch (error) {
      console.error('Error saving fruit:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลผลไม้ได้ กรุณาลองอีกครั้ง')
    }
  }

  // QR Payment screen
  if (cameraState.step === 'qr-payment' && selectedFruit && cameraState.detectedWeight && cameraState.currentTransactionId) {
    return (
      <QRPaymentScreen
        fruit={selectedFruit}
        weight={cameraState.detectedWeight}
        totalAmount={cameraState.totalAmount}
        transactionId={cameraState.currentTransactionId}
        onSave={cameraActions.handleQRPaymentSave}
        onCancel={handleQRPaymentCancel}
      />
    )
  }

  // Success screen
  if (cameraState.step === 'success') {
    return (
      <SuccessScreen
        totalAmount={cameraState.totalAmount}
        selectedFruitName={selectedFruit?.nameThai}
        detectedWeight={cameraState.detectedWeight}
        onNewScan={handleNewScan}
      />
    )
  }

  // Real camera step for photo capture
  if (cameraState.step === 'camera') {
    return (
      <WeighScaleCamera
        onPhotoTaken={cameraActions.handlePhotoTaken}
        onCancel={cameraActions.handleCameraCancel}
        isVisible={true}
        isProcessing={cameraState.isProcessingPhoto}
      />
    )
  }


  // Clean camera scanner view - no overlay text
  if (cameraState.step === 'scan') {
    return (
      <CleanScannerScreen
        isProcessingPhoto={cameraState.isProcessingPhoto}
        onScan={cameraActions.handleScan}
      />
    )
  }

  // Beautiful fruit selection like food delivery app
  if (cameraState.step === 'select') {
    return (
      <>
        <FruitSelectionScreen
          detectedWeight={cameraState.detectedWeight}
          fruits={fruits || []}
          onBack={() => cameraState.setStep('scan')}
          onFruitSelect={cameraActions.handleFruitSelect}
          onFruitLongPress={(fruitId) => fruitForm.setContextMenuFruit(fruitId)}
          onAddFruit={() => fruitForm.setShowAddFruit(true)}
        />

        <AddFruitModal
          visible={fruitForm.showAddFruit}
          editingFruit={fruitForm.editingFruit}
          newFruitName={fruitForm.newFruitName}
          newFruitPrice={fruitForm.newFruitPrice}
          newFruitEmoji={fruitForm.newFruitEmoji}
          onClose={() => {
            fruitForm.setShowAddFruit(false)
            fruitForm.resetFruitForm()
          }}
          onNameChange={fruitForm.setNewFruitName}
          onPriceChange={fruitForm.setNewFruitPrice}
          onEmojiChange={fruitForm.setNewFruitEmoji}
          onShowEmojiPicker={() => fruitForm.setShowEmojiPicker(true)}
          onSubmit={handleAddNewFruit}
          isFormValid={fruitForm.isFormValid()}
        />

        <ContextMenu
          visible={!!fruitForm.contextMenuFruit}
          onClose={() => fruitForm.setContextMenuFruit(null)}
          onEdit={() => {
            const fruit = fruits?.find(f => f.id === fruitForm.contextMenuFruit)
            if (fruit) fruitForm.startEditFruit(fruit)
          }}
          onDelete={() => {
            if (fruitForm.contextMenuFruit) {
              fruitForm.setShowDeleteConfirm(fruitForm.contextMenuFruit)
            }
          }}
        />

        <EmojiPickerModal
          visible={fruitForm.showEmojiPicker}
          selectedEmoji={fruitForm.newFruitEmoji}
          onClose={() => fruitForm.setShowEmojiPicker(false)}
          onSelectEmoji={fruitForm.setNewFruitEmoji}
        />

        <DeleteConfirmModal
          visible={!!fruitForm.showDeleteConfirm}
          onClose={() => fruitForm.setShowDeleteConfirm(null)}
          onConfirm={() => {
            if (fruitForm.showDeleteConfirm) {
              handleDeleteFruit(fruitForm.showDeleteConfirm)
            }
          }}
        />
      </>
    )
  }

  // Weight confirmation and price calculation
  if (cameraState.step === 'weight') {
    return (
      <WeightConfirmationScreen
        selectedFruit={selectedFruit}
        detectedWeight={cameraState.detectedWeight}
        onBack={() => cameraState.setStep('select')}
        onConfirm={cameraActions.handleConfirm}
      />
    )
  }

  return null
}