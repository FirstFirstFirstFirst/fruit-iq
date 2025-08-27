import React, { useState } from 'react'
import { View, Text, Alert, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { useFruits, useTransactions, useDatabase } from '../../src/hooks/useDatabase'
import { formatThaiCurrency, formatWeight } from '../../src/lib/utils'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import QRPaymentScreen from '../../src/components/QRPaymentScreen'

const { width } = Dimensions.get('window')

export default function CameraScreen() {
  const { isInitialized } = useDatabase()
  const { fruits, addFruit, loading: fruitsLoading } = useFruits()
  const { addTransaction } = useTransactions()
  
  const [step, setStep] = useState<'scan' | 'select' | 'weight' | 'confirm' | 'qr-payment' | 'success' | 'add-fruit'>('scan')
  const [selectedFruitId, setSelectedFruitId] = useState<number | null>(null)
  const [detectedWeight, setDetectedWeight] = useState<number | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null)
  const [showAddFruit, setShowAddFruit] = useState(false)
  const [newFruitName, setNewFruitName] = useState('')
  const [newFruitPrice, setNewFruitPrice] = useState('')
  const [newFruitEmoji, setNewFruitEmoji] = useState('')

  const selectedFruit = fruits.find(f => f.id === selectedFruitId)

  // Show loading while database initializes
  if (!isInitialized || fruitsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={48} color="#B46A07" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const handleScan = () => {
    // Mock weight detection
    const mockWeights = [1.25, 2.45, 0.75, 3.67, 1.89]
    const randomWeight = mockWeights[Math.floor(Math.random() * mockWeights.length)]
    setDetectedWeight(randomWeight)
    setStep('select')
  }

  const handleFruitSelect = (fruitId: number) => {
    setSelectedFruitId(fruitId)
    setStep('weight')
  }

  const handleConfirm = async () => {
    if (!selectedFruit || !detectedWeight) return

    const total = detectedWeight * selectedFruit.pricePerKg
    setTotalAmount(total)

    try {
      // Create transaction in database (not saved yet)
      const transaction = await addTransaction({
        fruitId: selectedFruit.id,
        weightKg: detectedWeight,
        pricePerKg: selectedFruit.pricePerKg,
        totalAmount: total,
        isSaved: false // Not saved until QR payment is completed
      })
      
      setCurrentTransactionId(transaction.id)
      setStep('qr-payment')
    } catch (error) {
      console.error('Failed to create transaction:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างรายการได้ กรุณาลองอีกครั้ง')
    }
  }

  const handleNewScan = () => {
    setStep('scan')
    setSelectedFruitId(null)
    setDetectedWeight(null)
    setTotalAmount(0)
    setCurrentTransactionId(null)
    setShowAddFruit(false)
    setNewFruitName('')
    setNewFruitPrice('')
    setNewFruitEmoji('')
  }

  const handleQRPaymentSave = () => {
    setStep('success')
  }

  const handleQRPaymentCancel = () => {
    // Reset to scan step if user cancels QR payment
    handleNewScan()
  }

  const handleAddNewFruit = async () => {
    if (!newFruitName || !newFruitPrice || !newFruitEmoji) return
    
    const newFruit = await addFruit({
      nameThai: newFruitName,
      nameEnglish: newFruitName,
      emoji: newFruitEmoji,
      pricePerKg: parseFloat(newFruitPrice),
      category: 'other',
      description: `ผลไม้ ${newFruitName}`,
      nutritionFacts: {
        calories: 50,
        carbs: 12,
        fiber: 2,
        sugar: 8,
        protein: 1,
        fat: 0.2,
        vitamin_c: 20
      }
    })
    
    setSelectedFruitId(newFruit.id)
    setShowAddFruit(false)
    setNewFruitName('')
    setNewFruitPrice('')
    setNewFruitEmoji('')
    setStep('weight')
  }

  // QR Payment screen
  if (step === 'qr-payment' && selectedFruit && detectedWeight && currentTransactionId) {
    return (
      <QRPaymentScreen
        fruit={selectedFruit}
        weight={detectedWeight}
        totalAmount={totalAmount}
        transactionId={currentTransactionId}
        onSave={handleQRPaymentSave}
        onCancel={handleQRPaymentCancel}
      />
    )
  }

  // Success screen
  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#B46A07', '#D97706']} style={styles.successGradient}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={80} color="white" />
            </View>
            <Text style={styles.successTitle}>บันทึกสำเร็จ!</Text>
            <Text style={styles.successAmount}>{formatThaiCurrency(totalAmount)}</Text>
            <Text style={styles.successDetails}>
              {selectedFruit?.nameThai} - {formatWeight(detectedWeight!)} - บันทึกแล้ว
            </Text>
            <TouchableOpacity style={styles.newScanButton} onPress={handleNewScan}>
              <Text style={styles.newScanText}>สแกนใหม่</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  // QR Scanner style camera view
  if (step === 'scan') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scannerContainer}>
          {/* Header */}
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>สแกนน้ำหนักผลไม้</Text>
            <Text style={styles.scannerSubtitle}>วางผลไม้บนตาชั่งและกดสแกน</Text>
          </View>

          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerSquare}>
                <View style={styles.scannerCorner} />
                <View style={[styles.scannerCorner, styles.topRight]} />
                <View style={[styles.scannerCorner, styles.bottomLeft]} />
                <View style={[styles.scannerCorner, styles.bottomRight]} />
                
                <View style={styles.scannerCenter}>
                  <MaterialIcons name="scale" size={60} color="white" />
                  <Text style={styles.scannerCenterText}>สแกนตาชั่ง</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Scan Button */}
          <View style={styles.scanButtonContainer}>
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
              <MaterialIcons name="camera-alt" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // Beautiful fruit selection like food delivery app
  if (step === 'select') {
    return (
      <SafeAreaView style={styles.modernContainer}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep('scan')}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>เลือกผลไม้</Text>
            <Text style={styles.headerWeight}>น้ำหนัก {formatWeight(detectedWeight!)}</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.modernScrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Modern Fruit Grid */}
          <View style={styles.modernGrid}>
            {fruits.map(fruit => (
              <TouchableOpacity
                key={fruit.id}
                style={styles.modernFruitCard}
                onPress={() => handleFruitSelect(fruit.id)}
              >
                <View style={styles.fruitImageContainer}>
                  <Text style={styles.modernFruitEmoji}>{fruit.emoji}</Text>
                </View>
                <View style={styles.fruitInfo}>
                  <Text style={styles.modernFruitName}>{fruit.nameThai}</Text>
                  <Text style={styles.modernFruitPrice}>
                    {formatThaiCurrency(fruit.pricePerKg)}/กก.
                  </Text>
                </View>
                <View style={styles.addButton}>
                  <MaterialIcons name="add" size={20} color="white" />
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Add new fruit card - modern style */}
            <TouchableOpacity
              style={styles.modernAddCard}
              onPress={() => setShowAddFruit(true)}
            >
              <View style={styles.addIconContainer}>
                <MaterialIcons name="add" size={32} color="#B46A07" />
              </View>
              <View style={styles.fruitInfo}>
                <Text style={styles.addFruitLabel}>เพิ่มผลไม้ใหม่</Text>
                <Text style={styles.addFruitSubtext}>สร้างรายการใหม่</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Add New Fruit Modal */}
        {showAddFruit && (
          <View style={styles.modernModal}>
            <View style={styles.modernModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>เพิ่มผลไม้ใหม่</Text>
                <TouchableOpacity onPress={() => setShowAddFruit(false)}>
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ชื่อผลไม้</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="เช่น มะม่วง, สับปะรด"
                  value={newFruitName}
                  onChangeText={setNewFruitName}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>อีโมจิ</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="🥭"
                  value={newFruitEmoji}
                  onChangeText={setNewFruitEmoji}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ราคาต่อกิโลกรัม</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="120"
                  value={newFruitPrice}
                  onChangeText={setNewFruitPrice}
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <TouchableOpacity
                style={styles.modernAddButton}
                onPress={handleAddNewFruit}
              >
                <Text style={styles.modernAddButtonText}>เพิ่มผลไม้</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    )
  }

  // Weight confirmation and price calculation
  if (step === 'weight') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmContainer}>
          {/* Header */}
          <View style={styles.confirmHeader}>
            <TouchableOpacity onPress={() => setStep('select')}>
              <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.confirmTitle}>ยืนยันรายการ</Text>
          </View>

          {/* Order summary */}
          <View style={styles.orderSummary}>
            <View style={styles.fruitSummary}>
              <Text style={styles.summaryEmoji}>{selectedFruit?.emoji}</Text>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryFruitName}>{selectedFruit?.nameThai}</Text>
                <Text style={styles.summaryWeight}>{formatWeight(detectedWeight!)}</Text>
              </View>
            </View>

            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>น้ำหนัก</Text>
                <Text style={styles.priceValue}>{formatWeight(detectedWeight!)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>ราคาต่อกิโลกรัม</Text>
                <Text style={styles.priceValue}>{formatThaiCurrency(selectedFruit!.pricePerKg)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>ราคารวม</Text>
                <Text style={styles.totalPrice}>
                  {formatThaiCurrency(detectedWeight! * selectedFruit!.pricePerKg)}
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>ยืนยันการขาย</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Success Screen
  successGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  successDetails: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
  },
  newScanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  newScanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Scanner Screen
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  scannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scannerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
  },
  scannerSquare: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#B46A07',
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    right: -2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: -2,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scannerCenter: {
    alignItems: 'center',
  },
  scannerCenterText: {
    color: 'white',
    fontSize: 14,
    marginTop: 12,
  },
  scanButtonContainer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  scanButton: {
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

  // Modern Food Delivery Style
  modernContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerWeight: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  modernScrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modernGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modernFruitCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fruitImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modernFruitEmoji: {
    fontSize: 50,
  },
  fruitInfo: {
    flex: 1,
    alignItems: 'center',
  },
  modernFruitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  modernFruitPrice: {
    fontSize: 14,
    color: '#B46A07',
    fontWeight: '700',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B46A07',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modernAddCard: {
    width: (width - 60) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#B46A07',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  addIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(180, 106, 7, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addFruitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B46A07',
    textAlign: 'center',
    marginBottom: 4,
  },
  addFruitSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Modern Modal Styles
  modernModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxHeight: '80%',
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modernInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  modernAddButton: {
    backgroundColor: '#B46A07',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernAddButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },

  // Confirmation Screen
  confirmContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 16,
  },
  orderSummary: {
    flex: 1,
    padding: 24,
  },
  fruitSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryFruitName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryWeight: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceBreakdown: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#B46A07',
  },
  confirmButton: {
    margin: 24,
    backgroundColor: '#B46A07',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})