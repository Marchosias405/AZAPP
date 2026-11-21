import { getLocalExamHistory } from "@/lib/exam/examHistory";
import { LOCAL_MOCK_QUESTIONS } from "@/lib/exam/localQuestions";
import type { LocalQuestion } from "@/lib/exam/types";
import { localQuestionSchema } from "@/lib/validation/questionSchema";

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
const MISSED_QUESTION_PREFIX = "az900-practice-outcome:";

function readJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Each answer updates a single storage entry, including when different tabs
// are studying different questions. Generated questions need their full text
// and choices because they cannot be looked up in the bundled question set.
export function recordPracticeOutcome(question: LocalQuestion, isCorrect: boolean): void {
  const key = MISSED_QUESTION_PREFIX + question.id;
  if (!isCorrect) {
    window.localStorage.setItem(key, JSON.stringify(question));
  } else if (LOCAL_MOCK_QUESTIONS.some((item) => item.id === question.id)) {
    // This marker supersedes a miss recorded by an older version of the app.
    window.localStorage.setItem(key, "null");
  } else {
    window.localStorage.removeItem(key);
  }
}

function getHistoricalMisses(): Map<string, LocalQuestion> {
  const latest = new Map<string, { at: number; correct: boolean }>();
  function remember(id: string, correct: boolean, date: string) {
    const at = Date.parse(date);
    if (Number.isFinite(at) && at >= (latest.get(id)?.at ?? -Infinity)) {
      latest.set(id, { at, correct });
    }
  }

  for (const exam of getLocalExamHistory()) {
    for (const answer of exam.answers) {
      remember(answer.questionId, answer.isCorrect, exam.completedAt);
    }
  }
  for (const session of getMistakesPracticeSessions()) {
    for (const answer of session.answers) {
      if (answer && typeof answer.questionId === "string" && typeof answer.isCorrect === "boolean") {
        remember(answer.questionId, answer.isCorrect, answer.answeredAt || session.completedAt);
      }
    }
  }
  return new Map(LOCAL_MOCK_QUESTIONS
    .filter((question) => latest.get(question.id)?.correct === false)
    .map((question) => [question.id, question]));
}

export function getMissedQuestions(): LocalQuestion[] {
  if (typeof window === "undefined") return [];
  const missed = getHistoricalMisses();
  const storage = window.localStorage;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(MISSED_QUESTION_PREFIX)) continue;
    const id = key.slice(MISSED_QUESTION_PREFIX.length);
    const raw = storage.getItem(key);
    if (raw === "null") {
      missed.delete(id);
      continue;
    }
    const snapshot = localQuestionSchema.safeParse(readJson(raw));
    if (snapshot.success && snapshot.data.id === id) {
      missed.set(id, snapshot.data);
    }
  }
  return Array.from(missed.values());
}

export function getMistakesPracticeSessions(): MistakesPracticeSession[] {
  if (typeof window === "undefined") return [];
  const sessions = readJson(window.localStorage.getItem(MISTAKES_PRACTICE_SESSIONS_KEY));
  if (!Array.isArray(sessions)) return [];
  return sessions.filter((session): session is MistakesPracticeSession =>
    session?.mode === "mistakes-only" && Array.isArray(session.answers),
  );
}

export function saveMistakesPracticeSession(session: MistakesPracticeSession): void {
  const sessions = getMistakesPracticeSessions();
  window.localStorage.setItem(
    MISTAKES_PRACTICE_SESSIONS_KEY,
    JSON.stringify([...sessions, session]),
  );
}
