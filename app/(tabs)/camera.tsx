import React, { useState } from 'react'
import { View, Text, Alert, SafeAreaView } from 'react-native'
import { Camera } from 'react-native-vision-camera'
import { Button } from '../../src/components/ui/Button'
import { Input } from '../../src/components/ui/Input'
import { Card, CardContent, CardHeader } from '../../src/components/ui/Card'
import { useCamera, useOCR } from '../../src/hooks/useCamera'
import { useFruits } from '../../src/hooks/useFruits'
import { useTransactions } from '../../src/hooks/useTransactions'
import { THAI_TEXT } from '../../src/lib/constants'
import { formatThaiCurrency, formatWeight, generatePromptPayData } from '../../src/lib/utils'
import QRCode from 'react-native-qrcode-svg'

export default function CameraScreen() {
  const { device, cameraRef, hasPermission, isLoading, takePhoto, requestPermissions } = useCamera()
  const { extractWeight, isProcessing } = useOCR()
  const { fruits } = useFruits()
  const { addTransaction } = useTransactions()
  
  const [selectedFruitId, setSelectedFruitId] = useState<number | null>(null)
  const [manualWeight, setManualWeight] = useState('')
  const [detectedWeight, setDetectedWeight] = useState<number | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)

  const selectedFruit = fruits.find(f => f.id === selectedFruitId)

  const handleTakePhoto = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions()
      if (!granted) {
        Alert.alert('Error', 'Camera permission required')
        return
      }
    }

    const photo = await takePhoto()
    if (!photo) {
      Alert.alert('Error', 'Failed to take photo')
      return
    }

    // Extract weight using OCR
    const weight = await extractWeight(photo)
    setDetectedWeight(weight)
    setManualWeight(weight?.toString() || '')
  }

  const handleConfirmTransaction = async () => {
    if (!selectedFruit) {
      Alert.alert('Error', 'Please select a fruit')
      return
    }

    const weight = detectedWeight || parseFloat(manualWeight)
    if (!weight || weight <= 0) {
      Alert.alert('Error', 'Please enter a valid weight')
      return
    }

    const total = weight * selectedFruit.pricePerKg
    const qrCodeData = generatePromptPayData(total)

    try {
      await addTransaction({
        fruitId: selectedFruit.id,
        weightKg: weight,
        pricePerKg: selectedFruit.pricePerKg,
        totalAmount: total,
        qrCodeData
      })

      setQrData(qrCodeData)
      setTotalAmount(total)
      setShowQR(true)
    } catch (error) {
      console.error('Transaction error:', error)
      Alert.alert('Error', 'Failed to save transaction')
    }
  }

  const handleNewTransaction = () => {
    setShowQR(false)
    setSelectedFruitId(null)
    setManualWeight('')
    setDetectedWeight(null)
    setQrData('')
    setTotalAmount(0)
  }

  if (showQR) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 p-4">
        <Card className="items-center">
          <CardHeader>
            <Text className="text-thai-2xl font-bold text-center text-gray-800">
              {THAI_TEXT.scanToPay}
            </Text>
          </CardHeader>
          <CardContent className="items-center">
            <QRCode value={qrData} size={200} />
            <Text className="text-thai-xl font-bold mt-4 text-primary-600">
              {formatThaiCurrency(totalAmount)}
            </Text>
            <Text className="text-thai-base text-gray-600 mt-2 text-center">
              {selectedFruit?.nameThai} - {formatWeight(detectedWeight || parseFloat(manualWeight))}
            </Text>
            <Button
              onPress={handleNewTransaction}
              className="mt-6 w-full"
              size="lg"
            >
              {THAI_TEXT.confirm}
            </Button>
          </CardContent>
        </Card>
      </SafeAreaView>
    )
  }

  if (!device) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 p-4 justify-center">
        <Text className="text-thai-lg text-center text-gray-600">
          {THAI_TEXT.cameraError}
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Camera View */}
        <View className="flex-1 relative">
          <Camera
            ref={cameraRef}
            device={device}
            isActive={true}
            photo={true}
            className="flex-1"
          />
          
          {/* Camera Controls */}
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
            <Button
              onPress={handleTakePhoto}
              loading={isLoading || isProcessing}
              className="mb-4"
              size="lg"
            >
              {THAI_TEXT.takePicture}
            </Button>
          </View>
        </View>

        {/* Transaction Details */}
        <View className="p-4 bg-white border-t border-gray-200">
          {/* Fruit Selection */}
          <Text className="text-thai-lg font-medium text-gray-800 mb-2">
            {THAI_TEXT.fruitName}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {fruits.slice(0, 6).map(fruit => (
              <Button
                key={fruit.id}
                variant={selectedFruitId === fruit.id ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setSelectedFruitId(fruit.id)}
                className="mr-2 mb-2"
              >
                {fruit.nameThai}
              </Button>
            ))}
          </View>

          {/* Weight Input */}
          <Input
            label={`${THAI_TEXT.weight} (${THAI_TEXT.kg})`}
            value={manualWeight}
            onChangeText={setManualWeight}
            keyboardType="numeric"
            placeholder={detectedWeight ? `${THAI_TEXT.weightNotDetected}` : THAI_TEXT.manualWeight}
          />

          {/* Price Display */}
          {selectedFruit && manualWeight && (
            <Card className="mb-4">
              <CardContent>
                <View className="flex-row justify-between">
                  <Text className="text-thai-base text-gray-600">
                    {formatWeight(parseFloat(manualWeight))} × {formatThaiCurrency(selectedFruit.pricePerKg)}
                  </Text>
                  <Text className="text-thai-lg font-bold text-primary-600">
                    {formatThaiCurrency(parseFloat(manualWeight) * selectedFruit.pricePerKg)}
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Confirm Button */}
          <Button
            onPress={handleConfirmTransaction}
            disabled={!selectedFruit || !manualWeight || parseFloat(manualWeight) <= 0}
            size="lg"
          >
            {THAI_TEXT.confirm}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}