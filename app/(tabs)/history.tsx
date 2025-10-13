import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";
import { useDailySales, useTransactions } from "../../src/hooks/useApi";
import { AuthAPI } from "../../src/lib/api";
import { formatThaiCurrency, formatWeight } from "../../src/lib/utils";

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const [loadingWebLink, setLoadingWebLink] = useState(false);
  const {
    transactions,
    loading: transactionsLoading,
    refresh: refreshTransactions,
    error: transactionsError,
  } = useTransactions();
  const {
    summary,
    loading: summaryLoading,
    refresh: refreshSummary,
    error: summaryError,
  } = useDailySales();
  const { isAuthenticated, selectedFarm, logout } = useAuth();
  const router = useRouter();

  // Monitor for API errors
  useEffect(() => {
    if (transactionsError || summaryError) {
      console.log("API errors detected:", { transactionsError, summaryError });
      setHasApiError(true);
    } else {
      setHasApiError(false);
    }
  }, [transactionsError, summaryError]);

  // Filter only saved transactions for display
  const savedTransactions = transactions?.filter((t) => t.isSaved) || [];

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("History screen focused, refreshing data...");
      try {
        refreshTransactions({ isSaved: true });
        refreshSummary();
      } catch (error) {
        console.error("Error refreshing data on focus:", error);
        setHasApiError(true);
      }
    }, [refreshTransactions, refreshSummary])
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("Manual refresh triggered");
      refreshTransactions({ isSaved: true });
      refreshSummary();
    } catch (error) {
      console.error("Error during refresh:", error);
      setHasApiError(true);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate fallback totals from transactions (optimistic UI) with comprehensive null safety
  const fallbackTotals = {
    count: Array.isArray(savedTransactions) ? savedTransactions.length : 0,
    weight: Array.isArray(savedTransactions)
      ? savedTransactions.reduce((acc, transaction) => {
          const weight =
            transaction &&
            typeof transaction?.weightKg === "number" &&
            !isNaN(transaction.weightKg)
              ? transaction.weightKg
              : 0;
          return acc + weight;
        }, 0)
      : 0,
    revenue: Array.isArray(savedTransactions)
      ? savedTransactions.reduce((acc, transaction) => {
          const amount =
            transaction &&
            typeof transaction?.totalAmount === "number" &&
            !isNaN(transaction.totalAmount)
              ? transaction.totalAmount
              : 0;
          return acc + amount;
        }, 0)
      : 0,
  };

  // Use database summary when available and not in error state, fallback to calculated values with comprehensive null safety
  const todaysTotals = {
    count:
      !hasApiError &&
      summary?.totalTransactions &&
      typeof summary.totalTransactions === "number" &&
      !isNaN(summary.totalTransactions) &&
      summary.totalTransactions >= 0
        ? summary.totalTransactions
        : fallbackTotals.count,
    weight: summary?.totalWeight || fallbackTotals.weight,
    revenue:
      !hasApiError &&
      summary?.totalRevenue &&
      typeof summary.totalRevenue === "number" &&
      !isNaN(summary.totalRevenue) &&
      summary.totalRevenue >= 0
        ? summary.totalRevenue
        : fallbackTotals.revenue,
  };

  console.log("History totals:", {
    summary: summary,
    fallback: fallbackTotals,
    final: todaysTotals,
    savedTransactionsCount: Array.isArray(savedTransactions)
      ? savedTransactions.length
      : 0,
    hasApiError,
  });

  const formatTime = (timestamp: string) => {
    try {
      if (!timestamp || typeof timestamp !== "string") {
        return "--:--";
      }
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "--:--";
      }
      return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "--:--";
    }
  };

  // Mock chart data for visual appeal - always show some data even in error state
  const chartData = [
    { day: "จ", amount: hasApiError ? 0 : 2400 },
    { day: "อ", amount: hasApiError ? 0 : 1800 },
    { day: "พ", amount: hasApiError ? 0 : 3200 },
    { day: "พฤ", amount: hasApiError ? 0 : 2800 },
    { day: "ศ", amount: hasApiError ? 0 : 3600 },
    { day: "ส", amount: hasApiError ? 0 : 4200 },
    { day: "อา", amount: todaysTotals.revenue || (hasApiError ? 0 : 2940) },
  ];

  const maxAmount =
    chartData.length > 0
      ? Math.max(
          ...chartData.map((d) =>
            d?.amount && typeof d.amount === "number" && !isNaN(d.amount)
              ? d.amount
              : 0
          )
        )
      : 1;

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
      {
        text: "ยกเลิก",
        style: "cancel",
      },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleOpenWebReport = async () => {
    try {
      setLoadingWebLink(true);
      const webUrl = await AuthAPI.generateWebAccessLink();

      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(webUrl);
      if (canOpen) {
        await Linking.openURL(webUrl);
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถเปิดลิงก์ได้");
      }
    } catch (error) {
      console.error("Error opening web report:", error);
      Alert.alert(
        "ข้อผิดพลาด",
        "ไม่สามารถเปิดรายงานบนเว็บได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoadingWebLink(false);
    }
  };

  // Show loading only on first load with better null safety
  if (
    transactionsLoading &&
    (!Array.isArray(transactions) || transactions.length === 0)
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B46A07" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
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
            colors={["#B46A07"]}
            tintColor="#B46A07"
          />
        }
      >
        {/* API Error Banner */}
        {hasApiError && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.errorBannerText}>
              มีปัญหาในการเชื่อมต่อ - แสดงข้อมูลเบื้องต้น
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>ภาพรวมยอดขาย</Text>
            <Text style={styles.headerSubtitle}>
              วันนี้ • {new Date().toLocaleDateString("th-TH")}
            </Text>
            {isAuthenticated && selectedFarm && (
              <Text style={styles.headerFarm}>
                ฟาร์ม: {selectedFarm.farmName}
              </Text>
            )}
          </View>
          {isAuthenticated && (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.webButton}
                onPress={handleOpenWebReport}
                disabled={loadingWebLink}
              >
                {loadingWebLink ? (
                  <ActivityIndicator size="small" color="#B46A07" />
                ) : (
                  <MaterialIcons
                    name="open-in-browser"
                    size={20}
                    color="#B46A07"
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <MaterialIcons name="logout" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={["#B46A07", "#D97706"]}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>ยอดขายวันนี้</Text>
            {summaryLoading ? (
              <ActivityIndicator
                size="small"
                color="rgba(255, 255, 255, 0.8)"
              />
            ) : (
              <MaterialIcons
                name={hasApiError ? "error-outline" : "visibility"}
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            )}
          </View>
          <Text style={styles.balanceAmount}>
            {formatThaiCurrency(todaysTotals.revenue)}
          </Text>
          <Text style={styles.balanceChange}>
            {hasApiError
              ? "ข้อมูลจากหน่วยความจำ"
              : summaryLoading
              ? "กำลังอัปเดต..."
              : "+12.5% จากเมื่อวาน"}
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
            <Text style={styles.statValue}>
              {formatWeight(todaysTotals.weight)}
            </Text>
            <Text style={styles.statLabel}>น้ำหนักรวม</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialIcons name="trending-up" size={24} color="#B46A07" />
            </View>
            <Text style={styles.statValue}>
              {todaysTotals.count > 0 && todaysTotals.revenue > 0
                ? formatThaiCurrency(todaysTotals.revenue / todaysTotals.count)
                : "฿0"}
            </Text>
            <Text style={styles.statLabel}>เฉลี่ย/รายการ</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>ยอดขาย 7 วันล่าสุด</Text>
          <View style={styles.chart}>
            {chartData.map((item, index) => {
              const safeAmount =
                typeof item?.amount === "number" ? item.amount : 0;
              const safeHeight =
                maxAmount > 0 ? (safeAmount / maxAmount) * 80 : 0;
              const safeDay = item?.day || "-";

              return (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(safeHeight, 2), // Minimum height for visibility
                        backgroundColor:
                          index === chartData.length - 1
                            ? "#B46A07"
                            : "#e5e7eb",
                      },
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

          {!Array.isArray(savedTransactions) ||
          savedTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>
                {hasApiError
                  ? "ไม่สามารถโหลดรายการได้"
                  : "ยังไม่มีรายการขายที่บันทึก"}
              </Text>
              <Text style={styles.emptySubtext}>
                {hasApiError
                  ? "กรุณาตรวจสอบการเชื่อมต่อ"
                  : "เริ่มต้นขายและบันทึกผลไม้เลย!"}
              </Text>
            </View>
          ) : (
            savedTransactions.slice(0, 5).map((transaction, index) => {
              // Enhanced safe data extraction with fallbacks
              const fruitEmoji =
                transaction?.fruit?.emoji &&
                typeof transaction.fruit.emoji === "string"
                  ? transaction.fruit.emoji
                  : "🍎";
              const fruitName =
                transaction?.fruit?.nameThai &&
                typeof transaction.fruit.nameThai === "string"
                  ? transaction.fruit.nameThai
                  : "ไม่ระบุชื่อผลไม้";
              const weight =
                transaction &&
                typeof transaction?.weightKg === "number" &&
                !isNaN(transaction.weightKg)
                  ? transaction.weightKg
                  : 0;
              const amount =
                transaction &&
                typeof transaction?.totalAmount === "number" &&
                !isNaN(transaction.totalAmount)
                  ? transaction.totalAmount
                  : 0;
              const timestamp =
                transaction?.createdAt &&
                typeof transaction.createdAt === "string"
                  ? transaction.createdAt
                  : "";

              return (
                <View
                  key={transaction?.transactionId || `transaction-${index}`}
                  style={styles.transactionCard}
                >
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  errorBannerText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Kanit-Medium",
    color: "#92400e",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontFamily: "Kanit-Medium",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Kanit-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#64748b",
    marginBottom: 4,
  },
  headerFarm: {
    fontSize: 12,
    fontFamily: "Kanit-Medium",
    color: "#B46A07",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  webButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    margin: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Kanit-Medium",
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: "Kanit-ExtraBold",
    color: "white",
    marginBottom: 8,
  },
  balanceChange: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Kanit-Medium",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Kanit-Bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Kanit-Regular",
    color: "#64748b",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "white",
    margin: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1e293b",
    marginBottom: 20,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Kanit-Medium",
  },
  transactionsContainer: {
    backgroundColor: "white",
    margin: 24,
    marginTop: 0,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  transactionsTitle: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1e293b",
  },
  viewAllText: {
    fontSize: 14,
    color: "#B46A07",
    fontFamily: "Kanit-Medium",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Kanit-Medium",
    color: "#64748b",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#94a3b8",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "Kanit-SemiBold",
    color: "#1e293b",
    marginBottom: 4,
  },
  transactionInfo: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#64748b",
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Kanit-Bold",
    color: "#B46A07",
  },
});
