import "server-only";

import { GoogleGenAI } from "@google/genai";

import type {
  AiProvider,
  AiStructuredOutputRequest,
  AiStructuredOutputResponse,
} from "@/lib/ai/contracts";
import { AiError } from "@/lib/ai/errors";

export class GeminiAiProvider implements AiProvider {
  readonly name = "gemini" as const;

  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    const normalizedApiKey = apiKey.trim();

    if (!normalizedApiKey) {
      throw new AiError({
        code: "AI_CONFIGURATION_ERROR",
        message:
          "GEMINI_API_KEY is required when Gemini is the selected AI provider.",
      });
    }

    this.client = new GoogleGenAI({
      apiKey: normalizedApiKey,
    });
  }

  async generateStructuredOutput(
    request: AiStructuredOutputRequest,
  ): Promise<AiStructuredOutputResponse> {
    try {
      const interaction = await this.client.interactions.create({
        model: request.model,
        input: request.prompt,
        store: false,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: request.jsonSchema,
        },
      });

      const outputText = interaction.output_text?.trim();

      if (!outputText) {
        throw new AiError({
          code: "AI_EMPTY_RESPONSE",
          message:
            "Gemini returned no structured question content.",
          status: 502,
        });
      }

      return {
        provider: this.name,
        model: request.model,
        outputText,
      };
    } catch (error) {
      if (error instanceof AiError) {
        throw error;
      }

      throw new AiError({
        code: "AI_PROVIDER_REQUEST_FAILED",
        message:
          "Gemini could not generate a question. Check the server configuration and try again.",
        status: 502,
        cause: error,
      });
    }
  }
}