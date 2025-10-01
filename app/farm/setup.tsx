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

// Thai provinces for dropdown
const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย',
  'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา',
  'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์',
  'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบูรณ์', 'เพชรบุรี', 'แพร่', 'ภูเก็ต', 'มหาสารคาม',
  'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
  'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี',
  'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อำนาจเจริญ', 'อุดรธานี',
  'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

export default function FarmSetupScreen() {
  const router = useRouter();
  const { createFarm, isLoading } = useAuth();

  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmProvince, setFarmProvince] = useState('');
  const [farmDurianSpecies, setFarmDurianSpecies] = useState('');
  const [farmSpace, setFarmSpace] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  const validateForm = (): boolean => {
    if (!farmName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อฟาร์ม');
      return false;
    }

    if (!farmProvince.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกจังหวัด');
      return false;
    }

    if (!farmSpace.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกพื้นที่ฟาร์ม');
      return false;
    }

    const spaceNum = parseFloat(farmSpace);
    if (isNaN(spaceNum) || spaceNum <= 0) {
      Alert.alert('ข้อผิดพลาด', 'พื้นที่ฟาร์มต้องเป็นตัวเลขที่มากกว่า 0');
      return false;
    }

    if (!latitude.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกละติจูด');
      return false;
    }

    const latNum = parseFloat(latitude);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      Alert.alert('ข้อผิดพลาด', 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90');
      return false;
    }

    if (!longitude.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกลองจิจูด');
      return false;
    }

    const lngNum = parseFloat(longitude);
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      Alert.alert('ข้อผิดพลาด', 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180');
      return false;
    }

    return true;
  };

  const handleCreateFarm = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const farmData = {
        farmName: farmName.trim(),
        farmLocation: farmLocation.trim() || undefined,
        farmProvince: farmProvince.trim(),
        farmDurianSpecies: farmDurianSpecies.trim() || undefined,
        farmSpace: parseFloat(farmSpace),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const newFarm = await createFarm(farmData);

      if (newFarm) {
        Alert.alert(
          'สร้างฟาร์มสำเร็จ!',
          'ฟาร์มของคุณได้รับการสร้างแล้ว คุณสามารถเริ่มใช้งานได้เลย',
          [
            {
              text: 'ตกลง',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Farm creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectProvince = (province: string) => {
    setFarmProvince(province);
    setShowProvinceDropdown(false);
  };

  const filteredProvinces = THAI_PROVINCES.filter(province =>
    province.toLowerCase().includes(farmProvince.toLowerCase())
  );

  const handleCancel = () => {
    Alert.alert(
      'ยกเลิกการสร้างฟาร์ม?',
      'ข้อมูลที่กรอกจะไม่ถูกบันทึก คุณสามารถสร้างฟาร์มได้ในภายหลัง',
      [
        {
          text: 'ไม่ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ยกเลิก',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
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
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              disabled={isSubmitting}
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
                {/* Farm Name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>ชื่อฟาร์ม *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="business" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="เช่น ฟาร์มทุเรียนป้าแก้ว"
                      placeholderTextColor="#9ca3af"
                      value={farmName}
                      onChangeText={setFarmName}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Farm Location */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>ที่ตั้งฟาร์ม</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="location-on" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="เช่น ตำบลป่าซาง อำเภอแม่ริม"
                      placeholderTextColor="#9ca3af"
                      value={farmLocation}
                      onChangeText={setFarmLocation}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Farm Province */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>จังหวัด *</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
                    disabled={isSubmitting}
                  >
                    <MaterialIcons name="map" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.selectInput]}
                      placeholder="เลือกจังหวัด"
                      placeholderTextColor="#9ca3af"
                      value={farmProvince}
                      onChangeText={setFarmProvince}
                      editable={!isSubmitting}
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
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>พันธุ์ทุเรียน</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="nature" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="เช่น หมอนทอง, ชะนี, กบ"
                      placeholderTextColor="#9ca3af"
                      value={farmDurianSpecies}
                      onChangeText={setFarmDurianSpecies}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* Farm Space */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>พื้นที่ฟาร์ม (ไร่) *</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="square-foot" size={20} color="#6b7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="เช่น 10"
                      placeholderTextColor="#9ca3af"
                      value={farmSpace}
                      onChangeText={setFarmSpace}
                      keyboardType="decimal-pad"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                {/* GPS Coordinates */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>พิกัด GPS *</Text>
                  <View style={styles.coordinatesContainer}>
                    <View style={[styles.inputWrapper, styles.coordinateInput]}>
                      <MaterialIcons name="my-location" size={20} color="#6b7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="ละติจูด"
                        placeholderTextColor="#9ca3af"
                        value={latitude}
                        onChangeText={setLatitude}
                        keyboardType="decimal-pad"
                        editable={!isSubmitting}
                      />
                    </View>
                    <View style={[styles.inputWrapper, styles.coordinateInput]}>
                      <MaterialIcons name="place" size={20} color="#6b7280" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="ลองจิจูด"
                        placeholderTextColor="#9ca3af"
                        value={longitude}
                        onChangeText={setLongitude}
                        keyboardType="decimal-pad"
                        editable={!isSubmitting}
                      />
                    </View>
                  </View>
                  <Text style={styles.helpText}>
                    ใช้ Google Maps เพื่อค้นหาพิกัดของฟาร์ม
                  </Text>
                </View>

                {/* Create Farm Button */}
                <TouchableOpacity
                  style={[styles.createButton, (isSubmitting || isLoading) && styles.createButtonDisabled]}
                  onPress={handleCreateFarm}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="add-business" size={20} color="white" />
                      <Text style={styles.createButtonText}>สร้างฟาร์ม</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Skip Button */}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleCancel}
                  disabled={isSubmitting}
                >
                  <Text style={styles.skipButtonText}>ข้ามไปก่อน</Text>
                </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  selectInput: {
    paddingRight: 0,
  },
  dropdownIcon: {
    marginRight: 16,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
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
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Kanit-Regular',
    color: '#1f2937',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Kanit-Regular',
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },
  createButton: {
    backgroundColor: '#B46A07',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-SemiBold',
    marginLeft: 8,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
  },
});