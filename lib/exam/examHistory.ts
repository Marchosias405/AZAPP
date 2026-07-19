import type {
  LocalExamResult,
  QuestionAnswerRecord,
} from "@/lib/exam/sessionTypes";
import { LOCAL_EXAM_RESULT_STORAGE_KEY } from "@/lib/exam/storage";

export const LOCAL_EXAM_HISTORY_STORAGE_KEY = "az900-local-exam-history";

const VALID_AZ900_DOMAINS = new Set<string>([
  "Describe cloud concepts",
  "Describe Azure architecture and services",
  "Describe Azure management and governance",
]);

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function isQuestionAnswerRecord(
  value: unknown,
): value is QuestionAnswerRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.questionId === "string" &&
    typeof record.questionNumber === "number" &&
    Number.isInteger(record.questionNumber) &&
    record.questionNumber > 0 &&
    typeof record.questionText === "string" &&
    typeof record.domain === "string" &&
    VALID_AZ900_DOMAINS.has(record.domain) &&
    typeof record.topic === "string" &&
    isStringArray(record.selectedAnswerIds) &&
    isStringArray(record.correctAnswerIds) &&
    typeof record.selectedAnswerText === "string" &&
    typeof record.correctAnswerText === "string" &&
    typeof record.isCorrect === "boolean" &&
    typeof record.explanation === "string" &&
    typeof record.memoryHook === "string"
  );
}

function isLocalExamResult(value: unknown): value is LocalExamResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.completedAt === "string" &&
    typeof record.totalQuestions === "number" &&
    Number.isInteger(record.totalQuestions) &&
    record.totalQuestions >= 0 &&
    typeof record.correctCount === "number" &&
    Number.isInteger(record.correctCount) &&
    record.correctCount >= 0 &&
    typeof record.wrongCount === "number" &&
    Number.isInteger(record.wrongCount) &&
    record.wrongCount >= 0 &&
    typeof record.scorePercent === "number" &&
    Number.isFinite(record.scorePercent) &&
    Array.isArray(record.answers) &&
    record.answers.every(isQuestionAnswerRecord)
  );
}

function sortLocalExamHistory(
  results: LocalExamResult[],
): LocalExamResult[] {
  return [...results].sort((firstResult, secondResult) => {
    const firstTimestamp = Date.parse(firstResult.completedAt);
    const secondTimestamp = Date.parse(secondResult.completedAt);

    const safeFirstTimestamp = Number.isNaN(firstTimestamp)
      ? 0
      : firstTimestamp;
    const safeSecondTimestamp = Number.isNaN(secondTimestamp)
      ? 0
      : secondTimestamp;

    return safeFirstTimestamp - safeSecondTimestamp;
  });
}

function getStoredHistoryOnly(): LocalExamResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawHistory = window.localStorage.getItem(
    LOCAL_EXAM_HISTORY_STORAGE_KEY,
  );

  if (!rawHistory) {
    return [];
  }

  const parsedHistory = safeJsonParse(rawHistory);

  if (!Array.isArray(parsedHistory)) {
    return [];
  }

  return parsedHistory.filter(isLocalExamResult);
}

export function getLatestLocalExamResult(): LocalExamResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawResult = window.localStorage.getItem(
    LOCAL_EXAM_RESULT_STORAGE_KEY,
  );

  if (!rawResult) {
    return null;
  }

  const parsedResult = safeJsonParse(rawResult);

  return isLocalExamResult(parsedResult) ? parsedResult : null;
}

export function getLocalExamHistory(): LocalExamResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedHistory = getStoredHistoryOnly();
  const latestResult = getLatestLocalExamResult();
  const uniqueResults = new Map<string, LocalExamResult>();

  savedHistory.forEach((result) => {
    uniqueResults.set(result.completedAt, result);
  });

  if (latestResult) {
    uniqueResults.set(latestResult.completedAt, latestResult);
  }

  return sortLocalExamHistory(Array.from(uniqueResults.values()));
}

export function saveLocalExamResult(result: LocalExamResult): void {
  if (typeof window === "undefined") {
    return;
  }

  const existingHistory = getLocalExamHistory().filter(
    (existingResult) => existingResult.completedAt !== result.completedAt,
  );

  const nextHistory = sortLocalExamHistory([
    ...existingHistory,
    result,
  ]);

  window.localStorage.setItem(
    LOCAL_EXAM_HISTORY_STORAGE_KEY,
    JSON.stringify(nextHistory),
  );

  window.localStorage.setItem(
    LOCAL_EXAM_RESULT_STORAGE_KEY,
    JSON.stringify(result),
  );
}