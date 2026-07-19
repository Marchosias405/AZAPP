import type { LocalQuestion } from "@/lib/exam/types";
import type {
  LocalExamResult,
  QuestionAnswerRecord,
} from "@/lib/exam/sessionTypes";

type BuildAnswerRecordInput = {
  question: LocalQuestion;
  questionNumber: number;
  selectedAnswerIds: string[];
  isCorrect: boolean;
};

type BuildLocalExamResultInput = {
  questions: LocalQuestion[];
  answerRecords: Record<string, QuestionAnswerRecord>;
};

function getAnswerText(question: LocalQuestion, answerIds: string[]) {
  return question.options
    .filter((option) => answerIds.includes(option.id))
    .map((option) => `${option.id}. ${option.text}`)
    .join(" | ");
}

export function buildAnswerRecord({
  question,
  questionNumber,
  selectedAnswerIds,
  isCorrect,
}: BuildAnswerRecordInput): QuestionAnswerRecord {
  return {
    questionId: question.id,
    questionNumber,
    questionText: question.questionText,
    domain: question.domain,
    topic: question.topic,
    selectedAnswerIds,
    correctAnswerIds: question.correctAnswerIds,
    selectedAnswerText: getAnswerText(question, selectedAnswerIds),
    correctAnswerText: getAnswerText(question, question.correctAnswerIds),
    isCorrect,
    explanation: question.explanation,
    memoryHook: question.memoryHook,
  };
}

export function buildLocalExamResult({
  questions,
  answerRecords,
}: BuildLocalExamResultInput): LocalExamResult {
  const answers = questions
    .map((question) => answerRecords[question.id])
    .filter((answer): answer is QuestionAnswerRecord => Boolean(answer));

  const totalQuestions = questions.length;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;
  const scorePercent =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  return {
    completedAt: new Date().toISOString(),
    totalQuestions,
    correctCount,
    wrongCount,
    scorePercent,
    answers,
  };
}