export const COLORS = {
  primary: "hsl(142.1 76.2% 36.3%)", // Green for fruit theme
  primaryForeground: "hsl(355.7 100% 97.3%)",
  secondary: "hsl(210 40% 96%)",
  secondaryForeground: "hsl(222.2 84% 4.9%)",
  destructive: "hsl(0 84.2% 60.2%)",
  destructiveForeground: "hsl(210 40% 98%)",
  muted: "hsl(210 40% 96%)",
  mutedForeground: "hsl(215.4 16.3% 46.9%)",
  accent: "hsl(210 40% 96%)",
  accentForeground: "hsl(222.2 84% 4.9%)",
  background: "hsl(0 0% 100%)",
  foreground: "hsl(222.2 84% 4.9%)",
  card: "hsl(0 0% 100%)",
  cardForeground: "hsl(222.2 84% 4.9%)",
  border: "hsl(214.3 31.8% 91.4%)",
  input: "hsl(214.3 31.8% 91.4%)",
  ring: "hsl(142.1 76.2% 36.3%)",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const;

// Thai text constants
export const THAI_TEXT = {
  // Navigation
  setup: "ตั้งค่า",
  camera: "ถ่ายภาพ",
  history: "ประวัติ",
  settings: "การตั้งค่า",
  
  // Fruit management
  addFruit: "เพิ่มผลไม้",
  editFruit: "แก้ไขผลไม้",
  fruitName: "ชื่อผลไม้",
  pricePerKg: "ราคาต่อกิโลกรัม",
  save: "บันทึก",
  cancel: "ยกเลิก",
  delete: "ลบ",
  
  // Camera screen
  takePhoto: "ถ่ายภาพตาชั่ง",
  retakePhoto: "ถ่ายใหม่",
  weight: "น้ำหนัก",
  selectFruit: "เลือกผลไม้",
  calculatePrice: "คำนวณราคา",
  generateQR: "สร้าง QR Code",
  
  // Units
  kg: "กก.",
  baht: "฿",
  
  // Common actions
  confirm: "ยืนยัน",
  back: "กลับ",
  next: "ถัดไป",
  done: "เสร็จ",
  
  // Error messages
  errorOCR: "ไม่สามารถอ่านตัวเลขได้ กรุณาป้อนด้วยตัวเอง",
  errorCamera: "ไม่สามารถเปิดกล้องได้",
  errorSave: "ไม่สามารถบันทึกข้อมูลได้",
  
  // Tutorial
  tutorialStep1: "ตั้งค่าผลไม้และราคา",
  tutorialStep2: "ถ่ายภาพตาชั่งดิจิตอล",
  tutorialStep3: "ระบบจะอ่านน้ำหนักอัตโนมัติ",
  tutorialStep4: "สแกน QR Code เพื่อชำระเงิน",
} as const;