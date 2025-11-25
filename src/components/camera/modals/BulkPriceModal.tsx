import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Dimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { formatThaiCurrency } from '../../../lib/utils'

const { width } = Dimensions.get('window')

export type PriceType = 'normal' | 'bulk' | 'custom'

interface BulkPriceModalProps {
  visible: boolean
  currentWeight: number
  defaultPricePerKg: number
  onClose: () => void
  onConfirm: (finalPrice: number, priceType: PriceType) => void
}

export default function BulkPriceModal({
  visible,
  currentWeight,
  defaultPricePerKg,
  onClose,
  onConfirm,
}: BulkPriceModalProps) {
  const [selectedType, setSelectedType] = useState<PriceType>('normal')
  const [bulkKg, setBulkKg] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')
  const [customPrice, setCustomPrice] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedType('normal')
      setBulkKg('')
      setBulkPrice('')
      setCustomPrice('')
    }
  }, [visible])

  // Calculations
  const normalTotal = currentWeight * defaultPricePerKg

  const bulkKgNum = parseFloat(bulkKg) || 0
  const bulkPriceNum = parseFloat(bulkPrice) || 0
  const effectiveRate = bulkKgNum > 0 ? bulkPriceNum / bulkKgNum : 0
  const bulkTotal = currentWeight * effectiveRate

  const customPriceNum = parseFloat(customPrice) || 0

  const getFinalPrice = (): number => {
    switch (selectedType) {
      case 'normal':
        return normalTotal
      case 'bulk':
        return bulkTotal
      case 'custom':
        return customPriceNum
      default:
        return normalTotal
    }
  }

  const isConfirmEnabled = (): boolean => {
    switch (selectedType) {
      case 'normal':
        return true
      case 'bulk':
        return bulkKgNum > 0 && bulkPriceNum > 0
      case 'custom':
        return customPriceNum > 0
      default:
        return false
    }
  }

  const handleConfirm = () => {
    const finalPrice = getFinalPrice()
    onConfirm(finalPrice, selectedType)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>กำหนดราคาพิเศษ</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="ปิด" accessibilityRole="button">
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Normal Price Option */}
          <TouchableOpacity
            style={[styles.optionCard, selectedType === 'normal' && styles.optionCardSelected]}
            onPress={() => setSelectedType('normal')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedType === 'normal' }}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.radioButton, selectedType === 'normal' && styles.radioButtonSelected]}>
                {selectedType === 'normal' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.optionTitle}>ราคาปกติ</Text>
            </View>
            <View style={styles.optionDetails}>
              <Text style={styles.optionCalculation}>
                {currentWeight.toFixed(2)} กก. × {formatThaiCurrency(defaultPricePerKg)}/กก.
              </Text>
              <Text style={styles.optionResult}>= {formatThaiCurrency(normalTotal)}</Text>
            </View>
          </TouchableOpacity>

          {/* Bulk Price Option */}
          <TouchableOpacity
            style={[styles.optionCard, selectedType === 'bulk' && styles.optionCardSelected]}
            onPress={() => setSelectedType('bulk')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedType === 'bulk' }}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.radioButton, selectedType === 'bulk' && styles.radioButtonSelected]}>
                {selectedType === 'bulk' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.optionTitle}>ราคาขายส่ง</Text>
            </View>
            <View style={styles.bulkInputRow}>
              <TextInput
                style={styles.bulkInput}
                value={bulkKg}
                onChangeText={setBulkKg}
                placeholder="3"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
                onFocus={() => setSelectedType('bulk')}
              />
              <Text style={styles.bulkInputLabel}>กก. ราคา</Text>
              <TextInput
                style={styles.bulkInput}
                value={bulkPrice}
                onChangeText={setBulkPrice}
                placeholder="100"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
                onFocus={() => setSelectedType('bulk')}
              />
              <Text style={styles.bulkInputLabel}>บาท</Text>
            </View>
            {selectedType === 'bulk' && bulkKgNum > 0 && bulkPriceNum > 0 && (
              <View style={styles.optionDetails}>
                <Text style={styles.optionCalculation}>
                  = {formatThaiCurrency(effectiveRate)}/กก.
                </Text>
                <Text style={styles.optionResult}>
                  สำหรับ {currentWeight.toFixed(2)} กก. = {formatThaiCurrency(bulkTotal)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Custom Price Option */}
          <TouchableOpacity
            style={[styles.optionCard, selectedType === 'custom' && styles.optionCardSelected]}
            onPress={() => setSelectedType('custom')}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedType === 'custom' }}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.radioButton, selectedType === 'custom' && styles.radioButtonSelected]}>
                {selectedType === 'custom' && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.optionTitle}>ราคาเฉพาะ</Text>
            </View>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                value={customPrice}
                onChangeText={setCustomPrice}
                placeholder="กรอกราคารวม"
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
                onFocus={() => setSelectedType('custom')}
              />
              <Text style={styles.customInputLabel}>บาท</Text>
            </View>
          </TouchableOpacity>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmButton, !isConfirmEnabled() && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isConfirmEnabled()}
            accessibilityRole="button"
            accessibilityLabel="ยืนยัน"
          >
            <Text style={[styles.confirmButtonText, !isConfirmEnabled() && styles.confirmButtonTextDisabled]}>
              ยืนยัน
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Kanit-Bold',
    color: '#1f2937',
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  optionCardSelected: {
    borderColor: '#B46A07',
    backgroundColor: 'rgba(180, 106, 7, 0.05)',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#B46A07',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B46A07',
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
  },
  optionDetails: {
    marginLeft: 34,
  },
  optionCalculation: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  optionResult: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#B46A07',
  },
  bulkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 34,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  bulkInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#1f2937',
    width: 70,
    textAlign: 'center',
    backgroundColor: '#f9fafb',
  },
  bulkInputLabel: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 34,
    marginTop: 4,
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  customInputLabel: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#B46A07',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
  },
  confirmButtonTextDisabled: {
    color: '#9ca3af',
  },
})
