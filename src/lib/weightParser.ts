/**
 * Weight Parser
 * Extracts weight values from OCR text using pattern matching
 */

import { WEIGHT_PATTERNS, OCR_CONFIG, WeightDetectionResult } from './ocrConfig';

/**
 * Extracts weight from OCR text using multiple patterns
 * Returns the most confident weight detection result
 */
export function extractWeightFromText(text: string): WeightDetectionResult | null {
  if (!text || typeof text !== 'string') {
    console.log('Invalid input text for weight extraction');
    return null;
  }

  console.log('Extracting weight from text:', text.substring(0, 100) + '...');

  const candidates: {
    weight: number;
    confidence: 'high' | 'medium' | 'low';
    matchedPattern: string;
    position: number;
  }[] = [];

  // Try each pattern in order of preference
  WEIGHT_PATTERNS.forEach((pattern, patternIndex) => {
    const matches = Array.from(text.matchAll(pattern));

    matches.forEach(match => {
      const weightStr = match[1];
      const weight = parseFloat(weightStr);

      if (validateWeightValue(weight)) {
        const confidence = determineConfidence(patternIndex, match[0], text);

        candidates.push({
          weight,
          confidence,
          matchedPattern: match[0],
          position: match.index || 0,
        });

        console.log(`Found weight candidate: ${weight} kg (confidence: ${confidence}, pattern: "${match[0]}")`);
      }
    });
  });

  if (candidates.length === 0) {
    console.log('No valid weight candidates found');
    return null;
  }

  // Sort by confidence and position preference
  const bestCandidate = selectBestCandidate(candidates);

  console.log(`Selected best weight: ${bestCandidate.weight} kg`);

  return {
    weight: bestCandidate.weight,
    confidence: bestCandidate.confidence,
    rawText: text,
    matchedPattern: bestCandidate.matchedPattern,
  };
}

/**
 * Validates if a weight value is within acceptable bounds
 */
export function validateWeightValue(weight: number): boolean {
  if (typeof weight !== 'number' || isNaN(weight)) {
    return false;
  }

  return weight >= OCR_CONFIG.MIN_WEIGHT && weight <= OCR_CONFIG.MAX_WEIGHT;
}

/**
 * Determines confidence level based on pattern type and context
 */
function determineConfidence(
  patternIndex: number,
  matchedText: string,
  fullText: string
): 'high' | 'medium' | 'low' {
  // Patterns with units (kg, กก.) get higher confidence
  if (patternIndex <= 3) {
    return 'high';
  }

  // Decimal numbers get medium confidence
  if (patternIndex === 4 && matchedText.includes('.')) {
    return 'medium';
  }

  // Check if the number appears in a scale-like context
  const contextWords = [
    'kg', 'กก', 'กิโล', 'weight', 'น้ำหนัก', 'ชั่ง', 'scale',
    'mass', 'มวล', 'หนัก', 'gram', 'กรัม'
  ];

  const hasContext = contextWords.some(word =>
    fullText.toLowerCase().includes(word.toLowerCase())
  );

  return hasContext ? 'medium' : 'low';
}

/**
 * Selects the best weight candidate from available options
 */
function selectBestCandidate(candidates: {
  weight: number;
  confidence: 'high' | 'medium' | 'low';
  matchedPattern: string;
  position: number;
}[]): typeof candidates[0] {
  // Sort by confidence first, then by position (prefer earlier matches)
  const confidenceOrder = { high: 3, medium: 2, low: 1 };

  return candidates.sort((a, b) => {
    const confidenceDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    if (confidenceDiff !== 0) return confidenceDiff;

    // If confidence is equal, prefer earlier position
    return a.position - b.position;
  })[0];
}

/**
 * Extracts all potential weight values for debugging
 */
export function extractAllWeights(text: string): {
  weight: number;
  pattern: string;
  confidence: string;
}[] {
  const results: {
    weight: number;
    pattern: string;
    confidence: string;
  }[] = [];

  WEIGHT_PATTERNS.forEach((pattern, index) => {
    const matches = Array.from(text.matchAll(pattern));

    matches.forEach(match => {
      const weight = parseFloat(match[1]);
      if (validateWeightValue(weight)) {
        results.push({
          weight,
          pattern: match[0],
          confidence: determineConfidence(index, match[0], text),
        });
      }
    });
  });

  return results;
}

/**
 * Formats weight value to standard display format
 */
export function formatDetectedWeight(weight: number): number {
  // Round to 2 decimal places for display
  return Math.round(weight * 100) / 100;
}

/**
 * Preprocesses text to improve weight detection
 */
export function preprocessTextForParsing(text: string): string {
  if (!text) return '';

  // Normalize common OCR mistakes and formatting issues
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Fix common OCR mistakes for Thai characters
    .replace(/กก\s*\./g, 'กก.')
    .replace(/กิโลกรัม/g, 'กิโลกรัม')
    // Fix common OCR mistakes for English
    .replace(/kg\s*\./g, 'kg.')
    .replace(/kilogram\s*/g, 'kilogram ')
    // Normalize decimal separators
    .replace(/,(\d)/g, '.$1')  // Convert comma decimals to dots
    .trim();
}