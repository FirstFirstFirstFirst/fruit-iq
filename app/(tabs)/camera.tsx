import React, { useState } from "react";
import { Alert, Modal } from "react-native";
import { useRouter } from "expo-router";
import CleanScannerScreen from "../../src/components/camera/CleanScannerScreen";
import LoadingScreen from "../../src/components/camera/LoadingScreen";
import AddFruitModal from "../../src/components/camera/modals/AddFruitModal";
import ContextMenu from "../../src/components/camera/modals/ContextMenu";
import DeleteConfirmModal from "../../src/components/camera/modals/DeleteConfirmModal";
import EmojiPickerModal from "../../src/components/camera/modals/EmojiPickerModal";
import FruitSelectionScreen from "../../src/components/camera/screens/FruitSelectionScreen";
import ManualWeightEntryScreen from "../../src/components/camera/screens/ManualWeightEntryScreen";
import WeightConfirmationScreen from "../../src/components/camera/screens/WeightConfirmationScreen";
import CartScreen from "../../src/components/camera/screens/CartScreen";
import QRPaymentScreen from "../../src/components/QRPaymentScreen";
import WeighScaleCamera from "../../src/components/WeighScaleCamera";
import { useFruits, useTransactions } from "../../src/hooks/useApi";
import { useCameraActions } from "../../src/hooks/useCameraActions";
import { useCameraState } from "../../src/hooks/useCameraState";
import { useFruitForm } from "../../src/hooks/useFruitForm";
import { useCart } from "../../src/hooks/useCart";
import type { PriceType } from "../../src/components/camera/modals/BulkPriceModal";

export default function CameraScreen() {
  const router = useRouter();
  const {
    fruits,
    addFruit,
    updateFruit,
    deleteFruit,
    loading: fruitsLoading,
  } = useFruits();
  const { addTransaction } = useTransactions();

  // Custom hooks
  const cameraState = useCameraState();
  const fruitForm = useFruitForm();
  const cart = useCart();

  // Track transaction IDs for cart items
  const [cartTransactionIds, setCartTransactionIds] = useState<number[]>([]);

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
    cart.clearCart();
    setCartTransactionIds([]);
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

  // Cart functions
  const handleAddToCart = async (
    weight: number,
    customTotal: number | null,
    priceType: PriceType
  ) => {
    if (!selectedFruit) return;

    try {
      // Calculate subtotal
      const subtotal =
        customTotal ?? weight * selectedFruit.pricePerKg;

      // Create transaction for this item
      const transaction = await addTransaction({
        fruitId: selectedFruit.fruitId,
        weightKg: weight,
        pricePerKg:
          priceType === "normal"
            ? selectedFruit.pricePerKg
            : subtotal / weight,
        totalAmount: subtotal,
      });

      // Add to cart
      cart.addItem({
        fruitId: selectedFruit.fruitId,
        fruitName: selectedFruit.nameThai,
        emoji: selectedFruit.emoji,
        weight,
        pricePerKg:
          priceType === "normal"
            ? selectedFruit.pricePerKg
            : subtotal / weight,
        // Use effective price per kg for bulk/custom
      });

      // Track transaction ID
      setCartTransactionIds((prev) => [...prev, transaction.transactionId]);

      // Go to cart review
      cameraState.setStep("cart-review");
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert(
        "ข้อผิดพลาด",
        "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองอีกครั้ง"
      );
    }
  };

  const handleCartAddMore = () => {
    // Reset for adding new item, but keep cart
    cameraState.setStep("scan");
    cameraState.setSelectedFruitId(null);
    cameraState.setDetectedWeight(null);
  };

  const handleCartCheckout = () => {
    if (cart.isEmpty) {
      Alert.alert("ตะกร้าว่าง", "กรุณาเพิ่มสินค้าก่อนชำระเงิน");
      return;
    }
    cameraState.setStep("qr-payment");
  };

  const handleCartClear = () => {
    cart.clearCart();
    setCartTransactionIds([]);
    cameraState.setStep("scan");
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

  // Manual weight entry - bypass camera OCR
  if (cameraState.step === "manual-weight") {
    return (
      <ManualWeightEntryScreen
        onConfirm={cameraActions.handleManualWeightConfirm}
        onBack={() => cameraState.setStep("scan")}
        onCancel={handleCancelFlow}
      />
    );
  }

  // Cart review screen
  if (cameraState.step === "cart-review") {
    return (
      <CartScreen
        items={cart.items}
        total={cart.total}
        onAddMore={handleCartAddMore}
        onCheckout={handleCartCheckout}
        onRemoveItem={cart.removeItem}
        onClearCart={handleCartClear}
        onBack={() => cameraState.setStep("scan")}
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
            onAddToCart={handleAddToCart}
            cartItemCount={cart.itemCount}
          />
        </Modal>
      </>
    );
  }

  // QR Payment screen - handles both single item and cart mode
  if (cameraState.step === "qr-payment") {
    const isCartMode = cart.items.length > 0;

    // Cart mode: show QR for cart total
    if (isCartMode) {
      return (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleQRPaymentCancel}
        >
          <QRPaymentScreen
            cartItems={cart.items}
            totalAmount={cart.total}
            transactionIds={cartTransactionIds}
            onSave={handleNewScan}
            onCancel={handleQRPaymentCancel}
          />
        </Modal>
      );
    }

    // Single item mode: show modals stack
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
