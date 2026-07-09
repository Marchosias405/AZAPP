"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MockQuestionCard } from "@/components/exam/mock-question-card";
import type { LocalQuestion } from "@/lib/exam/types";
import type { QuestionAnswerRecord } from "@/lib/exam/sessionTypes";
import { buildLocalExamResult } from "@/lib/exam/score";
import { LOCAL_EXAM_RESULT_STORAGE_KEY } from "@/lib/exam/storage";

type MockExamRunnerProps = {
  questions: LocalQuestion[];
};

export function MockExamRunner({ questions }: MockExamRunnerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerRecords, setAnswerRecords] = useState<
    Record<string, QuestionAnswerRecord>
  >({});

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionNumber = currentQuestionIndex + 1;
  const currentAnswerRecord = answerRecords[currentQuestion.id];

  const answeredCount = Object.keys(answerRecords).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const currentScorePreview = useMemo(() => {
    const correctSoFar = Object.values(answerRecords).filter(
      (answerRecord) => answerRecord.isCorrect,
    ).length;

    return {
      correctSoFar,
      answeredCount,
    };
  }, [answerRecords, answeredCount]);

  const hasPreviousQuestion = currentQuestionIndex > 0;
  const hasNextQuestion = currentQuestionIndex < questions.length - 1;
  const hasSubmittedCurrentQuestion = Boolean(currentAnswerRecord);

  function handleSubmittedAnswer(answerRecord: QuestionAnswerRecord) {
    setAnswerRecords((currentRecords) => ({
      ...currentRecords,
      [answerRecord.questionId]: answerRecord,
    }));
  }

  function goToPreviousQuestion() {
    if (!hasPreviousQuestion) {
      return;
    }

    setCurrentQuestionIndex((currentIndex) => currentIndex - 1);
  }

  function goToNextQuestion() {
    if (!hasSubmittedCurrentQuestion) {
      return;
    }

    if (hasNextQuestion) {
      setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
      return;
    }

    const result = buildLocalExamResult({
      questions,
      answerRecords,
    });

    window.localStorage.setItem(
      LOCAL_EXAM_RESULT_STORAGE_KEY,
      JSON.stringify(result),
    );

    router.push("/mock-exam/results");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Exam progress
            </p>
            <h2 className="mt-2 text-lg font-bold text-white">
              {answeredCount}/{questions.length} answered
            </h2>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-right text-sm font-semibold text-slate-950">
            {currentScorePreview.correctSoFar}/{questions.length} correct
            
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-300 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          Answer each question before moving forward. Your final score appears
          after the last question.
        </p>
      </section>

      <MockQuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionNumber}
        totalQuestions={questions.length}
        initialSelectedAnswerIds={currentAnswerRecord?.selectedAnswerIds ?? []}
        initialHasSubmitted={Boolean(currentAnswerRecord)}
        onSubmittedAnswer={handleSubmittedAnswer}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!hasPreviousQuestion}
          onClick={goToPreviousQuestion}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!hasSubmittedCurrentQuestion}
          onClick={goToNextQuestion}
          className="rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500 disabled:ring-1 disabled:ring-white/10"
        >
          {hasNextQuestion ? "Next" : "Finish exam"}
        </button>
      </div>
    </div>
  );
}