import { Alert } from "react-native";
import { CropSelection } from "../components/camera/constants";
import { THAI_TEXT } from "../lib/constants";
import { processPhotoWithOCR } from "../lib/ocrSpaceApi";
import { formatWeight } from "../lib/utils";
import { useTransactions } from "./useDatabase";

interface UseCameraActionsProps {
  setCapturedPhotoPath: (path: string | null) => void;
  setStep: (step: any) => void;
  setDetectedWeight: (weight: number | null) => void;
  setIsProcessingPhoto: (processing: boolean) => void;
  setCropSelection: (selection: CropSelection | null) => void;
  setSelectedFruitId: (id: number | null) => void;
  setTotalAmount: (amount: number) => void;
  setCurrentTransactionId: (id: number | null) => void;
  selectedFruit: any;
  detectedWeight: number | null;
  capturedPhotoPath: string | null;
  cropSelection: CropSelection | null;
}

export function useCameraActions({
  setCapturedPhotoPath,
  setStep,
  setDetectedWeight,
  setIsProcessingPhoto,
  setCropSelection,
  setSelectedFruitId,
  setTotalAmount,
  setCurrentTransactionId,
  selectedFruit,
  detectedWeight,
  capturedPhotoPath,
  cropSelection,
}: UseCameraActionsProps) {
  const { addTransaction } = useTransactions();

  const handleScan = () => {
    setStep("camera");
  };

  const handlePhotoTaken = (photoPath: string) => {
    setCapturedPhotoPath(photoPath);
    setStep("confirm-photo");
  };

  const handleCameraCancel = () => {
    setStep("scan");
    setCapturedPhotoPath(null);
  };

  const handleConfirmAndProcess = async () => {
    if (!capturedPhotoPath) return;

    setIsProcessingPhoto(true);

    try {
      console.log("Starting OCR processing for photo:", capturedPhotoPath);

      const result = await processPhotoWithOCR(
        capturedPhotoPath,
        cropSelection
      );
      console.log("OCR processing result:", result);

      setDetectedWeight(result.weight);
      setIsProcessingPhoto(false);
      setStep("select");

      if (result.confidence === "high") {
        console.log("High confidence weight detection:", result.weight, "kg");
      } else if (result.confidence === "medium") {
        Alert.alert(
          THAI_TEXT.ocrSuccess,
          `ตรวจพบน้ำหนัก ${formatWeight(
            result.weight
          )}\n(ความมั่นใจ: ปานกลาง)\n\nกรุณาตรวจสอบน้ำหนักให้ถูกต้อง`,
          [{ text: "ตกลง" }]
        );
      } else {
        Alert.alert(
          THAI_TEXT.ocrSuccess,
          `ตรวจพบน้ำหนัก ${formatWeight(
            result.weight
          )}\n(ความมั่นใจ: ต่ำ)\n\nกรุณาตรวจสอบและแก้ไขน้ำหนักในขั้นตอนถัดไป`,
          [{ text: "ตกลง" }]
        );
      }

      console.log(
        "Photo processed successfully:",
        capturedPhotoPath,
        "Weight detected:",
        result.weight,
        "Confidence:",
        result.confidence
      );
    } catch (error) {
      console.error("Error processing photo:", error);
      setIsProcessingPhoto(false);

      let errorMessage: string = THAI_TEXT.ocrFailed;
      let showRetry = true;

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage =
            THAI_TEXT.ocrConfigError +
            "\n\nกรุณาตั้งค่า OCR.space API Key ให้ถูกต้อง";
          showRetry = false;
        } else if (error.message.includes("401")) {
          errorMessage =
            THAI_TEXT.ocrConfigError +
            "\n\nOCR.space API Key ไม่ถูกต้องหรือหมดอายุ\nกรุณาตรวจสอบ API Key ของคุณ";
          showRetry = false;
        } else if (error.message.includes("429")) {
          errorMessage =
            THAI_TEXT.ocrConfigError +
            "\n\nใช้งาน OCR.space API เกินโควต้า (500 requests/day)\nกรุณาลองอีกครั้งพรุ่งนี้";
          showRetry = false;
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage = THAI_TEXT.ocrNetworkError;
        } else if (error.message.includes("weight")) {
          errorMessage = THAI_TEXT.ocrNoWeight;
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
          text: THAI_TEXT.retryOcr,
          onPress: () => setStep("camera"),
        });
      }

      Alert.alert("ข้อผิดพลาด", errorMessage, alertButtons);
    }
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
    handleConfirmAndProcess,
    handleFruitSelect,
    handleConfirm,
    handleQRPaymentSave,
  };
}
