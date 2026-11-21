import "server-only";

import { z } from "zod";
import type {
  AiProvider,
  AiStructuredOutputRequest,
  AiStructuredOutputResponse,
} from "@/lib/ai/contracts";
import { AiError } from "@/lib/ai/errors";

const responseSchema = z.object({
  model: z.string(),
  status: z.literal("completed"),
  output: z.array(z.object({
    type: z.string(),
    content: z.array(z.object({
      type: z.string(),
      text: z.string().optional(),
    })).optional(),
  })),
});

export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;

  constructor(private readonly apiKey: string) {}

  async generateStructuredOutput(
    request: AiStructuredOutputRequest,
  ): Promise<AiStructuredOutputResponse> {
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          model: request.model,
          input: request.prompt,
          store: false,
          text: {
            format: {
              type: "json_schema",
              name: "az900_question",
              strict: true,
              schema: request.jsonSchema,
            },
          },
        }, (key, value) => {
          // The strict API supports a subset of JSON Schema. Zod still
          // enforces the full draft schema on the returned question.
          if (key === "$schema" || key === "minLength") return undefined;
          return value;
        }),
      });

      if (!response.ok) {
        throw new AiError({
          code: "AI_PROVIDER_REQUEST_FAILED",
          message: `OpenAI could not generate a question (HTTP ${response.status}). Check the model, API key and account quota.`,
          status: 502,
        });
      }

      const result = responseSchema.safeParse(await response.json());
      if (result.success) {
        const content = result.data.output
          .filter((item) => item.type === "message")
          .flatMap((item) => item.content ?? []);
        const outputText = content
          .filter((part) => part.type === "output_text")
          .map((part) => part.text)
          .join("").trim();
        if (outputText && !content.some((part) => part.type === "refusal")) {
          return { provider: this.name, model: result.data.model, outputText };
        }
      }

      throw new AiError({
        code: "AI_EMPTY_RESPONSE",
        message: "OpenAI did not return a complete question. Try generating another question.",
        status: 502,
      });
    } catch (error) {
      if (error instanceof AiError) throw error;
      throw new AiError({
        code: "AI_PROVIDER_REQUEST_FAILED",
        message: "The server could not read a response from OpenAI. Try again.",
        status: 502,
        cause: error,
      });
    }
  }
}
