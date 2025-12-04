import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading, farms, selectedFarm } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
      {
        text: "ยกเลิก",
        style: "cancel",
      },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <LinearGradient colors={["#B46A07", "#D97706"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={60} color="white" />
          </View>
          <Text style={styles.userName}>{user?.name || "ผู้ใช้งาน"}</Text>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>
        </View>

        {/* Content Card */}
        <ScrollView
          style={styles.contentCard}
          contentContainerStyle={styles.contentCardInner}
          showsVerticalScrollIndicator={false}
        >
          {/* Farm Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ฟาร์มของฉัน</Text>
            {selectedFarm ? (
              <View style={styles.farmCard}>
                <View style={styles.farmIconContainer}>
                  <MaterialIcons name="agriculture" size={24} color="#B46A07" />
                </View>
                <View style={styles.farmInfo}>
                  <Text style={styles.farmName}>{selectedFarm.farmName}</Text>
                  <Text style={styles.farmDetail}>
                    {selectedFarm.farmProvince || "ไม่มีที่อยู่"}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noFarmText}>ยังไม่มีฟาร์ม</Text>
            )}
            {farms.length > 1 && (
              <Text style={styles.farmCount}>
                ฟาร์มทั้งหมด: {farms.length} ฟาร์ม
              </Text>
            )}
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>การตั้งค่า</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/auth/login")}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#374151" />
              <Text style={styles.menuItemText}>สลับบัญชี</Text>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Linking.openURL(
                "https://durico-web.vercel.app/privacy?app=weighpay"
              )}
              accessibilityRole="button"
              accessibilityLabel="นโยบายความเป็นส่วนตัว"
            >
              <MaterialIcons name="policy" size={24} color="#374151" />
              <Text style={styles.menuItemText}>นโยบายความเป็นส่วนตัว</Text>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              (isLoggingOut || isLoading) && styles.logoutButtonDisabled,
            ]}
            onPress={handleLogout}
            disabled={isLoggingOut || isLoading}
          >
            {isLoggingOut || isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <MaterialIcons name="logout" size={20} color="white" />
                <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version Info */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Kanit-Bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "rgba(255, 255, 255, 0.9)",
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentCardInner: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Kanit-SemiBold",
    color: "#374151",
    marginBottom: 12,
  },
  farmCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  farmIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 2,
  },
  farmDetail: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
  },
  noFarmText: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 16,
  },
  farmCount: {
    fontSize: 12,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "#374151",
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Kanit-Regular",
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },
});
