export type LocalMasteredQuestion = {
  questionId: string;
  masteredAt: string;
  updatedAt: string;
};

export const LOCAL_MASTERED_QUESTIONS_STORAGE_KEY =
  "az900-local-mastered-questions";

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isLocalMasteredQuestion(
  value: unknown,
): value is LocalMasteredQuestion {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.questionId === "string" &&
    typeof record.masteredAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

export function getLocalMasteredQuestions(): LocalMasteredQuestion[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedMasteredQuestions = window.localStorage.getItem(
    LOCAL_MASTERED_QUESTIONS_STORAGE_KEY,
  );

  if (!savedMasteredQuestions) {
    return [];
  }

  const parsedMasteredQuestions = safeJsonParse(savedMasteredQuestions);

  if (!Array.isArray(parsedMasteredQuestions)) {
    return [];
  }

  return parsedMasteredQuestions.filter(isLocalMasteredQuestion);
}

export function getLocalMasteredQuestionByQuestionId(
  questionId: string,
): LocalMasteredQuestion | null {
  return (
    getLocalMasteredQuestions().find(
      (masteredQuestion) => masteredQuestion.questionId === questionId,
    ) ?? null
  );
}

export function saveLocalMasteredQuestion(
  questionId: string,
): LocalMasteredQuestion {
  const currentMasteredQuestions = getLocalMasteredQuestions();
  const existingMasteredQuestion = currentMasteredQuestions.find(
    (masteredQuestion) => masteredQuestion.questionId === questionId,
  );

  const now = new Date().toISOString();

  const updatedMasteredQuestion: LocalMasteredQuestion = {
    questionId,
    masteredAt: existingMasteredQuestion?.masteredAt ?? now,
    updatedAt: now,
  };

  const nextMasteredQuestions = existingMasteredQuestion
    ? currentMasteredQuestions.map((masteredQuestion) =>
        masteredQuestion.questionId === questionId
          ? updatedMasteredQuestion
          : masteredQuestion,
      )
    : [...currentMasteredQuestions, updatedMasteredQuestion];

  window.localStorage.setItem(
    LOCAL_MASTERED_QUESTIONS_STORAGE_KEY,
    JSON.stringify(nextMasteredQuestions),
  );

  return updatedMasteredQuestion;
}

export function removeLocalMasteredQuestion(questionId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const nextMasteredQuestions = getLocalMasteredQuestions().filter(
    (masteredQuestion) => masteredQuestion.questionId !== questionId,
  );

  window.localStorage.setItem(
    LOCAL_MASTERED_QUESTIONS_STORAGE_KEY,
    JSON.stringify(nextMasteredQuestions),
  );
}