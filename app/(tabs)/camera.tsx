import React, { useState } from 'react'
import { View, Text, Alert, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { useFruits, useTransactions, useDatabase } from '../../src/hooks/useDatabase'
import { formatThaiCurrency, formatWeight } from '../../src/lib/utils'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import QRPaymentScreen from '../../src/components/QRPaymentScreen'
import { Fruit } from '../../src/data/mockData'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

export default function CameraScreen() {
  const router = useRouter()
  const { isInitialized } = useDatabase()
  const { fruits, addFruit, updateFruit, deleteFruit, loading: fruitsLoading } = useFruits()
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
  const [editingFruit, setEditingFruit] = useState<Fruit | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [contextMenuFruit, setContextMenuFruit] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  // Preset fruit emojis for easy selection
  const presetEmojis = [
    '🍎', '🍊', '🍌', '🥭', '🍇', '🍓', '🥥', '🍍', 
    '🫐', '🍈', '🍑', '🥝', '🍋', '🍐', '🥑', '🍅',
    '🥒', '🌶️', '🫑', '🥕'
  ]

  const selectedFruit = fruits?.find(f => f.id === selectedFruitId)

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

  const resetFruitForm = () => {
    setNewFruitName('')
    setNewFruitPrice('')
    setNewFruitEmoji('')
    setEditingFruit(null)
    setShowEmojiPicker(false)
  }

  const handleNewScan = () => {
    setStep('scan')
    setSelectedFruitId(null)
    setDetectedWeight(null)
    setTotalAmount(0)
    setCurrentTransactionId(null)
    setShowAddFruit(false)
    setShowDeleteConfirm(null)
    resetFruitForm()
  }

  const handleQRPaymentSave = () => {
    setStep('success')
  }

  const handleQRPaymentCancel = () => {
    // Reset to scan step if user cancels QR payment
    handleNewScan()
  }

  const handleEditFruit = (fruit: Fruit) => {
    setEditingFruit(fruit)
    setNewFruitName(fruit.nameThai)
    setNewFruitPrice(fruit.pricePerKg.toString())
    setNewFruitEmoji(fruit.emoji)
    setShowAddFruit(true)
  }

  const handleDeleteFruit = async (fruitId: number) => {
    try {
      await deleteFruit(fruitId)
      setShowDeleteConfirm(null)
      Alert.alert('ลบสำเร็จ', 'ผลไม้ได้รับการลบออกจากระบบแล้ว')
    } catch (error) {
      console.error('Error deleting fruit:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบผลไม้ได้ กรุณาลองอีกครั้ง')
    }
  }

  const handleAddNewFruit = async () => {
    if (!newFruitName?.trim() || !newFruitPrice?.trim() || !newFruitEmoji?.trim()) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    const price = parseFloat(newFruitPrice)
    if (isNaN(price) || price <= 0) {
      Alert.alert('ราคาไม่ถูกต้อง', 'กรุณากรอกราคาเป็นตัวเลขที่มากกว่า 0')
      return
    }

    try {
      if (editingFruit) {
        // Update existing fruit
        await updateFruit(editingFruit.id, {
          nameThai: newFruitName.trim(),
          nameEnglish: newFruitName.trim(),
          emoji: newFruitEmoji.trim(),
          pricePerKg: price,
          description: `ผลไม้ ${newFruitName.trim()}`
        })
        Alert.alert('แก้ไขสำเร็จ', 'ข้อมูลผลไม้ได้รับการอัปเดตแล้ว')
      } else {
        // Add new fruit
        const newFruit = await addFruit({
          nameThai: newFruitName.trim(),
          nameEnglish: newFruitName.trim(),
          emoji: newFruitEmoji.trim(),
          pricePerKg: price,
          category: 'other',
          description: `ผลไม้ ${newFruitName.trim()}`,
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
        setStep('weight')
      }
      
      setShowAddFruit(false)
      resetFruitForm()
    } catch (error) {
      console.error('Error saving fruit:', error)
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลผลไม้ได้ กรุณาลองอีกครั้ง')
    }
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
              {selectedFruit?.nameThai || 'ไม่ทราบชื่อ'} - {formatWeight(detectedWeight || 0)} - บันทึกแล้ว
            </Text>
            <View style={styles.successButtonContainer}>
              <TouchableOpacity style={styles.newScanButton} onPress={handleNewScan}>
                <MaterialIcons name="camera-alt" size={20} color="white" />
                <Text style={styles.newScanText}>สแกนใหม่</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/history')}>
                <MaterialIcons name="history" size={20} color="#B46A07" />
                <Text style={styles.historyText}>ดูประวัติ</Text>
              </TouchableOpacity>
            </View>
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
            <Text style={styles.headerWeight}>น้ำหนัก {formatWeight(detectedWeight || 0)}</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.modernScrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Improved Fruit Grid */}
          <View style={styles.modernGrid}>
            {fruits?.length > 0 ? fruits.map(fruit => (
              <TouchableOpacity
                key={fruit.id}
                style={styles.improvedFruitCard}
                onPress={() => handleFruitSelect(fruit.id)}
                onLongPress={() => {
                  setContextMenuFruit(fruit.id);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.fruitImageContainer}>
                  <Text style={styles.improvedFruitEmoji}>{fruit.emoji}</Text>
                </View>
                <View style={styles.improvedFruitInfo}>
                  <Text style={styles.improvedFruitName}>{fruit.nameThai}</Text>
                  <Text style={styles.improvedFruitPrice}>
                    {formatThaiCurrency(fruit.pricePerKg)}/กก.
                  </Text>
                </View>
                <View style={styles.selectIndicator}>
                  <MaterialIcons name="touch-app" size={16} color="#B46A07" />
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyFruitsContainer}>
                <MaterialIcons name="inbox" size={48} color="#d1d5db" />
                <Text style={styles.emptyFruitsText}>ไม่มีข้อมูลผลไม้</Text>
              </View>
            )}
            
            {/* Add new fruit card - modern style */}
            <TouchableOpacity
              style={styles.modernAddCard}
              onPress={() => setShowAddFruit(true)}
            >
              <View style={styles.addIconContainer}>
                <MaterialIcons name="add" size={32} color="#B46A07" />
              </View>
              <View style={styles.addFruitInfo}>
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
                <Text style={styles.modalTitle}>
                  {editingFruit ? 'แก้ไขผลไม้' : 'เพิ่มผลไม้ใหม่'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowAddFruit(false)
                  resetFruitForm()
                }}>
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
                
                {/* Emoji Display and Picker Button */}
                <TouchableOpacity
                  style={styles.emojiPickerButton}
                  onPress={() => setShowEmojiPicker(true)}
                >
                  <Text style={styles.emojiDisplay}>
                    {newFruitEmoji || '🍎'}
                  </Text>
                  <Text style={styles.emojiPickerText}>แตะเพื่อเลือกอีโมจิ</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color="#6b7280" />
                </TouchableOpacity>

                {/* Photo Selection Option */}
                <View style={styles.photoOptionContainer}>
                  <TouchableOpacity
                    style={styles.photoOptionButton}
                    onPress={() => {
                      // TODO: Implement image picker (requires expo-image-picker)
                      Alert.alert(
                        'รูปภาพ',
                        'ฟีเจอร์การเลือกรูปภาพยังไม่พร้อมใช้งาน\nกรุณาใช้อีโมจิแทน',
                        [{ text: 'ตกลง' }]
                      )
                    }}
                  >
                    <MaterialIcons name="photo-camera" size={20} color="#6b7280" />
                    <Text style={styles.photoOptionText}>หรือเลือกรูปภาพ</Text>
                  </TouchableOpacity>
                </View>

                {/* Custom Emoji Input (Optional) */}
                <TextInput
                  style={[styles.modernInput, styles.customEmojiInput]}
                  placeholder="หรือใส่อีโมจิเอง"
                  value={newFruitEmoji}
                  onChangeText={(text) => {
                    const emojiOnly = text.replace(/[^\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/gu, '')
                    setNewFruitEmoji(emojiOnly.slice(0, 2))
                  }}
                  placeholderTextColor="#9ca3af"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ราคาต่อกิโลกรัม (บาท)</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="120"
                  value={newFruitPrice}
                  onChangeText={(text) => {
                    // Allow only numbers and decimal point
                    const numericText = text.replace(/[^0-9.]/g, '')
                    // Prevent multiple decimal points
                    const parts = numericText.split('.')
                    if (parts.length > 2) {
                      return
                    }
                    setNewFruitPrice(numericText)
                  }}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <TouchableOpacity
                style={styles.modernAddButton}
                onPress={handleAddNewFruit}
                disabled={!newFruitName?.trim() || !newFruitPrice?.trim() || !newFruitEmoji?.trim()}
              >
                <Text style={styles.modernAddButtonText}>
                  {editingFruit ? 'บันทึกการแก้ไข' : 'เพิ่มผลไม้'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Context Menu Modal */}
        {contextMenuFruit && (
          <TouchableOpacity 
            style={styles.contextMenuOverlay}
            activeOpacity={1}
            onPress={() => setContextMenuFruit(null)}
          >
            <View style={styles.contextMenuContainer}>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => {
                  const fruit = fruits.find(f => f.id === contextMenuFruit);
                  if (fruit) handleEditFruit(fruit);
                  setContextMenuFruit(null);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#3b82f6" />
                <Text style={styles.contextMenuText}>แก้ไข</Text>
              </TouchableOpacity>
              
              <View style={styles.contextMenuDivider} />
              
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => {
                  setShowDeleteConfirm(contextMenuFruit);
                  setContextMenuFruit(null);
                }}
              >
                <MaterialIcons name="delete" size={20} color="#ef4444" />
                <Text style={[styles.contextMenuText, { color: '#ef4444' }]}>ลบ</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <View style={styles.modernModal}>
            <View style={[styles.modernModalContent, styles.emojiPickerModal]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>เลือกอีโมจิ</Text>
                <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
                <View style={styles.emojiGridContainer}>
                  {presetEmojis.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.emojiGridItem,
                        newFruitEmoji === emoji && styles.selectedEmojiItem
                      ]}
                      onPress={() => {
                        setNewFruitEmoji(emoji)
                        setShowEmojiPicker(false)
                      }}
                    >
                      <Text style={styles.emojiGridEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <View style={styles.modernModal}>
            <View style={styles.modernModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>ยืนยันการลบ</Text>
                <TouchableOpacity onPress={() => setShowDeleteConfirm(null)}>
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.deleteConfirmContent}>
                <MaterialIcons name="warning" size={48} color="#ef4444" />
                <Text style={styles.deleteConfirmText}>
                  คุณต้องการลบผลไม้นี้ออกจากระบบหรือไม่?
                </Text>
                <Text style={styles.deleteConfirmSubtext}>
                  การดำเนินการนี้ไม่สามารถยกเลิกได้
                </Text>
              </View>
              
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => setShowDeleteConfirm(null)}
                >
                  <Text style={styles.cancelDeleteText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={() => handleDeleteFruit(showDeleteConfirm)}
                >
                  <Text style={styles.confirmDeleteText}>ลบ</Text>
                </TouchableOpacity>
              </View>
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
                <Text style={styles.summaryWeight}>{formatWeight(detectedWeight || 0)}</Text>
              </View>
            </View>

            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>น้ำหนัก</Text>
                <Text style={styles.priceValue}>{formatWeight(detectedWeight || 0)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>ราคาต่อกิโลกรัม</Text>
                <Text style={styles.priceValue}>{formatThaiCurrency(selectedFruit?.pricePerKg || 0)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>ราคารวม</Text>
                <Text style={styles.totalPrice}>
                  {formatThaiCurrency((detectedWeight || 0) * (selectedFruit?.pricePerKg || 0))}
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
    fontFamily: 'Kanit-Medium',
    color: '#6b7280',
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
    fontFamily: 'Kanit-Bold',
    color: 'white',
    marginBottom: 16,
  },
  successAmount: {
    fontSize: 32,
    fontFamily: 'Kanit-ExtraBold',
    color: 'white',
    marginBottom: 8,
  },
  successDetails: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
  },
  successButtonContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  newScanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newScanText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyText: {
    color: '#B46A07',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
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
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  scannerSubtitle: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
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
    fontFamily: 'Kanit-Regular',
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
    fontFamily: 'Kanit-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerWeight: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#6b7280',
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
  // Improved fruit cards - larger and cleaner
  improvedFruitCard: {
    width: (width - 50) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fruitImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  // Improved fruit card content styles
  improvedFruitEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  improvedFruitInfo: {
    alignItems: 'center',
    flex: 1,
  },
  improvedFruitName: {
    fontSize: 18,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  improvedFruitPrice: {
    fontSize: 16,
    color: '#B46A07',
    fontFamily: 'Kanit-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  selectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 106, 7, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontFamily: 'Kanit-SemiBold',
    color: '#B46A07',
    textAlign: 'center',
    marginBottom: 4,
  },
  addFruitInfo: {
    alignItems: 'center',
  },
  addFruitSubtext: {
    fontSize: 12,
    fontFamily: 'Kanit-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptyFruitsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  emptyFruitsText: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#9ca3af',
    marginTop: 12,
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
    fontFamily: 'Kanit-Bold',
    color: '#1f2937',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#374151',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modernInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Emoji Picker Styles
  emojiPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  emojiDisplay: {
    fontSize: 28,
    marginRight: 12,
  },
  emojiPickerText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  customEmojiInput: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: -12,
  },
  emojiPickerModal: {
    maxHeight: '70%',
  },
  emojiGrid: {
    maxHeight: 300,
  },
  emojiGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  emojiGridItem: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEmojiItem: {
    borderColor: '#B46A07',
    backgroundColor: 'rgba(180, 106, 7, 0.1)',
  },
  emojiGridEmoji: {
    fontSize: 32,
  },
  
  // Photo Option Styles
  photoOptionContainer: {
    marginVertical: 8,
  },
  photoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  photoOptionText: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    marginLeft: 8,
  },
  modernAddButton: {
    backgroundColor: '#B46A07',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  modernAddButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Kanit-Bold',
    letterSpacing: 0.5,
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
    fontFamily: 'Kanit-SemiBold',
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
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryWeight: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
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
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
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
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
  },
  totalPrice: {
    fontSize: 22,
    fontFamily: 'Kanit-Bold',
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
    fontFamily: 'Kanit-SemiBold',
  },

  // Delete Confirmation Modal
  deleteConfirmContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  deleteConfirmText: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteConfirmSubtext: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelDeleteText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
  },
  
  // Context Menu Styles
  contextMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 140,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contextMenuText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  contextMenuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
    marginHorizontal: 8,
  },
})