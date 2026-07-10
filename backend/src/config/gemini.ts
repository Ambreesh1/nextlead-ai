import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { env } from './env';
import { CRM_SYSTEM_INSTRUCTIONS } from '../prompts/crmExtraction.prompt';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Lazily instantiate the Gemini client so a missing/invalid API key doesn't
 * crash the whole process at import time - it will surface as a clear
 * error only when AI extraction is actually attempted.
 *
 * The CRM system instructions are static (they don't change per-batch), so
 * they're bound once here at model-creation time rather than being resent
 * with every request.
 */
export function getGeminiModel(): GenerativeModel {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  if (!model) {
    model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: CRM_SYSTEM_INSTRUCTIONS,
      generationConfig: {
        temperature: 0.1, // low temperature: we want consistent, deterministic field mapping
        responseMimeType: 'application/json',
      },
    });
  }

  return model;
}
