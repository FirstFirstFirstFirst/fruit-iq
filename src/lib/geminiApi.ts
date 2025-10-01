/**
 * Google Gemini API Integration
 * Service for processing scale images and extracting weight using Gemini Vision API
 */

import * as FileSystem from "expo-file-system";

const GEMINI_API_BASE_URL = process.env.EXPO_PUBLIC_GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';

export interface WeightDetectionResult {
  weight: number;
  confidence: "high" | "medium" | "low";
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// Get API key from environment variables
const getApiKey = (): string | null => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || null;
  console.log("Checking for Gemini API key:", !!apiKey);

  if (!apiKey) {
    console.error(
      "Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY in your environment variables."
    );
    console.log("To set up the API key:");
    console.log("1. Go to https://makersuite.google.com/app/apikey");
    console.log("2. Create a new API key");
    console.log("3. Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file");
  }

  return apiKey;
};

/**
 * Main function to process photo with Gemini and extract weight
 */
export async function processPhotoWithGemini(
  photoUri: string
): Promise<WeightDetectionResult> {
  try {
    console.log("Starting Gemini processing for photo:", photoUri);

    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    // Convert image to base64
    const base64Image = await convertImageToBase64(photoUri);

    // Call Gemini API
    const weightText = await callGeminiAPI(base64Image, apiKey);

    // Parse the JSON response
    const weightResult = parseWeightFromGeminiResponse(weightText);

    console.log("Gemini processing completed successfully:", weightResult);
    return weightResult;
  } catch (error) {
    console.error("Gemini processing failed:", error);
    throw error;
  }
}

/**
 * Convert image file to base64 format
 */
async function convertImageToBase64(photoUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(photoUri, {
      encoding: "base64",
    });
    return base64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw new Error("Failed to process image");
  }
}

/**
 * Makes request to Gemini Vision API
 */
async function callGeminiAPI(
  base64Image: string,
  apiKey: string
): Promise<string> {
  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: 'What weight is shown in this digital scale image? Answer only the kg part in JSON format. Your answer should start with ```json { "weight_in_kg": and end with ``` no comments.',
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    console.log("Making API request to Gemini...");

    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Gemini API Error: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    console.log("Gemini API response received");

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Gemini response text:", responseText);

    return responseText;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

/**
 * Parse weight from Gemini JSON response
 */
function parseWeightFromGeminiResponse(
  responseText: string
): WeightDetectionResult {
  try {
    // Extract JSON from response (handle ```json wrapper)
    const jsonMatch = responseText.match(/```json\s*(\{.*?\})\s*```/s);
    let jsonText = jsonMatch ? jsonMatch[1] : responseText;

    // Fallback: try to find just the JSON object
    if (!jsonMatch) {
      const objectMatch = responseText.match(/\{[^}]*"weight_in_kg"[^}]*\}/);
      if (objectMatch) {
        jsonText = objectMatch[0];
      }
    }

    console.log("Parsing JSON:", jsonText);

    const parsed = JSON.parse(jsonText);
    const weight = parsed.weight_in_kg;

    if (typeof weight !== "number" || isNaN(weight) || weight <= 0) {
      throw new Error("Invalid weight value detected");
    }

    // Determine confidence based on weight range (simple heuristic)
    let confidence: "high" | "medium" | "low" = "high";
    if (weight > 10 || weight < 0.01) {
      confidence = "low";
    } else if (weight > 5 || weight < 0.1) {
      confidence = "medium";
    }

    return {
      weight,
      confidence,
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to extract weight from image");
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.log("Gemini test failed: No API key configured");
      return false;
    }

    // Simple test request
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Hello" }],
            },
          ],
        }),
      }
    );

    const success = response.status === 200;
    console.log("Gemini connection test:", success ? "PASSED" : "FAILED");
    return success;
  } catch (error) {
    console.log("Gemini connection test failed:", error);
    return false;
  }
}

/**
 * Get current Gemini service status
 */
export function getGeminiStatus(): {
  configured: boolean;
  available: boolean;
} {
  const apiKey = getApiKey();

  return {
    configured: !!apiKey,
    available: !!apiKey && typeof fetch !== "undefined",
  };
}
