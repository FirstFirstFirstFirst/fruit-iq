import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSettings, useDatabase } from "../../src/hooks/useDatabase";

export default function HomeScreen() {
  const router = useRouter();
  const { height } = Dimensions.get('window');
  const isSmallScreen = height < 700;
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  
  // PromptPay setup state
  const { isInitialized } = useDatabase();
  const { promptpayPhone, setPromptpayPhone, loading: settingsLoading } = useSettings();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupInput, setSetupInput] = useState('');
  const [setupInputType, setSetupInputType] = useState<'phone' | 'id'>('phone');
  const [saving, setSaving] = useState(false);

  // Check if PromptPay is configured when database is ready
  useEffect(() => {
    if (isInitialized && !settingsLoading) {
      if (!promptpayPhone) {
        setShowSetupModal(true);
      }
    }
  }, [isInitialized, settingsLoading, promptpayPhone]);

  // Validation functions
  const isValidThaiPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\s|-/g, '');
    const patterns = [
      /^(\+66|0)[0-9]{9}$/, // +66xxxxxxxxx or 0xxxxxxxxx
      /^66[0-9]{9}$/        // 66xxxxxxxxx
    ];
    return patterns.some(pattern => pattern.test(cleaned));
  };

  const isValidThaiNationalId = (id: string): boolean => {
    const cleaned = id.replace(/\s|-/g, '');
    return /^[0-9]{13}$/.test(cleaned);
  };

  const handleSetupSave = async () => {
    if (!setupInput.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูล');
      return;
    }

    const isValid = setupInputType === 'phone' 
      ? isValidThaiPhoneNumber(setupInput)
      : isValidThaiNationalId(setupInput);

    if (!isValid) {
      const message = setupInputType === 'phone'
        ? 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง\nกรุณากรอกเป็น 0xxxxxxxxx หรือ +66xxxxxxxxx'
        : 'รูปแบบหมายเลขบัตรประชาชนไม่ถูกต้อง\nกรุณากรอก 13 หลัก';
      
      Alert.alert('ข้อมูลไม่ถูกต้อง', message);
      return;
    }

    try {
      setSaving(true);
      await setPromptpayPhone(setupInput.trim());
      setShowSetupModal(false);
      setSetupInput('');
      Alert.alert(
        'ตั้งค่าสำเร็จ!', 
        'คุณสามารถเริ่มใช้งาน WeighPay ได้แล้ว',
        [{ text: 'ตกลง' }]
      );
    } catch (error) {
      console.error('Error saving PromptPay setting:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  const handleStartUse = () => {
    if (!promptpayPhone && isInitialized) {
      setShowSetupModal(true);
    } else {
      router.push("/(tabs)/camera");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#B46A07", "#D97706"]} style={styles.gradient}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const isScrollableContent = contentSize.height > layoutMeasurement.height;
            setIsScrollable(isScrollableContent);
            
            // Hide scroll hint after user starts scrolling
            if (contentOffset.y > 20) {
              setShowScrollHint(false);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height - 100 }
          ]}
        >
          {/* Hero Section */}
          <View style={[styles.hero, isSmallScreen && styles.heroSmall]}>
            <View style={[styles.logoContainer, isSmallScreen && styles.logoContainerSmall]}>
              <MaterialIcons name="scale" size={isSmallScreen ? 48 : 60} color="white" />
            </View>
            <Text style={[styles.heroTitle, isSmallScreen && styles.heroTitleSmall]}>WeighPay</Text>
            <Text style={[styles.heroSubtitle, isSmallScreen && styles.heroSubtitleSmall]}>
              ระบบชั่งน้ำหนักและคำนวณราคา{"\n"}ผลไม้อัจฉริยะ
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={[styles.featuresTitle, isSmallScreen && styles.featuresTitleSmall]}>วิธีใช้งาน</Text>

            <View style={[styles.featureCard, isSmallScreen && styles.featureCardSmall]}>
              <View style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                <Feather name="camera" size={isSmallScreen ? 20 : 26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isSmallScreen && styles.featureTitleSmall]}>1. สแกนน้ำหนักผลไม้</Text>
                <Text style={[styles.featureDescription, isSmallScreen && styles.featureDescriptionSmall]}>
                  ตรวจจับน้ำหนักผลไม้อัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={[styles.featureCard, isSmallScreen && styles.featureCardSmall]}>
              <View style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                <MaterialIcons name="shopping-cart" size={isSmallScreen ? 20 : 26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isSmallScreen && styles.featureTitleSmall]}>2. เลือกผลไม้และคำนวณราคา</Text>
                <Text style={[styles.featureDescription, isSmallScreen && styles.featureDescriptionSmall]}>
                  เลือกผลไม้และคำนวณราคาอัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={[styles.featureCard, isSmallScreen && styles.featureCardSmall]}>
              <View style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                <MaterialIcons name="qr-code" size={isSmallScreen ? 20 : 26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isSmallScreen && styles.featureTitleSmall]}>
                  3. รับชำระเงินผ่าน QR Code
                </Text>
                <Text style={[styles.featureDescription, isSmallScreen && styles.featureDescriptionSmall]}>
                  สร้าง QR Code PromptPay
                </Text>
              </View> 
            </View>
          </View>

          {/* CTA Button */}
          <View style={[styles.ctaContainer, isSmallScreen && styles.ctaContainerSmall]}>
            <TouchableOpacity
              style={[styles.ctaButton, isSmallScreen && styles.ctaButtonSmall]}
              onPress={handleStartUse}
            >
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={[styles.ctaText, isSmallScreen && styles.ctaTextSmall]}>เริ่มใช้งาน</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Scroll Hint Indicator */}
        {isScrollable && showScrollHint && (
          <View style={[styles.scrollHint, { bottom: 100 }]}>
            <View style={styles.scrollDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.scrollHintText}>เลื่อนลงเพื่อดูเพิ่มเติม</Text>
          </View>
        )}
        
        {/* PromptPay Setup Modal */}
        <Modal
          visible={showSetupModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.setupIcon}>
                  <MaterialIcons name="qr-code" size={32} color="#B46A07" />
                </View>
                <Text style={styles.modalTitle}>ตั้งค่า PromptPay</Text>
                <Text style={styles.modalSubtitle}>
                  เพื่อใช้งานระบบชำระเงิน QR Code{'\n'}กรุณากรอกข้อมูลของคุณ
                </Text>
              </View>

              {/* Input Type Selector */}
              <View style={styles.inputTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.inputTypeButton,
                    setupInputType === 'phone' && styles.inputTypeButtonActive
                  ]}
                  onPress={() => {
                    setSetupInputType('phone');
                    setSetupInput('');
                  }}
                >
                  <MaterialIcons 
                    name="phone" 
                    size={20} 
                    color={setupInputType === 'phone' ? 'white' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.inputTypeText,
                    setupInputType === 'phone' && styles.inputTypeTextActive
                  ]}>
                    เบอร์โทรศัพท์
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.inputTypeButton,
                    setupInputType === 'id' && styles.inputTypeButtonActive
                  ]}
                  onPress={() => {
                    setSetupInputType('id');
                    setSetupInput('');
                  }}
                >
                  <MaterialIcons 
                    name="credit-card" 
                    size={20} 
                    color={setupInputType === 'id' ? 'white' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.inputTypeText,
                    setupInputType === 'id' && styles.inputTypeTextActive
                  ]}>
                    เลขบัตรประชาชน
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {setupInputType === 'phone' ? 'หมายเลขโทรศัพท์' : 'หมายเลขบัตรประชาชน'}
                </Text>
                <TextInput
                  style={styles.setupInput}
                  placeholder={
                    setupInputType === 'phone' 
                      ? '08xxxxxxxx หรือ +66xxxxxxxx' 
                      : '1234567890123 (13 หลัก)'
                  }
                  value={setupInput}
                  onChangeText={setSetupInput}
                  keyboardType={setupInputType === 'phone' ? 'phone-pad' : 'numeric'}
                  placeholderTextColor="#9ca3af"
                  maxLength={setupInputType === 'phone' ? 15 : 13}
                />
                
                <View style={styles.inputHint}>
                  <MaterialIcons name="info-outline" size={16} color="#6b7280" />
                  <Text style={styles.inputHintText}>
                    {setupInputType === 'phone'
                      ? 'ใช้หมายเลขโทรศัพท์ที่ผูกกับ PromptPay'
                      : 'ใช้หมายเลขบัตรประชาชนที่ผูกกับ PromptPay'
                    }
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.setupSaveButton}
                  onPress={handleSetupSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="save" size={20} color="white" />
                      <Text style={styles.setupSaveText}>บันทึกและเริ่มใช้งาน</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.setupSkipButton}
                  onPress={() => {
                    setShowSetupModal(false);
                    setSetupInput('');
                  }}
                  disabled={saving}
                >
                  <Text style={styles.setupSkipText}>ข้ามไปก่อน</Text>
                </TouchableOpacity>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>PromptPay คืออะไร?</Text>
                <View style={styles.infoItem}>
                  <MaterialIcons name="account-balance" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>
                    บริการโอนเงินผ่าน QR Code ของธนาคารไทย
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialIcons name="security" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>
                    ปลอดภัย รวดเร็ว ไม่มีค่าธรรมเนียม
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <MaterialIcons name="smartphone" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>
                    รองรับทุกแอปธนาคารในประเทศไทย
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  heroSmall: {
    paddingTop: 30,
    paddingBottom: 15,
  },
  logoContainer: {
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
  logoContainerSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Kanit-Bold",
    color: "white",
    marginBottom: 12,
  },
  heroTitleSmall: {
    fontSize: 24,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  heroSubtitleSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  featuresTitleSmall: {
    fontSize: 18,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  featureCardSmall: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 6,
  },
  featureTitleSmall: {
    fontSize: 14,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    lineHeight: 20,
  },
  featureDescriptionSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "white",
    alignItems: "center",
    marginTop: 'auto',
  },
  ctaContainerSmall: {
    paddingVertical: 16,
  },
  ctaButton: {
    backgroundColor: "#B46A07",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B46A07",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 150,
  },
  ctaButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  ctaText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    marginLeft: 6,
  },
  ctaTextSmall: {
    fontSize: 14,
  },
  scrollHint: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollDots: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
    marginHorizontal: 2,
  },
  dotActive: {
    backgroundColor: "#B46A07",
  },
  scrollHintText: {
    fontSize: 10,
    color: "#6b7280",
    fontFamily: "Kanit-Regular",
    textAlign: "center",
  },

  // PromptPay Setup Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  setupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(180, 106, 7, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Kanit-Bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputTypeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  inputTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  inputTypeButtonActive: {
    backgroundColor: '#B46A07',
    borderColor: '#B46A07',
  },
  inputTypeText: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#6b7280',
    marginLeft: 8,
  },
  inputTypeTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  setupInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  inputHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  inputHintText: {
    fontSize: 12,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    marginLeft: 6,
    lineHeight: 16,
  },
  modalActions: {
    gap: 12,
    marginBottom: 32,
  },
  setupSaveButton: {
    backgroundColor: '#B46A07',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  setupSaveText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    marginLeft: 8,
  },
  setupSkipButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  setupSkipText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
  infoSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Kanit-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
