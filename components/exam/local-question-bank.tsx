"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import * as localQuestionModule from "@/lib/exam/localQuestions";
import {
  getLocalQuestionReports,
  removeLocalQuestionReport,
  saveLocalQuestionReport,
  type LocalQuestionReport,
  type LocalQuestionReportReason,
} from "@/lib/exam/questionReports";

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

const REPORT_REASON_LABELS: Record<LocalQuestionReportReason, string> = {
  "wrong-answer": "Correct answer seems wrong",
  "confusing-wording": "Question wording is confusing",
  "too-hard": "Too advanced for AZ-900",
  duplicate: "Duplicate question",
  "bad-explanation": "Explanation is weak or wrong",
  other: "Other issue",
};

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

function getReportForQuestion(
  reports: LocalQuestionReport[],
  questionId: string,
): LocalQuestionReport | null {
  return reports.find((report) => report.questionId === questionId) ?? null;
}

export function LocalQuestionBank() {
  const questions = useMemo(() => getLocalQuestionBank(), []);
  const [searchText, setSearchText] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [reportedOnly, setReportedOnly] = useState(false);
  const [reports, setReports] = useState<LocalQuestionReport[]>([]);
  const [activeReportQuestionId, setActiveReportQuestionId] = useState<
    string | null
  >(null);
  const [reportReason, setReportReason] =
    useState<LocalQuestionReportReason>("wrong-answer");
  const [reportNote, setReportNote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setReports(getLocalQuestionReports());
    });
  }, []);

  const topics = useMemo(
    () => getUniqueSortedValues(questions, (question) => question.topic),
    [questions],
  );

  const domains = useMemo(
    () => getUniqueSortedValues(questions, (question) => question.domain),
    [questions],
  );

  const reportedQuestionIds = useMemo(() => {
    return new Set(reports.map((report) => report.questionId));
  }, [reports]);

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
      const matchesReported =
        !reportedOnly || reportedQuestionIds.has(question.id);

      return matchesSearch && matchesTopic && matchesDomain && matchesReported;
    });
  }, [
    domainFilter,
    questions,
    reportedOnly,
    reportedQuestionIds,
    searchText,
    topicFilter,
  ]);

  const singleAnswerCount = questions.filter(
    (question) => getSelectCount(question) === 1,
  ).length;

  const multiSelectCount = questions.length - singleAnswerCount;

  function startReport(questionId: string) {
    const existingReport = getReportForQuestion(reports, questionId);

    setActiveReportQuestionId(questionId);
    setReportReason(existingReport?.reason ?? "wrong-answer");
    setReportNote(existingReport?.note ?? "");
    setStatusMessage("");
  }

  function cancelReport() {
    setActiveReportQuestionId(null);
    setReportReason("wrong-answer");
    setReportNote("");
  }

  function submitReport(questionId: string) {
    const savedReport = saveLocalQuestionReport(
      questionId,
      reportReason,
      reportNote.trim(),
    );

    setReports((currentReports) => {
      const reportAlreadyExists = currentReports.some(
        (report) => report.questionId === questionId,
      );

      if (reportAlreadyExists) {
        return currentReports.map((report) =>
          report.questionId === questionId ? savedReport : report,
        );
      }

      return [...currentReports, savedReport];
    });

    setActiveReportQuestionId(null);
    setReportNote("");
    setReportReason("wrong-answer");
    setStatusMessage("Question report saved locally.");
  }

  function clearReport(questionId: string) {
    removeLocalQuestionReport(questionId);
    setReports((currentReports) =>
      currentReports.filter((report) => report.questionId !== questionId),
    );
    setStatusMessage("Question report cleared.");
  }

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
          app. You can now flag bad questions locally before database-backed
          editing, disabling, deleting, and regeneration are added.
        </p>

        <div className="mt-4 grid grid-cols-4 gap-3">
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

          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Flagged
            </p>
            <p className="mt-1 text-xl font-black">{reports.length}</p>
          </div>
        </div>

        {statusMessage ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            {statusMessage}
          </p>
        ) : null}
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

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
          <input
            type="checkbox"
            checked={reportedOnly}
            onChange={(event) => setReportedOnly(event.target.checked)}
            className="h-4 w-4"
          />
          Show flagged questions only
        </label>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Showing {filteredQuestions.length} of {questions.length} local
          questions. {reports.length} question
          {reports.length === 1 ? "" : "s"} flagged locally.
        </p>
      </section>

      <section className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 text-slate-950">
            <h2 className="text-lg font-bold">No matching questions</h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Try clearing the search box, choosing All domains and All topics,
              or turning off flagged-only mode.
            </p>
          </div>
        ) : (
          filteredQuestions.map((question, index) => {
            const options = getOptions(question);
            const correctAnswerIds = getCorrectAnswerIds(question);
            const report = getReportForQuestion(reports, question.id);
            const isReportFormOpen = activeReportQuestionId === question.id;

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

                  {report ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      Flagged
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {question.domain ?? "AZ-900"}
                </p>

                <h2 className="mt-2 text-base font-bold leading-7">
                  {getQuestionText(question)}
                </h2>

                {report ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
                    <p className="text-sm font-bold">Local report saved</p>
                    <p className="mt-2 text-sm leading-6">
                      Reason: {REPORT_REASON_LABELS[report.reason]}
                    </p>

                    {report.note ? (
                      <p className="mt-2 text-sm leading-6">
                        Note: {report.note}
                      </p>
                    ) : null}
                  </div>
                ) : null}

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

                {isReportFormOpen ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
                    <h3 className="text-base font-bold">Flag this question</h3>

                    <label
                      htmlFor={`report-reason-${question.id}`}
                      className="mt-4 block text-sm font-bold"
                    >
                      Reason
                    </label>

                    <select
                      id={`report-reason-${question.id}`}
                      value={reportReason}
                      onChange={(event) =>
                        setReportReason(
                          event.target.value as LocalQuestionReportReason,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                    >
                      {Object.entries(REPORT_REASON_LABELS).map(
                        ([reason, label]) => (
                          <option key={reason} value={reason}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>

                    <label
                      htmlFor={`report-note-${question.id}`}
                      className="mt-4 block text-sm font-bold"
                    >
                      Optional note
                    </label>

                    <textarea
                      id={`report-note-${question.id}`}
                      value={reportNote}
                      onChange={(event) => setReportNote(event.target.value)}
                      placeholder="Example: answer seems wrong, wording is confusing, or topic feels too advanced."
                      rows={3}
                      className="mt-2 w-full rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-amber-500"
                    />

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => submitReport(question.id)}
                        className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-amber-950"
                      >
                        Save report
                      </button>

                      <button
                        type="button"
                        onClick={cancelReport}
                        className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-bold text-amber-950"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => startReport(question.id)}
                      className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950"
                    >
                      {report ? "Edit report" : "Flag bad question"}
                    </button>

                    {report ? (
                      <button
                        type="button"
                        onClick={() => clearReport(question.id)}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700"
                      >
                        Clear report
                      </button>
                    ) : null}
                  </div>
                )}
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