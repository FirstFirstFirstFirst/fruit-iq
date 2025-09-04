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
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WeighScaleCameraProps {
  onPhotoTaken: (photoPath: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function WeighScaleCamera({ onPhotoTaken, onCancel, isVisible }: WeighScaleCameraProps) {
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState<FlashMode>('off');
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

  const toggleFlash = () => {
    setFlash(current => current === 'off' ? 'on' : 'off');
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
          <Text style={styles.permissionText}>
            เพื่อสแกนน้ำหนักจากตาชั่งดิจิทัล
          </Text>
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

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        mode="picture"
      />
      
      {/* Camera Overlay - positioned absolutely on top */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>สแกนตาชั่ง</Text>
            <Text style={styles.headerSubtitle}>วางตาชั่งในกรอบและกดถ่าย</Text>
          </View>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <MaterialIcons 
              name={flash === 'on' ? 'flash-on' : 'flash-off'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.topRight]} />
            <View style={[styles.scanCorner, styles.bottomLeft]} />
            <View style={[styles.scanCorner, styles.bottomRight]} />
            
            {/* Scale icon in center */}
            <View style={styles.scanCenter}>
              <MaterialIcons name="scale" size={40} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.scanCenterText}>วางตาชั่งในกรอบนี้</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            • วางตาชั่งดิจิทัลให้อยู่ในกรอบ
          </Text>
          <Text style={styles.instructionText}>
            • ตรวจสอบให้ตัวเลขน้ำหนักชัดเจน
          </Text>
          <Text style={styles.instructionText}>
            • กดปุ่มถ่ายรูปเมื่อพร้อม
          </Text>
        </View>

        {/* Capture Button */}
        <View style={styles.captureArea}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={capturePhoto}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="white" size="large" />
            ) : (
              <View style={styles.captureButtonInner}>
                <MaterialIcons name="camera-alt" size={32} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scanning Area
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.6,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 4,
    borderColor: '#B46A07',
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    right: -2,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    top: undefined,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    top: undefined,
    left: undefined,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanCenter: {
    alignItems: 'center',
  },
  scanCenterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    marginTop: 8,
    textAlign: 'center',
  },

  // Instructions
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    lineHeight: 20,
    marginBottom: 4,
  },

  // Capture Button
  captureArea: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  captureButton: {
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
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Permission states
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
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
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