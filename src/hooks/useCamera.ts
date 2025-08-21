import { useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Alert } from 'react-native';
import { performOCR, type OCRResult } from '~/lib/ocr';
import { THAI_TEXT } from '~/lib/constants';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const result = await requestPermission();
      return result.granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'ต้องการสิทธิ์กล้อง',
        'แอปต้องการใช้กล้องเพื่อถ่ายภาพตาชั่ง กรุณาอนุญาตในการตั้งค่า'
      );
      return false;
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    return permission?.granted || false;
  };

  const takePhoto = async (cameraRef: any): Promise<string | null> => {
    try {
      if (!cameraRef?.current) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงกล้องได้');
        return null;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      setLastPhoto(photo.uri);
      return photo.uri;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('ข้อผิดพลาด', THAI_TEXT.errorCamera);
      return null;
    }
  };

  const processPhoto = async (photoUri: string): Promise<OCRResult | null> => {
    try {
      setIsProcessing(true);
      const result = await performOCR(photoUri);
      return result;
    } catch (error) {
      console.error('Error processing photo:', error);
      Alert.alert('ข้อผิดพลาด', THAI_TEXT.errorOCR);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhotoAndProcess = async (cameraRef: any): Promise<{
    photoUri: string | null;
    ocrResult: OCRResult | null;
  }> => {
    const photoUri = await takePhoto(cameraRef);
    if (!photoUri) {
      return { photoUri: null, ocrResult: null };
    }

    const ocrResult = await processPhoto(photoUri);
    return { photoUri, ocrResult };
  };

  return {
    hasPermission: permission?.granted,
    isProcessing,
    lastPhoto,
    requestPermissions,
    checkPermissions,
    takePhoto,
    processPhoto,
    takePhotoAndProcess,
  };
}