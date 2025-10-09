import React from "react";
import { Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import CleanScannerScreen from "../../src/components/camera/CleanScannerScreen";
import LoadingScreen from "../../src/components/camera/LoadingScreen";
import AddFruitModal from "../../src/components/camera/modals/AddFruitModal";
import ContextMenu from "../../src/components/camera/modals/ContextMenu";
import DeleteConfirmModal from "../../src/components/camera/modals/DeleteConfirmModal";
import EmojiPickerModal from "../../src/components/camera/modals/EmojiPickerModal";
import FruitSelectionScreen from "../../src/components/camera/screens/FruitSelectionScreen";
import WeightConfirmationScreen from "../../src/components/camera/screens/WeightConfirmationScreen";
import QRPaymentScreen from "../../src/components/QRPaymentScreen";
import WeighScaleCamera from "../../src/components/WeighScaleCamera";
import { useFruits } from "../../src/hooks/useApi";
import { useCameraActions } from "../../src/hooks/useCameraActions";
import { useCameraState } from "../../src/hooks/useCameraState";
import { useFruitForm } from "../../src/hooks/useFruitForm";

export default function CameraScreen() {
  const router = useRouter();
  const {
    fruits,
    addFruit,
    updateFruit,
    deleteFruit,
    loading: fruitsLoading,
  } = useFruits();

  // Custom hooks
  const cameraState = useCameraState();
  const fruitForm = useFruitForm();

  const selectedFruit = fruits?.find(
    (f) => f.fruitId === cameraState.selectedFruitId
  );

  const cameraActions = useCameraActions({
    setCapturedPhotoPath: cameraState.setCapturedPhotoPath,
    setStep: cameraState.setStep,
    setDetectedWeight: cameraState.setDetectedWeight,
    setIsProcessingPhoto: cameraState.setIsProcessingPhoto,
    setSelectedFruitId: cameraState.setSelectedFruitId,
    setTotalAmount: cameraState.setTotalAmount,
    setCurrentTransactionId: cameraState.setCurrentTransactionId,
    selectedFruit,
    detectedWeight: cameraState.detectedWeight,
    capturedPhotoPath: cameraState.capturedPhotoPath,
  });

  // Show loading while fruits are loading
  if (fruitsLoading) {
    return <LoadingScreen />;
  }

  const handleNewScan = () => {
    cameraState.resetCameraState();
    fruitForm.closeAllModals();
  };

  const handleQRPaymentCancel = () => {
    handleNewScan();
  };

  const handleCancelFlow = () => {
    Alert.alert("ยกเลิกการขาย?", "ข้อมูลที่กรอกจะไม่ถูกบันทึก", [
      {
        text: "ไม่ยกเลิก",
        style: "cancel",
      },
      {
        text: "ยกเลิก",
        style: "destructive",
        onPress: () => {
          handleNewScan();
        },
      },
    ]);
  };

  const handleDeleteFruit = async (fruitId: number) => {
    try {
      await deleteFruit(fruitId);
      fruitForm.setShowDeleteConfirm(null);
      Alert.alert("ลบสำเร็จ", "ผลไม้ได้รับการลบออกจากระบบแล้ว");
    } catch (error) {
      console.error("Error deleting fruit:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถลบผลไม้ได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleAddNewFruit = async () => {
    if (!fruitForm.isFormValid()) {
      Alert.alert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const { price, isValid } = fruitForm.getParsedPrice();
    if (!isValid) {
      Alert.alert("ราคาไม่ถูกต้อง", "กรุณากรอกราคาเป็นตัวเลขที่มากกว่า 0");
      return;
    }

    try {
      if (fruitForm.editingFruit) {
        await updateFruit(fruitForm.editingFruit.fruitId, {
          nameThai: fruitForm.newFruitName.trim(),
          nameEnglish: fruitForm.newFruitName.trim(),
          emoji: fruitForm.newFruitEmoji.trim(),
          pricePerKg: price,
          description: `ผลไม้ ${fruitForm.newFruitName.trim()}`,
        });
        Alert.alert("แก้ไขสำเร็จ", "ข้อมูลผลไม้ได้รับการอัปเดตแล้ว");
      } else {
        const newFruit = await addFruit({
          nameThai: fruitForm.newFruitName.trim(),
          nameEnglish: fruitForm.newFruitName.trim(),
          emoji: fruitForm.newFruitEmoji.trim(),
          pricePerKg: price,
          category: "other",
          description: `ผลไม้ ${fruitForm.newFruitName.trim()}`,
          nutritionFacts: {
            calories: 50,
            carbs: 12,
            fiber: 2,
            sugar: 8,
            protein: 1,
            fat: 0.2,
            vitamin_c: 20,
          },
        });

        cameraState.setSelectedFruitId(newFruit.fruitId);
        cameraState.setStep("weight");
      }

      fruitForm.setShowAddFruit(false);
      fruitForm.resetFruitForm();
    } catch (error) {
      console.error("Error saving fruit:", error);
      Alert.alert(
        "ข้อผิดพลาด",
        "ไม่สามารถบันทึกข้อมูลผลไม้ได้ กรุณาลองอีกครั้ง"
      );
    }
  };


  // Success handling - no longer a full screen, handled by Alert in handleQRPaymentSave
  // The success step is kept for state management but doesn't render anything
  if (cameraState.step === "success") {
    // Automatically reset after showing success alert
    handleNewScan();
    return null;
  }

  // Real camera step for photo capture
  if (cameraState.step === "camera") {
    return (
      <WeighScaleCamera
        onPhotoTaken={cameraActions.handlePhotoTaken}
        onCancel={cameraActions.handleCameraCancel}
        isVisible={true}
        isProcessing={cameraState.isProcessingPhoto}
      />
    );
  }

  // Clean camera scanner view - no overlay text
  if (cameraState.step === "scan") {
    return (
      <CleanScannerScreen
        isProcessingPhoto={cameraState.isProcessingPhoto}
        onScan={cameraActions.handleScan}
        onManualEntry={cameraActions.handleManualEntry}
        onCancel={() => router.push("/")}
      />
    );
  }

  // Beautiful fruit selection like food delivery app
  if (cameraState.step === "select") {
    return (
      <>
        <FruitSelectionScreen
          detectedWeight={cameraState.detectedWeight}
          fruits={fruits || []}
          onBack={() => cameraState.setStep("scan")}
          onFruitSelect={cameraActions.handleFruitSelect}
          onFruitLongPress={(fruitId) => fruitForm.setContextMenuFruit(fruitId)}
          onAddFruit={() => fruitForm.setShowAddFruit(true)}
          onCancel={handleCancelFlow}
        />

        <AddFruitModal
          visible={fruitForm.showAddFruit}
          editingFruit={fruitForm.editingFruit}
          newFruitName={fruitForm.newFruitName}
          newFruitPrice={fruitForm.newFruitPrice}
          newFruitEmoji={fruitForm.newFruitEmoji}
          onClose={() => {
            fruitForm.setShowAddFruit(false);
            fruitForm.resetFruitForm();
          }}
          onNameChange={fruitForm.setNewFruitName}
          onPriceChange={fruitForm.setNewFruitPrice}
          onEmojiChange={fruitForm.setNewFruitEmoji}
          onShowEmojiPicker={() => fruitForm.setShowEmojiPicker(true)}
          onSubmit={handleAddNewFruit}
          isFormValid={fruitForm.isFormValid()}
        />

        <ContextMenu
          visible={!!fruitForm.contextMenuFruit}
          onClose={() => fruitForm.setContextMenuFruit(null)}
          onEdit={() => {
            const fruit = fruits?.find(
              (f) => f.fruitId === fruitForm.contextMenuFruit
            );
            if (fruit) fruitForm.startEditFruit(fruit);
          }}
          onDelete={() => {
            if (fruitForm.contextMenuFruit) {
              fruitForm.setShowDeleteConfirm(fruitForm.contextMenuFruit);
            }
          }}
        />

        <EmojiPickerModal
          visible={fruitForm.showEmojiPicker}
          selectedEmoji={fruitForm.newFruitEmoji}
          onClose={() => fruitForm.setShowEmojiPicker(false)}
          onSelectEmoji={fruitForm.setNewFruitEmoji}
        />

        <DeleteConfirmModal
          visible={!!fruitForm.showDeleteConfirm}
          onClose={() => fruitForm.setShowDeleteConfirm(null)}
          onConfirm={() => {
            if (fruitForm.showDeleteConfirm) {
              handleDeleteFruit(fruitForm.showDeleteConfirm);
            }
          }}
        />
      </>
    );
  }

  // Weight confirmation - shown as modal over fruit selection
  if (cameraState.step === "weight") {
    return (
      <>
        <FruitSelectionScreen
          detectedWeight={cameraState.detectedWeight}
          fruits={fruits || []}
          onBack={() => cameraState.setStep("scan")}
          onFruitSelect={cameraActions.handleFruitSelect}
          onFruitLongPress={(fruitId) => fruitForm.setContextMenuFruit(fruitId)}
          onAddFruit={() => fruitForm.setShowAddFruit(true)}
          onCancel={handleCancelFlow}
        />
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => cameraState.setStep("select")}
        >
          <WeightConfirmationScreen
            selectedFruit={selectedFruit}
            detectedWeight={cameraState.detectedWeight}
            onBack={() => cameraState.setStep("select")}
            onConfirm={cameraActions.handleConfirm}
            onCancel={handleCancelFlow}
          />
        </Modal>
      </>
    );
  }

  // QR Payment screen - shown as modal over weight confirmation modal
  if (cameraState.step === "qr-payment") {
    return (
      <>
        {/* Base: Fruit Selection Screen */}
        <FruitSelectionScreen
          detectedWeight={cameraState.detectedWeight}
          fruits={fruits || []}
          onBack={() => cameraState.setStep("scan")}
          onFruitSelect={cameraActions.handleFruitSelect}
          onFruitLongPress={(fruitId) => fruitForm.setContextMenuFruit(fruitId)}
          onAddFruit={() => fruitForm.setShowAddFruit(true)}
          onCancel={handleCancelFlow}
        />

        {/* First Modal: Weight Confirmation */}
        <Modal
          visible={true}
          animationType="none"
          presentationStyle="pageSheet"
          transparent={false}
        >
          <WeightConfirmationScreen
            selectedFruit={selectedFruit}
            detectedWeight={cameraState.detectedWeight}
            onBack={() => cameraState.setStep("select")}
            onConfirm={cameraActions.handleConfirm}
            onCancel={handleCancelFlow}
          />
        </Modal>

        {/* Second Modal: QR Payment */}
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleQRPaymentCancel}
        >
          {selectedFruit &&
            cameraState.detectedWeight &&
            cameraState.currentTransactionId && (
              <QRPaymentScreen
                fruit={selectedFruit}
                weight={cameraState.detectedWeight}
                totalAmount={cameraState.totalAmount}
                transactionId={cameraState.currentTransactionId}
                onSave={cameraActions.handleQRPaymentSave}
                onCancel={handleQRPaymentCancel}
              />
            )}
        </Modal>
      </>
    );
  }

  return null;
}
