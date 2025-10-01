import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

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

interface FarmSetupFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function FarmSetupForm({ onSuccess, onCancel }: FarmSetupFormProps) {
  const { createFarm } = useAuth();

  const [farmName, setFarmName] = useState("");
  const [farmProvince, setFarmProvince] = useState("");
  const [farmDurianSpecies, setFarmDurianSpecies] = useState("");
  const [farmSpace, setFarmSpace] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

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
          [{ text: "ตกลง", onPress: onSuccess }]
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

  return (
    <>
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

        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>ยกเลิก</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  inputLabel: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#374151",
    marginBottom: 12,
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
  cancelButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontFamily: "Kanit-Medium",
  },
});
