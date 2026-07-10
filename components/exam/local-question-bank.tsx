"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import * as localQuestionModule from "@/lib/exam/localQuestions";

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
  const seenQuestionIds = new Set<string>();

  for (let index = 0; index < 200; index += 1) {
    const question = getLocalQuestionByIndex(index);

    if (!question || typeof question !== "object") {
      break;
    }

    const typedQuestion = question as QuestionLike;

    if (!typedQuestion.id || seenQuestionIds.has(typedQuestion.id)) {
      break;
    }

    questions.push(typedQuestion);
    seenQuestionIds.add(typedQuestion.id);
  }

  return questions;
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
  const selectCount = getSelectCount(question);

  if (selectCount > 1) {
    return `Choose ${selectCount}`;
  }

  return "Single answer";
}

function getSelectCount(question: QuestionLike): number {
  if (typeof question.selectCount === "number" && question.selectCount > 0) {
    return question.selectCount;
  }

  const correctAnswerCount = getCorrectAnswerIds(question).length;

  if (correctAnswerCount > 0) {
    return correctAnswerCount;
  }

  const questionType = question.questionType ?? question.type ?? "";

  if (questionType.toLowerCase().includes("choose-3")) {
    return 3;
  }

  if (questionType.toLowerCase().includes("choose-2")) {
    return 2;
  }

  return 1;
}

