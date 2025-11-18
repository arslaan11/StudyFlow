import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Chapter, Flashcard } from "../types";

// Initialize API
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FAST = 'gemini-2.5-flash';

// --- Syllabus Generation ---

export const generateSyllabus = async (subject: string, examType: string): Promise<Chapter[]> => {
  const prompt = `Generate a list of key chapters for the subject "${subject}" specifically for a student preparing for "${examType}". 
  For each chapter, estimate the study hours required (integer) and difficulty (Easy, Medium, Hard).`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        estimatedHours: { type: Type.INTEGER },
        difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
      },
      required: ['name', 'estimatedHours', 'difficulty'],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const rawData = JSON.parse(response.text || '[]');
    
    // Map to our internal Chapter type
    return rawData.map((item: any) => ({
      id: crypto.randomUUID(),
      name: item.name,
      estimatedHours: item.estimatedHours,
      difficulty: item.difficulty,
      isCompleted: false
    }));
  } catch (error) {
    console.error("Error generating syllabus:", error);
    return [];
  }
};

// --- Flashcard Generation ---

export const generateFlashcards = async (topic: string, count: number = 5): Promise<Flashcard[]> => {
  const prompt = `Create ${count} effective study flashcards for the topic: "${topic}". 
  Keep the questions concise and answers clear.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING, description: "The question or term on the front" },
        back: { type: Type.STRING, description: "The answer or definition on the back" },
      },
      required: ['front', 'back'],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const rawData = JSON.parse(response.text || '[]');
    
    return rawData.map((item: any) => ({
      id: crypto.randomUUID(),
      front: item.front,
      back: item.back,
      status: 'new'
    }));
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
};

// --- Doubt Solver (Multimodal) ---

export const solveDoubt = async (text: string, base64Image?: string): Promise<string> => {
  try {
    const parts: any[] = [];
    
    if (base64Image) {
      // Strip header if present (data:image/png;base64,)
      const cleanBase64 = base64Image.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    parts.push({ text: text });

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: { parts },
      config: {
        systemInstruction: "You are a helpful, encouraging study companion. Explain concepts simply and clearly. If the user uploads an image of a problem, solve it step-by-step."
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error solving doubt:", error);
    return "Sorry, I encountered an error while trying to solve your doubt.";
  }
};
