/**
 * QR Payment Screen Component
 * Displays PromptPay QR code for offline payment and handles transaction saving
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import generatePayload from 'promptpay-qr';
import { useSettings, useTransactions } from '../hooks/useApi';
import { formatThaiCurrency, formatWeight, getEmojiById } from '../lib/utils';
import { Fruit } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface QRPaymentScreenProps {
  fruit: Fruit;
  weight: number;
  totalAmount: number;
  transactionId: number;
  onSave: () => void;
  onCancel: () => void;
}

export default function QRPaymentScreen({
  fruit,
  weight,
  totalAmount,
  transactionId,
  onSave,
  onCancel
}: QRPaymentScreenProps) {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const router = useRouter();
  const { promptpayPhone, getPromptpayPhone } = useSettings();
  const { markTransactionAsSaved } = useTransactions();
  const { isAuthenticated, selectedFarm } = useAuth();

  const emojiItem = getEmojiById(fruit.emoji);

  const generateQRCode = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get PromptPay phone/ID from settings
      let promptpayId = promptpayPhone;
      if (!promptpayId) {
        promptpayId = await getPromptpayPhone();
      }

      // Use default phone number if none configured (for demo)
      if (!promptpayId) {
        promptpayId = '0812345678'; // Demo phone number
      }

      console.log('Generating PromptPay QR with ID:', promptpayId, 'Amount:', totalAmount);

      // Generate PromptPay QR code using the official library
      const qrData = generatePayload(promptpayId, { amount: totalAmount });
      console.log('Generated QR payload:', qrData.substring(0, 100) + '...');
      
      setQrCodeData(qrData);
      setQrGenerated(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        'ไม่สามารถสร้าง QR Code ได้ กรุณาลองอีกครั้ง\n' + (error instanceof Error ? error.message : ''),
        [{ text: 'ตกลง' }]
      );
    } finally {
      setLoading(false);
    }
  }, [promptpayPhone, getPromptpayPhone, totalAmount]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const handleSaveTransaction = async () => {
    try {
      setSaving(true);

      // Mark transaction as saved via API (also creates farm activity if user has farm)
      await markTransactionAsSaved(transactionId);

      console.log(`Transaction ${transactionId} marked as saved successfully`);

      // Show success message with actions
      Alert.alert(
        '✅ บันทึกสำเร็จ!',
        `ขาย${fruit.nameThai}\nน้ำหนัก ${formatWeight(weight)}\nยอดเงิน ${formatThaiCurrency(totalAmount)}\n\n${
          isAuthenticated && selectedFarm
            ? 'รายการขายได้รับการบันทึกและเพิ่มกิจกรรมไปยังฟาร์มของคุณแล้ว'
            : 'รายการขายได้รับการบันทึกแล้ว'
        }`,
        [
          {
            text: 'สแกนใหม่',
            onPress: onSave,
            style: 'default'
          },
          {
            text: 'ดูประวัติ',
            onPress: () => {
              onSave();
              router.push('/(tabs)/history');
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        `ไม่สามารถบันทึกรายการได้: ${error instanceof Error ? error.message : 'Unknown error'}\nกรุณาลองอีกครั้ง`,
        [{ text: 'ตกลง' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'ยกเลิกรายการ',
      'คุณต้องการยกเลิกรายการนี้หรือไม่?',
      [
        {
          text: 'ไม่ยกเลิก',
          style: 'cancel'
        },
        {
          text: 'ยกเลิก',
          style: 'destructive',
          onPress: onCancel
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B46A07" />
          <Text style={styles.loadingText}>กำลังสร้าง QR Code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>ชำระเงิน</Text>
            <Text style={styles.headerSubtitle}>สแกน QR Code เพื่อชำระ</Text>
          </View>
        </View>

        {/* Transaction Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.fruitSummary}>
            {emojiItem?.type === 'emoji' ? (
              <Text style={styles.fruitEmoji}>{emojiItem.value}</Text>
            ) : emojiItem?.type === 'image' ? (
              <Image
                source={emojiItem.source}
                style={{ width: 48, height: 48, marginRight: 16 }}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.fruitEmoji}>🍎</Text>
            )}
            <View style={styles.fruitDetails}>
              <Text style={styles.fruitName}>{fruit.nameThai}</Text>
              <Text style={styles.fruitWeight}>{formatWeight(weight)}</Text>
            </View>
          </View>
          
          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>น้ำหนัก</Text>
              <Text style={styles.priceValue}>{formatWeight(weight)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>ราคาต่อกิโลกรัม</Text>
              <Text style={styles.priceValue}>{formatThaiCurrency(fruit.pricePerKg)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>ยอดรวม</Text>
              <Text style={styles.totalPrice}>{formatThaiCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* QR Code Display */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>สแกนเพื่อชำระเงิน</Text>
            <Text style={styles.qrSubtitle}>PromptPay QR Code</Text>
            
            <View style={styles.qrCodeContainer}>
              {qrGenerated && qrCodeData ? (
                <QRCode
                  value={qrCodeData}
                  size={width * 0.6}
                  backgroundColor="white"
                  color="black"
                  logo={undefined}
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <MaterialIcons name="qr-code" size={60} color="#9ca3af" />
                  <Text style={styles.qrPlaceholderText}>QR Code ไม่พร้อมใช้งาน</Text>
                </View>
              )}
            </View>

            <View style={styles.qrInfo}>
              <View style={styles.qrInfoRow}>
                <MaterialIcons name="smartphone" size={16} color="#6b7280" />
                <Text style={styles.qrInfoText}>
                  เปิดแอปธนาคารของคุณและสแกน QR Code
                </Text>
              </View>
              <View style={styles.qrInfoRow}>
                <MaterialIcons name="security" size={16} color="#6b7280" />
                <Text style={styles.qrInfoText}>
                  การชำระเงินปลอดภัยผ่าน PromptPay
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>วิธีการชำระเงิน</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>เปิดแอปธนาคารในโทรศัพท์</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>เลือกฟังก์ชัน &quot;สแกน QR&quot; หรือ &quot;โอนเงิน&quot;</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>สแกน QR Code ข้างต้น</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>ยืนยันการโอนเงิน {formatThaiCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTransaction}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>บันทึกรายการขาย</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelActionButton}
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={styles.cancelActionButtonText}>ยกเลิก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cancelButton: {
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
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },

  // Summary
  summaryCard: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  fruitSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fruitEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  fruitDetails: {
    flex: 1,
  },
  fruitName: {
    fontSize: 20,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  fruitWeight: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  priceDetails: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
    borderTopColor: '#e5e7eb',
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

  // QR Code
  qrContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  qrTitle: {
    fontSize: 18,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    marginBottom: 24,
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: width * 0.6,
    height: width * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  qrPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Kanit-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrInfoText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },

  // Instructions
  instructionsCard: {
    margin: 20,
    marginBottom: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#B46A07',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#374151',
    lineHeight: 20,
  },

  // Actions
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: '#B46A07',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    marginLeft: 8,
  },
  cancelActionButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelActionButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
});