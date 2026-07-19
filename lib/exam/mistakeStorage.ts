export type MistakesPracticeAnswer = {
  questionId: string;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
  isCorrect: boolean;
  answeredAt: string;
};

export type MistakesPracticeSession = {
  id: string;
  mode: "mistakes-only";
  startedAt: string;
  completedAt: string;
  answers: MistakesPracticeAnswer[];
  score: {
    correct: number;
    wrong: number;
    total: number;
    percent: number;
  };
};

const MISTAKES_PRACTICE_SESSIONS_KEY = "az900-mistakes-practice-sessions";

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getStringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function getQuestionIdFromRecord(record: Record<string, unknown>): string | null {
  const directQuestionId = getStringValue(record.questionId);

  if (directQuestionId) {
    return directQuestionId;
  }

  const directId = getStringValue(record.id);

  if (directId) {
    return directId;
  }

  const nestedQuestion = record.question;

  if (
    nestedQuestion &&
    typeof nestedQuestion === "object" &&
    !Array.isArray(nestedQuestion)
  ) {
    const nestedRecord = nestedQuestion as Record<string, unknown>;

    return getStringValue(nestedRecord.id) ?? getStringValue(nestedRecord.questionId);
  }

  return null;
}

function isWrongAnswerRecord(record: Record<string, unknown>): boolean {
  if (record.isCorrect === false) {
    return true;
  }

  if (record.correct === false) {
    return true;
  }

  if (record.wasCorrect === false) {
    return true;
  }

  const status = getStringValue(record.status)?.toLowerCase();
  const result = getStringValue(record.result)?.toLowerCase();

  return (
    status === "wrong" ||
    status === "incorrect" ||
    status === "missed" ||
    result === "wrong" ||
    result === "incorrect" ||
    result === "missed"
  );
}

function addQuestionIdsDeep(value: unknown, ids: Set<string>, depth = 0): void {
  if (!value || depth > 8) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      addQuestionIdsDeep(item, ids, depth + 1);
    }

    return;
  }

  if (typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  const questionId = getQuestionIdFromRecord(record);

  if (questionId) {
    ids.add(questionId);
  }

  for (const nestedValue of Object.values(record)) {
    if (typeof nestedValue === "object") {
      addQuestionIdsDeep(nestedValue, ids, depth + 1);
    }
  }
}

function collectWrongQuestionIds(value: unknown, ids: Set<string>, depth = 0): void {
  if (!value || depth > 8) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectWrongQuestionIds(item, ids, depth + 1);
    }

    return;
  }

  if (typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;

  const missedCollections = [
    record.missedQuestions,
    record.mistakes,
    record.wrongQuestions,
    record.wrongAnswers,
    record.incorrectAnswers,
  ];

  for (const collection of missedCollections) {
    if (collection) {
      addQuestionIdsDeep(collection, ids, depth + 1);
    }
  }

  const questionId = getQuestionIdFromRecord(record);

  if (questionId && isWrongAnswerRecord(record)) {
    ids.add(questionId);
  }

  for (const nestedValue of Object.values(record)) {
    if (typeof nestedValue === "object") {
      collectWrongQuestionIds(nestedValue, ids, depth + 1);
    }
  }
}

export function getMissedQuestionIdsFromBrowserStorage(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const ids = new Set<string>();

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      continue;
    }

    const parsedValue = safeJsonParse(rawValue);

    if (!parsedValue) {
      continue;
    }

    collectWrongQuestionIds(parsedValue, ids);
  }

  return Array.from(ids);
}

export function getMistakesPracticeSessions(): MistakesPracticeSession[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(MISTAKES_PRACTICE_SESSIONS_KEY);

  if (!rawValue) {
    return [];
  }

  const parsedValue = safeJsonParse(rawValue);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter(
    (session): session is MistakesPracticeSession =>
      Boolean(session) &&
      typeof session === "object" &&
      !Array.isArray(session) &&
      (session as MistakesPracticeSession).mode === "mistakes-only",
  );
}

export function saveMistakesPracticeSession(session: MistakesPracticeSession): void {
  if (typeof window === "undefined") {
    return;
  }

  const existingSessions = getMistakesPracticeSessions();

  window.localStorage.setItem(
    MISTAKES_PRACTICE_SESSIONS_KEY,
    JSON.stringify([...existingSessions, session]),
  );
}