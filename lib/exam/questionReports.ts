export type LocalQuestionReportReason =
  | "wrong-answer"
  | "confusing-wording"
  | "too-hard"
  | "duplicate"
  | "bad-explanation"
  | "other";

export type LocalQuestionReport = {
  questionId: string;
  reason: LocalQuestionReportReason;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export const LOCAL_QUESTION_REPORTS_STORAGE_KEY = "az900-local-question-reports";

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isLocalQuestionReport(value: unknown): value is LocalQuestionReport {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.questionId === "string" &&
    typeof record.reason === "string" &&
    typeof record.note === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

export function getLocalQuestionReports(): LocalQuestionReport[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedReports = window.localStorage.getItem(
    LOCAL_QUESTION_REPORTS_STORAGE_KEY,
  );

  if (!savedReports) {
    return [];
  }

  const parsedReports = safeJsonParse(savedReports);

  if (!Array.isArray(parsedReports)) {
    return [];
  }

  return parsedReports.filter(isLocalQuestionReport);
}

export function getLocalQuestionReportByQuestionId(
  questionId: string,
): LocalQuestionReport | null {
  return (
    getLocalQuestionReports().find((report) => report.questionId === questionId) ??
    null
  );
}

export function saveLocalQuestionReport(
  questionId: string,
  reason: LocalQuestionReportReason,
  note: string,
): LocalQuestionReport {
  const currentReports = getLocalQuestionReports();
  const existingReport = currentReports.find(
    (report) => report.questionId === questionId,
  );

  const now = new Date().toISOString();

  const updatedReport: LocalQuestionReport = {
    questionId,
    reason,
    note,
    createdAt: existingReport?.createdAt ?? now,
    updatedAt: now,
  };

  const nextReports = existingReport
    ? currentReports.map((report) =>
        report.questionId === questionId ? updatedReport : report,
      )
    : [...currentReports, updatedReport];

  window.localStorage.setItem(
    LOCAL_QUESTION_REPORTS_STORAGE_KEY,
    JSON.stringify(nextReports),
  );

  return updatedReport;
}

export function removeLocalQuestionReport(questionId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const nextReports = getLocalQuestionReports().filter(
    (report) => report.questionId !== questionId,
  );

  window.localStorage.setItem(
    LOCAL_QUESTION_REPORTS_STORAGE_KEY,
    JSON.stringify(nextReports),
  );
}