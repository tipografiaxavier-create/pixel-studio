
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Refines a simple prompt into a high-quality descriptive prompt for Gemini Image.
 */
export const refinePrompt = async (basePrompt: string, style: string): Promise<string> => {
  if (!API_KEY) return basePrompt;
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this basic user prompt into a highly detailed, visually descriptive prompt for an AI image generator. 
    User Prompt: "${basePrompt}"
    Requested Style: "${style}"
    Focus on lighting, textures, composition, and specific visual elements. 
    Respond ONLY with the refined prompt string. Keep it under 150 words.`,
    config: {
      temperature: 0.7,
      topK: 40,
      topP: 0.9,
    }
  });

  return response.text || basePrompt;
};

/**
 * Generates an image based on a prompt and configuration.
 */
export const generateImage = async (
  prompt: string, 
  aspectRatio: AspectRatio = '1:1'
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    }
  });

  // Extract the image from candidates
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image data found in response.");
};

/**
 * Edits an existing image based on a prompt.
 */
export const editImage = async (
  base64Image: string, 
  prompt: string, 
  aspectRatio: AspectRatio = '1:1'
): Promise<string> => {
  if (!API_KEY) throw new Error("API Key is missing.");

  // Remove data:image/...;base64, prefix
  const rawBase64 = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: rawBase64,
            mimeType: mimeType,
          }
        },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    }
  });

  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("Failed to edit image.");
};
