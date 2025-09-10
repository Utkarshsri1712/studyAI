
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, GeneratedQuestions, Topic } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonResponse = <T,>(jsonString: string): T | null => {
  try {
    // The response can sometimes be wrapped in ```json ... ```, so we extract it.
    const match = jsonString.match(/```json\n([\s\S]*?)\n```/);
    const cleanedString = match ? match[1] : jsonString;
    return JSON.parse(cleanedString.trim()) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Original string:", jsonString);
    return null;
  }
};


export const analyzeDocument = async (text: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize the following text and extract the top 5 most important keywords. Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise summary of the provided text.",
          },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of the top 5 most relevant keywords from the text.",
          },
        },
        required: ["summary", "keywords"],
      },
    },
  });

  const result = parseJsonResponse<AnalysisResult>(response.text);
  if (!result) {
    throw new Error("Failed to parse document analysis response.");
  }
  return result;
};

export const generateQuestions = async (text: string): Promise<GeneratedQuestions> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on the following text, generate 3 multiple-choice questions, 2 short-answer questions (for 2-3 marks), and 1 long-answer question (for 12 marks). Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mcqs: {
            type: Type.ARRAY,
            description: "An array of multiple-choice questions.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING, description: "The correct option text." },
              },
              required: ["question", "options", "answer"],
            },
          },
          shortAnswers: {
            type: Type.ARRAY,
            description: "An array of short-answer questions.",
            items: { type: Type.STRING },
          },
          longAnswers: {
            type: Type.ARRAY,
            description: "An array containing one long-answer question.",
            items: { type: Type.STRING },
          },
        },
        required: ["mcqs", "shortAnswers", "longAnswers"],
      },
    },
  });

  const result = parseJsonResponse<GeneratedQuestions>(response.text);
  if (!result) {
    throw new Error("Failed to parse question generation response.");
  }
  return result;
};


export const predictTopics = async (text: string): Promise<Topic[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following text from past exam papers or study material. Identify the 5 most important topics and their probability of appearing in a future exam as a percentage. Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        description: "An array of important topics and their predicted probability.",
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "The name of the topic." },
            probability: {
              type: Type.NUMBER,
              description: "The probability (0-100) of the topic appearing in an exam.",
            },
          },
          required: ["topic", "probability"],
        },
      },
    },
  });

  const result = parseJsonResponse<Topic[]>(response.text);
  if (!result) {
    throw new Error("Failed to parse topic prediction response.");
  }
  return result;
};
