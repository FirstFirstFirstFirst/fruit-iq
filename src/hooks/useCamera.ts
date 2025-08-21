import { useState } from 'react';
import { Camera } from 'react-native-vision-camera';
import { Alert } from 'react-native';
import { performOCR, type OCRResult } from '~/lib/ocr';
import { THAI_TEXT } from '~/lib/constants';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await Camera.requestCameraPermission();
      
      if (cameraPermission === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        Alert.alert(
          'ต้องการสิทธิ์กล้อง',
          'แอปต้องการใช้กล้องเพื่อถ่ายภาพตาชั่ง กรุณาอนุญาตในการตั้งค่า'
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
      return false;
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      const permitted = cameraPermission === 'granted';
      setHasPermission(permitted);
      return permitted;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
      return false;
    }
  };

  const takePhoto = async (camera: any): Promise<string | null> => {
    try {
      if (!camera) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงกล้องได้');
        return null;
      }

      const photo = await camera.takePhoto({
        quality: 85,
        skipMetadata: true,
        flash: 'auto',
      });

      const photoUri = `file://${photo.path}`;
      setLastPhoto(photoUri);
      return photoUri;
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

  const takePhotoAndProcess = async (camera: any): Promise<{
    photoUri: string | null;
    ocrResult: OCRResult | null;
  }> => {
    const photoUri = await takePhoto(camera);
    if (!photoUri) {
      return { photoUri: null, ocrResult: null };
    }

    const ocrResult = await processPhoto(photoUri);
    return { photoUri, ocrResult };
  };

  return {
    hasPermission,
    isProcessing,
    lastPhoto,
    requestPermissions,
    checkPermissions,
    takePhoto,
    processPhoto,
    takePhotoAndProcess,
  };
}