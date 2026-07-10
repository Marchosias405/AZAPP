"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { LocalExamResult } from "@/lib/exam/sessionTypes";
import { LOCAL_EXAM_RESULT_STORAGE_KEY } from "@/lib/exam/storage";

type DomainFilter = "all" | string;

function loadLatestResult(): LocalExamResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedResult = window.localStorage.getItem(LOCAL_EXAM_RESULT_STORAGE_KEY);

  if (!savedResult) {
    return null;
  }

  try {
    return JSON.parse(savedResult) as LocalExamResult;
  } catch {
    return null;
  }
}

export function MistakesReview() {
  const [result, setResult] = useState<LocalExamResult | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");

  useEffect(() => {
    queueMicrotask(() => {
      setResult(loadLatestResult());
      setHasLoaded(true);
    });
  }, []);

  const missedAnswers = useMemo(() => {
    return result?.answers.filter((answer) => !answer.isCorrect) ?? [];
  }, [result]);

  const availableTopics = useMemo(() => {
    const topics = new Set<string>();

    missedAnswers.forEach((answer) => {
      if (answer.topic) {
        topics.add(answer.topic);
      }
    });

    return Array.from(topics).sort();
  }, [missedAnswers]);

  const filteredMissedAnswers = useMemo(() => {
    if (domainFilter === "all") {
      return missedAnswers;
    }

    return missedAnswers.filter((answer) => answer.topic === domainFilter);
  }, [domainFilter, missedAnswers]);

  if (!hasLoaded) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h1 className="text-xl font-bold">Loading mistake review...</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Checking your latest local mock exam result.
        </p>
      </section>
    );
  }

  if (!result) {
    return (
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Mistake review
          </p>

          <h1 className="mt-3 text-2xl font-bold">No exam result found</h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Complete a local mock exam first. Your missed questions will appear
            here after the results page is created.
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
    );
  }

  if (missedAnswers.length === 0) {
    return (
      <div className="space-y-4">
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-emerald-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Mistake review
          </p>

          <h1 className="mt-3 text-2xl font-bold">No mistakes in latest exam</h1>

          <p className="mt-2 text-sm leading-6">
            Clean run. Your latest local exam had no missed questions.
          </p>
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
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Mistake review
        </p>

        <h1 className="mt-3 text-2xl font-bold">Review missed questions</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your latest local exam had {result.wrongCount} missed question
          {result.wrongCount === 1 ? "" : "s"} out of {result.totalQuestions}.
          Use this page to review explanations without retaking the practice
          flow.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Score
            </p>
            <p className="mt-1 text-xl font-black">{result.scorePercent}%</p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Correct
            </p>
            <p className="mt-1 text-xl font-black">{result.correctCount}</p>
          </div>

          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Wrong
            </p>
            <p className="mt-1 text-xl font-black">{result.wrongCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <label
          htmlFor="topic-filter"
          className="text-sm font-bold text-slate-800"
        >
          Filter by topic
        </label>

        <select
          id="topic-filter"
          value={domainFilter}
          onChange={(event) => setDomainFilter(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
        >
          <option value="all">All missed topics</option>

          {availableTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Showing {filteredMissedAnswers.length} of {missedAnswers.length} missed
          questions.
        </p>
      </section>

      <section className="space-y-4">
        {filteredMissedAnswers.map((answer) => (
          <article
            key={answer.questionId}
            className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Question {answer.questionNumber} · {answer.topic}
            </p>

            <h2 className="mt-2 text-base font-bold leading-7">
              {answer.questionText}
            </h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-rose-50 px-4 py-4 text-rose-900">
                <p className="text-sm font-bold">Your answer</p>
                <p className="mt-2 text-sm leading-6">
                  {answer.selectedAnswerText}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-900">
                <p className="text-sm font-bold">Correct answer</p>
                <p className="mt-2 text-sm leading-6">
                  {answer.correctAnswerText}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-sm font-bold">Explanation</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {answer.explanation}
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-50 px-4 py-4 text-cyan-950">
                <p className="text-sm font-bold">Memory hook</p>
                <p className="mt-2 text-sm leading-6">{answer.memoryHook}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/mistakes"
          className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
        >
          Practice these mistakes
        </Link>

        <Link
          href="/"
          className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}