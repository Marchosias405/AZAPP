"use client";

import Link from "next/link";
import {
  type FormEvent,
  useState,
} from "react";

import { GeneratedQuestionEditor } from "@/components/ai/generated-question-editor";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  GeneratedQuestionResult,
  GenerateQuestionRequest,
} from "@/lib/ai/contracts";
import {
  AZ900_DOMAINS,
  AZ900_TOPICS_BY_DOMAIN,
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
} from "@/lib/constants/az900Topics";
import type { LocalQuestion } from "@/lib/exam/types";
import { localQuestionSchema } from "@/lib/validation/questionSchema";

type GenerationSettings = Pick<
  GenerateQuestionRequest,
  "domain" | "topic" | "difficulty" | "questionType"
>;

type GenerationDetails = Pick<
  GeneratedQuestionResult,
  "provider" | "model" | "factChecked"
>;

type ApiErrorDetails = {
  path?: string;
  message?: string;
};

type ApiResponsePayload = {
  data?: GeneratedQuestionResult;
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetails[];
  };
};

const INITIAL_DOMAIN = AZ900_DOMAINS[0];

const INITIAL_SETTINGS: GenerationSettings = {
  domain: INITIAL_DOMAIN,
  topic: AZ900_TOPICS_BY_DOMAIN[INITIAL_DOMAIN][0],
  difficulty: "standard",
  questionType: "single-answer",
};

const QUESTION_TYPE_LABELS: Record<
  GenerationSettings["questionType"],
  string
> = {
  "single-answer": "Single answer",
  "choose-2": "Choose 2 answers",
  "choose-3": "Choose 3 answers",
  scenario: "Scenario",
  "common-confusion": "Common confusion",
};

const DIFFICULTY_LABELS: Record<
  GenerationSettings["difficulty"],
  string
> = {
  beginner: "Beginner",
  standard: "Standard",
  challenging: "Challenging",
};

const SELECT_CLASS_NAME =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-100";

function getApiErrorMessage(
  payload: ApiResponsePayload | null,
): string {
  const generalMessage =
    payload?.error?.message ??
    "The question could not be generated.";

  const detailedMessages =
    payload?.error?.details
      ?.filter(
        (
          detail,
        ): detail is Required<ApiErrorDetails> =>
          typeof detail.path === "string" &&
          typeof detail.message === "string",
      )
      .map(
        (detail) =>
          `${detail.path}: ${detail.message}`,
      ) ?? [];

  if (detailedMessages.length === 0) {
    return generalMessage;
  }

  return `${generalMessage} ${detailedMessages.join(
    " ",
  )}`;
}

