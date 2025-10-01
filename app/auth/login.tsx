import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/contexts/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมล");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("ข้อผิดพลาด", "รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกรหัสผ่าน");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const success = await login(email.trim(), password);

      if (success) {
        // Navigate to main app - this will be handled by the navigation logic
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToSignup = () => {
    router.push("/auth/signup");
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <MaterialIcons name="scale" size={60} color="white" />
              </View>
              <Text style={styles.title}>เข้าสู่ระบบ</Text>
              <Text style={styles.subtitle}>
                เข้าสู่ระบบเพื่อเริ่มใช้งาน WeighPay
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>อีเมล</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="email"
                      size={20}
                      color="#6b7280"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="กรอกอีเมลของคุณ"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>รหัสผ่าน</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="lock"
                      size={20}
                      color="#6b7280"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      placeholderTextColor="#9ca3af"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    (isSubmitting || isLoading) && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="login" size={20} color="white" />
                      <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Signup Link */}
                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>ยังไม่มีบัญชี? </Text>
                  <TouchableOpacity
                    onPress={navigateToSignup}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.signupLink}>สมัครสมาชิก</Text>
                  </TouchableOpacity>
                </View>
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
  },
  header: {
    alignItems: "center",
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "#1f2937",
  },
  passwordInput: {
    paddingRight: 0,
  },
  passwordToggle: {
    padding: 16,
  },
  loginButton: {
    backgroundColor: "#B46A07",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#B46A07",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    marginLeft: 8,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
  },
  signupLink: {
    fontSize: 14,
    fontFamily: "Kanit-SemiBold",
    color: "#B46A07",
  },
});
