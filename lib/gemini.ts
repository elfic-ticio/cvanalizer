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
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
    // @ts-expect-error thinkingConfig is supported in 0.24+ but not yet in types
    thinkingConfig: { thinkingBudget: 0 },
  });

  const prompt = `Eres un experto en reclutamiento técnico. Analiza la compatibilidad entre este CV y esta oferta de trabajo.

CV:
${cvText}

OFERTA:
${jobDescription}

Responde SOLO en JSON con esta estructura exacta, sin texto adicional:
{
  "score": number entre 0 y 100,
  "matchSkills": string[],
  "missingSkills": string[],
  "suggestions": [string, string, string],
  "summary": "máximo 2 oraciones"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini did not return valid JSON");
  }

  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}
