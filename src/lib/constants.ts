// Simple constants for demo
export const THAI_TEXT = {
  // Basic actions
  confirm: 'Confirm',
  cancel: 'Cancel',

  // Weight and pricing
  weight: 'Weight',
  kg: 'kg',

  // Messages
  manualWeight: 'Enter weight manually',

  // OCR-related messages
  processingPhoto: 'กำลังประมวลผลรูปภาพ...',
  ocrProcessing: 'กำลังอ่านน้ำหนักจากรูปภาพ...',
  ocrSuccess: 'ตรวจพบน้ำหนัก',
  ocrFailed: 'ไม่สามารถอ่านน้ำหนักได้ กรุณาลองอีกครั้ง',
  ocrNoWeight: 'ไม่พบน้ำหนักในรูปภาพ กรุณาถ่ายใหม่',
  ocrInvalidWeight: 'น้ำหนักที่ตรวจพบไม่ถูกต้อง',
  ocrNetworkError: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ OCR ได้',
  ocrConfigError: 'การตั้งค่า OCR ไม่ถูกต้อง',
  retryOcr: 'ลองอีกครั้ง',
  enterManually: 'กรอกน้ำหนักเอง',
} as const