"use client";

import { useEffect, useMemo, useState } from "react";
import type { LocalQuestion, QuestionType } from "@/lib/exam/types";
import { areAnswerSetsEqual, formatAnswerList } from "@/lib/exam/grading";
import { buildAnswerRecord } from "@/lib/exam/score";
import type { QuestionAnswerRecord } from "@/lib/exam/sessionTypes";
import { StatusPill } from "@/components/ui/status-pill";

type MockQuestionCardProps = {
  question: LocalQuestion;
  questionNumber: number;
  totalQuestions: number;
  initialSelectedAnswerIds?: string[];
  initialHasSubmitted?: boolean;
  onSubmittedAnswer?: (answerRecord: QuestionAnswerRecord) => void;
};

const questionTypeLabels: Record<QuestionType, string> = {
  "single-answer": "Choose 1 answer",
  "choose-2": "Choose 2 answers",
  "choose-3": "Choose 3 answers",
  scenario: "Scenario question",
  "common-confusion": "Common confusion",
};

function getInstructionText(selectCount: number) {
  if (selectCount === 1) {
    return "Choose 1 answer, then submit.";
  }

  return `Choose exactly ${selectCount} answers, then submit.`;
}

export function MockQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  initialSelectedAnswerIds = [],
  initialHasSubmitted = false,
  onSubmittedAnswer,
}: MockQuestionCardProps) {
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<string[]>(
    initialSelectedAnswerIds,
  );
  const [hasSubmitted, setHasSubmitted] = useState(initialHasSubmitted);
  const [selectionMessage, setSelectionMessage] = useState("");

  const initialSelectedKey = initialSelectedAnswerIds.join("|");

  const correctAnswerSet = useMemo(
    () => new Set(question.correctAnswerIds),
    [question.correctAnswerIds],
  );

  const isCorrect = areAnswerSetsEqual(
    selectedAnswerIds,
    question.correctAnswerIds,
  );

  const canSubmit =
    selectedAnswerIds.length === question.selectCount && !hasSubmitted;

  const correctAnswerText = question.options
    .filter((option) => correctAnswerSet.has(option.id))
    .map((option) => `${option.id}. ${option.text}`)
    .join(" | ");


  useEffect(() => {
    queueMicrotask(() => {
      setSelectedAnswerIds(initialSelectedAnswerIds);
      setHasSubmitted(initialHasSubmitted);
      setSelectionMessage("");
    });
  }, [question.id, initialSelectedKey, initialHasSubmitted, initialSelectedAnswerIds]);


  function handleOptionClick(optionId: string) {
    if (hasSubmitted) {
      return;
    }

    setSelectionMessage("");

    if (question.selectCount === 1) {
      setSelectedAnswerIds([optionId]);
      return;
    }

    const isAlreadySelected = selectedAnswerIds.includes(optionId);

    if (isAlreadySelected) {
      setSelectedAnswerIds((currentSelectedIds) =>
        currentSelectedIds.filter((selectedId) => selectedId !== optionId),
      );
      return;
    }

    if (selectedAnswerIds.length >= question.selectCount) {
      setSelectionMessage(
        `You can only choose ${question.selectCount} answers for this question.`,
      );
      return;
    }

    setSelectedAnswerIds((currentSelectedIds) => [
      ...currentSelectedIds,
      optionId,
    ]);
  }

  function handleSubmit() {
    if (!canSubmit) {
      setSelectionMessage(
        `Select ${question.selectCount} answer${
          question.selectCount > 1 ? "s" : ""
        } before submitting.`,
      );
      return;
    }

    const answerRecord = buildAnswerRecord({
      question,
      questionNumber,
      selectedAnswerIds,
      isCorrect,
    });

    setHasSubmitted(true);
    setSelectionMessage("");
    onSubmittedAnswer?.(answerRecord);
  }

  function getOptionClassName(optionId: string) {
    const isSelected = selectedAnswerIds.includes(optionId);
    const isCorrectAnswer = correctAnswerSet.has(optionId);

    if (hasSubmitted && isCorrectAnswer) {
      return "border-emerald-300 bg-emerald-50 text-emerald-950";
    }

    if (hasSubmitted && isSelected && !isCorrectAnswer) {
      return "border-rose-300 bg-rose-50 text-rose-950";
    }

    if (isSelected) {
      return "border-cyan-400 bg-cyan-50 text-slate-950";
    }

    return "border-slate-200 bg-slate-50 text-slate-950";
  }

  function getOptionBadgeClassName(optionId: string) {
    const isSelected = selectedAnswerIds.includes(optionId);
    const isCorrectAnswer = correctAnswerSet.has(optionId);

    if (hasSubmitted && isCorrectAnswer) {
      return "bg-emerald-600 text-white";
    }

    if (hasSubmitted && isSelected && !isCorrectAnswer) {
      return "bg-rose-600 text-white";
    }

    if (isSelected) {
      return "bg-cyan-500 text-slate-950";
    }

    return "bg-slate-900 text-white";
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill
          label={`Question ${questionNumber}/${totalQuestions}`}
          tone="ready"
        />
        <StatusPill label={questionTypeLabels[question.questionType]} />
        {hasSubmitted ? (
          <StatusPill label="Submitted" tone={isCorrect ? "ready" : "warning"} />
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        {hasSubmitted
          ? "Answer submitted. Review the feedback below, then move to the next question."
          : getInstructionText(question.selectCount)}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {question.domain}
        </p>
        <p className="text-sm font-medium text-slate-600">{question.topic}</p>
      </div>

      <h2 className="mt-5 text-xl font-bold leading-8">
        {question.questionText}
      </h2>

      <div className="mt-5 space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswerIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              disabled={hasSubmitted}
              aria-pressed={isSelected}
              onClick={() => handleOptionClick(option.id)}
              className={`flex w-full gap-3 rounded-2xl border px-4 py-4 text-left text-sm leading-6 transition ${getOptionClassName(
                option.id,
              )} ${
                hasSubmitted
                  ? "cursor-default"
                  : "cursor-pointer active:scale-[0.99]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getOptionBadgeClassName(
                  option.id,
                )}`}
              >
                {option.id}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm font-medium text-slate-600">
        Selected:{" "}
        {selectedAnswerIds.length > 0
          ? formatAnswerList(selectedAnswerIds)
          : "None yet"}
      </div>

      {selectionMessage ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          {selectionMessage}
        </div>
      ) : null}

      {!hasSubmitted ? (
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          Submit answer
        </button>
      ) : (
        <section
          className={`mt-5 rounded-3xl border px-5 py-5 ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isCorrect ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isCorrect ? "Correct" : "Not quite"}
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {isCorrect ? "Nice, you got it." : "Review this one."}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            <span className="font-semibold">Correct answer: </span>
            {correctAnswerText}
          </p>

          <div className="mt-4 rounded-2xl bg-white px-4 py-4">
            <p className="text-sm font-bold text-slate-950">Explanation</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {question.explanation}
            </p>
          </div>

          <div className="mt-3 rounded-2xl bg-white px-4 py-4">
            <p className="text-sm font-bold text-slate-950">Memory hook</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {question.memoryHook}
            </p>
          </div>
        </section>
      )}
    </article>
  );
}