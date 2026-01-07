import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  // Fallback or empty check handled by the caller or UI
  return new GoogleGenAI({ apiKey });
};

export const checkSpellingAndClarify = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) return "Servicio de IA no disponible (Falta API Key)";
  
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful assistant for a delivery app in Spanish. 
      The user is typing a delivery order. 
      Your task is to correct any spelling errors and formatting issues in Spanish. 
      Return ONLY the corrected text. Do not add conversational filler.
      
      User text: "${text}"`,
    });
    
    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Return original if fails
  }
};