import React, { useState, useEffect } from 'react'
import { View, Text, SafeAreaView, ScrollView, FlatList, Alert } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { Input } from '../../src/components/ui/Input'
import { Card, CardContent, CardHeader } from '../../src/components/ui/Card'
import { useFruits } from '../../src/hooks/useFruits'
import { THAI_TEXT } from '../../src/lib/constants'
import { formatThaiCurrency } from '../../src/lib/utils'
import '../../src/lib/seeder' // Import seeder to trigger initialization

export default function SetupScreen() {
  const { fruits, addFruit, updateFruit, initializeWithPresets } = useFruits()
  const [showAddFruit, setShowAddFruit] = useState(false)
  const [newFruitName, setNewFruitName] = useState('')
  const [newFruitPrice, setNewFruitPrice] = useState('')
  const [editingFruit, setEditingFruit] = useState<any>(null)

  useEffect(() => {
    // Initialize with presets if no fruits exist
    if (fruits.length === 0) {
      initializeWithPresets()
    }
  }, [fruits.length, initializeWithPresets])

  const handleAddFruit = async () => {
    if (!newFruitName.trim() || !newFruitPrice.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const price = parseFloat(newFruitPrice)
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price')
      return
    }

    try {
      await addFruit({
        nameThai: newFruitName.trim(),
        nameEnglish: '',
        pricePerKg: price,
        isActive: true
      })

      setNewFruitName('')
      setNewFruitPrice('')
      setShowAddFruit(false)
      Alert.alert('Success', 'Fruit added successfully')
    } catch (error) {
      console.error('Add fruit error:', error)
      Alert.alert('Error', 'Failed to add fruit')
    }
  }

  const handleEditFruit = (fruit: any) => {
    setEditingFruit(fruit)
    setNewFruitName(fruit.nameThai)
    setNewFruitPrice(fruit.pricePerKg.toString())
    setShowAddFruit(true)
  }

  const handleUpdateFruit = async () => {
    if (!editingFruit || !newFruitName.trim() || !newFruitPrice.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const price = parseFloat(newFruitPrice)
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price')
      return
    }

    try {
      await updateFruit(editingFruit.id, {
        nameThai: newFruitName.trim(),
        pricePerKg: price
      })

      setNewFruitName('')
      setNewFruitPrice('')
      setEditingFruit(null)
      setShowAddFruit(false)
      Alert.alert('Success', 'Fruit updated successfully')
    } catch (error) {
      console.error('Update fruit error:', error)
      Alert.alert('Error', 'Failed to update fruit')
    }
  }

  const handleCancel = () => {
    setNewFruitName('')
    setNewFruitPrice('')
    setEditingFruit(null)
    setShowAddFruit(false)
  }

  const renderFruit = ({ item }: { item: any }) => (
    <Card className="mb-3">
      <CardContent>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-thai-lg font-medium text-gray-800">
              {item.nameThai}
            </Text>
            {item.nameEnglish && (
              <Text className="text-thai-sm text-gray-600">
                {item.nameEnglish}
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-thai-lg font-bold text-primary-600">
              {formatThaiCurrency(item.pricePerKg)}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleEditFruit(item)}
              className="mt-1"
            >
              {THAI_TEXT.edit}
            </Button>
          </View>
        </View>
      </CardContent>
    </Card>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <Text className="text-thai-2xl font-bold text-gray-800">
              FruitIQ Setup
            </Text>
          </CardHeader>
          <CardContent>
            <Text className="text-thai-base text-gray-600">
              จัดการรายการผลไม้และราคา
            </Text>
          </CardContent>
        </Card>

        {/* Tutorial Card */}
        <Card className="mb-6">
          <CardHeader>
            <Text className="text-thai-lg font-medium text-gray-800">
              {THAI_TEXT.tutorial}
            </Text>
          </CardHeader>
          <CardContent>
            <Text className="text-thai-sm text-gray-600 mb-2">{THAI_TEXT.step1}</Text>
            <Text className="text-thai-sm text-gray-600 mb-2">{THAI_TEXT.step2}</Text>
            <Text className="text-thai-sm text-gray-600 mb-2">{THAI_TEXT.step3}</Text>
            <Text className="text-thai-sm text-gray-600">{THAI_TEXT.step4}</Text>
          </CardContent>
        </Card>

        {/* Add Fruit Form */}
        {showAddFruit && (
          <Card className="mb-6">
            <CardHeader>
              <Text className="text-thai-lg font-medium text-gray-800">
                {editingFruit ? THAI_TEXT.editFruit : THAI_TEXT.addFruit}
              </Text>
            </CardHeader>
            <CardContent>
              <Input
                label={THAI_TEXT.fruitName}
                value={newFruitName}
                onChangeText={setNewFruitName}
                placeholder="เช่น มะม่วง"
              />
              <Input
                label={`${THAI_TEXT.pricePerKg} (${THAI_TEXT.baht})`}
                value={newFruitPrice}
                onChangeText={setNewFruitPrice}
                keyboardType="numeric"
                placeholder="80"
              />
              <View className="flex-row gap-3">
                <Button
                  onPress={editingFruit ? handleUpdateFruit : handleAddFruit}
                  className="flex-1"
                >
                  {editingFruit ? THAI_TEXT.save : THAI_TEXT.add}
                </Button>
                <Button
                  variant="outline"
                  onPress={handleCancel}
                  className="flex-1"
                >
                  {THAI_TEXT.cancel}
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Add Button */}
        {!showAddFruit && (
          <Button
            onPress={() => setShowAddFruit(true)}
            className="mb-6"
            size="lg"
          >
            {THAI_TEXT.addFruit}
          </Button>
        )}

        {/* Fruits List */}
        <View className="mb-4">
          <Text className="text-thai-lg font-medium text-gray-800 mb-3">
            รายการผลไม้ ({fruits.length})
          </Text>
          
          {fruits.length === 0 ? (
            <Card>
              <CardContent className="items-center py-8">
                <Text className="text-thai-base text-gray-500 text-center">
                  {THAI_TEXT.noFruits}
                </Text>
              </CardContent>
            </Card>
          ) : (
            <FlatList
              data={fruits}
              renderItem={renderFruit}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
