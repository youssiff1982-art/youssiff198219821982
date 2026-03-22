import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function correctFillInTheBlank(word: string, missingIndex: number, studentAnswer: string) {
  const getArabicClusters = (w: string) => w.match(/[\u0600-\u06FF][\u064B-\u065F\u0670\u06D6-\u06ED]*/g) || [];
  const clusters = getArabicClusters(word);
  const targetCluster = clusters[missingIndex] || "";
  const baseLetter = targetCluster[0] || "";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Correct a student's fill-in-the-blank answer for an Arabic word. 
    Word: ${word}
    Target cluster (letter + diacritics): ${targetCluster}
    Expected base letter: ${baseLetter}
    Student's provided letter: ${studentAnswer}
    
    Return JSON: { "isCorrect": boolean, "correctLetter": string, "feedback": string }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          correctLetter: { type: Type.STRING },
          feedback: { type: Type.STRING }
        },
        required: ["isCorrect", "correctLetter", "feedback"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { isCorrect: studentAnswer === word[missingIndex], correctLetter: word[missingIndex], feedback: "" };
  }
}

export async function generateQuestions(topic: string, type: 'exercise' | 'test', level: string, count: number = 3) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} ${type === 'exercise' ? 'exercise' : 'test'} questions in Arabic for the topic: "${topic}".
    Level: ${level}
    Return a JSON array of objects with: { "id": string, "text": string, "type": "open", "level": "${level}" }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["open"] },
            level: { type: Type.STRING }
          },
          required: ["id", "text", "type", "level"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("AI Generation Error:", e);
    return [];
  }
}
