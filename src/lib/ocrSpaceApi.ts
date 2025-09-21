/**
 * OCR.space API Integration
 * Main service for processing images with OCR.space API
 */

import { OCR_CONFIG, OCR_ERROR_MESSAGES, OcrSpaceApiResponse, WeightDetectionResult } from './ocrConfig';
import { preprocessImageForOCR, validateImageUri } from './imageProcessor';
import { extractWeightFromText, preprocessTextForParsing } from './weightParser';

// API Key should be stored in environment variables or secure storage
// For Expo apps, use EXPO_PUBLIC_ prefix for public environment variables
const getApiKey = (): string | null => {
  const apiKey = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY || null;
  console.log('Checking for OCR.space API key:', !!apiKey);

  if (!apiKey) {
    console.error('OCR.space API key not found. Please set EXPO_PUBLIC_OCR_SPACE_API_KEY in your environment variables.');
    console.log('To set up the API key:');
    console.log('1. Go to https://ocr.space/ocrapi');
    console.log('2. Register for a free account');
    console.log('3. Get your API key from the dashboard');
    console.log('4. Set EXPO_PUBLIC_OCR_SPACE_API_KEY in your .env file');
  }

  return apiKey;
};

/**
 * Main function to process photo with OCR and extract weight
 * Orchestrates the complete OCR workflow
 */
export async function processPhotoWithOCR(photoUri: string): Promise<WeightDetectionResult> {
  try {
    console.log('Starting OCR processing for photo:', photoUri);

    // Validate inputs
    if (!validateImageUri(photoUri)) {
      throw new Error(OCR_ERROR_MESSAGES.IMAGE_PROCESSING_ERROR);
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error(OCR_ERROR_MESSAGES.API_KEY_MISSING);
    }

    // Step 1: Preprocess image for optimal OCR
    console.log('Preprocessing image...');
    const processedImage = await preprocessImageForOCR(photoUri);

    // Step 2: Call OCR.space API
    console.log('Calling OCR.space API...');
    const ocrText = await callOCRSpaceAPI(processedImage.base64, apiKey);

    // Step 3: Extract weight from OCR text
    console.log('Extracting weight from text...');
    const weightResult = extractWeightFromText(ocrText);

    if (!weightResult) {
      throw new Error(OCR_ERROR_MESSAGES.NO_WEIGHT_FOUND);
    }

    console.log('OCR processing completed successfully:', weightResult);
    return weightResult;

  } catch (error) {
    console.error('OCR processing failed:', error);

    // Re-throw with appropriate error message
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(OCR_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

/**
 * Makes authenticated request to OCR.space API
 */
async function callOCRSpaceAPI(base64Image: string, apiKey: string): Promise<string> {
  try {
    // Create FormData for multipart request
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'tha'); // Thai language support
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2'); // OCR Engine 2 is generally better for Asian languages
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');

    console.log('Making API request to OCR.space...');

    // Create abort controller for timeout handling (React Native compatible)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, OCR_CONFIG.REQUEST_TIMEOUT);

    const response = await fetch(OCR_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'User-Agent': 'WeighPay/1.0 (React Native)',
      },
      body: formData,
      signal: abortController.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API Response Status: ${response.status} ${response.statusText}`);
      throw new Error(await handleOCRSpaceError(response));
    }

    const data: OcrSpaceApiResponse = await response.json();

    console.log('API response received');

    // Check for API errors in response
    if (!data.IsErroredOnProcessing && data.ParsedResults && data.ParsedResults.length > 0) {
      const parsedText = data.ParsedResults[0].ParsedText;

      if (!parsedText || parsedText.trim().length === 0) {
        throw new Error(OCR_ERROR_MESSAGES.NO_TEXT_DETECTED);
      }

      console.log('Extracted text from API:', parsedText.substring(0, 200) + '...');
      return preprocessTextForParsing(parsedText);
    } else {
      // Handle OCR.space specific errors
      const errorMessage = data.ErrorMessage?.join(', ') || 'Unknown OCR processing error';
      console.error('OCR.space API error:', errorMessage);
      throw new Error(`OCR Processing Error: ${errorMessage}`);
    }

  } catch (error) {
    console.error('OCR.space API call failed:', error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(OCR_ERROR_MESSAGES.NETWORK_ERROR);
      }
      if (error.message.includes('fetch')) {
        throw new Error(OCR_ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }

    throw new Error(OCR_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

/**
 * Handles OCR.space specific error responses
 */
async function handleOCRSpaceError(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    console.error('OCR.space Error Details:', errorData);

    if (response.status === 401) {
      return OCR_ERROR_MESSAGES.API_KEY_MISSING;
    } else if (response.status === 429) {
      return OCR_ERROR_MESSAGES.API_QUOTA_EXCEEDED;
    } else if (response.status === 400) {
      return 'ข้อมูลรูปภาพไม่ถูกต้องหรือไฟล์เสียหาย';
    } else if (response.status >= 500) {
      return 'เซิร์ฟเวอร์ OCR.space ขัดข้อง กรุณาลองอีกครั้งภายหลัง';
    }

    return `OCR.space API Error: ${response.status} ${response.statusText}`;
  } catch {
    return `OCR.space API Error: ${response.status} ${response.statusText}`;
  }
}

/**
 * Tests API connection and configuration
 */
export async function testOcrConnection(): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('OCR test failed: No API key configured');
      return false;
    }

    // Create a minimal test request with React Native compatible timeout
    const testAbortController = new AbortController();
    const testTimeoutId = setTimeout(() => {
      testAbortController.abort();
    }, 5000);

    // Create a small test image (1x1 white pixel)
    const testFormData = new FormData();
    testFormData.append('base64Image', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDX8AAAA');
    testFormData.append('language', 'eng');

    const testResponse = await fetch(OCR_CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: testFormData,
      signal: testAbortController.signal,
    });

    clearTimeout(testTimeoutId);

    const success = testResponse.status === 200;
    console.log('OCR connection test:', success ? 'PASSED' : 'FAILED');
    return success;

  } catch (error) {
    console.log('OCR connection test failed:', error);
    return false;
  }
}

/**
 * Gets current OCR service status and configuration
 */
export function getOcrStatus(): {
  configured: boolean;
  available: boolean;
  config: typeof OCR_CONFIG;
} {
  const apiKey = getApiKey();

  return {
    configured: !!apiKey,
    available: !!apiKey && typeof fetch !== 'undefined',
    config: OCR_CONFIG,
  };
}