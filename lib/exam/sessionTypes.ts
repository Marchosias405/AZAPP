import type { Az900Domain } from "@/lib/exam/types";

export type QuestionAnswerRecord = {
  questionId: string;
  questionNumber: number;
  questionText: string;
  domain: Az900Domain;
  topic: string;
  selectedAnswerIds: string[];
  correctAnswerIds: string[];
  selectedAnswerText: string;
  correctAnswerText: string;
  isCorrect: boolean;
  explanation: string;
  memoryHook: string;
};

export type LocalExamResult = {
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  answers: QuestionAnswerRecord[];
};