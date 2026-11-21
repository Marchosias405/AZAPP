"use client";

import Link from "next/link";
import { useState } from "react";
import { MockQuestionCard } from "@/components/exam/mock-question-card";
import { recordPracticeOutcome } from "@/lib/exam/mistakeStorage";
import type { QuestionAnswerRecord } from "@/lib/exam/sessionTypes";
import type { LocalQuestion } from "@/lib/exam/types";

type Props = {
  question: LocalQuestion;
  isGenerating: boolean;
  onNext: () => void;
  onChangeSettings: () => void;
};

export function GeneratedQuestionPractice({ question, isGenerating, onNext, onChangeSettings }: Props) {
  const [answer, setAnswer] = useState<QuestionAnswerRecord | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [storageFailed, setStorageFailed] = useState(false);

  function recordAnswer(result: QuestionAnswerRecord) {
    setAnswer(result);
    try {
      recordPracticeOutcome(question, result.isCorrect);
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }

  function retryQuestion() {
    setAnswer(null);
    setAttempt(attempt + 1);
  }

  return (
    <div className="space-y-4">
      <MockQuestionCard
        key={attempt}
        question={question}
        questionNumber={1}
        totalQuestions={1}
        initialSelectedAnswerIds={answer?.selectedAnswerIds}
        initialHasSubmitted={Boolean(answer)}
        onSubmittedAnswer={recordAnswer}
      />

      {answer && (
        <section className="space-y-3 rounded-3xl bg-white px-5 py-5 text-slate-950">
          {storageFailed ? (
            <div role="alert" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Your answer was graded, but your missed-question list could not be updated in this browser.
              <button
                type="button"
                onClick={() => recordAnswer(answer)}
                className="mt-2 block min-h-11 font-semibold underline underline-offset-4"
              >
                Retry saving progress
              </button>
            </div>
          ) : !answer.isCorrect ? (
            <p role="status" className="text-sm leading-6">
              Added to your <Link href="/mistakes" className="font-semibold text-cyan-800 underline">missed questions</Link> until you answer it correctly.
            </p>
          ) : attempt > 0 && (
            <p role="status" className="text-sm leading-6">Cleared from your missed questions.</p>
          )}
          {!answer.isCorrect && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={retryQuestion}
              className="w-full rounded-2xl border border-cyan-700 px-4 py-3 text-sm font-semibold text-cyan-800 disabled:opacity-50"
            >
              Try this question again
            </button>
          )}
          <button
            type="button"
            disabled={isGenerating}
            onClick={onNext}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isGenerating ? "Generating question..." : "Next question"}
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={onChangeSettings}
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-cyan-800 underline disabled:opacity-50"
          >
            Change practice settings
          </button>
        </section>
      )}
    </div>
  );
}
