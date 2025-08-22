import React from 'react'
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useTransactions } from '../../src/hooks/useSimpleData'
import { formatThaiCurrency, formatWeight } from '../../src/lib/utils'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function HistoryScreen() {
  const { transactions } = useTransactions()

  // Calculate today's totals
  const todaysTotals = transactions.reduce((acc, transaction) => ({
    count: acc.count + 1,
    weight: acc.weight + transaction.weightKg,
    revenue: acc.revenue + transaction.totalAmount
  }), { count: 0, weight: 0, revenue: 0 })

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mock chart data for visual appeal
  const chartData = [
    { day: 'จ', amount: 2400 },
    { day: 'อ', amount: 1800 },
    { day: 'พ', amount: 3200 },
    { day: 'พฤ', amount: 2800 },
    { day: 'ศ', amount: 3600 },
    { day: 'ส', amount: 4200 },
    { day: 'อา', amount: todaysTotals.revenue || 2940 },
  ]

  const maxAmount = Math.max(...chartData.map(d => d.amount))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ภาพรวมยอดขาย</Text>
          <Text style={styles.headerSubtitle}>วันนี้ • {new Date().toLocaleDateString('th-TH')}</Text>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#B46A07', '#D97706']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>ยอดขายวันนี้</Text>
            <MaterialIcons name="visibility" size={20} color="rgba(255, 255, 255, 0.8)" />
          </View>
          <Text style={styles.balanceAmount}>{formatThaiCurrency(todaysTotals.revenue)}</Text>
          <Text style={styles.balanceChange}>+12.5% จากเมื่อวาน</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialIcons name="receipt" size={24} color="#B46A07" />
            </View>
            <Text style={styles.statValue}>{todaysTotals.count}</Text>
            <Text style={styles.statLabel}>รายการ</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialIcons name="scale" size={24} color="#B46A07" />
            </View>
            <Text style={styles.statValue}>{formatWeight(todaysTotals.weight)}</Text>
            <Text style={styles.statLabel}>น้ำหนักรวม</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialIcons name="trending-up" size={24} color="#B46A07" />
            </View>
            <Text style={styles.statValue}>
              {todaysTotals.count > 0 ? formatThaiCurrency(todaysTotals.revenue / todaysTotals.count) : '฿0'}
            </Text>
            <Text style={styles.statLabel}>เฉลี่ย/รายการ</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>ยอดขาย 7 วันล่าสุด</Text>
          <View style={styles.chart}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: (item.amount / maxAmount) * 80,
                      backgroundColor: index === chartData.length - 1 ? '#B46A07' : '#e5e7eb'
                    }
                  ]} 
                />
                <Text style={styles.chartLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>รายการล่าสุด</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>ดูทั้งหมด</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>ยังไม่มีรายการขาย</Text>
              <Text style={styles.emptySubtext}>เริ่มต้นขายผลไม้เลย!</Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionEmoji}>{transaction.fruit?.emoji}</Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionName}>{transaction.fruit?.nameThai}</Text>
                  <Text style={styles.transactionInfo}>
                    {formatWeight(transaction.weightKg)} • {formatTime(transaction.timestamp)}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  {formatThaiCurrency(transaction.totalAmount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  balanceCard: {
    margin: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  balanceChange: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  transactionsContainer: {
    backgroundColor: 'white',
    margin: 24,
    marginTop: 0,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    color: '#B46A07',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionEmoji: {
    fontSize: 24,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionInfo: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B46A07',
  },
})