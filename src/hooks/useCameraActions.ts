import { Alert } from "react-native";
import { THAI_TEXT } from "../lib/constants";
import { processPhotoWithGemini } from "../lib/geminiApi";
import { formatWeight } from "../lib/utils";
import { useTransactions } from "./useDatabase";

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

  const handleScan = () => {
    setStep("camera");
  };

  const handlePhotoTaken = async (photoPath: string) => {
    setCapturedPhotoPath(photoPath);
    setIsProcessingPhoto(true);

    try {
      console.log("Starting Gemini processing for photo:", photoPath);

      const result = await processPhotoWithGemini(photoPath);
      console.log("Gemini processing result:", result);

      setDetectedWeight(result.weight);
      setIsProcessingPhoto(false);
      setStep("select");

      if (result.confidence === "high") {
        console.log("High confidence weight detection:", result.weight, "kg");
      } else if (result.confidence === "medium") {
        Alert.alert(
          "ตรวจพบน้ำหนัก",
          `ตรวจพบน้ำหนัก ${formatWeight(
            result.weight
          )}\n(ความมั่นใจ: ปานกลาง)\n\nกรุณาตรวจสอบน้ำหนักให้ถูกต้อง`,
          [{ text: "ตกลง" }]
        );
      } else {
        Alert.alert(
          "ตรวจพบน้ำหนัก",
          `ตรวจพบน้ำหนัก ${formatWeight(
            result.weight
          )}\n(ความมั่นใจ: ต่ำ)\n\nกรุณาตรวจสอบและแก้ไขน้ำหนักในขั้นตอนถัดไป`,
          [{ text: "ตกลง" }]
        );
      }

      console.log(
        "Photo processed successfully:",
        photoPath,
        "Weight detected:",
        result.weight,
        "Confidence:",
        result.confidence
      );
    } catch (error) {
      console.error("Error processing photo:", error);
      setIsProcessingPhoto(false);

      let errorMessage: string = "ไม่สามารถตรวจสอบน้ำหนักได้ กรุณาลองอีกครั้ง";
      let showRetry = true;

      if (error instanceof Error) {
        if (error.message.includes("API key") || error.message.includes("Gemini")) {
          errorMessage = "การตั้งค่า Gemini API ไม่ถูกต้อง\n\nกรุณาตั้งค่า Gemini API Key ให้ถูกต้อง";
          showRetry = false;
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
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
            setDetectedWeight(1.0);
            setStep("weight");
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

  const handleConfirm = async () => {
    if (!selectedFruit || !detectedWeight) return;

    const total = detectedWeight * selectedFruit.pricePerKg;
    setTotalAmount(total);

    try {
      const transaction = await addTransaction({
        fruitId: selectedFruit.id,
        weightKg: detectedWeight,
        pricePerKg: selectedFruit.pricePerKg,
        totalAmount: total,
        isSaved: false,
      });

      setCurrentTransactionId(transaction.id);
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
    handleConfirm,
    handleQRPaymentSave,
  };
}
