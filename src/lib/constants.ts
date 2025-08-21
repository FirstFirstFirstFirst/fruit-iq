// Phuket fruit presets based on the research data
export const PHUKET_FRUITS = [
  // Popular tropical fruits
  { id: 1, nameThai: 'มะม่วง', nameEnglish: 'Mango', defaultPrice: 80 },
  { id: 2, nameThai: 'เงาะ', nameEnglish: 'Rambutan', defaultPrice: 60 },
  { id: 3, nameThai: 'มังคุด', nameEnglish: 'Mangosteen', defaultPrice: 120 },
  { id: 4, nameThai: 'สับปะรดภูเก็ต', nameEnglish: 'Phuket Pineapple', defaultPrice: 40 },
  { id: 5, nameThai: 'แก้วมังกร', nameEnglish: 'Dragon Fruit', defaultPrice: 70 },
  { id: 6, nameThai: 'ทุเรียน', nameEnglish: 'Durian', defaultPrice: 200 },
  { id: 7, nameThai: 'มะละกอ', nameEnglish: 'Papaya', defaultPrice: 30 },
  { id: 8, nameThai: 'ฝรั่ง', nameEnglish: 'Guava', defaultPrice: 50 },
  { id: 9, nameThai: 'แตงโม', nameEnglish: 'Watermelon', defaultPrice: 25 },
  { id: 10, nameThai: 'มะพร้าว', nameEnglish: 'Coconut', defaultPrice: 35 },
  
  // Seasonal specialties
  { id: 11, nameThai: 'ลิ้นจี่', nameEnglish: 'Lychee', defaultPrice: 100 },
  { id: 12, nameThai: 'ลำไย', nameEnglish: 'Longan', defaultPrice: 80 },
  { id: 13, nameThai: 'ขนุน', nameEnglish: 'Jackfruit', defaultPrice: 45 },
  { id: 14, nameThai: 'ชมพู่', nameEnglish: 'Rose Apple', defaultPrice: 60 },
  { id: 15, nameThai: 'น้อยหน่า', nameEnglish: 'Custard Apple', defaultPrice: 90 },
  { id: 16, nameThai: 'มะฟื้อง', nameEnglish: 'Star Fruit', defaultPrice: 55 },
  { id: 17, nameThai: 'ส้มโอ', nameEnglish: 'Pomelo', defaultPrice: 65 },
  
  // Local varieties
  { id: 18, nameThai: 'สละ', nameEnglish: 'Snake Fruit', defaultPrice: 85 },
  { id: 19, nameThai: 'มะปรางหวาน', nameEnglish: 'Plum Mango', defaultPrice: 75 },
  { id: 20, nameThai: 'ส้มเขียวหวาน', nameEnglish: 'Thai Orange', defaultPrice: 40 },
  { id: 21, nameThai: 'ทับทิม', nameEnglish: 'Pomegranate', defaultPrice: 110 },
  { id: 22, nameThai: 'กระท้อน', nameEnglish: 'Kraton', defaultPrice: 95 },
  { id: 23, nameThai: 'มะกอก', nameEnglish: 'Makok', defaultPrice: 70 },
  { id: 24, nameThai: 'ฟักข้าว', nameEnglish: 'Gac', defaultPrice: 150 },
  { id: 25, nameThai: 'มะยงชิด', nameEnglish: 'Ma Yong Chit', defaultPrice: 120 },
] as const

// Thai text constants
export const THAI_TEXT = {
  // Navigation
  setup: 'ตั้งค่า',
  camera: 'ถ่ายรูป',
  history: 'ประวัติ',
  settings: 'การตั้งค่า',
  
  // Actions
  takePicture: 'ถ่ายรูปน้ำหนัก',
  retake: 'ถ่ายใหม่',
  confirm: 'ยืนยัน',
  cancel: 'ยกเลิก',
  save: 'บันทึก',
  delete: 'ลบ',
  edit: 'แก้ไข',
  add: 'เพิ่ม',
  
  // Fruit management
  addFruit: 'เพิ่มผลไม้',
  editFruit: 'แก้ไขผลไม้',
  fruitName: 'ชื่อผลไม้',
  pricePerKg: 'ราคาต่อกิโลกรัม',
  
  // Weight and pricing
  weight: 'น้ำหนัก',
  price: 'ราคา',
  total: 'รวม',
  baht: 'บาท',
  kg: 'กิโลกรัม',
  
  // QR Code
  qrCode: 'คิวอาร์โค้ด',
  promptPay: 'พร้อมเพย์',
  scanToPay: 'สแกนเพื่อชำระเงิน',
  
  // History and accounting
  todaysSales: 'ยอดขายวันนี้',
  totalRevenue: 'รายได้รวม',
  transactions: 'รายการขาย',
  
  // Tutorial
  tutorial: 'คำแนะนำ',
  step1: '1. ถ่ายรูปตาชั่งดิจิตอล',
  step2: '2. เลือกผลไม้และราคา',
  step3: '3. แสดง QR Code ให้ลูกค้า',
  step4: '4. รอลูกค้าสแกนและชำระ',
  
  // Messages
  noFruits: 'ยังไม่มีผลไม้ กรุณาเพิ่มผลไม้ก่อน',
  weightNotDetected: 'ไม่พบน้ำหนัก กรุณาป้อนด้วยตนเอง',
  manualWeight: 'ป้อนน้ำหนักด้วยตนเอง',
  
  // Errors
  error: 'เกิดข้อผิดพลาด',
  cameraError: 'ไม่สามารถเปิดกล้องได้',
  saveError: 'ไม่สามารถบันทึกได้',
} as const

// Color scheme optimized for Thai market and low-tech users
export const COLORS = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  thai: {
    red: '#B41E3D',
    blue: '#2D4A7C',
    gold: '#FFD700',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const

// Screen dimensions for large buttons (optimized for basic smartphones)
export const DIMENSIONS = {
  buttonHeight: 60,
  iconSize: 32,
  cardPadding: 16,
  screenPadding: 20,
} as const