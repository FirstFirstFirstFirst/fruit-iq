import React from 'react'
import { View, Text, SafeAreaView, ScrollView, FlatList } from 'react-native'
import { Card, CardContent, CardHeader } from '../../src/components/ui/Card'
import { useTransactions } from '../../src/hooks/useTransactions'
import { useFruits } from '../../src/hooks/useFruits'
// import { useTodaysSummary } from '../../src/hooks/useDailySummary'
import { THAI_TEXT } from '../../src/lib/constants'
import { formatThaiCurrency, formatWeight, formatThaiTime } from '../../src/lib/utils'

export default function HistoryScreen() {
  const { todaysTransactions, todaysTotals } = useTransactions()
  const { fruits } = useFruits()
  // const todaysSummary = useTodaysSummary() // Future use for more detailed summaries

  const getFruitName = (fruitId: number) => {
    const fruit = fruits.find(f => f.id === fruitId)
    return fruit?.nameThai || 'ไม่ระบุ'
  }

  const renderTransaction = ({ item }: { item: any }) => {
    return (
      <Card className="mb-3">
        <CardContent>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-thai-lg font-medium text-gray-800">
                {getFruitName(item.fruitId)}
              </Text>
              <Text className="text-thai-sm text-gray-600">
                {formatWeight(item.weightKg)} × {formatThaiCurrency(item.pricePerKg)}
              </Text>
              <Text className="text-thai-sm text-gray-500">
                {formatThaiTime(new Date(item.createdAt))}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-thai-lg font-bold text-primary-600">
                {formatThaiCurrency(item.totalAmount)}
              </Text>
              {!item.syncedAt && (
                <View className="bg-yellow-100 px-2 py-1 rounded-full mt-1">
                  <Text className="text-thai-sm text-yellow-800">ยังไม่ซิงค์</Text>
                </View>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Daily Summary */}
        <Card className="mb-6">
          <CardHeader>
            <Text className="text-thai-xl font-bold text-gray-800">
              {THAI_TEXT.todaysSales}
            </Text>
          </CardHeader>
          <CardContent>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-thai-base text-gray-600">
                {THAI_TEXT.transactions}
              </Text>
              <Text className="text-thai-lg font-medium text-gray-800">
                {todaysTotals.count} รายการ
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-thai-base text-gray-600">
                น้ำหนักรวม
              </Text>
              <Text className="text-thai-lg font-medium text-gray-800">
                {formatWeight(todaysTotals.weight)}
              </Text>
            </View>
            
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-thai-lg font-medium text-gray-800">
                  {THAI_TEXT.totalRevenue}
                </Text>
                <Text className="text-thai-2xl font-bold text-primary-600">
                  {formatThaiCurrency(todaysTotals.revenue)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <View className="mb-4">
          <Text className="text-thai-lg font-medium text-gray-800 mb-3">
            รายการขายวันนี้
          </Text>
          
          {todaysTransactions.length === 0 ? (
            <Card>
              <CardContent className="items-center py-8">
                <Text className="text-thai-base text-gray-500 text-center">
                  ยังไม่มีรายการขายวันนี้
                </Text>
              </CardContent>
            </Card>
          ) : (
            <FlatList
              data={todaysTransactions}
              renderItem={renderTransaction}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}