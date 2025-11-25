import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { formatThaiCurrency } from '../../../lib/utils'
import CartItem from '../CartItem'
import type { CartItem as CartItemType } from '../../../hooks/useCart'

interface CartScreenProps {
  items: CartItemType[]
  total: number
  onAddMore: () => void
  onCheckout: () => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onBack: () => void
}

export default function CartScreen({
  items,
  total,
  onAddMore,
  onCheckout,
  onRemoveItem,
  onClearCart,
  onBack,
}: CartScreenProps) {
  const handleClearCart = () => {
    Alert.alert(
      'ล้างตะกร้า?',
      'คุณต้องการลบรายการทั้งหมดในตะกร้าหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ล้างตะกร้า',
          style: 'destructive',
          onPress: onClearCart,
        },
      ]
    )
  }

  const isEmpty = items.length === 0

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตะกร้าสินค้า</Text>
        {!isEmpty && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <MaterialIcons name="delete-sweep" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>ตะกร้าว่างเปล่า</Text>
          <Text style={styles.emptySubtitle}>
            เพิ่มสินค้าเพื่อเริ่มการขาย
          </Text>
          <TouchableOpacity style={styles.addMoreButtonEmpty} onPress={onAddMore}>
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addMoreButtonTextEmpty}>เพิ่มสินค้า</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <CartItem key={item.id} item={item} onRemove={onRemoveItem} />
            ))}
          </ScrollView>

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                จำนวนรายการ
              </Text>
              <Text style={styles.summaryValue}>{items.length} รายการ</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
              <Text style={styles.totalValue}>{formatThaiCurrency(total)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={onAddMore}
              accessibilityRole="button"
              accessibilityLabel="เพิ่มสินค้า"
            >
              <MaterialIcons name="add" size={20} color="#B46A07" />
              <Text style={styles.addMoreButtonText}>เพิ่มสินค้า</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={onCheckout}
              accessibilityRole="button"
              accessibilityLabel="ชำระเงิน"
            >
              <MaterialIcons name="payment" size={20} color="white" />
              <Text style={styles.checkoutButtonText}>ชำระเงิน</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
  },
  clearButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Kanit-SemiBold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  addMoreButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B46A07',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addMoreButtonTextEmpty: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#1f2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Kanit-Bold',
    color: '#B46A07',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  addMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(180, 106, 7, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B46A07',
    gap: 8,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#B46A07',
  },
  checkoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B46A07',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: 'white',
  },
})
