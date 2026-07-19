"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import * as localQuestionModule from "@/lib/exam/localQuestions";
import {
  getMissedQuestionIdsFromBrowserStorage,
  saveMistakesPracticeSession,
  type MistakesPracticeAnswer,
  type MistakesPracticeSession,
} from "@/lib/exam/mistakeStorage";

type QuestionOptionLike =
  | string
  | {
      id?: string;
      optionId?: string;
      value?: string;
      label?: string;
      text?: string;
    };

type QuestionLike = {
  id: string;
  domain?: string;
  topic?: string;
  difficulty?: string;
  questionText?: string;
  question?: string;
  prompt?: string;
  questionType?: string;
  type?: string;
  selectCount?: number;
  options?: QuestionOptionLike[];
  correctAnswers?: unknown;
  correctAnswerIds?: unknown;
  correctOptionIds?: unknown;
  correctAnswer?: unknown;
  explanation?: string;
  memoryHook?: string;
  memory_hook?: string;
};

type NormalizedOption = {
  id: string;
  text: string;
};

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";



function getLocalQuestionBank(): QuestionLike[] {
  const exportedValues = Object.values(
    localQuestionModule as Record<string, unknown>,
  );

  const exportedQuestionArray = exportedValues.find(
    (value): value is QuestionLike[] =>
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "object" &&
      value[0] !== null &&
      "id" in value[0],
  );

  if (exportedQuestionArray) {
    return exportedQuestionArray;
  }

  const getLocalQuestionByIndex = (
    localQuestionModule as Record<string, unknown>
  ).getLocalQuestionByIndex;

  if (typeof getLocalQuestionByIndex !== "function") {
    return [];
  }

  const questions: QuestionLike[] = [];

  for (let index = 0; index < 200; index += 1) {
    const question = getLocalQuestionByIndex(index);

    if (!question || typeof question !== "object") {
      break;
    }

    questions.push(question as QuestionLike);
  }

  return questions;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mistakes-${Date.now()}`;
}

function normalizeId(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;

    return (
      normalizeId(record.id) ??
      normalizeId(record.optionId) ??
      normalizeId(record.value)
    );
  }

  return null;
}

function normalizeIdArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeId(item))
      .filter((item): item is string => Boolean(item));
  }

  const singleValue = normalizeId(value);

  return singleValue ? [singleValue] : [];
}

function getQuestionText(question: QuestionLike): string {
  return (
    question.questionText ??
    question.question ??
    question.prompt ??
    "Question text is missing."
  );
}

function getQuestionType(question: QuestionLike): string {
  return question.questionType ?? question.type ?? "single";
}

function getCorrectAnswerIds(question: QuestionLike): string[] {
  return (
    normalizeIdArray(question.correctAnswers).length > 0
      ? normalizeIdArray(question.correctAnswers)
      : normalizeIdArray(question.correctAnswerIds).length > 0
        ? normalizeIdArray(question.correctAnswerIds)
        : normalizeIdArray(question.correctOptionIds).length > 0
          ? normalizeIdArray(question.correctOptionIds)
          : normalizeIdArray(question.correctAnswer)
  );
}

function getSelectCount(question: QuestionLike): number {
  if (typeof question.selectCount === "number" && question.selectCount > 0) {
    return question.selectCount;
  }

  const correctAnswerCount = getCorrectAnswerIds(question).length;

  if (correctAnswerCount > 0) {
    return correctAnswerCount;
  }

  const questionType = getQuestionType(question).toLowerCase();

  if (questionType.includes("choose-3")) {
    return 3;
  }

  if (questionType.includes("choose-2")) {
    return 2;
  }

  return 1;
}

function getOptions(question: QuestionLike): NormalizedOption[] {
  const options = question.options ?? [];

  return options.map((option, index) => {
    const fallbackId = OPTION_LETTERS[index] ?? String(index + 1);

    if (typeof option === "string") {
      return {
        id: fallbackId,
        text: option,
      };
    }

    return {
      id: option.id ?? option.optionId ?? option.value ?? fallbackId,
      text: option.text ?? option.label ?? option.value ?? "Missing option text",
    };
  });
}

function answersMatch(selectedAnswerIds: string[], correctAnswerIds: string[]): boolean {
  if (selectedAnswerIds.length !== correctAnswerIds.length) {
    return false;
  }

  const selectedSet = new Set(selectedAnswerIds);

  return correctAnswerIds.every((answerId) => selectedSet.has(answerId));
}

function getSelectedOptionTexts(
  selectedAnswerIds: string[],
  options: NormalizedOption[],
): string {
  if (selectedAnswerIds.length === 0) {
    return "No answer selected.";
  }

  return selectedAnswerIds
    .map((answerId) => {
      const option = options.find((item) => item.id === answerId);

      return option ? option.text : answerId;
    })
    .join(", ");
}

function shuffleQuestions(questions: QuestionLike[]): QuestionLike[] {
  return [...questions].sort(() => Math.random() - 0.5);
}

export function MistakesPracticeRunner() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [questions, setQuestions] = useState<QuestionLike[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<string[]>([]);
  const [activeAnswer, setActiveAnswer] = useState<MistakesPracticeAnswer | null>(
    null,
  );
  const [completedAnswers, setCompletedAnswers] = useState<
    MistakesPracticeAnswer[]
  >([]);
  const [startedAt, setStartedAt] = useState<string>("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const missedQuestionIds = new Set(getMissedQuestionIdsFromBrowserStorage());
      const questionBank = getLocalQuestionBank();

      const missedQuestions = questionBank.filter((question) =>
        missedQuestionIds.has(question.id),
      );

      setQuestions(shuffleQuestions(missedQuestions));
      setStartedAt(new Date().toISOString());
      setIsLoaded(true);
    });
  }, []);

  const currentQuestion = questions[currentIndex];

  const currentOptions = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }

    return getOptions(currentQuestion);
  }, [currentQuestion]);

  const correctAnswerIds = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }

    return getCorrectAnswerIds(currentQuestion);
  }, [currentQuestion]);

  const selectCount = useMemo(() => {
    if (!currentQuestion) {
      return 1;
    }

    return getSelectCount(currentQuestion);
  }, [currentQuestion]);

  const selectedCountText =
    selectCount === 1
      ? "Choose 1 answer."
      : `Choose ${selectCount} answers. Selected ${selectedAnswerIds.length}/${selectCount}.`;

  const canSubmit = selectedAnswerIds.length === selectCount && !activeAnswer;

  const score = useMemo(() => {
    const answersToScore = activeAnswer
      ? [...completedAnswers, activeAnswer]
      : completedAnswers;

    const correct = answersToScore.filter((answer) => answer.isCorrect).length;
    const total = answersToScore.length;
    const wrong = total - correct;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

    return {
      correct,
      wrong,
      total,
      percent,
    };
  }, [activeAnswer, completedAnswers]);

  function toggleAnswer(optionId: string) {
    if (activeAnswer) {
      return;
    }

    if (selectCount === 1) {
      setSelectedAnswerIds([optionId]);
      return;
    }

    const alreadySelected = selectedAnswerIds.includes(optionId);

    if (alreadySelected) {
      setSelectedAnswerIds((current) =>
        current.filter((answerId) => answerId !== optionId),
      );
      return;
    }

    if (selectedAnswerIds.length >= selectCount) {
      return;
    }

    setSelectedAnswerIds((current) => [...current, optionId]);
  }

  function submitAnswer() {
    if (!currentQuestion || !canSubmit) {
      return;
    }

    const isCorrect = answersMatch(selectedAnswerIds, correctAnswerIds);

    setActiveAnswer({
      questionId: currentQuestion.id,
      selectedAnswerIds,
      correctAnswerIds,
      isCorrect,
      answeredAt: new Date().toISOString(),
    });
  }

  function finishPractice(finalAnswers: MistakesPracticeAnswer[]) {
    const correct = finalAnswers.filter((answer) => answer.isCorrect).length;
    const total = finalAnswers.length;
    const wrong = total - correct;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

    const session: MistakesPracticeSession = {
      id: createSessionId(),
      mode: "mistakes-only",
      startedAt,
      completedAt: new Date().toISOString(),
      answers: finalAnswers,
      score: {
        correct,
        wrong,
        total,
        percent,
      },
    };

    saveMistakesPracticeSession(session);
    setIsFinished(true);
  }

  function goToNextQuestion() {
    if (!activeAnswer) {
      return;
    }

    const updatedAnswers = [...completedAnswers, activeAnswer];

    setCompletedAnswers(updatedAnswers);
    setActiveAnswer(null);
    setSelectedAnswerIds([]);

    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      finishPractice(updatedAnswers);
      return;
    }

    setCurrentIndex((current) => current + 1);
  }

  if (!isLoaded) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading mistakes...</p>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Mistakes Only</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            No mistakes found yet
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Finish a local mock exam first. Any questions you miss will appear
            here for quick review.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/mock-exam"
            className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Start Mock Exam
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  if (isFinished) {
    return (
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Mistakes Only Complete
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            {score.percent}%
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You got {score.correct} correct and {score.wrong} wrong out of{" "}
            {score.total} mistake questions.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          Correct answers here do not remove questions from your mistake list
          yet. A later part will add <strong>Mastered</strong> status.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Practice Again
          </button>

          <Link
            href="/"
            className="rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-700">Mistakes Only</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
            Question {currentIndex + 1} of {questions.length}
          </h1>
        </div>

        <Link
          href="/"
          className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          Exit
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {currentQuestion.domain ?? "AZ-900"}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          {currentQuestion.topic ?? "General"}
        </span>

        <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
          Previously missed
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-500">
          {selectedCountText}
        </p>

        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getQuestionText(currentQuestion)}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {currentOptions.map((option) => {
          const isSelected = selectedAnswerIds.includes(option.id);
          const isCorrectAnswer = correctAnswerIds.includes(option.id);
          const isWrongSelected =
            Boolean(activeAnswer) && isSelected && !isCorrectAnswer;

          let optionClassName =
            "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition";

          if (!activeAnswer && isSelected) {
            optionClassName += " border-slate-950 bg-slate-950 text-white";
          } else if (activeAnswer && isCorrectAnswer) {
            optionClassName += " border-emerald-500 bg-emerald-50 text-emerald-800";
          } else if (isWrongSelected) {
            optionClassName += " border-red-500 bg-red-50 text-red-800";
          } else {
            optionClassName += " border-slate-200 bg-white text-slate-800";
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleAnswer(option.id)}
              className={optionClassName}
            >
              <span className="mr-2 font-bold">{option.id}.</span>
              {option.text}
            </button>
          );
        })}
      </div>

      {activeAnswer ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p
            className={
              activeAnswer.isCorrect
                ? "text-sm font-bold text-emerald-700"
                : "text-sm font-bold text-red-700"
            }
          >
            {activeAnswer.isCorrect ? "Correct" : "Not quite"}
          </p>

          <p className="mt-2 text-sm text-slate-700">
            <strong>Your answer:</strong>{" "}
            {getSelectedOptionTexts(activeAnswer.selectedAnswerIds, currentOptions)}
          </p>

          <p className="mt-2 text-sm text-slate-700">
            <strong>Correct answer:</strong>{" "}
            {getSelectedOptionTexts(activeAnswer.correctAnswerIds, currentOptions)}
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            {currentQuestion.explanation ?? "No explanation available yet."}
          </p>

          <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
            <strong>Memory hook:</strong>{" "}
            {currentQuestion.memoryHook ??
              currentQuestion.memory_hook ??
              "No memory hook available yet."}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={submitAnswer}
          disabled={!canSubmit}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Submit Answer
        </button>

        <button
          type="button"
          onClick={goToNextQuestion}
          disabled={!activeAnswer}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          {currentIndex === questions.length - 1
            ? "Finish Practice"
            : "Next Question"}
        </button>
      </div>
    </section>
  );
}