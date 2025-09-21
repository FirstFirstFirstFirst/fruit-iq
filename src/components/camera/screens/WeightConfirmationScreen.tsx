import React from 'react'
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { formatThaiCurrency, formatWeight } from '../../../lib/utils'
import { Fruit } from '../../../data/mockData'
import { cameraStyles } from '../styles'

interface WeightConfirmationScreenProps {
  selectedFruit: Fruit | undefined
  detectedWeight: number | null
  onBack: () => void
  onConfirm: () => void
}

export default function WeightConfirmationScreen({
  selectedFruit,
  detectedWeight,
  onBack,
  onConfirm,
}: WeightConfirmationScreenProps) {
  const totalAmount = (detectedWeight || 0) * (selectedFruit?.pricePerKg || 0)

  return (
    <SafeAreaView style={cameraStyles.container}>
      <View style={cameraStyles.confirmContainer}>
        {/* Header */}
        <View style={cameraStyles.confirmHeader}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={cameraStyles.confirmTitle}>ยืนยันรายการ</Text>
        </View>

        {/* Order summary */}
        <View style={cameraStyles.orderSummary}>
          <View style={cameraStyles.fruitSummary}>
            <Text style={cameraStyles.summaryEmoji}>{selectedFruit?.emoji}</Text>
            <View style={cameraStyles.summaryDetails}>
              <Text style={cameraStyles.summaryFruitName}>{selectedFruit?.nameThai}</Text>
              <Text style={cameraStyles.summaryWeight}>{formatWeight(detectedWeight || 0)}</Text>
            </View>
          </View>

          <View style={cameraStyles.priceBreakdown}>
            <View style={cameraStyles.priceRow}>
              <Text style={cameraStyles.priceLabel}>น้ำหนัก</Text>
              <Text style={cameraStyles.priceValue}>{formatWeight(detectedWeight || 0)}</Text>
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
        <TouchableOpacity style={cameraStyles.confirmButton} onPress={onConfirm}>
          <Text style={cameraStyles.confirmButtonText}>ยืนยันการขาย</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}