"use client";

import Link from "next/link";
import {
  type FormEvent,
  useState,
} from "react";

import { GeneratedQuestionEditor } from "@/components/ai/generated-question-editor";
import { GeneratedQuestionPractice } from "@/components/ai/generated-question-practice";
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
import { validateLocalQuestion } from "@/lib/validation/questionRules";
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

type ApiResponsePayload<T> = {
  data?: T;
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
  payload: ApiResponsePayload<unknown> | null,
  fallback: string,
): string {
  const generalMessage = payload?.error?.message ?? fallback;

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

export function QuestionGenerationWorkspace({ mode = "practice" }: { mode?: "practice" | "author" }) {
  const isAuthor = mode === "author";
  const [settings, setSettings] =
    useState<GenerationSettings>(INITIAL_SETTINGS);

  const [generatedQuestion, setGeneratedQuestion] =
    useState<LocalQuestion | null>(null);

  const [generationDetails, setGenerationDetails] =
    useState<GenerationDetails | null>(null);

  const [pending, setPending] = useState<"generate" | "save" | null>(null);
  const isGenerating = pending === "generate";
  const [reviewed, setReviewed] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedQuestionText, setSavedQuestionText] = useState("");

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
    if (pending) return;
    setPending("generate");
    setReviewed(false);
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
          body: JSON.stringify(settings),
        },
      );

      const payload = (await response
        .json()
        .catch(() => null)) as ApiResponsePayload<GeneratedQuestionResult> | null;

      if (!response.ok || !payload?.data) {
        throw new Error(
          getApiErrorMessage(payload, "The question could not be generated."),
        );
      }

      const parsedQuestion =
        localQuestionSchema.safeParse(
          payload.data.question,
        );

      if (!parsedQuestion.success || !validateLocalQuestion(parsedQuestion.data).isValid) {
        throw new Error(
          "The generated question failed validation. Generate a new question to try again.",
        );
      }

      setGeneratedQuestion(parsedQuestion.data);
      setSaveError("");
      setSavedQuestionText("");
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
      setPending(null);
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
    setReviewed(false);
    setSaveError("");
    setGenerationError("");
  }

  function editPreview(question: LocalQuestion) {
    setReviewed(false);
    setSaveError("");
    setGeneratedQuestion(question);
  }

  async function savePreview() {
    if (!isAuthor || pending || !reviewed || !generatedQuestion) return;
    if (!validateLocalQuestion(generatedQuestion).isValid) return;

    setPending("save");
    setSaveError("");
    const unconfirmed = "Could not confirm the save. Retry with this preview to check or complete the save.";
    try {
      const response = await fetch("/api/ai/save-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: true, question: generatedQuestion }),
      });
      const payload = (await response.json().catch(() => null)) as
        ApiResponsePayload<{ id: string }> | null;
      if (!response.ok) {
        setSaveError(getApiErrorMessage(payload, unconfirmed));
      } else if (!payload?.data?.id) {
        setSaveError(unconfirmed);
      } else {
        setSavedQuestionText(generatedQuestion.questionText);
        discardPreview();
      }
    } catch {
      setSaveError(unconfirmed);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
        {isAuthor && <StatusPill label="Authoring" tone="warning" />}
        <h1 className={`text-2xl font-bold ${isAuthor ? "mt-4" : ""}`}>
          {isAuthor ? "Author an AZ-900 question" : "AZ-900 practice"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isAuthor
            ? "Generate a draft, review its contents, and save the finished question to Supabase."
            : "Submit your answer to see the explanation. Missed questions stay in this browser for practice until you get them right."}
        </p>

        {isAuthor && (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950">
            Check factual accuracy against Microsoft Learn before saving.
          </p>
        )}
      </section>

      {(isAuthor || !generatedQuestion) && <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm"
      >
        <h2 className="text-xl font-bold">
          {isAuthor ? "Generation settings" : "Practice settings"}
        </h2>

        <div className="mt-5 space-y-5">
          <label className="block text-sm font-bold">
            Domain
            <select
              value={settings.domain}
              disabled={pending !== null}
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
              disabled={pending !== null}
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
                disabled={pending !== null}
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
                disabled={pending !== null}
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
          disabled={pending !== null}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {isGenerating
            ? "Generating question..."
            : generatedQuestion
              ? "Generate another question"
              : isAuthor ? "Generate question" : "Start practice"}
        </button>

        <div
          aria-live="polite"
          className="mt-3 min-h-6 text-sm leading-6 text-slate-600"
        >
          {isGenerating
            ? "Generating and validating your question…"
            : generatedQuestion
              ? "A temporary preview is ready below."
              : savedQuestionText
                ? "You can generate another question."
                : isAuthor ? "No question has been generated yet." : null}
        </div>

      </form>}

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

      {isAuthor && savedQuestionText && (
        <section role="status" className="rounded-3xl bg-emerald-50 px-5 py-5 text-emerald-950">
          <h2 className="font-bold">Question saved to Supabase</h2>
          <p className="mt-2 text-sm">{savedQuestionText}</p>
        </section>
      )}

      {generatedQuestion && !isAuthor && (
        <GeneratedQuestionPractice
          key={generatedQuestion.id}
          question={generatedQuestion}
          isGenerating={isGenerating}
          onNext={generatePreview}
          onChangeSettings={discardPreview}
        />
      )}
      {isAuthor && generatedQuestion && generationDetails ? (
        <GeneratedQuestionEditor
          question={generatedQuestion}
          provider={generationDetails.provider}
          model={generationDetails.model}
          factChecked={generationDetails.factChecked}
          isRegenerating={isGenerating}
          isSaving={pending === "save"}
          reviewed={reviewed}
          saveError={saveError}
          onReviewChange={setReviewed}
          onSave={savePreview}
          onQuestionChange={editPreview}
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
