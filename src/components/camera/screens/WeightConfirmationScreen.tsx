import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { formatThaiCurrency } from '../../../lib/utils'
import { Fruit } from '../../../data/mockData'
import { cameraStyles } from '../styles'

interface WeightConfirmationScreenProps {
  selectedFruit: Fruit | undefined
  detectedWeight: number | null
  onBack: () => void
  onConfirm: (weight: number) => void
  onCancel?: () => void
}

export default function WeightConfirmationScreen({
  selectedFruit,
  detectedWeight,
  onBack,
  onConfirm,
  onCancel,
}: WeightConfirmationScreenProps) {
  const [weightInput, setWeightInput] = useState(detectedWeight?.toString() || '')
  const [isEditing, setIsEditing] = useState(true) // Always start in editing mode for easy weight adjustment

  const currentWeight = parseFloat(weightInput) || 0
  const totalAmount = currentWeight * (selectedFruit?.pricePerKg || 0)

  const handleConfirm = () => {
    const weight = parseFloat(weightInput)
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('น้ำหนักไม่ถูกต้อง', 'กรุณากรอกน้ำหนักที่มากกว่า 0')
      return
    }
    onConfirm(weight)
  }

  return (
    <SafeAreaView style={cameraStyles.container}>
      <View style={cameraStyles.confirmContainer}>
        {/* Header */}
        <View style={cameraStyles.confirmHeader}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={cameraStyles.confirmTitle}>ยืนยันรายการ</Text>
          {onCancel && (
            <TouchableOpacity style={cameraStyles.cancelFlowButton} onPress={onCancel}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Order summary */}
        <View style={cameraStyles.orderSummary}>
          <View style={cameraStyles.fruitSummary}>
            <Text style={cameraStyles.summaryEmoji}>{selectedFruit?.emoji}</Text>
            <View style={cameraStyles.summaryDetails}>
              <Text style={cameraStyles.summaryFruitName}>{selectedFruit?.nameThai}</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={cameraStyles.weightInputContainer}
              >
                {isEditing ? (
                  <View style={cameraStyles.weightEditRow}>
                    <TextInput
                      style={cameraStyles.weightInput}
                      value={weightInput}
                      onChangeText={setWeightInput}
                      keyboardType="decimal-pad"
                      autoFocus
                      selectTextOnFocus
                      onBlur={() => setIsEditing(false)}
                      placeholder="0.00"
                    />
                    <Text style={cameraStyles.weightUnit}>กก.</Text>
                  </View>
                ) : (
                  <View style={cameraStyles.weightDisplayRow}>
                    <Text style={cameraStyles.summaryWeight}>{currentWeight.toFixed(2)} กก.</Text>
                    <MaterialIcons name="edit" size={16} color="#6b7280" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={cameraStyles.priceBreakdown}>
            <View style={cameraStyles.priceRow}>
              <Text style={cameraStyles.priceLabel}>น้ำหนัก</Text>
              <Text style={cameraStyles.priceValue}>{currentWeight.toFixed(2)} กก.</Text>
            </View>
            <View style={cameraStyles.priceRow}>
              <Text style={cameraStyles.priceLabel}>ราคาต่อกิโลกรัม</Text>
              <Text style={cameraStyles.priceValue}>
                {formatThaiCurrency(selectedFruit?.pricePerKg || 0)}
              </Text>
            </View>
            <View style={[cameraStyles.priceRow, cameraStyles.totalRow]}>
              <Text style={cameraStyles.totalLabel}>ราคารวม</Text>
              <Text style={cameraStyles.totalPrice}>
                {formatThaiCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Confirm button */}
        <TouchableOpacity style={cameraStyles.confirmButton} onPress={handleConfirm}>
          <Text style={cameraStyles.confirmButtonText}>ยืนยันการขาย</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}