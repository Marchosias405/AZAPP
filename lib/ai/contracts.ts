import { z } from "zod";

import {
  AZ900_ALLOWED_TOPICS,
  AZ900_DOMAINS,
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
} from "@/lib/constants/az900Topics";
import type { LocalQuestion } from "@/lib/exam/types";
import type { QuestionValidationResult } from "@/lib/validation/questionRules";

export const AI_PROVIDER_NAMES = [
  "gemini",
  "openai",
] as const;

export type AiProviderName =
  (typeof AI_PROVIDER_NAMES)[number];

export const generateQuestionRequestSchema = z
  .object({
    provider: z.enum(AI_PROVIDER_NAMES).optional(),
    domain: z.enum(AZ900_DOMAINS),
    topic: z.enum(AZ900_ALLOWED_TOPICS),
    difficulty: z.enum(QUESTION_DIFFICULTIES),
    questionType: z.enum(QUESTION_TYPES),
  })
  .strict();

export type GenerateQuestionRequest = z.infer<
  typeof generateQuestionRequestSchema
>;

export type AiStructuredOutputRequest = {
  model: string;
  prompt: string;
  jsonSchema: Record<string, unknown>;
};

export type AiStructuredOutputResponse = {
  provider: AiProviderName;
  model: string;
  outputText: string;
};

export interface AiProvider {
  readonly name: AiProviderName;

  generateStructuredOutput(
    request: AiStructuredOutputRequest,
  ): Promise<AiStructuredOutputResponse>;
}

export type GeneratedQuestionResult = {
  provider: AiProviderName;
  model: string;
  question: LocalQuestion;
  validation: QuestionValidationResult;
  factChecked: boolean;
};