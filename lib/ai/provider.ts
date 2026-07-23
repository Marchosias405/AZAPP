import "server-only";

import type {
  AiProvider,
  AiProviderName,
} from "@/lib/ai/contracts";
import {
  getAiConfig,
  type AiConfig,
} from "@/lib/ai/config";
import { AiError } from "@/lib/ai/errors";
import { GeminiAiProvider } from "@/lib/ai/providers/gemini";

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

  throw new AiError({
    code: "AI_PROVIDER_NOT_IMPLEMENTED",
    message:
      "The OpenAI provider is enabled but has not been implemented yet.",
    status: 501,
  });
}

export function getAiProvider(
  providerName?: AiProviderName,
): AiProvider {
  const config = getAiConfig();
  const selectedProvider =
    providerName ?? config.defaultProvider;

  switch (selectedProvider) {
    case "gemini":
      return createGeminiProvider(config);

    case "openai":
      return createOpenAiProvider(config);

    default: {
      const exhaustiveCheck: never = selectedProvider;

      throw new AiError({
        code: "AI_CONFIGURATION_ERROR",
        message: `Unsupported AI provider: ${exhaustiveCheck}`,
      });
    }
  }
}