function getCorrectAnswerIds(question: QuestionLike): string[] {
  const correctAnswers = normalizeIdArray(question.correctAnswers);

  if (correctAnswers.length > 0) {
    return correctAnswers;
  }

  const correctAnswerIds = normalizeIdArray(question.correctAnswerIds);

  if (correctAnswerIds.length > 0) {
    return correctAnswerIds;
  }

  const correctOptionIds = normalizeIdArray(question.correctOptionIds);

  if (correctOptionIds.length > 0) {
    return correctOptionIds;
  }

  return normalizeIdArray(question.correctAnswer);
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

function getCorrectAnswerText(question: QuestionLike): string {
  const options = getOptions(question);
  const correctAnswerIds = getCorrectAnswerIds(question);

  if (correctAnswerIds.length === 0) {
    return "Correct answer is missing.";
  }

  return correctAnswerIds
    .map((answerId) => {
      const option = options.find((item) => item.id === answerId);

      return option ? `${option.id}. ${option.text}` : answerId;
    })
    .join(" | ");
}

function getUniqueSortedValues(
  questions: QuestionLike[],
  getValue: (question: QuestionLike) => string | undefined,
): string[] {
  const values = new Set<string>();

  questions.forEach((question) => {
    const value = getValue(question);

    if (value) {
      values.add(value);
    }
  });

  return Array.from(values).sort();
}

export function LocalQuestionBank() {
  const questions = useMemo(() => getLocalQuestionBank(), []);
  const [searchText, setSearchText] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

  const topics = useMemo(
    () => getUniqueSortedValues(questions, (question) => question.topic),
    [questions],
  );

  const domains = useMemo(
    () => getUniqueSortedValues(questions, (question) => question.domain),
    [questions],
  );

  const filteredQuestions = useMemo(() => {
    const normalizedSearchText = searchText.trim().toLowerCase();

    return questions.filter((question) => {
      const questionText = getQuestionText(question).toLowerCase();
      const topic = question.topic ?? "";
      const domain = question.domain ?? "";
      const explanation = question.explanation ?? "";
      const memoryHook = question.memoryHook ?? question.memory_hook ?? "";

      const matchesSearch =
        normalizedSearchText.length === 0 ||
        questionText.includes(normalizedSearchText) ||
        topic.toLowerCase().includes(normalizedSearchText) ||
        domain.toLowerCase().includes(normalizedSearchText) ||
        explanation.toLowerCase().includes(normalizedSearchText) ||
        memoryHook.toLowerCase().includes(normalizedSearchText);

      const matchesTopic = topicFilter === "all" || topic === topicFilter;
      const matchesDomain = domainFilter === "all" || domain === domainFilter;

      return matchesSearch && matchesTopic && matchesDomain;
    });
  }, [domainFilter, questions, searchText, topicFilter]);

  const singleAnswerCount = questions.filter(
    (question) => getSelectCount(question) === 1,
  ).length;

  const multiSelectCount = questions.length - singleAnswerCount;

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Question bank
          </p>

          <h1 className="mt-3 text-2xl font-bold">No local questions found</h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            The local question bank could not load any questions. Check
            lib/exam/localQuestions.ts.
          </p>
        </section>

        <Link
          href="/"
          className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Question bank
        </p>

        <h1 className="mt-3 text-2xl font-bold">Local question bank</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Browse the local AZ-900 practice questions currently built into the
          app. Editing, disabling, deleting, and regeneration will come later.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Total
            </p>
            <p className="mt-1 text-xl font-black">{questions.length}</p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Single
            </p>
            <p className="mt-1 text-xl font-black">{singleAnswerCount}</p>
          </div>

          <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Multi
            </p>
            <p className="mt-1 text-xl font-black">{multiSelectCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h2 className="text-lg font-bold">Find questions</h2>

        <label
          htmlFor="question-search"
          className="mt-4 block text-sm font-bold text-slate-800"
        >
          Search
        </label>

        <input
          id="question-search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search question, topic, or explanation"
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-400"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="domain-filter"
              className="block text-sm font-bold text-slate-800"
            >
              Domain
            </label>

            <select
              id="domain-filter"
              value={domainFilter}
              onChange={(event) => setDomainFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              <option value="all">All domains</option>

              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="topic-filter"
              className="block text-sm font-bold text-slate-800"
            >
              Topic
            </label>

            <select
              id="topic-filter"
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              <option value="all">All topics</option>

              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Showing {filteredQuestions.length} of {questions.length} local
          questions.
        </p>
      </section>

      <section className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 text-slate-950">
            <h2 className="text-lg font-bold">No matching questions</h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Try clearing the search box or choosing All domains and All
              topics.
            </p>
          </div>
        ) : (
          filteredQuestions.map((question, index) => {
            const options = getOptions(question);
            const correctAnswerIds = getCorrectAnswerIds(question);

            return (
              <article
                key={question.id}
                className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Question {index + 1}
                  </span>

                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900">
                    {getQuestionType(question)}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900">
                    {question.topic ?? "General"}
                  </span>
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {question.domain ?? "AZ-900"}
                </p>

                <h2 className="mt-2 text-base font-bold leading-7">
                  {getQuestionText(question)}
                </h2>

                <div className="mt-4 space-y-2">
                  {options.map((option) => {
                    const isCorrectAnswer = correctAnswerIds.includes(option.id);

                    return (
                      <div
                        key={option.id}
                        className={
                          isCorrectAnswer
                            ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"
                            : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800"
                        }
                      >
                        <span className="font-bold">{option.id}. </span>
                        {option.text}

                        {isCorrectAnswer ? (
                          <span className="ml-2 font-bold text-emerald-700">
                            Correct
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-950">
                  <p className="text-sm font-bold">Correct answer</p>
                  <p className="mt-2 text-sm leading-6">
                    {getCorrectAnswerText(question)}
                  </p>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-bold">Explanation</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {question.explanation ?? "No explanation available yet."}
                  </p>
                </div>

                <div className="mt-3 rounded-2xl bg-cyan-50 px-4 py-4 text-cyan-950">
                  <p className="text-sm font-bold">Memory hook</p>
                  <p className="mt-2 text-sm leading-6">
                    {question.memoryHook ??
                      question.memory_hook ??
                      "No memory hook available yet."}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/mock-exam"
          className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
        >
          Start mock exam
        </Link>

        <Link
          href="/"
          className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}