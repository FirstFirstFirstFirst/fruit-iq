/**
 * WeighScale Camera Component
 * Real camera integration using Expo Camera for capturing digital scale displays
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

interface WeighScaleCameraProps {
  onPhotoTaken: (photoPath: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function WeighScaleCamera({ onPhotoTaken, onCancel, isVisible }: WeighScaleCameraProps) {
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing] = useState<CameraType>('back');

  const [permission, requestPermission] = useCameraPermissions();

  const requestCameraPermission = useCallback(async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'ต้องการสิทธิ์เข้าถึงกล้อง',
          'แอปต้องการใช้กล้องเพื่อสแกนน้ำหนักจากตาชั่งดิจิทัล กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่า',
          [
            { text: 'ยกเลิก', onPress: onCancel },
            { 
              text: 'ลองอีกครั้ง', 
              onPress: () => requestCameraPermission()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถขอสิทธิ์เข้าถึงกล้องได้');
    }
  }, [requestPermission, onCancel]);

  // Request camera permissions on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestCameraPermission();
    }
  }, [permission, requestCameraPermission]);

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false
      });

      if (photo && photo.uri) {
        console.log('Photo captured:', photo.uri);
        onPhotoTaken(photo.uri);
      } else {
        throw new Error('No photo URI received');
      }
      
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        'ไม่สามารถถ่ายรูปได้ กรุณาลองอีกครั้ง',
        [{ text: 'ตกลง' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };


  // Show loading if permission is being requested
  if (permission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B46A07" />
          <Text style={styles.loadingText}>กำลังตรวจสอบสิทธิ์...</Text>
        </View>
      </View>
    );
  }

  // Show permission request if not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={64} color="#9ca3af" />
          <Text style={styles.permissionTitle}>ต้องการสิทธิ์เข้าถึงกล้อง</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>อนุญาตการเข้าถึงกล้อง</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelPermissionButton} onPress={onCancel}>
            <Text style={styles.cancelPermissionButtonText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isVisible) {
    return null;
  }

  const renderMinimalOverlay = () => (
    <View style={styles.minimalOverlay}>
      {/* Top-left close button */}
      <TouchableOpacity onPress={onCancel} style={styles.minimalCloseButton}>
        <MaterialIcons name="close" size={24} color="white" />
      </TouchableOpacity>

      {/* Bottom capture button */}
      <View style={styles.minimalCaptureArea}>
        <TouchableOpacity
          style={[styles.minimalCaptureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={capturePhoto}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <MaterialIcons name="camera-alt" size={32} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Camera View - completely clean */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash="off"
        mode="picture"
      />

      {/* Minimal overlay with only essential controls */}
      {renderMinimalOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },

  // Minimal overlay
  minimalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  minimalCloseButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  minimalCaptureArea: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  minimalCaptureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B46A07',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    marginTop: 16,
  },

  // Permission states (simplified)
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8fafc',
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: 'Kanit-Bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#B46A07',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
  },
  cancelPermissionButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelPermissionButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
});