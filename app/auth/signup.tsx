import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import ConsentCheckbox from '../../src/components/ConsentCheckbox';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consent state
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ');
      return false;
    }

    if (name.trim().length < 2) {
      Alert.alert('ข้อผิดพลาด', 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมล');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('ข้อผิดพลาด', 'รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่าน');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    // Validate privacy consent FIRST
    if (!privacyAccepted) {
      Alert.alert(
        'ข้อผิดพลาด',
        'กรุณายอมรับนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ',
        [{ text: 'ตกลง' }]
      );
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const success = await signup(email.trim(), password, name.trim(), {
        privacyAccepted: privacyAccepted,
      });

      if (success) {
        // Navigate to main app - this will be handled by the navigation logic
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#B46A07', '#D97706']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <MaterialIcons name="person-add" size={60} color="white" />
              </View>
              <Text style={styles.title}>สมัครสมาชิก</Text>
              <Text style={styles.subtitle}>
                สร้างบัญชีใหม่เพื่อเริ่มใช้งาน WeighPay
              </Text>
            </View>

            {/* Signup Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>ชื่อ</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="person" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="กรอกชื่อของคุณ"
                      placeholderTextColor="#9ca3af"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>อีเมล</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="email" size={20} color="#6b7280" style={styles.inputIcon} />
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
                    <MaterialIcons name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>ยืนยันรหัสผ่าน</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="lock-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="ยืนยันรหัสผ่านของคุณ"
                      placeholderTextColor="#9ca3af"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <MaterialIcons
                        name={showConfirmPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Consent Section */}
                <View style={styles.consentSection}>
                  <ConsentCheckbox
                    label="ฉันยอมรับ"
                    linkText="นโยบายความเป็นส่วนตัว"
                    link="/privacy-policy"
                    required
                    value={privacyAccepted}
                    onChange={setPrivacyAccepted}
                  />
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  style={[styles.signupButton, (!privacyAccepted || isSubmitting || isLoading) && styles.signupButtonDisabled]}
                  onPress={handleSignup}
                  disabled={!privacyAccepted || isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="person-add" size={20} color="white" />
                      <Text style={styles.signupButtonText}>สมัครสมาชิก</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>มีบัญชีอยู่แล้ว? </Text>
                  <TouchableOpacity
                    onPress={navigateToLogin}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
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
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Kanit-Bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    backgroundColor: '#ffffff',
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
    fontFamily: 'Kanit-Regular',
    color: '#1f2937',
  },
  passwordInput: {
    paddingRight: 0,
  },
  passwordToggle: {
    padding: 16,
  },
  signupButton: {
    backgroundColor: '#B46A07',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Kanit-SemiBold',
    color: '#B46A07',
  },
  consentSection: {
    marginTop: 24,
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});