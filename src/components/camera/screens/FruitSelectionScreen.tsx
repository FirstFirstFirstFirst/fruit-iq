import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { formatWeight } from '../../../lib/utils'
import { Fruit } from '../../../data/mockData'
import { cameraStyles } from '../styles'
import FruitCard from '../FruitCard'
import AddFruitCard from '../AddFruitCard'

interface FruitSelectionScreenProps {
  detectedWeight: number | null
  fruits: Fruit[]
  onBack: () => void
  onFruitSelect: (fruitId: number) => void
  onFruitLongPress: (fruitId: number) => void
  onAddFruit: () => void
  onCancel?: () => void
}

export default function FruitSelectionScreen({
  detectedWeight,
  fruits,
  onBack,
  onFruitSelect,
  onFruitLongPress,
  onAddFruit,
  onCancel,
}: FruitSelectionScreenProps) {
  return (
    <SafeAreaView style={cameraStyles.modernContainer}>
      {/* Modern Header */}
      <View style={cameraStyles.modernHeader}>
        <TouchableOpacity style={cameraStyles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={cameraStyles.headerContent}>
          <Text style={cameraStyles.headerTitle}>เลือกผลไม้</Text>
          <Text style={cameraStyles.headerWeight}>น้ำหนัก {formatWeight(detectedWeight || 0)}</Text>
        </View>
        {onCancel && (
          <TouchableOpacity style={cameraStyles.cancelFlowButton} onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={cameraStyles.modernScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={cameraStyles.scrollContent}
      >
        {/* Improved Fruit Grid */}
        <View style={cameraStyles.modernGrid}>
          {fruits?.length > 0 ? (
            fruits.map(fruit => (
              <FruitCard
                key={fruit.id}
                fruit={fruit}
                onSelect={onFruitSelect}
                onLongPress={onFruitLongPress}
              />
            ))
          ) : (
            <View style={cameraStyles.emptyFruitsContainer}>
              <MaterialIcons name="inbox" size={48} color="#d1d5db" />
              <Text style={cameraStyles.emptyFruitsText}>ไม่มีข้อมูลผลไม้</Text>
            </View>
          )}

          {/* Add new fruit card */}
          <AddFruitCard onPress={onAddFruit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}