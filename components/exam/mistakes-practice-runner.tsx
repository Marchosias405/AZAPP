"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MockQuestionCard } from "@/components/exam/mock-question-card";
import {
  getMissedQuestions,
  recordPracticeOutcome,
  saveMistakesPracticeSession,
  type MistakesPracticeAnswer,
} from "@/lib/exam/mistakeStorage";
import type { QuestionAnswerRecord } from "@/lib/exam/sessionTypes";
import type { LocalQuestion } from "@/lib/exam/types";

const PRIMARY = "rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-semibold text-slate-950";
const SECONDARY = "rounded-2xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white";

export function MistakesPracticeRunner() {
  const [questions, setQuestions] = useState<LocalQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<MistakesPracticeAnswer[]>([]);
  const [startedAt, setStartedAt] = useState("");
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  function startRound() {
    try {
      const missed = getMissedQuestions();
      // Give repeat rounds a different question order.
      for (let i = missed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [missed[i], missed[j]] = [missed[j], missed[i]];
      }
      setQuestions(missed);
      setCurrentIndex(0);
      setAnswers([]);
      setStartedAt(new Date().toISOString());
      setFinished(false);
      setError("");
    } catch {
      setQuestions(null);
      setError("Your missed questions could not be loaded. Check that browser storage is available and try again.");
    }
  }

  useEffect(() => { queueMicrotask(startRound); }, []);

  const question = questions?.[currentIndex];
  const answer = answers[currentIndex];
  const correct = answers.filter((item) => item.isCorrect).length;
  const wrong = answers.length - correct;
  const percent = answers.length ? Math.round(100 * correct / answers.length) : 0;

  function submit(record: QuestionAnswerRecord) {
    if (!question || answer) return false;
    try {
      recordPracticeOutcome(question, record.isCorrect);
    } catch {
      setError("Your practice progress could not be saved. Check browser storage and submit again.");
      return false;
    }
    setError("");
    setAnswers([...answers, {
      questionId: question.id,
      selectedAnswerIds: record.selectedAnswerIds,
      correctAnswerIds: record.correctAnswerIds,
      isCorrect: record.isCorrect,
      answeredAt: new Date().toISOString(),
    }]);
  }

  function next() {
    if (!questions || !answer) return;
    setError("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    try {
      saveMistakesPracticeSession({
        id: crypto.randomUUID?.() ?? `mistakes-${startedAt}`,
        mode: "mistakes-only",
        startedAt,
        completedAt: new Date().toISOString(),
        score: { correct, wrong, total: answers.length, percent },
        answers,
      });
      setFinished(true);
    } catch {
      setError("Your answers were recorded, but this practice summary could not be saved. Try finishing the round again.");
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Mistakes Only</h1>
      {error && <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
      {!questions ? (
        error
          ? <button type="button" onClick={startRound} className={PRIMARY}>Retry loading</button>
          : <p className="text-slate-200">Loading missed questions…</p>
      ) : finished ? (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 text-slate-950">
            <h2 className="text-xl font-bold">Practice complete</h2>
            <p className="mt-2">{correct} of {answers.length} correct ({percent}%).</p>
            <p className="mt-2 text-sm text-slate-700">
              {wrong ? "Practice the questions you missed again when you’re ready." : "You cleared every question in this round."}
            </p>
          </div>
          {wrong > 0 && <button type="button" onClick={startRound} className={PRIMARY}>Practice remaining mistakes</button>}
        </div>
      ) : question ? (
        <>
          <MockQuestionCard
            key={question.id}
            question={question}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            initialHasSubmitted={Boolean(answer)}
            initialSelectedAnswerIds={answer?.selectedAnswerIds}
            onSubmittedAnswer={submit}
          />
          {answer && (
            <div className="space-y-3">
              <p role="status" className="text-sm text-slate-200">
                {answer.isCorrect ? "Cleared from your missed questions." : "Saved for another practice round."}
              </p>
              <button type="button" onClick={next} className={PRIMARY}>
                {currentIndex === questions.length - 1 ? "Finish practice" : "Next question"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl bg-white p-5 text-slate-950">
          <h2 className="text-xl font-bold">You’re all caught up</h2>
          <p className="mt-2 text-sm text-slate-700">Any question you miss in practice or a mock exam will appear here until you answer it correctly.</p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {questions && (finished || !question) && <Link href="/mock-exam" className={SECONDARY}>Start mock exam</Link>}
        <Link href="/" className={SECONDARY}>Back to dashboard</Link>
      </div>
    </section>
  );
}
