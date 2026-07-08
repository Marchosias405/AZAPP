"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { LocalExamResult } from "@/lib/exam/sessionTypes";
import { LOCAL_EXAM_RESULT_STORAGE_KEY } from "@/lib/exam/storage";

export default function LocalExamResultsPage() {
  const [result, setResult] = useState<LocalExamResult | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const savedResult = window.localStorage.getItem(
      LOCAL_EXAM_RESULT_STORAGE_KEY,
    );

    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult) as LocalExamResult);
      } catch {
        setResult(null);
      }
    }

    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return (
      <AppShell>
        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <h2 className="text-xl font-bold">Loading results...</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Checking your local exam result.
          </p>
        </section>
      </AppShell>
    );
  }

  if (!result) {
    return (
      <AppShell>
        <div className="space-y-4">
          <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
            <h2 className="text-xl font-bold">No result found</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Complete a local mock exam first. Results are stored only in this
              browser for now.
            </p>
          </section>

          <Link
            href="/mock-exam"
            className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
          >
            Start local mock exam
          </Link>

          <Link
            href="/"
            className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  const missedAnswers = result.answers.filter((answer) => !answer.isCorrect);

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Local exam result
          </p>

          <h2 className="mt-2 text-4xl font-black text-white">
            {result.scorePercent}%
          </h2>

          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            You got {result.correctCount} correct and {result.wrongCount} wrong
            out of {result.totalQuestions} questions.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-emerald-50 px-5 py-5 text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Correct
            </p>
            <p className="mt-2 text-3xl font-black">{result.correctCount}</p>
          </div>

          <div className="rounded-3xl bg-rose-50 px-5 py-5 text-rose-900">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Wrong
            </p>
            <p className="mt-2 text-3xl font-black">{result.wrongCount}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <h2 className="text-xl font-bold">Missed questions</h2>

          {missedAnswers.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
              No missed questions. Clean run.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {missedAnswers.map((answer) => (
                <article
                  key={answer.questionId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Question {answer.questionNumber} · {answer.topic}
                  </p>

                  <h3 className="mt-2 text-base font-bold leading-7">
                    {answer.questionText}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-rose-700">
                    <span className="font-semibold">Your answer: </span>
                    {answer.selectedAnswerText}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    <span className="font-semibold">Correct answer: </span>
                    {answer.correctAnswerText}
                  </p>

                  <div className="mt-3 rounded-2xl bg-white px-4 py-4">
                    <p className="text-sm font-bold">Explanation</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {answer.explanation}
                    </p>
                  </div>

                  <div className="mt-3 rounded-2xl bg-white px-4 py-4">
                    <p className="text-sm font-bold">Memory hook</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {answer.memoryHook}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <Link
          href="/mock-exam"
          className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
        >
          Start another local exam
        </Link>

        <Link
          href="/"
          className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </AppShell>
  );
}