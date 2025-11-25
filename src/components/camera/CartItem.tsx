import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { formatThaiCurrency } from '../../lib/utils'
import EmojiDisplay from './EmojiDisplay'
import type { CartItem as CartItemType } from '../../hooks/useCart'

interface CartItemProps {
  item: CartItemType
  onRemove: (id: string) => void
}

export default function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <EmojiDisplay emojiId={item.emoji} size={48} />
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.fruitName}>{item.fruitName}</Text>
        <Text style={styles.weightText}>
          {item.weight.toFixed(2)} กก. × {formatThaiCurrency(item.pricePerKg)}/กก.
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.subtotal}>{formatThaiCurrency(item.subtotal)}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onRemove(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`ลบ ${item.fruitName}`}
        >
          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  leftSection: {
    marginRight: 12,
  },
  detailsSection: {
    flex: 1,
  },
  fruitName: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  weightText: {
    fontSize: 13,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  subtotal: {
    fontSize: 16,
    fontFamily: 'Kanit-Bold',
    color: '#B46A07',
  },
  deleteButton: {
    padding: 4,
  },
})
