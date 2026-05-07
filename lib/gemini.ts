import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalysisResult {
  score: number;
  matchSkills: string[];
  missingSkills: string[];
  suggestions: [string, string, string];
  summary: string;
}

export async function analyzeCV(
  cvText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `Eres un experto en reclutamiento técnico. Analiza la compatibilidad entre este CV y esta oferta de trabajo.

CV:
${cvText}

OFERTA:
${jobDescription}

Responde SOLO en JSON con esta estructura exacta, sin texto adicional:
{
  "score": number (0-100),
  "matchSkills": string[],
  "missingSkills": string[],
  "suggestions": [string, string, string],
  "summary": "máximo 2 oraciones"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as AnalysisResult;
}
