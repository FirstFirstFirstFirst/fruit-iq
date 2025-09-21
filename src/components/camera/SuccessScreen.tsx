import { formatThaiCurrency, formatWeight } from "@/src/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { cameraStyles } from "./styles";

interface SuccessScreenProps {
  totalAmount: number;
  selectedFruitName?: string;
  detectedWeight?: number | null;
  onNewScan: () => void;
}

export default function SuccessScreen({
  totalAmount,
  selectedFruitName,
  detectedWeight,
  onNewScan,
}: SuccessScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={cameraStyles.container}>
      <LinearGradient
        colors={["#B46A07", "#D97706"]}
        style={cameraStyles.successGradient}
      >
        <View style={cameraStyles.successContent}>
          <View style={cameraStyles.successIcon}>
            <MaterialIcons name="check-circle" size={80} color="white" />
          </View>
          <Text style={cameraStyles.successTitle}>บันทึกสำเร็จ!</Text>
          <Text style={cameraStyles.successAmount}>
            {formatThaiCurrency(totalAmount)}
          </Text>
          <Text style={cameraStyles.successDetails}>
            {selectedFruitName || "ไม่ทราบชื่อ"} -{" "}
            {formatWeight(detectedWeight || 0)} - บันทึกแล้ว
          </Text>
          <View style={cameraStyles.successButtonContainer}>
            <TouchableOpacity
              style={cameraStyles.newScanButton}
              onPress={onNewScan}
            >
              <MaterialIcons name="camera-alt" size={20} color="white" />
              <Text style={cameraStyles.newScanText}>สแกนใหม่</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={cameraStyles.historyButton}
              onPress={() => router.push("/history")}
            >
              <MaterialIcons name="history" size={20} color="#B46A07" />
              <Text style={cameraStyles.historyText}>ดูประวัติ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
