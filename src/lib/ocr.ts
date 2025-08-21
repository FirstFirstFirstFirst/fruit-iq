export interface OCRResult {
  weight?: number;
  rawText: string;
  confidence: number;
}

export function extractWeightFromText(text: string): OCRResult {
  const rawText = text.trim();
  
  // Common patterns for digital scale displays
  const patterns = [
    // "2.45 kg", "2.45kg", "2.45 กก"
    /(\d+\.?\d*)\s*(?:kg|กก\.?|kilogram)/i,
    // "2.45 g" (convert to kg)
    /(\d+\.?\d*)\s*(?:g|กรัม|gram)/i,
    // Just numbers with decimal (assume kg if reasonable range)
    /^(\d{1,2}\.\d{1,3})$/,
    // Numbers without decimal but reasonable for kg
    /^(\d{1,3})$/,
  ];

  let weight: number | undefined;
  let confidence = 0;

  for (let i = 0; i < patterns.length; i++) {
    const match = text.match(patterns[i]);
    if (match) {
      const value = parseFloat(match[1]);
      
      // Pattern-specific processing
      if (i === 1) {
        // Convert grams to kg
        weight = value / 1000;
        confidence = 0.8;
      } else if (i === 2 || i === 3) {
        // Plain numbers - validate range
        if (value >= 0.01 && value <= 50) {
          weight = value;
          confidence = i === 2 ? 0.9 : 0.7;
        }
      } else {
        // kg patterns
        weight = value;
        confidence = 0.95;
      }
      break;
    }
  }

  // Validate weight range (0.01kg to 50kg seems reasonable for fruit)
  if (weight && (weight < 0.01 || weight > 50)) {
    weight = undefined;
    confidence = 0;
  }

  // Round to 2 decimal places
  if (weight) {
    weight = Math.round(weight * 100) / 100;
  }

  return {
    weight,
    rawText,
    confidence,
  };
}

export function formatWeightForDisplay(weight: number): string {
  return `${weight.toFixed(2)} กก.`;
}

// Mock OCR function for development (replace with real ML Kit implementation)
export async function performOCR(imageUri: string): Promise<OCRResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OCR results for testing
  const mockResults = [
    { text: "2.45 kg", weight: 2.45, confidence: 0.95 },
    { text: "1.23 กก", weight: 1.23, confidence: 0.90 },
    { text: "0.85", weight: 0.85, confidence: 0.85 },
    { text: "3250 g", weight: 3.25, confidence: 0.80 },
    { text: "invalid text", weight: undefined, confidence: 0 },
  ];
  
  // Return random mock result
  const mockResult = mockResults[Math.floor(Math.random() * mockResults.length)];
  return extractWeightFromText(mockResult.text);
}

// Preprocessing suggestions for better OCR
export interface ImageProcessingOptions {
  brightness?: number;
  contrast?: number;
  rotation?: number;
}

export function getImageProcessingTips(): string[] {
  return [
    "ถือกล้องให้มั่นคง",
    "ให้แสงส่องตาชั่งชัดเจน",
    "ถ่ายจากระยะ 10-20 ซม.",
    "หลีกเลี่ยงเงาบนหน้าจอตาชั่ง",
    "ตรวจสอบให้ตัวเลขชัดเจน",
  ];
}