import { useState, useCallback, useRef } from 'react'
import { Camera, useCameraPermission, useCameraDevice, PhotoFile } from 'react-native-vision-camera'
import { parseWeight } from '../lib/utils'

export function useCamera() {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')
  const cameraRef = useRef<Camera>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastPhoto, setLastPhoto] = useState<PhotoFile | null>(null)

  const takePhoto = useCallback(async (): Promise<PhotoFile | null> => {
    if (!cameraRef.current || !hasPermission) return null
    
    try {
      setIsLoading(true)
      const photo = await cameraRef.current.takePhoto({
        quality: 85,
        enableAutoStabilization: true,
        enableAutoRedEyeReduction: true,
      })
      
      setLastPhoto(photo)
      return photo
    } catch (error) {
      console.error('Failed to take photo:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission])

  const requestPermissions = useCallback(async () => {
    if (!hasPermission) {
      return await requestPermission()
    }
    return true
  }, [hasPermission, requestPermission])

  return {
    device,
    cameraRef,
    hasPermission,
    isLoading,
    lastPhoto,
    takePhoto,
    requestPermissions
  }
}

// Hook for OCR text processing (mockup for now)
export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false)

  const extractWeight = useCallback(async (photo: PhotoFile): Promise<number | null> => {
    setIsProcessing(true)
    
    try {
      // TODO: Replace with actual ML Kit OCR implementation
      // For now, simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock OCR results for testing
      const mockTexts = ['2.45 kg', '1.23 kg', '0.75 kg', '3.67 kg', '5.12 kg']
      const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
      
      console.log('Mock OCR result:', randomText)
      return parseWeight(randomText)
    } catch (error) {
      console.error('OCR processing failed:', error)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    isProcessing,
    extractWeight
  }
}