import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface ManualWeightEntryScreenProps {
  onConfirm: (weight: number) => void;
  onBack: () => void;
  onCancel?: () => void;
}

export default function ManualWeightEntryScreen({
  onConfirm,
  onBack,
  onCancel,
}: ManualWeightEntryScreenProps) {
  const [weightString, setWeightString] = useState("");

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      setWeightString((prev) => prev.slice(0, -1));
      return;
    }

    if (key === ".") {
      // Only allow one decimal point
      if (weightString.includes(".")) return;
      // Don't start with decimal
      if (weightString === "") {
        setWeightString("0.");
        return;
      }
    }

    // Limit to 2 decimal places
    const parts = weightString.split(".");
    if (parts.length === 2 && parts[1].length >= 2 && key !== "backspace") {
      return;
    }

    // Limit total digits to prevent overflow
    if (weightString.replace(".", "").length >= 6 && key !== "backspace") {
      return;
    }

    setWeightString((prev) => prev + key);
  };

  const handleConfirm = () => {
    const weight = parseFloat(weightString);
    if (weight > 0) {
      onConfirm(weight);
    }
  };

  const displayWeight = weightString || "0";
  const parsedWeight = parseFloat(weightString) || 0;
  const isValid = parsedWeight > 0;

  const keypadKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "backspace"],
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="ย้อนกลับ"
        >
          <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>กรอกน้ำหนัก</Text>
        </View>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="ยกเลิก"
          >
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Weight Display */}
      <View style={styles.weightDisplayContainer}>
        <View style={styles.weightDisplay}>
          <Text style={styles.weightText}>{displayWeight}</Text>
          <Text style={styles.unitText}>กก.</Text>
        </View>
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {keypadKeys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keypadButton,
                  key === "backspace" && styles.backspaceButton,
                ]}
                onPress={() => handleKeyPress(key)}
                accessibilityRole="button"
                accessibilityLabel={
                  key === "backspace" ? "ลบ" : key === "." ? "จุดทศนิยม" : key
                }
              >
                {key === "backspace" ? (
                  <MaterialIcons name="backspace" size={28} color="#374151" />
                ) : (
                  <Text style={styles.keypadText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Confirm Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, !isValid && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!isValid}
          accessibilityRole="button"
          accessibilityLabel="เลือกผลไม้"
        >
          <Text style={styles.confirmButtonText}>เลือกผลไม้</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const KEYPAD_BUTTON_SIZE = Math.min((width - 80) / 3, 80);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Kanit-Bold",
    color: "#1f2937",
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  weightDisplayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  weightDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  weightText: {
    fontSize: 64,
    fontFamily: "Kanit-Bold",
    color: "#1f2937",
    minWidth: 150,
    textAlign: "right",
  },
  unitText: {
    fontSize: 24,
    fontFamily: "Kanit-Medium",
    color: "#6b7280",
    marginLeft: 12,
  },
  keypadContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  keypadButton: {
    width: KEYPAD_BUTTON_SIZE,
    height: KEYPAD_BUTTON_SIZE,
    borderRadius: KEYPAD_BUTTON_SIZE / 2,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  backspaceButton: {
    backgroundColor: "#fee2e2",
  },
  keypadText: {
    fontSize: 28,
    fontFamily: "Kanit-SemiBold",
    color: "#374151",
  },
  confirmButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#B46A07",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#B46A07",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Kanit-SemiBold",
  },
});
