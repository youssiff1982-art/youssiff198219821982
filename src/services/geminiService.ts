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
    Include a mix of these skills: 
    "مطابقة" (Matching), "توصيل" (Connecting), "اختيار من متعدد" (MCQ), "صح وخطأ" (TF), "الحصيلة اللغوية" (Vocabulary), "السلامة اللغوية" (Grammar), "إكمال الحرف الناقص" (Missing Letter), "أكتب ما يملى عليك" (Dictation), "علل" (Explain Why), "رتب" (Arrange), "تحليل الكلمات" (Word Analysis), "تكوين كلمات" (Formation), "معاني الكلمات" (Meanings), "الجموع" (Plurals), "هذا وهذه" (Demonstratives), "هنا وهناك" (Place Adverbs), "أكبر وأصغر" (Comparison).

    For "mcq", include "options" (4 strings).
    For "tf", include "options" (["صح", "خطأ"]).
    For "fill", include "word" and "blankIndex".
    For "match", include "matchPairs" (array of {image: string, letter: string}).
    For "arrange", include "items" (array of strings to sort).
    For "analysis", include "word" and "syllables" (array of parts).
    For "math", include "text" like "5 [؟] 3" and "correctAnswer" like ">".

    Return a JSON array: { "id": string, "text": string, "type": string, "skill": string, "level": "${level}", "options"?: string[], "word"?: string, "blankIndex"?: number, "matchPairs"?: any[], "items"?: string[], "syllables"?: string[], "correctAnswer": string }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["mcq", "tf", "fill", "open", "match", "arrange", "math", "analysis", "formation"] },
            skill: { type: Type.STRING },
            level: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            word: { type: Type.STRING },
            blankIndex: { type: Type.INTEGER },
            matchPairs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { image: { type: Type.STRING }, letter: { type: Type.STRING } } } },
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
          },
          required: ["id", "text", "type", "skill", "level", "correctAnswer"]
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
