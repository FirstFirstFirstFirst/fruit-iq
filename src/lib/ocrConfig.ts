/**
 * OCR Configuration
 * OCR.space API configuration and constants
 */

export const OCR_CONFIG = {
  // OCR.space API endpoint
  API_ENDPOINT: 'https://api.ocr.space/parse/image',

  // Image processing settings
  MAX_IMAGE_WIDTH: 1024,
  MAX_IMAGE_HEIGHT: 1024,
  IMAGE_QUALITY: 0.8,

  // Weight detection parameters
  MIN_WEIGHT: 0.01,  // Minimum valid weight (10g)
  MAX_WEIGHT: 50.0,  // Maximum valid weight (50kg)

  // API request timeout
  REQUEST_TIMEOUT: 15000, // 15 seconds
} as const;

export const WEIGHT_PATTERNS = [
  // Thai patterns
  /(\d+\.?\d*)\s*กก\.?/gi,           // "1.25 กก." or "1.25กก"
  /(\d+\.?\d*)\s*กิโลกรัม/gi,        // "1.25 กิโลกรัม"

  // English patterns
  /(\d+\.?\d*)\s*kg\.?/gi,           // "1.25 kg" or "1.25kg"
  /(\d+\.?\d*)\s*kilograms?/gi,      // "1.25 kilogram"

  // Generic number patterns (fallback)
  /(\d+\.\d{1,3})/g,                 // "1.250" (with decimal)
  /(\d+)/g,                          // "2" (whole numbers)
] as const;

export const OCR_ERROR_MESSAGES = {
  API_KEY_MISSING: 'OCR.space API key ไม่ได้ถูกตั้งค่า',
  NETWORK_ERROR: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ OCR.space ได้',
  IMAGE_PROCESSING_ERROR: 'ไม่สามารถประมวลผลรูปภาพได้',
  NO_TEXT_DETECTED: 'ไม่พบข้อความในรูปภาพ',
  NO_WEIGHT_FOUND: 'ไม่พบน้ำหนักในรูปภาพ',
  INVALID_WEIGHT: 'น้ำหนักที่ตรวจพบไม่ถูกต้อง',
  API_QUOTA_EXCEEDED: 'ใช้งาน OCR.space API เกินโควต้า (500 requests/day)',
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
} as const;

export interface OcrSpaceApiResponse {
  ParsedResults: {
    TextOverlay?: {
      Lines: {
        LineText: string;
        Words: {
          WordText: string;
          Left: number;
          Top: number;
          Height: number;
          Width: number;
        }[];
      }[];
    };
    TextOrientation: string;
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }[];
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds: string;
  SearchablePDFURL?: string;
  ErrorMessage?: string[];
  ErrorDetails?: string;
}

export interface WeightDetectionResult {
  weight: number;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
  matchedPattern: string;
}