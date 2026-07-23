import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import type {
  GeneratedQuestionResult,
  GenerateQuestionRequest,
} from "@/lib/ai/contracts";
import { getAiConfig } from "@/lib/ai/config";
import { AiError } from "@/lib/ai/errors";
import { getAiProvider } from "@/lib/ai/provider";
import { buildQuestionGenerationPrompt } from "@/lib/ai/questionPrompt";
import type { LocalQuestion } from "@/lib/exam/types";
import {
  validateLocalQuestion,
  type QuestionValidationIssue,
} from "@/lib/validation/questionRules";
import {
  generatedQuestionDraftSchema,
  type ValidatedGeneratedQuestionDraft,
} from "@/lib/validation/questionSchema";

const generatedQuestionJsonSchema = z.toJSONSchema(
  generatedQuestionDraftSchema,
) as Record<string, unknown>;

function parseProviderJson(outputText: string): unknown {
  try {
    return JSON.parse(outputText);
  } catch (error) {
    throw new AiError({
      code: "AI_INVALID_JSON",
      message:
        "The AI provider returned content that was not valid JSON.",
      status: 502,
      cause: error,
    });
  }
}

function validateGeneratedDraft(
  value: unknown,
): ValidatedGeneratedQuestionDraft {
  const parsedDraft =
    generatedQuestionDraftSchema.safeParse(value);

  if (!parsedDraft.success) {
    throw new AiError({
      code: "AI_OUTPUT_VALIDATION_FAILED",
      message:
        "The generated question did not match the required question structure.",
      status: 422,
      details: parsedDraft.error.issues.map((issue) => ({
        path:
          issue.path.length > 0
            ? issue.path.map(String).join(".")
            : "question",
        message: issue.message,
      })),
    });
  }

  return parsedDraft.data;
}

function getRequestAlignmentIssues(
  request: GenerateQuestionRequest,
  draft: ValidatedGeneratedQuestionDraft,
): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = [];

  if (draft.domain !== request.domain) {
    issues.push({
      path: "domain",
      message: `Generated domain must match the requested domain "${request.domain}".`,
    });
  }

  if (draft.topic !== request.topic) {
    issues.push({
      path: "topic",
      message: `Generated topic must match the requested topic "${request.topic}".`,
    });
  }

  if (draft.difficulty !== request.difficulty) {
    issues.push({
      path: "difficulty",
      message: `Generated difficulty must match the requested difficulty "${request.difficulty}".`,
    });
  }

  if (draft.questionType !== request.questionType) {
    issues.push({
      path: "questionType",
      message: `Generated question type must match the requested type "${request.questionType}".`,
    });
  }

  return issues;
}

function createGeneratedQuestion(
  draft: ValidatedGeneratedQuestionDraft,
): LocalQuestion {
  return {
    id: `generated-${randomUUID()}`,
    ...draft,
  };
}

export async function generateQuestion(
  request: GenerateQuestionRequest,
): Promise<GeneratedQuestionResult> {
  const config = getAiConfig();

  if (config.enableFactChecking) {
    throw new AiError({
      code: "AI_FACT_CHECKING_NOT_IMPLEMENTED",
      message:
        "AI fact-checking is enabled but has not been implemented yet. Set ENABLE_AI_FACT_CHECKING=false for Part 20.",
      status: 501,
    });
  }

  const provider = getAiProvider(request.provider);
  const prompt = buildQuestionGenerationPrompt(request);

  const providerResponse =
    await provider.generateStructuredOutput({
      model: config.generationModel,
      prompt,
      jsonSchema: generatedQuestionJsonSchema,
    });

  const parsedOutput = parseProviderJson(
    providerResponse.outputText,
  );

  const generatedDraft =
    validateGeneratedDraft(parsedOutput);

  const alignmentIssues = getRequestAlignmentIssues(
    request,
    generatedDraft,
  );

  if (alignmentIssues.length > 0) {
    throw new AiError({
      code: "AI_OUTPUT_VALIDATION_FAILED",
      message:
        "The generated question did not match the requested generation settings.",
      status: 422,
      details: alignmentIssues,
    });
  }

  const question =
    createGeneratedQuestion(generatedDraft);

  const validation = validateLocalQuestion(question);

  if (!validation.isValid) {
    throw new AiError({
      code: "AI_OUTPUT_VALIDATION_FAILED",
      message:
        "The generated question failed deterministic question validation.",
      status: 422,
      details: validation.issues,
    });
  }

  return {
    provider: providerResponse.provider,
    model: providerResponse.model,
    question,
    validation,
    factChecked: false,
  };
}
