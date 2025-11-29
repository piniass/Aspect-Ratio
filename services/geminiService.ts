import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client outside the function if possible, but inside is safer for env vars update in some environments
// However, per instructions, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a new version of the uploaded image with the specific aspect ratio.
 * 
 * @param base64Image The base64 string of the source image (including the data:image/... prefix).
 * @param aspectRatio The target aspect ratio string.
 * @returns The base64 string of the generated image.
 */
export const generateResizedImage = async (
  base64Image: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Extract the raw base64 data (remove data:image/png;base64, prefix)
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'image/png',
            },
          },
          {
            // We provide a prompt to guide the model. 
            // Since we are changing aspect ratio, the model needs to know to keep the content.
            text: "Recreate this image in high fidelity, adapting the composition to fit the new aspect ratio while preserving the original subject, style, and lighting.",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    // Parse the response to find the image part
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};