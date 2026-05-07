import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalysisResult {
  score: number;
  matchSkills: string[];
  missingSkills: string[];
  suggestions: [string, string, string];
  summary: string;
}

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-001", "gemini-1.5-flash"];

const PROMPT = (cvText: string, jobDescription: string) => `\
Eres un experto en reclutamiento técnico. Analiza la compatibilidad entre este CV y esta oferta de trabajo.

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

async function tryModel(modelName: string, cvText: string, jobDescription: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(PROMPT(cvText, jobDescription));
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}

export async function analyzeCV(
  cvText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  let lastError: Error = new Error("No models available");

  for (const modelName of MODELS) {
    try {
      return await tryModel(modelName, cvText, jobDescription);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable =
        message.includes("503") ||
        message.includes("overloaded") ||
        message.includes("high demand") ||
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("Too Many Requests");
      lastError = err instanceof Error ? err : new Error(message);

      if (isRetryable) {
        console.warn(`[gemini] ${modelName} unavailable, trying next model...`);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}
