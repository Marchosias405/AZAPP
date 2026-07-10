export type LocalDisabledQuestion = {
  questionId: string;
  reason: string;
  disabledAt: string;
  updatedAt: string;
};

export const LOCAL_DISABLED_QUESTIONS_STORAGE_KEY =
  "az900-local-disabled-questions";

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isLocalDisabledQuestion(
  value: unknown,
): value is LocalDisabledQuestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.questionId === "string" &&
    typeof record.reason === "string" &&
    typeof record.disabledAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

export function getLocalDisabledQuestions(): LocalDisabledQuestion[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedDisabledQuestions = window.localStorage.getItem(
    LOCAL_DISABLED_QUESTIONS_STORAGE_KEY,
  );

  if (!savedDisabledQuestions) {
    return [];
  }

  const parsedDisabledQuestions = safeJsonParse(savedDisabledQuestions);

  if (!Array.isArray(parsedDisabledQuestions)) {
    return [];
  }

  return parsedDisabledQuestions.filter(isLocalDisabledQuestion);
}

export function getLocalDisabledQuestionByQuestionId(
  questionId: string,
): LocalDisabledQuestion | null {
  return (
    getLocalDisabledQuestions().find(
      (disabledQuestion) => disabledQuestion.questionId === questionId,
    ) ?? null
  );
}

export function saveLocalDisabledQuestion(
  questionId: string,
  reason: string,
): LocalDisabledQuestion {
  const currentDisabledQuestions = getLocalDisabledQuestions();
  const existingDisabledQuestion = currentDisabledQuestions.find(
    (disabledQuestion) => disabledQuestion.questionId === questionId,
  );

  const now = new Date().toISOString();

  const updatedDisabledQuestion: LocalDisabledQuestion = {
    questionId,
    reason,
    disabledAt: existingDisabledQuestion?.disabledAt ?? now,
    updatedAt: now,
  };

  const nextDisabledQuestions = existingDisabledQuestion
    ? currentDisabledQuestions.map((disabledQuestion) =>
        disabledQuestion.questionId === questionId
          ? updatedDisabledQuestion
          : disabledQuestion,
      )
    : [...currentDisabledQuestions, updatedDisabledQuestion];

  window.localStorage.setItem(
    LOCAL_DISABLED_QUESTIONS_STORAGE_KEY,
    JSON.stringify(nextDisabledQuestions),
  );

  return updatedDisabledQuestion;
}

export function removeLocalDisabledQuestion(questionId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const nextDisabledQuestions = getLocalDisabledQuestions().filter(
    (disabledQuestion) => disabledQuestion.questionId !== questionId,
  );

  window.localStorage.setItem(
    LOCAL_DISABLED_QUESTIONS_STORAGE_KEY,
    JSON.stringify(nextDisabledQuestions),
  );
}