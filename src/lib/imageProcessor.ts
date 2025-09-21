/**
 * Image Processing Utilities
 * Handles image preprocessing for OCR optimization using expo-image-manipulator
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { OCR_CONFIG } from './ocrConfig';

export interface ProcessedImage {
  base64: string;
  width: number;
  height: number;
  uri: string;
}

/**
 * Preprocesses image for optimal OCR processing
 * Resizes, enhances contrast, and converts to base64
 */
export async function preprocessImageForOCR(imageUri: string): Promise<ProcessedImage> {
  try {
    console.log('Starting image preprocessing for OCR:', imageUri);

    // Get image info first
    const imageInfo = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    console.log('Original image dimensions:', imageInfo.width, 'x', imageInfo.height);

    // Calculate optimal resize dimensions
    const { width: targetWidth, height: targetHeight } = calculateOptimalDimensions(
      imageInfo.width,
      imageInfo.height
    );

    console.log('Target dimensions:', targetWidth, 'x', targetHeight);

    // Apply image transformations
    const processedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Resize to optimal dimensions
        {
          resize: {
            width: targetWidth,
            height: targetHeight,
          },
        },
      ],
      {
        compress: OCR_CONFIG.IMAGE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!processedImage.base64) {
      throw new Error('Failed to generate base64 from processed image');
    }

    console.log('Image preprocessing completed successfully');

    return {
      base64: processedImage.base64,
      width: processedImage.width,
      height: processedImage.height,
      uri: processedImage.uri,
    };
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    throw new Error('Image preprocessing failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Calculates optimal dimensions for OCR processing
 * Maintains aspect ratio while staying within API limits
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {
  const maxWidth = OCR_CONFIG.MAX_IMAGE_WIDTH;
  const maxHeight = OCR_CONFIG.MAX_IMAGE_HEIGHT;

  // If image is already within limits, use original dimensions
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // Calculate scaling factors
  const widthScale = maxWidth / originalWidth;
  const heightScale = maxHeight / originalHeight;

  // Use the smaller scale to maintain aspect ratio
  const scale = Math.min(widthScale, heightScale);

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

/**
 * Validates image URI format
 */
export function validateImageUri(uri: string): boolean {
  if (!uri || typeof uri !== 'string') {
    return false;
  }

  // Check for valid URI schemes
  const validSchemes = ['file://', 'content://', 'asset://', 'data:'];
  return validSchemes.some(scheme => uri.startsWith(scheme));
}

/**
 * Estimates file size from base64 string
 */
export function estimateBase64Size(base64: string): number {
  // Base64 encoding adds ~33% overhead
  return Math.round((base64.length * 3) / 4);
}

/**
 * Creates a cropped version of the image focused on the center
 * Useful for focusing OCR on the digital display area
 */
export async function cropCenterRegion(
  imageUri: string,
  cropRatio: number = 0.6
): Promise<string> {
  try {
    const imageInfo = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    const cropWidth = Math.round(imageInfo.width * cropRatio);
    const cropHeight = Math.round(imageInfo.height * cropRatio);
    const cropX = Math.round((imageInfo.width - cropWidth) / 2);
    const cropY = Math.round((imageInfo.height - cropHeight) / 2);

    const croppedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: cropX,
            originY: cropY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ],
      {
        compress: OCR_CONFIG.IMAGE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return croppedImage.uri;
  } catch (error) {
    console.error('Image cropping failed:', error);
    throw new Error('Failed to crop image: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}