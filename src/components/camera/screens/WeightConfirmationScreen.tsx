import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { formatThaiCurrency } from '../../../lib/utils'
import { Fruit } from '../../../data/mockData'
import { cameraStyles } from '../styles'
import BulkPriceModal, { PriceType } from '../modals/BulkPriceModal'
import EmojiDisplay from '../EmojiDisplay'

interface WeightConfirmationScreenProps {
  selectedFruit: Fruit | undefined
  detectedWeight: number | null
  onBack: () => void
  onConfirm: (weight: number) => void
  onCancel?: () => void
  onAddToCart?: (weight: number, customTotal: number | null, priceType: PriceType) => void
  cartItemCount?: number
}

export default function WeightConfirmationScreen({
  selectedFruit,
  detectedWeight,
  onBack,
  onConfirm,
  onCancel,
  onAddToCart,
  cartItemCount = 0,
}: WeightConfirmationScreenProps) {
  const [weightInput, setWeightInput] = useState(detectedWeight?.toString() || '')
  const [isEditing, setIsEditing] = useState(true) // Always start in editing mode for easy weight adjustment
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false)
  const [customTotal, setCustomTotal] = useState<number | null>(null)
  const [priceType, setPriceType] = useState<PriceType>('normal')

  const currentWeight = parseFloat(weightInput) || 0
  const normalTotal = currentWeight * (selectedFruit?.pricePerKg || 0)
  const totalAmount = customTotal ?? normalTotal

  const handleBulkPriceConfirm = (finalPrice: number, type: PriceType) => {
    setCustomTotal(type === 'normal' ? null : finalPrice)
    setPriceType(type)
  }

  const getPriceTypeLabel = (): string => {
    switch (priceType) {
      case 'bulk':
        return 'ราคาขายส่ง'
      case 'custom':
        return 'ราคาเฉพาะ'
      default:
        return ''
    }
  }

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
          <View style={localStyles.headerRight}>
            {cartItemCount > 0 && (
              <View style={localStyles.cartBadgeContainer}>
                <MaterialIcons name="shopping-cart" size={22} color="#B46A07" />
                <View style={localStyles.cartBadge}>
                  <Text style={localStyles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              </View>
            )}
            {onCancel && (
              <TouchableOpacity style={cameraStyles.cancelFlowButton} onPress={onCancel}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Order summary */}
        <View style={cameraStyles.orderSummary}>
          <View style={cameraStyles.fruitSummary}>
            <View style={{ marginRight: 16 }}>
              <EmojiDisplay emojiId={selectedFruit?.emoji || 'apple'} size={64} />
            </View>
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
              <View style={localStyles.totalLabelContainer}>
                <Text style={cameraStyles.totalLabel}>ราคารวม</Text>
                {priceType !== 'normal' && (
                  <View style={localStyles.priceTypeBadge}>
                    <Text style={localStyles.priceTypeBadgeText}>{getPriceTypeLabel()}</Text>
                  </View>
                )}
              </View>
              <Text style={cameraStyles.totalPrice}>
                {formatThaiCurrency(totalAmount)}
              </Text>
            </View>
            <TouchableOpacity
              style={localStyles.editPriceButton}
              onPress={() => setShowBulkPriceModal(true)}
              accessibilityRole="button"
              accessibilityLabel="แก้ไขราคา"
            >
              <MaterialIcons name="edit" size={18} color="#B46A07" />
              <Text style={localStyles.editPriceText}>แก้ไขราคา</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        {onAddToCart ? (
          <View style={localStyles.actionButtonsContainer}>
            <TouchableOpacity
              style={localStyles.addToCartButton}
              onPress={() => {
                const weight = parseFloat(weightInput)
                if (isNaN(weight) || weight <= 0) {
                  Alert.alert('น้ำหนักไม่ถูกต้อง', 'กรุณากรอกน้ำหนักที่มากกว่า 0')
                  return
                }
                onAddToCart(weight, customTotal, priceType)
              }}
              accessibilityRole="button"
              accessibilityLabel="เพิ่มลงตะกร้า"
            >
              <MaterialIcons name="add-shopping-cart" size={20} color="white" />
              <Text style={localStyles.addToCartButtonText}>เพิ่มลงตะกร้า</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyles.checkoutNowButton}
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel="ชำระเงินเลย"
            >
              <Text style={localStyles.checkoutNowButtonText}>ชำระเงินเลย</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={cameraStyles.confirmButton} onPress={handleConfirm}>
            <Text style={cameraStyles.confirmButtonText}>ยืนยันการขาย</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bulk Price Modal */}
      <BulkPriceModal
        visible={showBulkPriceModal}
        currentWeight={currentWeight}
        defaultPricePerKg={selectedFruit?.pricePerKg || 0}
        onClose={() => setShowBulkPriceModal(false)}
        onConfirm={handleBulkPriceConfirm}
      />
    </SafeAreaView>
  )
}

const localStyles = StyleSheet.create({
  totalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceTypeBadge: {
    backgroundColor: 'rgba(180, 106, 7, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceTypeBadgeText: {
    fontSize: 12,
    fontFamily: 'Kanit-Medium',
    color: '#B46A07',
  },
  editPriceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#B46A07',
    borderRadius: 12,
    backgroundColor: 'rgba(180, 106, 7, 0.05)',
  },
  editPriceText: {
    fontSize: 14,
    fontFamily: 'Kanit-SemiBold',
    color: '#B46A07',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBadgeContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 11,
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B46A07',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
  },
  checkoutNowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
  },
  checkoutNowButtonText: {
    fontSize: 15,
    fontFamily: 'Kanit-Medium',
    color: '#6b7280',
  },
})