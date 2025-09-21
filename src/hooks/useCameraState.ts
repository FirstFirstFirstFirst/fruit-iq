import { useState } from 'react'
import { CameraStep, CropSelection } from '../components/camera/constants'

export function useCameraState() {
  const [step, setStep] = useState<CameraStep>('scan')
  const [selectedFruitId, setSelectedFruitId] = useState<number | null>(null)
  const [detectedWeight, setDetectedWeight] = useState<number | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null)
  const [capturedPhotoPath, setCapturedPhotoPath] = useState<string | null>(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null)

  const resetCameraState = () => {
    setStep('scan')
    setSelectedFruitId(null)
    setDetectedWeight(null)
    setTotalAmount(0)
    setCurrentTransactionId(null)
    setCapturedPhotoPath(null)
    setIsProcessingPhoto(false)
    setCropSelection(null)
  }

  return {
    // State
    step,
    selectedFruitId,
    detectedWeight,
    totalAmount,
    currentTransactionId,
    capturedPhotoPath,
    isProcessingPhoto,
    cropSelection,

    // Setters
    setStep,
    setSelectedFruitId,
    setDetectedWeight,
    setTotalAmount,
    setCurrentTransactionId,
    setCapturedPhotoPath,
    setIsProcessingPhoto,
    setCropSelection,

    // Actions
    resetCameraState,
  }
}