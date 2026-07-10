"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { LocalExamResult } from "@/lib/exam/sessionTypes";
import { LOCAL_EXAM_RESULT_STORAGE_KEY } from "@/lib/exam/storage";

type TopicStat = {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  percent: number;
};

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

function getTopicStats(result: LocalExamResult | null): TopicStat[] {
  if (!result) {
    return [];
  }

  const topicMap = new Map<string, TopicStat>();

  result.answers.forEach((answer) => {
    const topic = answer.topic || "General AZ-900";

    const existingTopic = topicMap.get(topic) ?? {
      topic,
      total: 0,
      correct: 0,
      wrong: 0,
      percent: 0,
    };

    const updatedTopic = {
      ...existingTopic,
      total: existingTopic.total + 1,
      correct: existingTopic.correct + (answer.isCorrect ? 1 : 0),
      wrong: existingTopic.wrong + (answer.isCorrect ? 0 : 1),
    };

    updatedTopic.percent = Math.round(
      (updatedTopic.correct / updatedTopic.total) * 100,
    );

    topicMap.set(topic, updatedTopic);
  });

  return Array.from(topicMap.values()).sort((firstTopic, secondTopic) => {
    if (secondTopic.wrong !== firstTopic.wrong) {
      return secondTopic.wrong - firstTopic.wrong;
    }

    return firstTopic.percent - secondTopic.percent;
  });
}

function getStudyMessage(result: LocalExamResult, topicStats: TopicStat[]): string {
  if (result.wrongCount === 0) {
    return "Clean run. You can either take another mock exam or move on to generated questions later.";
  }

  const weakestTopic = topicStats.find((topic) => topic.wrong > 0);

  if (!weakestTopic) {
    return "Review your missed questions and retake Mistakes Only practice.";
  }

  return `Focus next on ${weakestTopic.topic}. It had ${weakestTopic.wrong} missed question${
    weakestTopic.wrong === 1 ? "" : "s"
  } in your latest local exam.`;
}

export function LocalProgressStats() {
  const [result, setResult] = useState<LocalExamResult | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setResult(loadLatestResult());
      setHasLoaded(true);
    });
  }, []);

  const topicStats = useMemo(() => getTopicStats(result), [result]);

  const strongestTopics = useMemo(() => {
    return [...topicStats]
      .filter((topic) => topic.correct > 0)
      .sort((firstTopic, secondTopic) => secondTopic.percent - firstTopic.percent)
      .slice(0, 3);
  }, [topicStats]);

  const weakestTopics = useMemo(() => {
    return topicStats.filter((topic) => topic.wrong > 0).slice(0, 3);
  }, [topicStats]);

  if (!hasLoaded) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h1 className="text-xl font-bold">Loading progress stats...</h1>
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
            Progress stats
          </p>

          <h1 className="mt-3 text-2xl font-bold">No progress data yet</h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Complete a local mock exam first. Your score, correct count, wrong
            count, and weak topics will appear here.
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

  const studyMessage = getStudyMessage(result, topicStats);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Progress stats
        </p>

        <h1 className="mt-3 text-2xl font-bold">Latest local exam summary</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          These stats are based on your latest local mock exam only. Full
          long-term progress history will be added later with Supabase.
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

      <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          What to study next
        </p>

        <h2 className="mt-3 text-xl font-bold text-white">Recommended focus</h2>

        <p className="mt-2 text-sm leading-6 text-cyan-50/80">
          {studyMessage}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/mistakes"
            className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
          >
            Practice mistakes
          </Link>

          <Link
            href="/mistakes/review"
            className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
          >
            Review mistakes
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h2 className="text-xl font-bold">Topic performance</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Topics with more missed questions appear first.
        </p>

        <div className="mt-4 space-y-3">
          {topicStats.map((topic) => (
            <article
              key={topic.topic}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    {topic.topic}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {topic.correct} correct · {topic.wrong} wrong · {topic.total}{" "}
                    total
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-800">
                  {topic.percent}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${topic.percent}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <h2 className="text-lg font-bold">Weakest topics</h2>

          {weakestTopics.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              No weak topics in the latest exam.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {weakestTopics.map((topic) => (
                <li key={topic.topic}>
                  <span className="font-semibold">{topic.topic}</span>:{" "}
                  {topic.wrong} missed
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <h2 className="text-lg font-bold">Strongest topics</h2>

          {strongestTopics.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              No correct answers yet. Start with another mock exam.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {strongestTopics.map((topic) => (
                <li key={topic.topic}>
                  <span className="font-semibold">{topic.topic}</span>:{" "}
                  {topic.percent}%
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/mock-exam"
          className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
        >
          Start another exam
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