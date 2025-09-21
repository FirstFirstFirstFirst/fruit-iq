/**
 * Google Cloud Vision OCR Integration
 * Main service for processing images with Google Cloud Vision API
 */

import { OCR_CONFIG, OCR_ERROR_MESSAGES, OcrApiResponse, WeightDetectionResult } from './ocrConfig';
import { preprocessImageForOCR, validateImageUri } from './imageProcessor';
import { extractWeightFromText, preprocessTextForParsing } from './weightParser';

// API Key should be stored in environment variables or secure storage
// For demo purposes, this would be configured in app settings
const getApiKey = (): string | null => {
  // In production, this should come from secure environment variables
  // or user configuration in app settings
  console.log('Checking for API key:', !!process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY);
  return process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || null;
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

    // Step 2: Call Google Vision API
    console.log('Calling Google Vision API...');
    const ocrText = await callGoogleVisionAPI(processedImage.base64, apiKey);

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
 * Makes authenticated request to Google Cloud Vision API
 */
async function callGoogleVisionAPI(base64Image: string, apiKey: string): Promise<string> {
  try {
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ['th', 'en'], // Thai and English language hints
          },
        },
      ],
    };

    console.log('Making API request to Google Vision...');

    const response = await fetch(`${OCR_CONFIG.API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(OCR_CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(OCR_ERROR_MESSAGES.API_QUOTA_EXCEEDED);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: OcrApiResponse = await response.json();

    console.log('API response received');

    // Check for API errors
    if (data.responses[0]?.error) {
      const apiError = data.responses[0].error;
      console.error('Google Vision API error:', apiError);
      throw new Error(`API Error: ${apiError.message}`);
    }

    // Extract text from response
    const textAnnotations = data.responses[0]?.textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error(OCR_ERROR_MESSAGES.NO_TEXT_DETECTED);
    }

    // The first annotation contains all detected text
    const fullText = textAnnotations[0].description;
    if (!fullText) {
      throw new Error(OCR_ERROR_MESSAGES.NO_TEXT_DETECTED);
    }

    console.log('Extracted text from API:', fullText.substring(0, 200) + '...');

    return preprocessTextForParsing(fullText);

  } catch (error) {
    console.error('Google Vision API call failed:', error);

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
 * Tests API connection and configuration
 */
export async function testOcrConnection(): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log('OCR test failed: No API key configured');
      return false;
    }

    // Create a minimal test request
    const testResponse = await fetch(`${OCR_CONFIG.API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: {
            content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 white pixel
          },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
        }],
      }),
      signal: AbortSignal.timeout(5000),
    });

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

/**
 * Process photo with fallback to mock data if OCR fails
 * Provides graceful degradation for development and testing
 */
export async function processPhotoWithFallback(photoUri: string): Promise<WeightDetectionResult> {
  try {
    // Attempt real OCR processing
    return await processPhotoWithOCR(photoUri);
  } catch (error) {
    console.warn('OCR processing failed, using mock data:', error);

    // Fallback to mock weight detection for development
    const mockWeight = 1.25 + Math.random() * 2.42; // Random weight between 1.25-3.67 kg

    return {
      weight: Math.round(mockWeight * 100) / 100,
      confidence: 'low',
      rawText: 'Mock OCR fallback data',
      matchedPattern: `${mockWeight.toFixed(2)} kg (mock)`,
    };
  }
}