"use client";

import { useMemo } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import type { LocalQuestion } from "@/lib/exam/types";
import { validateLocalQuestion } from "@/lib/validation/questionRules";

type GeneratedQuestionEditorProps = {
  question: LocalQuestion;
  provider: string;
  model: string;
  factChecked: boolean;
  isRegenerating: boolean;
  onQuestionChange: (question: LocalQuestion) => void;
  onRegenerate: () => void;
  onDiscard: () => void;
};

const FIELD_CLASS_NAME =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200";

function getQuestionTypeLabel(question: LocalQuestion): string {
  switch (question.questionType) {
    case "single-answer":
      return "Single answer";
    case "choose-2":
      return "Choose 2";
    case "choose-3":
      return "Choose 3";
    case "scenario":
      return "Scenario";
    case "common-confusion":
      return "Common confusion";
  }
}

export function GeneratedQuestionEditor({
  question,
  provider,
  model,
  factChecked,
  isRegenerating,
  onQuestionChange,
  onRegenerate,
  onDiscard,
}: GeneratedQuestionEditorProps) {
  const validationResult = useMemo(
    () => validateLocalQuestion(question),
    [question],
  );

  function updateQuestion(
    updates: Partial<LocalQuestion>,
  ) {
    onQuestionChange({
      ...question,
      ...updates,
    });
  }

  function updateOptionText(
    optionId: string,
    text: string,
  ) {
    updateQuestion({
      options: question.options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              text,
            }
          : option,
      ),
    });
  }

  function toggleCorrectAnswer(optionId: string) {
    const isSelected =
      question.correctAnswerIds.includes(optionId);

    const selectedAnswerIds = new Set(
      question.correctAnswerIds,
    );

    if (isSelected) {
      selectedAnswerIds.delete(optionId);
    } else if (
      selectedAnswerIds.size < question.selectCount
    ) {
      selectedAnswerIds.add(optionId);
    }

    updateQuestion({
      correctAnswerIds: question.options
        .filter((option) =>
          selectedAnswerIds.has(option.id),
        )
        .map((option) => option.id),
    });
  }

  function handleDiscard() {
    const shouldDiscard = window.confirm(
      "Discard this generated question preview?",
    );

    if (shouldDiscard) {
      onDiscard();
    }
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill
          label={
            validationResult.isValid
              ? "Valid preview"
              : "Needs attention"
          }
          tone={
            validationResult.isValid
              ? "ready"
              : "warning"
          }
        />

        <StatusPill
          label={getQuestionTypeLabel(question)}
        />

        <StatusPill
          label={
            factChecked
              ? "Fact checked"
              : "Not fact checked"
          }
          tone={factChecked ? "ready" : "warning"}
        />
      </div>

      <h2 className="mt-4 text-xl font-bold">
        Review and edit the question
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Changes stay in this temporary browser preview.
        Nothing is saved to Supabase or the local question
        bank.
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-100 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Provider
          </dt>
          <dd className="mt-1 text-sm font-bold capitalize">
            {provider}
          </dd>
        </div>

        <div className="rounded-2xl bg-slate-100 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Model
          </dt>
          <dd className="mt-1 break-words text-sm font-bold">
            {model}
          </dd>
        </div>

        <div className="rounded-2xl bg-slate-100 px-4 py-3 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Topic
          </dt>
          <dd className="mt-1 text-sm font-bold">
            {question.topic}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-5">
        <label className="block text-sm font-bold">
          Question text
          <textarea
            rows={5}
            value={question.questionText}
            onChange={(event) =>
              updateQuestion({
                questionText: event.target.value,
              })
            }
            className={FIELD_CLASS_NAME}
          />
        </label>

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold">
                Answer options
              </h3>
              <p
                id="correct-answer-instructions"
                className="mt-1 text-xs leading-5 text-slate-500"
              >
                Select exactly {question.selectCount} correct{" "}
                {question.selectCount === 1
                  ? "answer"
                  : "answers"}
                .
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {question.correctAnswerIds.length}/
              {question.selectCount} selected
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {question.options.map((option) => {
              const isCorrect =
                question.correctAnswerIds.includes(
                  option.id,
                );

              const answerLimitReached =
                question.correctAnswerIds.length >=
                question.selectCount;

              return (
                <div
                  key={option.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {option.id}
                    </span>

                    <label className="flex-1 text-sm font-bold">
                      Option {option.id}
                      <textarea
                        rows={3}
                        value={option.text}
                        onChange={(event) =>
                          updateOptionText(
                            option.id,
                            event.target.value,
                          )
                        }
                        className={FIELD_CLASS_NAME}
                      />
                    </label>
                  </div>

                  <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={isCorrect}
                      disabled={
                        !isCorrect &&
                        answerLimitReached
                      }
                      aria-describedby="correct-answer-instructions"
                      onChange={() =>
                        toggleCorrectAnswer(option.id)
                      }
                      className="h-5 w-5 rounded border-slate-300"
                    />

                    <span>
                      Mark option {option.id} as correct
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <label className="block text-sm font-bold">
          Explanation
          <textarea
            rows={6}
            value={question.explanation}
            onChange={(event) =>
              updateQuestion({
                explanation: event.target.value,
              })
            }
            className={FIELD_CLASS_NAME}
          />
        </label>

        <label className="block text-sm font-bold">
          Memory hook
          <textarea
            rows={4}
            value={question.memoryHook}
            onChange={(event) =>
              updateQuestion({
                memoryHook: event.target.value,
              })
            }
            className={FIELD_CLASS_NAME}
          />
        </label>

        <label className="block text-sm font-bold">
          Source basis
          <textarea
            rows={4}
            value={question.sourceBasis}
            onChange={(event) =>
              updateQuestion({
                sourceBasis: event.target.value,
              })
            }
            className={FIELD_CLASS_NAME}
          />
        </label>

        <label className="block text-sm font-bold">
          Tags
          <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
            Separate tags with commas.
          </span>
          <input
            type="text"
            value={question.tags.join(", ")}
            onChange={(event) =>
              updateQuestion({
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim()),
              })
            }
            className={FIELD_CLASS_NAME}
          />
        </label>
      </div>

      <section
        className={
          validationResult.isValid
            ? "mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-emerald-950"
            : "mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-5 text-rose-950"
        }
        aria-live="polite"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          Local validation
        </p>

        <h3 className="mt-2 text-lg font-bold">
          {validationResult.isValid
            ? "This preview passes"
            : `${validationResult.issues.length} ${
                validationResult.issues.length === 1
                  ? "issue needs"
                  : "issues need"
              } attention`}
        </h3>

        {validationResult.isValid ? (
          <p className="mt-2 text-sm leading-6">
            The current edits pass all structural and
            deterministic question rules.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {validationResult.issues.map(
              (issue, index) => (
                <li
                  key={`${issue.path}-${index}`}
                  className="rounded-2xl bg-white px-4 py-3 text-sm leading-6"
                >
                  <span className="font-bold">
                    {issue.path}:{" "}
                  </span>
                  {issue.message}
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isRegenerating}
          onClick={onRegenerate}
          className="rounded-2xl bg-cyan-300 px-4 py-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {isRegenerating
            ? "Generating..."
            : "Regenerate"}
        </button>

        <button
          type="button"
          disabled={isRegenerating}
          onClick={handleDiscard}
          className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Discard preview
        </button>
      </div>
    </article>
  );
}
