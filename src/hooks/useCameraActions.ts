import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { WeightDetectionAPI } from "../lib/api";
import { THAI_TEXT } from "../lib/constants";
import { formatWeight } from "../lib/utils";
import { useTransactions } from "./useApi";

interface UseCameraActionsProps {
  setCapturedPhotoPath: (path: string | null) => void;
  setStep: (step: any) => void;
  setDetectedWeight: (weight: number | null) => void;
  setIsProcessingPhoto: (processing: boolean) => void;
  setSelectedFruitId: (id: number | null) => void;
  setTotalAmount: (amount: number) => void;
  setCurrentTransactionId: (id: number | null) => void;
  selectedFruit: any;
  detectedWeight: number | null;
  capturedPhotoPath: string | null;
}

export function useCameraActions({
  setCapturedPhotoPath,
  setStep,
  setDetectedWeight,
  setIsProcessingPhoto,
  setSelectedFruitId,
  setTotalAmount,
  setCurrentTransactionId,
  selectedFruit,
  detectedWeight,
  capturedPhotoPath,
}: UseCameraActionsProps) {
  const { addTransaction } = useTransactions();
  const { selectedFarm } = useAuth();

  const handleScan = () => {
    setStep("camera");
  };

  const handlePhotoTaken = async (photoPath: string) => {
    setCapturedPhotoPath(photoPath);
    setIsProcessingPhoto(true);

    try {
      console.log("Starting weight detection for photo:", photoPath);

      // Resize and compress image to reduce payload size
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photoPath,
        [{ resize: { width: 1024 } }], // Resize to max width 1024px (maintains aspect ratio)
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log("Image compressed:", manipulatedImage.uri);

      // Convert compressed image to base64
      const base64Image = await FileSystem.readAsStringAsync(
        manipulatedImage.uri,
        {
          encoding: "base64",
        }
      );

      console.log(
        "Base64 size (approx):",
        Math.round(base64Image.length / 1024),
        "KB"
      );

      // Call Weight Detection API
      const result = await WeightDetectionAPI.processImage(base64Image);
      console.log("Weight detection result:", result);

      setDetectedWeight(result.weight);
      setIsProcessingPhoto(false);
      setStep("select");

      Alert.alert(
        "ตรวจพบน้ำหนัก",
        `ตรวจพบน้ำหนัก ${formatWeight(
          result.weight
        )}\n\nกรุณาตรวจสอบน้ำหนักให้ถูกต้องหลังเลือกผลไม้`,
        [{ text: "ตกลง" }]
      );

      console.log(
        "Photo processed successfully:",
        photoPath,
        "Weight detected:",
        result.weight
      );
    } catch (error) {
      console.error("Error processing photo:", error);
      setIsProcessingPhoto(false);

      let errorMessage: string = "ไม่สามารถตรวจสอบน้ำหนักได้ กรุณาลองอีกครั้ง";
      let showRetry = true;

      if (error instanceof Error) {
        if (
          error.message.includes("API key") ||
          error.message.includes("API")
        ) {
          errorMessage =
            "เซิร์ฟเวอร์ยังไม่พร้อมใช้งาน\n\nกรุณาติดต่อผู้ดูแลระบบ";
          showRetry = false;
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
        } else if (error.message.includes("weight")) {
          errorMessage = "ไม่พบน้ำหนักในรูปภาพ กรุณาถ่ายใหม่";
        } else {
          errorMessage = error.message;
        }
      }

      const alertButtons: { text: string; onPress: () => void }[] = [
        {
          text: THAI_TEXT.enterManually,
          onPress: () => {
            handleManualEntry();
          },
        },
      ];

      if (showRetry) {
        alertButtons.unshift({
          text: "ลองอีกครั้ง",
          onPress: () => setStep("camera"),
        });
      }

      Alert.alert("ข้อผิดพลาด", errorMessage, alertButtons);
    }
  };

  const handleCameraCancel = () => {
    setStep("scan");
    setCapturedPhotoPath(null);
  };

  const handleFruitSelect = (fruitId: number) => {
    setSelectedFruitId(fruitId);
    setStep("weight");
  };

  const handleManualEntry = () => {
    setDetectedWeight(null);
    setStep("select");
  };

  const handleConfirm = async (weight?: number) => {
    const finalWeight = weight ?? detectedWeight;
    if (!selectedFruit || !finalWeight) return;

    const total = finalWeight * selectedFruit.pricePerKg;
    setTotalAmount(total);

    // Update detectedWeight state so QR screen can access it
    setDetectedWeight(finalWeight);

    try {
      const transaction = await addTransaction({
        fruitId: selectedFruit.fruitId,
        weightKg: finalWeight,
        pricePerKg: selectedFruit.pricePerKg,
        totalAmount: total,
        farmId: selectedFarm?.farmId,
      });

      setCurrentTransactionId(transaction.transactionId);
      setStep("qr-payment");
    } catch (error) {
      console.error("Failed to create transaction:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถสร้างรายการได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleQRPaymentSave = () => {
    setStep("success");
  };

  return {
    handleScan,
    handlePhotoTaken,
    handleCameraCancel,
    handleFruitSelect,
    handleManualEntry,
    handleConfirm,
    handleQRPaymentSave,
  };
}
