import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useTransactions, useDatabase, useDailySales } from '../../src/hooks/useDatabase'
import { formatThaiCurrency, formatWeight } from '../../src/lib/utils'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native'

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const { isInitialized } = useDatabase()
  const { transactions, loading: transactionsLoading, refreshTransactions } = useTransactions()
  const { summary, loading: summaryLoading, refreshSummary } = useDailySales()
  
  // Filter only saved transactions for display
  const savedTransactions = transactions?.filter(t => t.isSaved) || []

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('History screen focused, refreshing data...');
      refreshTransactions();
      refreshSummary();
    }, [refreshTransactions, refreshSummary])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('Manual refresh triggered');
      await Promise.all([
        refreshTransactions(),
        refreshSummary()
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
      // Still show data even if refresh fails
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate fallback totals from transactions (optimistic UI) with null safety
  const fallbackTotals = {
    count: savedTransactions.length,
    weight: savedTransactions.reduce((acc, transaction) => {
      const weight = typeof transaction?.weightKg === 'number' ? transaction.weightKg : 0;
      return acc + weight;
    }, 0),
    revenue: savedTransactions.reduce((acc, transaction) => {
      const amount = typeof transaction?.totalAmount === 'number' ? transaction.totalAmount : 0;
      return acc + amount;
    }, 0)
  };

  // Use database summary when available, fallback to calculated values with null safety
  const todaysTotals = {
    count: (summary?.totalTransactions && typeof summary.totalTransactions === 'number' && summary.totalTransactions > 0) 
      ? summary.totalTransactions 
      : fallbackTotals.count,
    weight: fallbackTotals.weight, // Always use calculated weight as it's more reliable
    revenue: (summary?.totalRevenue && typeof summary.totalRevenue === 'number' && summary.totalRevenue > 0) 
      ? summary.totalRevenue 
      : fallbackTotals.revenue
  };

  console.log('History totals:', { 
    summary: summary, 
    fallback: fallbackTotals, 
    final: todaysTotals,
    savedTransactionsCount: savedTransactions.length 
  });

  const formatTime = (timestamp: string) => {
    try {
      if (!timestamp || typeof timestamp !== 'string') {
        return '--:--';
      }
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '--:--';
      }
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
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

  const maxAmount = chartData.length > 0 ? Math.max(...chartData.map(d => d?.amount || 0)) : 1;

  // Show loading while database initializes
  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B46A07" />
          <Text style={styles.loadingText}>กำลังเริ่มต้นระบบ...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show loading only on first load with better null safety
  if (transactionsLoading && (!transactions || transactions.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B46A07" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B46A07']}
            tintColor="#B46A07"
          />
        }
      >
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
            {summaryLoading ? (
              <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />
            ) : (
              <MaterialIcons name="visibility" size={20} color="rgba(255, 255, 255, 0.8)" />
            )}
          </View>
          <Text style={styles.balanceAmount}>{formatThaiCurrency(todaysTotals.revenue)}</Text>
          <Text style={styles.balanceChange}>
            {summaryLoading ? 'กำลังอัปเดต...' : '+12.5% จากเมื่อวาน'}
          </Text>
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
              {todaysTotals.count > 0 && todaysTotals.revenue > 0 
                ? formatThaiCurrency(todaysTotals.revenue / todaysTotals.count) 
                : '฿0'}
            </Text>
            <Text style={styles.statLabel}>เฉลี่ย/รายการ</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>ยอดขาย 7 วันล่าสุด</Text>
          <View style={styles.chart}>
            {chartData.map((item, index) => {
              const safeAmount = typeof item?.amount === 'number' ? item.amount : 0;
              const safeHeight = maxAmount > 0 ? (safeAmount / maxAmount) * 80 : 0;
              const safeDay = item?.day || '-';
              
              return (
                <View key={index} style={styles.chartBar}>
                  <View 
                    style={[
                      styles.bar,
                      { 
                        height: Math.max(safeHeight, 2), // Minimum height for visibility
                        backgroundColor: index === chartData.length - 1 ? '#B46A07' : '#e5e7eb'
                      }
                    ]} 
                  />
                  <Text style={styles.chartLabel}>{safeDay}</Text>
                </View>
              );
            })}
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
          
          {savedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>ยังไม่มีรายการขายที่บันทึก</Text>
              <Text style={styles.emptySubtext}>เริ่มต้นขายและบันทึกผลไม้เลย!</Text>
            </View>
          ) : (
            savedTransactions.slice(0, 5).map((transaction) => {
              // Safe data extraction with fallbacks
              const fruitEmoji = transaction?.fruit?.emoji || '🍎';
              const fruitName = transaction?.fruit?.nameThai || 'ไม่ระบุชื่อผลไม้';
              const weight = typeof transaction?.weightKg === 'number' ? transaction.weightKg : 0;
              const amount = typeof transaction?.totalAmount === 'number' ? transaction.totalAmount : 0;
              const timestamp = transaction?.timestamp || '';
              
              return (
                <View key={transaction?.id || Math.random()} style={styles.transactionCard}>
                  <View style={styles.transactionIcon}>
                    <Text style={styles.transactionEmoji}>{fruitEmoji}</Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>{fruitName}</Text>
                    <Text style={styles.transactionInfo}>
                      {formatWeight(weight)} • {formatTime(timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.transactionAmount}>
                    {formatThaiCurrency(amount)}
                  </Text>
                </View>
              );
            })
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Kanit-Medium',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Kanit-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
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
    fontFamily: 'Kanit-Medium',
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: 'Kanit-ExtraBold',
    color: 'white',
    marginBottom: 8,
  },
  balanceChange: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Kanit-Medium',
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
    fontFamily: 'Kanit-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Kanit-Regular',
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
    fontFamily: 'Kanit-SemiBold',
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
    fontFamily: 'Kanit-Medium',
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
    fontFamily: 'Kanit-SemiBold',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    color: '#B46A07',
    fontFamily: 'Kanit-Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
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
    fontFamily: 'Kanit-SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionInfo: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Kanit-Bold',
    color: '#B46A07',
  },
})