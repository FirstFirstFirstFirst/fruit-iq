import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FarmSetupForm from "../../src/components/farm/FarmSetupForm";

export default function FarmSetupScreen() {
  const router = useRouter();

  const handleFarmSuccess = () => {
    router.replace("/(tabs)");
  };

  const handleCancel = () => {
    Alert.alert(
      "ยกเลิกการสร้างฟาร์ม?",
      "ข้อมูลที่กรอกจะไม่ถูกบันทึก คุณสามารถสร้างฟาร์มได้ในภายหลังจากหน้าหลัก",
      [
        {
          text: "ยังไม่ยกเลิก",
          style: "cancel",
        },
        {
          text: "ยกเลิก",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#B46A07", "#D97706"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <MaterialIcons name="agriculture" size={60} color="white" />
              </View>
              <Text style={styles.title}>ตั้งค่าฟาร์ม</Text>
              <Text style={styles.subtitle}>
                สร้างฟาร์มใหม่เพื่อเริ่มบันทึกกิจกรรม
              </Text>
            </View>

            {/* Farm Setup Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <FarmSetupForm
                  onSuccess={handleFarmSuccess}
                  onCancel={handleCancel}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 28,
    fontFamily: "Kanit-Bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
});
