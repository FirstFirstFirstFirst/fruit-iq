import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Alert, Image, ScrollView } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Button, Card, CardContent, Input } from '~/components/ui';
import { useCamera } from '~/hooks/useCamera';
import { useFruits } from '~/hooks/useFruits';
import { useTransactions } from '~/hooks/useTransactions';
import { THAI_TEXT } from '~/lib/constants';
import { formatCurrency, formatWeight } from '~/lib/utils';
import { getImageProcessingTips, type OCRResult } from '~/lib/ocr';

export function CameraScreen({ navigation }: any) {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;

  const { 
    hasPermission, 
    isProcessing, 
    requestPermissions, 
    checkPermissions,
    takePhotoAndProcess 
  } = useCamera();

  const { fruits } = useFruits();
  const { addTransaction } = useTransactions();

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [selectedFruit, setSelectedFruit] = useState<any>(null);
  const [manualWeight, setManualWeight] = useState('');
  const [step, setStep] = useState<'camera' | 'review' | 'fruit-select' | 'confirm'>('camera');

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    const { photoUri, ocrResult } = await takePhotoAndProcess(cameraRef.current);
    
    if (photoUri) {
      setCapturedPhoto(photoUri);
      setOcrResult(ocrResult);
      
      if (ocrResult?.weight && ocrResult.confidence > 0.7) {
        setStep('fruit-select');
      } else {
        setStep('review');
      }
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setOcrResult(null);
    setSelectedFruit(null);
    setManualWeight('');
    setStep('camera');
  };

  const handleManualWeightConfirm = () => {
    const weight = parseFloat(manualWeight);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาใส่น้ำหนักที่ถูกต้อง');
      return;
    }
    
    setOcrResult({ 
      weight, 
      rawText: manualWeight, 
      confidence: 1.0 
    });
    setStep('fruit-select');
  };

  const handleFruitSelect = (fruit: any) => {
    setSelectedFruit(fruit);
    setStep('confirm');
  };

  const handleConfirmTransaction = async () => {
    if (!ocrResult?.weight || !selectedFruit) return;

    try {
      const totalAmount = ocrResult.weight * selectedFruit.price_per_kg;
      
      await addTransaction({
        fruit_id: selectedFruit.id,
        weight_kg: ocrResult.weight,
        price_per_kg: selectedFruit.price_per_kg,
        total_amount: totalAmount,
        photo_path: capturedPhoto || undefined,
      });

      Alert.alert('สำเร็จ', 'บันทึกการขายเรียบร้อย', [
        {
          text: 'ดูประวัติ',
          onPress: () => navigation.navigate('History')
        },
        {
          text: 'ขายต่อ',
          onPress: () => {
            handleRetakePhoto();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกการขายได้');
    }
  };

  const requestCameraPermission = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'ไม่สามารถใช้กล้องได้',
        'กรุณาเปิดสิทธิ์กล้องในการตั้งค่า'
      );
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-lg text-foreground">กำลังตรวจสอบสิทธิ์กล้อง...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center p-4">
        <Card>
          <CardContent className="items-center">
            <Text className="text-xl font-bold text-foreground mb-4">
              ต้องการสิทธิ์กล้อง
            </Text>
            <Text className="text-base text-muted-foreground text-center mb-6">
              แอปต้องการใช้กล้องเพื่อถ่ายภาพตาชั่งดิจิตอล
            </Text>
            <Button onPress={requestCameraPermission} size="lg">
              เปิดใช้งานกล้อง
            </Button>
          </CardContent>
        </Card>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-lg text-foreground">ไม่พบกล้องหลัง</Text>
      </SafeAreaView>
    );
  }

  if (step === 'camera') {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Camera
          ref={cameraRef}
          device={device}
          isActive={true}
          photo={true}
          className="flex-1"
        />
        
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
          <View className="mb-4">
            <Text className="text-white text-center font-bold text-lg mb-2">
              {THAI_TEXT.takePhoto}
            </Text>
            <Text className="text-white/80 text-center text-sm">
              จัดกรอบให้เห็นตัวเลขบนตาชั่งชัดเจน
            </Text>
          </View>
          
          <View className="flex-row justify-center gap-4">
            <Button
              variant="outline"
              onPress={() => navigation.goBack()}
            >
              {THAI_TEXT.back}
            </Button>
            
            <Button
              onPress={handleTakePhoto}
              disabled={isProcessing}
              size="lg"
              className="flex-1 max-w-48"
            >
              {isProcessing ? 'กำลังประมวลผล...' : 'ถ่ายภาพ 📸'}
            </Button>
          </View>
        </View>

        <View className="absolute top-16 left-4 right-4">
          <Card className="bg-black/70">
            <CardContent className="p-3">
              <Text className="text-white text-sm font-bold mb-2">
                เคล็ดลับถ่ายภาพที่ดี:
              </Text>
              {getImageProcessingTips().map((tip, index) => (
                <Text key={index} className="text-white/90 text-xs">
                  • {tip}
                </Text>
              ))}
            </CardContent>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'review') {
    return (
      <SafeAreaView className="flex-1 bg-background p-4">
        <ScrollView>
          <Card className="mb-6">
            <CardContent>
              <Text className="text-xl font-bold text-center text-foreground mb-4">
                ตรวจสอบภาพที่ถ่าย
              </Text>
              
              {capturedPhoto && (
                <Image
                  source={{ uri: capturedPhoto }}
                  className="w-full h-64 rounded-lg mb-4"
                  resizeMode="contain"
                />
              )}

              {ocrResult && (
                <View className="mb-4 p-4 bg-muted rounded-lg">
                  <Text className="text-base text-muted-foreground mb-2">
                    ข้อความที่พบ: "{ocrResult.rawText}"
                  </Text>
                  {ocrResult.weight ? (
                    <Text className="text-lg font-bold text-primary">
                      น้ำหนัก: {formatWeight(ocrResult.weight)}
                    </Text>
                  ) : (
                    <Text className="text-base text-destructive">
                      ไม่สามารถอ่านน้ำหนักได้
                    </Text>
                  )}
                </View>
              )}

              <Text className="text-lg font-bold text-foreground mb-2">
                ใส่น้ำหนักด้วยตัวเอง:
              </Text>
              
              <Input
                value={manualWeight}
                onChangeText={setManualWeight}
                placeholder="เช่น 2.45"
                keyboardType="decimal-pad"
                className="mb-4"
              />

              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  onPress={handleRetakePhoto}
                  className="flex-1"
                >
                  ถ่ายใหม่
                </Button>
                <Button
                  onPress={handleManualWeightConfirm}
                  className="flex-1"
                  disabled={!manualWeight}
                >
                  ถัดไป
                </Button>
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'fruit-select') {
    return (
      <SafeAreaView className="flex-1 bg-background p-4">
        <ScrollView>
          <Card className="mb-6">
            <CardContent>
              <Text className="text-xl font-bold text-center text-foreground mb-4">
                เลือกชนิดผลไม้
              </Text>
              
              {ocrResult?.weight && (
                <Text className="text-lg text-center text-primary mb-4">
                  น้ำหนัก: {formatWeight(ocrResult.weight)}
                </Text>
              )}
            </CardContent>
          </Card>

          <View className="gap-3">
            {fruits.map((fruit) => (
              <Card key={fruit.id}>
                <CardContent className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">
                      {fruit.name_thai}
                    </Text>
                    <Text className="text-base text-muted-foreground">
                      {formatCurrency(fruit.price_per_kg)}/กก.
                    </Text>
                    {ocrResult?.weight && (
                      <Text className="text-sm text-primary">
                        รวม: {formatCurrency(ocrResult.weight * fruit.price_per_kg)}
                      </Text>
                    )}
                  </View>
                  <Button
                    onPress={() => handleFruitSelect(fruit)}
                    size="sm"
                  >
                    เลือก
                  </Button>
                </CardContent>
              </Card>
            ))}
          </View>

          <Button
            variant="outline"
            onPress={handleRetakePhoto}
            className="mt-6"
          >
            ยกเลิก
          </Button>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'confirm') {
    const totalAmount = ocrResult?.weight && selectedFruit 
      ? ocrResult.weight * selectedFruit.price_per_kg 
      : 0;

    return (
      <SafeAreaView className="flex-1 bg-background p-4">
        <ScrollView>
          <Card className="mb-6">
            <CardContent>
              <Text className="text-2xl font-bold text-center text-foreground mb-6">
                ยืนยันการขาย
              </Text>

              <View className="space-y-4">
                <View className="flex-row justify-between">
                  <Text className="text-lg text-muted-foreground">ผลไม้:</Text>
                  <Text className="text-lg font-bold text-foreground">
                    {selectedFruit?.name_thai}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-lg text-muted-foreground">น้ำหนัก:</Text>
                  <Text className="text-lg font-bold text-foreground">
                    {ocrResult?.weight ? formatWeight(ocrResult.weight) : '-'}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-lg text-muted-foreground">ราคา/กก.:</Text>
                  <Text className="text-lg font-bold text-foreground">
                    {selectedFruit ? formatCurrency(selectedFruit.price_per_kg) : '-'}
                  </Text>
                </View>

                <View className="border-t border-border pt-4">
                  <View className="flex-row justify-between">
                    <Text className="text-xl font-bold text-foreground">รวมทั้งสิ้น:</Text>
                    <Text className="text-2xl font-bold text-primary">
                      {formatCurrency(totalAmount)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 mt-8">
                <Button
                  variant="outline"
                  onPress={() => setStep('fruit-select')}
                  className="flex-1"
                >
                  แก้ไข
                </Button>
                <Button
                  onPress={handleConfirmTransaction}
                  className="flex-1"
                  size="lg"
                >
                  ยืนยัน ✓
                </Button>
              </View>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}