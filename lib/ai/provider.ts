import "server-only";

import type {
  AiProvider,
  AiProviderName,
  AiStructuredOutputRequest,
} from "@/lib/ai/contracts";
import type { AiConfig } from "@/lib/ai/config";
import { AiError } from "@/lib/ai/errors";
import { GeminiAiProvider } from "@/lib/ai/providers/gemini";
import { OpenAiProvider } from "@/lib/ai/providers/openai";

function createGeminiProvider(config: AiConfig): AiProvider {
  if (!config.geminiApiKey) {
    throw new AiError({
      code: "AI_CONFIGURATION_ERROR",
      message:
        "GEMINI_API_KEY is missing. Add it to the server environment before generating questions.",
    });
  }

  return new GeminiAiProvider(config.geminiApiKey);
}

function createOpenAiProvider(config: AiConfig): AiProvider {
  if (!config.enableOpenAiProvider) {
    throw new AiError({
      code: "AI_PROVIDER_DISABLED",
      message:
        "The OpenAI provider is disabled. Set ENABLE_OPENAI_PROVIDER=true before selecting it.",
      status: 503,
    });
  }

  if (!config.openAiApiKey) {
    throw new AiError({
      code: "AI_CONFIGURATION_ERROR",
      message:
        "OPENAI_API_KEY is missing even though the OpenAI provider is enabled.",
    });
  }

  return new OpenAiProvider(config.openAiApiKey);
}

export async function requestStructuredOutput(
  request: Omit<AiStructuredOutputRequest, "model">,
  config: AiConfig,
  requestedProvider?: AiProviderName,
) {
  const selectedProvider = requestedProvider ?? config.defaultProvider;
  if (selectedProvider === "gemini") {
    try {
      return await createGeminiProvider(config).generateStructuredOutput({
        ...request,
        model: config.generationModel,
      });
    } catch (error) {
      const useBackup =
        requestedProvider === undefined &&
        config.enableOpenAiProvider &&
        config.openAiApiKey &&
        error instanceof AiError &&
        (error.code === "AI_PROVIDER_UNAVAILABLE" || error.code === "AI_CONFIGURATION_ERROR");
      if (!useBackup) throw error;
    }
  }

  return createOpenAiProvider(config).generateStructuredOutput({
    ...request,
    model: config.openAiGenerationModel,
  });
}
