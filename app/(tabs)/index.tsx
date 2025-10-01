import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthGuard from "../../src/components/AuthGuard";
import { useAuth } from "../../src/contexts/AuthContext";
import { useSettings } from "../../src/hooks/useApi";

// Thai provinces for dropdown
const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น",
  "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร",
  "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก",
  "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี",
  "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พังงา", "พัทลุง", "พิจิตร",
  "พิษณุโลก", "เพชรบูรณ์", "เพชรบุรี", "แพร่", "ภูเก็ต", "มหาสารคาม",
  "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง",
  "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
  "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม",
  "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี",
  "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อำนาจเจริญ", "อุดรธานี",
  "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี",
];

export default function HomeScreen() {
  const router = useRouter();
  const { height } = Dimensions.get("window");
  const isSmallScreen = height < 700;
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // PromptPay setup state
  const {
    promptpayPhone,
    updateSettings,
    loading: settingsLoading,
  } = useSettings();
  const { isAuthenticated, selectedFarm, farms, createFarm } = useAuth();
  const [showPromptPayModal, setShowPromptPayModal] = useState(false);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [setupInput, setSetupInput] = useState("");
  const [setupInputType, setSetupInputType] = useState<"phone" | "id">("phone");
  const [saving, setSaving] = useState(false);

  // Farm setup state
  const [farmName, setFarmName] = useState("");
  const [farmProvince, setFarmProvince] = useState("");
  const [farmDurianSpecies, setFarmDurianSpecies] = useState("");
  const [farmSpace, setFarmSpace] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  // Check farm and PromptPay setup status
  useEffect(() => {
    if (!settingsLoading && isAuthenticated) {
      // First check if user has a farm
      if (!selectedFarm && farms.length === 0) {
        setShowFarmModal(true);
      }
      // If user has farm but no PromptPay, show PromptPay setup
      else if (selectedFarm && !promptpayPhone) {
        setShowPromptPayModal(true);
      }
    }
  }, [settingsLoading, isAuthenticated, selectedFarm, farms, promptpayPhone]);

  // Validation functions
  const isValidThaiPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\s|-/g, "");
    const patterns = [
      /^(\+66|0)[0-9]{9}$/, // +66xxxxxxxxx or 0xxxxxxxxx
      /^66[0-9]{9}$/, // 66xxxxxxxxx
    ];
    return patterns.some((pattern) => pattern.test(cleaned));
  };

  const isValidThaiNationalId = (id: string): boolean => {
    const cleaned = id.replace(/\s|-/g, "");
    return /^[0-9]{13}$/.test(cleaned);
  };

  const handlePromptPaySave = async () => {
    if (!setupInput.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูล");
      return;
    }

    const isValid =
      setupInputType === "phone"
        ? isValidThaiPhoneNumber(setupInput)
        : isValidThaiNationalId(setupInput);

    if (!isValid) {
      const message =
        setupInputType === "phone"
          ? "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง\nกรุณากรอกเป็น 0xxxxxxxxx หรือ +66xxxxxxxxx"
          : "รูปแบบหมายเลขบัตรประชาชนไม่ถูกต้อง\nกรุณากรอก 13 หลัก";

      Alert.alert("ข้อมูลไม่ถูกต้อง", message);
      return;
    }

    try {
      setSaving(true);
      await updateSettings({
        promptpayPhone: setupInput.trim()
      });
      setShowPromptPayModal(false);
      setSetupInput("");
      Alert.alert("ตั้งค่าสำเร็จ!", "คุณสามารถเริ่มใช้งาน WeighPay ได้แล้ว", [
        { text: "ตกลง" },
      ]);
    } catch (error) {
      console.error("Error saving PromptPay setting:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const validateFarmForm = (): boolean => {
    if (!farmName.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกชื่อฟาร์ม");
      return false;
    }

    if (!farmProvince.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณาเลือกจังหวัด");
      return false;
    }

    if (!farmSpace.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกพื้นที่ฟาร์ม");
      return false;
    }

    const spaceNum = parseFloat(farmSpace);
    if (isNaN(spaceNum) || spaceNum <= 0) {
      Alert.alert("ข้อผิดพลาด", "พื้นที่ฟาร์มต้องเป็นตัวเลขที่มากกว่า 0");
      return false;
    }

    if (!latitude.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกละติจูด");
      return false;
    }

    const latNum = parseFloat(latitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      Alert.alert("ข้อผิดพลาด", "ละติจูดต้องอยู่ระหว่าง -90 ถึง 90");
      return false;
    }

    if (!longitude.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกลองจิจูด");
      return false;
    }

    const lngNum = parseFloat(longitude);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      Alert.alert("ข้อผิดพลาด", "ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180");
      return false;
    }

    return true;
  };

  const handleFarmCreate = async () => {
    if (!validateFarmForm()) return;

    try {
      setSaving(true);

      const farmData = {
        farmName: farmName.trim(),
        farmProvince: farmProvince.trim(),
        farmDurianSpecies: farmDurianSpecies.trim() || undefined,
        farmSpace: parseFloat(farmSpace),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const newFarm = await createFarm(farmData);

      if (newFarm) {
        setShowFarmModal(false);
        // Reset form
        setFarmName("");
        setFarmProvince("");
        setFarmDurianSpecies("");
        setFarmSpace("");
        setLatitude("");
        setLongitude("");
        Alert.alert(
          "สร้างฟาร์มสำเร็จ!",
          "ฟาร์มของคุณได้รับการสร้างแล้ว",
          [{ text: "ตกลง" }]
        );
      }
    } catch (error) {
      console.error("Farm creation error:", error);
    } finally {
      setSaving(false);
    }
  };

  const selectProvince = (province: string) => {
    setFarmProvince(province);
    setShowProvinceDropdown(false);
  };

  const filteredProvinces = THAI_PROVINCES.filter((province) =>
    province.toLowerCase().includes(farmProvince.toLowerCase())
  );

  const handleStartUse = () => {
    if (!selectedFarm && farms.length === 0) {
      setShowFarmModal(true);
    } else if (!promptpayPhone) {
      setShowPromptPayModal(true);
    } else {
      router.push("/(tabs)/camera");
    }
  };

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <LinearGradient colors={["#B46A07", "#D97706"]} style={styles.gradient}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={true}
            onScroll={(event) => {
              const { layoutMeasurement, contentOffset, contentSize } =
                event.nativeEvent;
              const isScrollableContent =
                contentSize.height > layoutMeasurement.height;
              setIsScrollable(isScrollableContent);

              // Hide scroll hint after user starts scrolling
              if (contentOffset.y > 20) {
                setShowScrollHint(false);
              }
            }}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Hero Section */}
            <View style={[styles.hero, isSmallScreen && styles.heroSmall]}>
              <View
                style={[
                  styles.logoContainer,
                  isSmallScreen && styles.logoContainerSmall,
                ]}
              >
                <MaterialIcons
                  name="scale"
                  size={isSmallScreen ? 48 : 60}
                  color="white"
                />
              </View>
              <Text
                style={[
                  styles.heroTitle,
                  isSmallScreen && styles.heroTitleSmall,
                ]}
              >
                WeighPay
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  isSmallScreen && styles.heroSubtitleSmall,
                ]}
              >
                ระบบชั่งน้ำหนักและคำนวณราคา{"\n"}ผลไม้อัจฉริยะ
              </Text>

              {/* Farm Status */}
              {isAuthenticated && selectedFarm && (
                <View style={styles.farmStatus}>
                  <MaterialIcons
                    name="agriculture"
                    size={16}
                    color="rgba(255, 255, 255, 0.9)"
                  />
                  <Text style={styles.farmStatusText}>
                    ฟาร์ม: {selectedFarm.farmName}
                  </Text>
                </View>
              )}
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text
                style={[
                  styles.featuresTitle,
                  isSmallScreen && styles.featuresTitleSmall,
                ]}
              >
                วิธีใช้งาน
              </Text>

              <View
                style={[
                  styles.featureCard,
                  isSmallScreen && styles.featureCardSmall,
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    isSmallScreen && styles.featureIconSmall,
                  ]}
                >
                  <Feather
                    name="camera"
                    size={isSmallScreen ? 20 : 26}
                    color="#B46A07"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text
                    style={[
                      styles.featureTitle,
                      isSmallScreen && styles.featureTitleSmall,
                    ]}
                  >
                    1. สแกนน้ำหนักผลไม้
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      isSmallScreen && styles.featureDescriptionSmall,
                    ]}
                  >
                    ตรวจจับน้ำหนักผลไม้อัตโนมัติ
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.featureCard,
                  isSmallScreen && styles.featureCardSmall,
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    isSmallScreen && styles.featureIconSmall,
                  ]}
                >
                  <MaterialIcons
                    name="shopping-cart"
                    size={isSmallScreen ? 20 : 26}
                    color="#B46A07"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text
                    style={[
                      styles.featureTitle,
                      isSmallScreen && styles.featureTitleSmall,
                    ]}
                  >
                    2. เลือกผลไม้และคำนวณราคา
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      isSmallScreen && styles.featureDescriptionSmall,
                    ]}
                  >
                    เลือกผลไม้และคำนวณราคาอัตโนมัติ
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.featureCard,
                  isSmallScreen && styles.featureCardSmall,
                ]}
              >
                <View
                  style={[
                    styles.featureIcon,
                    isSmallScreen && styles.featureIconSmall,
                  ]}
                >
                  <MaterialIcons
                    name="qr-code"
                    size={isSmallScreen ? 20 : 26}
                    color="#B46A07"
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text
                    style={[
                      styles.featureTitle,
                      isSmallScreen && styles.featureTitleSmall,
                    ]}
                  >
                    3. รับชำระเงินผ่าน QR Code
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      isSmallScreen && styles.featureDescriptionSmall,
                    ]}
                  >
                    สร้าง QR Code PromptPay
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <View
              style={[
                styles.ctaContainer,
                isSmallScreen && styles.ctaContainerSmall,
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  isSmallScreen && styles.ctaButtonSmall,
                ]}
                onPress={handleStartUse}
              >
                <MaterialIcons name="play-arrow" size={20} color="white" />
                <Text
                  style={[styles.ctaText, isSmallScreen && styles.ctaTextSmall]}
                >
                  เริ่มใช้งาน
                </Text>
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
              <Text style={styles.scrollHintText}>
                เลื่อนลงเพื่อดูเพิ่มเติม
              </Text>
            </View>
          )}

          {/* PromptPay Setup Modal */}
          <Modal
            visible={showPromptPayModal}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <SafeAreaView style={styles.modalContainer}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={true}
              >
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowPromptPayModal(false);
                    setSetupInput("");
                  }}
                  disabled={saving}
                >
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.setupIcon}>
                    <MaterialIcons name="qr-code" size={32} color="#B46A07" />
                  </View>
                  <Text style={styles.modalTitle}>ตั้งค่า PromptPay</Text>
                  <Text style={styles.modalSubtitle}>
                    เพื่อใช้งานระบบชำระเงิน QR Code{"\n"}กรุณากรอกข้อมูลของคุณ
                  </Text>
                </View>

                {/* Input Type Selector */}
                <View style={styles.inputTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.inputTypeButton,
                      setupInputType === "phone" &&
                        styles.inputTypeButtonActive,
                    ]}
                    onPress={() => {
                      setSetupInputType("phone");
                      setSetupInput("");
                    }}
                  >
                    <MaterialIcons
                      name="phone"
                      size={20}
                      color={setupInputType === "phone" ? "white" : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.inputTypeText,
                        setupInputType === "phone" &&
                          styles.inputTypeTextActive,
                      ]}
                    >
                      เบอร์โทรศัพท์
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.inputTypeButton,
                      setupInputType === "id" && styles.inputTypeButtonActive,
                    ]}
                    onPress={() => {
                      setSetupInputType("id");
                      setSetupInput("");
                    }}
                  >
                    <MaterialIcons
                      name="credit-card"
                      size={20}
                      color={setupInputType === "id" ? "white" : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.inputTypeText,
                        setupInputType === "id" && styles.inputTypeTextActive,
                      ]}
                    >
                      เลขบัตรประชาชน
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Input Field */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    {setupInputType === "phone"
                      ? "หมายเลขโทรศัพท์"
                      : "หมายเลขบัตรประชาชน"}
                  </Text>
                  <TextInput
                    style={styles.setupInput}
                    placeholder={
                      setupInputType === "phone"
                        ? "08xxxxxxxx หรือ +66xxxxxxxx"
                        : "1234567890123 (13 หลัก)"
                    }
                    value={setupInput}
                    onChangeText={setSetupInput}
                    keyboardType={
                      setupInputType === "phone" ? "phone-pad" : "numeric"
                    }
                    placeholderTextColor="#9ca3af"
                    maxLength={setupInputType === "phone" ? 15 : 13}
                  />

                  <View style={styles.inputHint}>
                    <MaterialIcons
                      name="info-outline"
                      size={16}
                      color="#6b7280"
                    />
                    <Text style={styles.inputHintText}>
                      {setupInputType === "phone"
                        ? "ใช้หมายเลขโทรศัพท์ที่ผูกกับ PromptPay"
                        : "ใช้หมายเลขบัตรประชาชนที่ผูกกับ PromptPay"}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.setupSaveButton}
                    onPress={handlePromptPaySave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <MaterialIcons name="save" size={20} color="white" />
                        <Text style={styles.setupSaveText}>
                          บันทึกและเริ่มใช้งาน
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </Modal>

          {/* Farm Setup Modal */}
          <Modal
            visible={showFarmModal}
            animationType="slide"
            presentationStyle="pageSheet"
          >
            <SafeAreaView style={styles.modalContainer}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={true}
              >
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowFarmModal(false);
                    setFarmName("");
                    setFarmProvince("");
                    setFarmDurianSpecies("");
                    setFarmSpace("");
                    setLatitude("");
                    setLongitude("");
                  }}
                  disabled={saving}
                >
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.setupIcon}>
                    <MaterialIcons name="agriculture" size={32} color="#B46A07" />
                  </View>
                  <Text style={styles.modalTitle}>ตั้งค่าฟาร์ม</Text>
                  <Text style={styles.modalSubtitle}>
                    สร้างฟาร์มใหม่เพื่อเริ่มบันทึกกิจกรรม
                  </Text>
                </View>

                {/* Farm Name */}
                <View style={styles.farmInputContainer}>
                  <Text style={styles.inputLabel}>ชื่อฟาร์ม *</Text>
                  <View style={styles.farmInputWrapper}>
                    <MaterialIcons
                      name="business"
                      size={20}
                      color="#6b7280"
                      style={styles.farmInputIcon}
                    />
                    <TextInput
                      style={styles.farmInput}
                      placeholder="เช่น ฟาร์มทุเรียนป้าแก้ว"
                      placeholderTextColor="#9ca3af"
                      value={farmName}
                      onChangeText={setFarmName}
                      editable={!saving}
                    />
                  </View>
                </View>

                {/* Farm Province */}
                <View style={styles.farmInputContainer}>
                  <Text style={styles.inputLabel}>จังหวัด *</Text>
                  <TouchableOpacity
                    style={styles.farmInputWrapper}
                    onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
                    disabled={saving}
                  >
                    <MaterialIcons
                      name="map"
                      size={20}
                      color="#6b7280"
                      style={styles.farmInputIcon}
                    />
                    <TextInput
                      style={[styles.farmInput, styles.selectInput]}
                      placeholder="เลือกจังหวัด"
                      placeholderTextColor="#9ca3af"
                      value={farmProvince}
                      onChangeText={setFarmProvince}
                      editable={!saving}
                    />
                    <MaterialIcons
                      name={showProvinceDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                      size={20}
                      color="#6b7280"
                      style={styles.dropdownIcon}
                    />
                  </TouchableOpacity>

                  {showProvinceDropdown && (
                    <View style={styles.dropdown}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {filteredProvinces.map((province, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => selectProvince(province)}
                          >
                            <Text style={styles.dropdownItemText}>{province}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Durian Species */}
                <View style={styles.farmInputContainer}>
                  <Text style={styles.inputLabel}>พันธุ์ทุเรียน</Text>
                  <View style={styles.farmInputWrapper}>
                    <MaterialIcons
                      name="nature"
                      size={20}
                      color="#6b7280"
                      style={styles.farmInputIcon}
                    />
                    <TextInput
                      style={styles.farmInput}
                      placeholder="เช่น หมอนทอง, ชะนี, กบ"
                      placeholderTextColor="#9ca3af"
                      value={farmDurianSpecies}
                      onChangeText={setFarmDurianSpecies}
                      editable={!saving}
                    />
                  </View>
                </View>

                {/* Farm Space */}
                <View style={styles.farmInputContainer}>
                  <Text style={styles.inputLabel}>พื้นที่ฟาร์ม (ไร่) *</Text>
                  <View style={styles.farmInputWrapper}>
                    <MaterialIcons
                      name="square-foot"
                      size={20}
                      color="#6b7280"
                      style={styles.farmInputIcon}
                    />
                    <TextInput
                      style={styles.farmInput}
                      placeholder="เช่น 10"
                      placeholderTextColor="#9ca3af"
                      value={farmSpace}
                      onChangeText={setFarmSpace}
                      keyboardType="decimal-pad"
                      editable={!saving}
                    />
                  </View>
                </View>

                {/* GPS Coordinates */}
                <View style={styles.farmInputContainer}>
                  <Text style={styles.inputLabel}>พิกัด GPS *</Text>
                  <View style={styles.coordinatesContainer}>
                    <View style={[styles.farmInputWrapper, styles.coordinateInput]}>
                      <MaterialIcons
                        name="my-location"
                        size={20}
                        color="#6b7280"
                        style={styles.farmInputIcon}
                      />
                      <TextInput
                        style={styles.farmInput}
                        placeholder="ละติจูด"
                        placeholderTextColor="#9ca3af"
                        value={latitude}
                        onChangeText={setLatitude}
                        keyboardType="decimal-pad"
                        editable={!saving}
                      />
                    </View>
                    <View style={[styles.farmInputWrapper, styles.coordinateInput]}>
                      <MaterialIcons
                        name="place"
                        size={20}
                        color="#6b7280"
                        style={styles.farmInputIcon}
                      />
                      <TextInput
                        style={styles.farmInput}
                        placeholder="ลองจิจูด"
                        placeholderTextColor="#9ca3af"
                        value={longitude}
                        onChangeText={setLongitude}
                        keyboardType="decimal-pad"
                        editable={!saving}
                      />
                    </View>
                  </View>
                  <Text style={styles.helpText}>
                    ใช้ Google Maps เพื่อค้นหาพิกัดของฟาร์ม
                  </Text>
                </View>

                {/* Action Button */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.setupSaveButton}
                    onPress={handleFarmCreate}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <MaterialIcons name="add-business" size={20} color="white" />
                        <Text style={styles.setupSaveText}>สร้างฟาร์ม</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B46A07",
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
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
  farmStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  farmStatusText: {
    fontSize: 14,
    fontFamily: "Kanit-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 6,
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
    marginTop: "auto",
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
    backgroundColor: "#ffffff",
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    paddingTop: 60,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(107, 114, 128, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
  },
  setupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(180, 106, 7, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Kanit-Bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  inputTypeContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  inputTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  inputTypeButtonActive: {
    backgroundColor: "#B46A07",
    borderColor: "#B46A07",
  },
  inputTypeText: {
    fontSize: 14,
    fontFamily: "Kanit-Medium",
    color: "#6b7280",
    marginLeft: 8,
  },
  inputTypeTextActive: {
    color: "white",
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#374151",
    marginBottom: 12,
  },
  setupInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    backgroundColor: "#ffffff",
    color: "#1f2937",
  },
  inputHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  inputHintText: {
    fontSize: 12,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    marginLeft: 6,
    lineHeight: 16,
  },
  modalActions: {
    gap: 12,
    marginBottom: 32,
  },
  setupSaveButton: {
    backgroundColor: "#B46A07",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B46A07",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  setupSaveText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    marginLeft: 8,
  },
  setupSkipButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  setupSkipText: {
    color: "#6b7280",
    fontSize: 16,
    fontFamily: "Kanit-Medium",
  },
  infoSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#374151",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },

  // Farm Setup Modal Styles
  farmInputContainer: {
    marginBottom: 20,
  },
  farmInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  farmInputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  farmInput: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "#1f2937",
  },
  selectInput: {
    paddingRight: 0,
  },
  dropdownIcon: {
    marginRight: 16,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "#1f2937",
  },
  coordinatesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 16,
  },
});
