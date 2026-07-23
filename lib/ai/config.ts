import "server-only";

import { z } from "zod";

import {
  AI_PROVIDER_NAMES,
  type AiProviderName,
} from "@/lib/ai/contracts";
import { AiError } from "@/lib/ai/errors";

const DEFAULT_AI_PROVIDER: AiProviderName = "gemini";
const DEFAULT_GENERATION_MODEL = "gemini-3.1-flash-lite";
const DEFAULT_VALIDATION_MODEL = "gemini-3.5-flash";

const aiProviderSchema = z.enum(AI_PROVIDER_NAMES);

export type AiConfig = {
  defaultProvider: AiProviderName;
  generationModel: string;
  validationModel: string;
  enableOpenAiProvider: boolean;
  enableFactChecking: boolean;
  geminiApiKey?: string;
  openAiApiKey?: string;
};

function readOptionalText(
  value: string | undefined,
): string | undefined {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function readModelName(
  value: string | undefined,
  fallback: string,
): string {
  return readOptionalText(value) ?? fallback;
}

function readFeatureFlag(
  variableName: string,
  value: string | undefined,
): boolean {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue) {
    return false;
  }

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  throw new AiError({
    code: "AI_CONFIGURATION_ERROR",
    message: `${variableName} must be either true or false.`,
  });
}

export function getAiConfig(): AiConfig {
  const providerResult = aiProviderSchema.safeParse(
    readOptionalText(process.env.DEFAULT_AI_PROVIDER) ??
      DEFAULT_AI_PROVIDER,
  );

  if (!providerResult.success) {
    throw new AiError({
      code: "AI_CONFIGURATION_ERROR",
      message:
        "DEFAULT_AI_PROVIDER must be either gemini or openai.",
    });
  }

  return {
    defaultProvider: providerResult.data,
    generationModel: readModelName(
      process.env.DEFAULT_GENERATION_MODEL,
      DEFAULT_GENERATION_MODEL,
    ),
    validationModel: readModelName(
      process.env.DEFAULT_VALIDATION_MODEL,
      DEFAULT_VALIDATION_MODEL,
    ),
    enableOpenAiProvider: readFeatureFlag(
      "ENABLE_OPENAI_PROVIDER",
      process.env.ENABLE_OPENAI_PROVIDER,
    ),
    enableFactChecking: readFeatureFlag(
      "ENABLE_AI_FACT_CHECKING",
      process.env.ENABLE_AI_FACT_CHECKING,
    ),
    geminiApiKey: readOptionalText(
      process.env.GEMINI_API_KEY,
    ),
    openAiApiKey: readOptionalText(
      process.env.OPENAI_API_KEY,
    ),
  };
}