export function QuestionGenerationWorkspace() {
  const [settings, setSettings] =
    useState<GenerationSettings>(INITIAL_SETTINGS);

  const [generatedQuestion, setGeneratedQuestion] =
    useState<LocalQuestion | null>(null);

  const [generationDetails, setGenerationDetails] =
    useState<GenerationDetails | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationError, setGenerationError] =
    useState("");

  const topicsForSelectedDomain =
    AZ900_TOPICS_BY_DOMAIN[settings.domain];

  function updateSettings(
    updates: Partial<GenerationSettings>,
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      ...updates,
    }));
  }

  async function generatePreview() {
    setIsGenerating(true);
    setGenerationError("");

    try {
      const response = await fetch(
        "/api/ai/generate-question",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            provider: "gemini",
            ...settings,
          }),
        },
      );

      const payload = (await response
        .json()
        .catch(() => null)) as ApiResponsePayload | null;

      if (!response.ok || !payload?.data) {
        throw new Error(
          getApiErrorMessage(payload),
        );
      }

      const parsedQuestion =
        localQuestionSchema.safeParse(
          payload.data.question,
        );

      if (!parsedQuestion.success) {
        throw new Error(
          "The server returned a question that the preview editor could not validate.",
        );
      }

      setGeneratedQuestion(parsedQuestion.data);
      setGenerationDetails({
        provider: payload.data.provider,
        model: payload.data.model,
        factChecked: payload.data.factChecked,
      });
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "The question could not be generated.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    await generatePreview();
  }

  function handleDomainChange(
    domain: GenerationSettings["domain"],
  ) {
    const firstTopic =
      AZ900_TOPICS_BY_DOMAIN[domain][0];

    setSettings((currentSettings) => ({
      ...currentSettings,
      domain,
      topic: firstTopic,
    }));
  }

  function discardPreview() {
    setGeneratedQuestion(null);
    setGenerationDetails(null);
    setGenerationError("");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            label="Part 21 preview"
            tone="ready"
          />
          <StatusPill
            label="Development only"
            tone="warning"
          />
        </div>

        <h1 className="mt-4 text-2xl font-bold">
          Generate an AZ-900 question
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose the question settings, generate one
          validated draft with Gemini, and review every field
          before a future save workflow is added.
        </p>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
          Generated content may still contain factual errors.
          Deterministic validation checks structure and rules,
          but AI fact-checking is not enabled.
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Generation settings
        </p>

        <h2 className="mt-3 text-xl font-bold">
          Build one temporary preview
        </h2>

        <div className="mt-5 space-y-5">
          <label className="block text-sm font-bold">
            Domain
            <select
              value={settings.domain}
              disabled={isGenerating}
              onChange={(event) =>
                handleDomainChange(
                  event.target
                    .value as GenerationSettings["domain"],
                )
              }
              className={SELECT_CLASS_NAME}
            >
              {AZ900_DOMAINS.map((domain) => (
                <option
                  key={domain}
                  value={domain}
                >
                  {domain}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold">
            Topic
            <select
              value={settings.topic}
              disabled={isGenerating}
              onChange={(event) =>
                updateSettings({
                  topic:
                    event.target
                      .value as GenerationSettings["topic"],
                })
              }
              className={SELECT_CLASS_NAME}
            >
              {topicsForSelectedDomain.map((topic) => (
                <option
                  key={topic}
                  value={topic}
                >
                  {topic}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Difficulty
              <select
                value={settings.difficulty}
                disabled={isGenerating}
                onChange={(event) =>
                  updateSettings({
                    difficulty:
                      event.target
                        .value as GenerationSettings["difficulty"],
                  })
                }
                className={SELECT_CLASS_NAME}
              >
                {QUESTION_DIFFICULTIES.map(
                  (difficulty) => (
                    <option
                      key={difficulty}
                      value={difficulty}
                    >
                      {DIFFICULTY_LABELS[difficulty]}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block text-sm font-bold">
              Question type
              <select
                value={settings.questionType}
                disabled={isGenerating}
                onChange={(event) =>
                  updateSettings({
                    questionType:
                      event.target
                        .value as GenerationSettings["questionType"],
                  })
                }
                className={SELECT_CLASS_NAME}
              >
                {QUESTION_TYPES.map(
                  (questionType) => (
                    <option
                      key={questionType}
                      value={questionType}
                    >
                      {
                        QUESTION_TYPE_LABELS[
                          questionType
                        ]
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {isGenerating
            ? "Generating question..."
            : generatedQuestion
              ? "Generate another question"
              : "Generate question"}
        </button>

        <div
          aria-live="polite"
          className="mt-3 min-h-6 text-sm leading-6 text-slate-600"
        >
          {isGenerating
            ? "Gemini is generating and validating one question. This may take a moment."
            : generatedQuestion
              ? "A temporary preview is ready below."
              : "No question has been generated yet."}
        </div>

        {generationError ? (
          <div
            role="alert"
            className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-950"
          >
            <p className="font-bold">
              Generation failed
            </p>
            <p className="mt-2">
              {generationError}
            </p>
          </div>
        ) : null}
      </form>

      {generatedQuestion && generationDetails ? (
        <GeneratedQuestionEditor
          question={generatedQuestion}
          provider={generationDetails.provider}
          model={generationDetails.model}
          factChecked={generationDetails.factChecked}
          isRegenerating={isGenerating}
          onQuestionChange={setGeneratedQuestion}
          onRegenerate={generatePreview}
          onDiscard={discardPreview}
        />
      ) : null}

      <Link
        href="/"
        className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
