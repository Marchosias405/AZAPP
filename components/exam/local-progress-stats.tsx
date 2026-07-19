"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getLocalExamHistory } from "@/lib/exam/examHistory";
import type { LocalExamResult } from "@/lib/exam/sessionTypes";

type TopicStat = {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  percent: number;
};

type HistorySummary = {
  attempts: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  overallPercent: number;
  bestScorePercent: number;
};

function getTopicStats(results: LocalExamResult[]): TopicStat[] {
  const topicMap = new Map<string, TopicStat>();

  results.forEach((result) => {
    result.answers.forEach((answer) => {
      const topic = answer.topic || "General AZ-900";

      const existingTopic = topicMap.get(topic) ?? {
        topic,
        total: 0,
        correct: 0,
        wrong: 0,
        percent: 0,
      };

      const updatedTopic: TopicStat = {
        ...existingTopic,
        total: existingTopic.total + 1,
        correct: existingTopic.correct + (answer.isCorrect ? 1 : 0),
        wrong: existingTopic.wrong + (answer.isCorrect ? 0 : 1),
        percent: 0,
      };

      updatedTopic.percent = Math.round(
        (updatedTopic.correct / updatedTopic.total) * 100,
      );

      topicMap.set(topic, updatedTopic);
    });
  });

  return Array.from(topicMap.values()).sort(
    (firstTopic, secondTopic) => {
      if (secondTopic.wrong !== firstTopic.wrong) {
        return secondTopic.wrong - firstTopic.wrong;
      }

      if (firstTopic.percent !== secondTopic.percent) {
        return firstTopic.percent - secondTopic.percent;
      }

      return secondTopic.total - firstTopic.total;
    },
  );
}

function getHistorySummary(
  results: LocalExamResult[],
): HistorySummary {
  const totalQuestions = results.reduce(
    (total, result) => total + result.totalQuestions,
    0,
  );

  const correctCount = results.reduce(
    (total, result) => total + result.correctCount,
    0,
  );

  const wrongCount = results.reduce(
    (total, result) => total + result.wrongCount,
    0,
  );

  const overallPercent =
    totalQuestions === 0
      ? 0
      : Math.round((correctCount / totalQuestions) * 100);

  const bestScorePercent =
    results.length === 0
      ? 0
      : Math.max(...results.map((result) => result.scorePercent));

  return {
    attempts: results.length,
    totalQuestions,
    correctCount,
    wrongCount,
    overallPercent,
    bestScorePercent,
  };
}

function getStudyMessage(
  summary: HistorySummary,
  topicStats: TopicStat[],
): string {
  if (summary.wrongCount === 0) {
    return "Clean history so far. Take another mock exam to keep testing your recall.";
  }

  const weakestTopic = topicStats.find((topic) => topic.wrong > 0);

  if (!weakestTopic) {
    return "Review your missed questions and retake Mistakes Only practice.";
  }

  return `Focus next on ${weakestTopic.topic}. It has ${weakestTopic.wrong} missed answer${
    weakestTopic.wrong === 1 ? "" : "s"
  } across your saved attempts.`;
}

function formatCompletedAt(completedAt: string): string {
  const completedDate = new Date(completedAt);

  if (Number.isNaN(completedDate.getTime())) {
    return "Saved local attempt";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(completedDate);
}

export function LocalProgressStats() {
  const [examHistory, setExamHistory] = useState<LocalExamResult[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setExamHistory(getLocalExamHistory());
      setHasLoaded(true);
    });
  }, []);

  const summary = useMemo(
    () => getHistorySummary(examHistory),
    [examHistory],
  );

  const topicStats = useMemo(
    () => getTopicStats(examHistory),
    [examHistory],
  );

  const strongestTopics = useMemo(() => {
    return [...topicStats]
      .filter((topic) => topic.correct > 0)
      .sort((firstTopic, secondTopic) => {
        if (secondTopic.percent !== firstTopic.percent) {
          return secondTopic.percent - firstTopic.percent;
        }

        return secondTopic.total - firstTopic.total;
      })
      .slice(0, 3);
  }, [topicStats]);

  const weakestTopics = useMemo(() => {
    return topicStats.filter((topic) => topic.wrong > 0).slice(0, 3);
  }, [topicStats]);

  const recentAttempts = useMemo(() => {
    return [...examHistory].reverse().slice(0, 5);
  }, [examHistory]);

  if (!hasLoaded) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h1 className="text-xl font-bold">Loading progress stats...</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Checking your saved local exam attempts.
        </p>
      </section>
    );
  }

  if (examHistory.length === 0) {
    return (
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Progress stats
          </p>

          <h1 className="mt-3 text-2xl font-bold">No progress data yet</h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Complete a local mock exam first. Every completed attempt will be
            saved in this browser and summarized here.
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

  const latestResult = examHistory[examHistory.length - 1];
  const studyMessage = getStudyMessage(summary, topicStats);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Progress stats
        </p>

        <h1 className="mt-3 text-2xl font-bold">Local attempt history</h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          These stats combine {summary.attempts} completed local exam
          attempt{summary.attempts === 1 ? "" : "s"} saved in this browser.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Attempts
            </p>
            <p className="mt-1 text-xl font-black">{summary.attempts}</p>
          </div>

          <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Overall
            </p>
            <p className="mt-1 text-xl font-black">
              {summary.overallPercent}%
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Best
            </p>
            <p className="mt-1 text-xl font-black">
              {summary.bestScorePercent}%
            </p>
          </div>

          <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-indigo-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Questions
            </p>
            <p className="mt-1 text-xl font-black">
              {summary.totalQuestions}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Latest exam
        </p>

        <h2 className="mt-3 text-xl font-bold">
          {latestResult.scorePercent}% score
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Completed {formatCompletedAt(latestResult.completedAt)}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Total
            </p>
            <p className="mt-1 text-xl font-black">
              {latestResult.totalQuestions}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Correct
            </p>
            <p className="mt-1 text-xl font-black">
              {latestResult.correctCount}
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Wrong
            </p>
            <p className="mt-1 text-xl font-black">
              {latestResult.wrongCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          What to study next
        </p>

        <h2 className="mt-3 text-xl font-bold text-white">
          Recommended focus
        </h2>

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
            Review latest mistakes
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h2 className="text-xl font-bold">Recent attempts</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your five most recent local mock exams appear here.
        </p>

        <div className="mt-4 space-y-3">
          {recentAttempts.map((attempt, index) => {
            const attemptNumber = summary.attempts - index;

            return (
              <article
                key={`${attempt.completedAt}-${attemptNumber}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">
                      Attempt {attemptNumber}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {formatCompletedAt(attempt.completedAt)}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-800">
                    {attempt.scorePercent}%
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {attempt.correctCount} correct | {attempt.wrongCount} wrong |{" "}
                  {attempt.totalQuestions} total
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h2 className="text-xl font-bold">Topic performance</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This combines topic results from every saved exam attempt.
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
                    {topic.correct} correct | {topic.wrong} wrong |{" "}
                    {topic.total} total
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
              No weak topics across your saved attempts.
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
              No correct answers yet. Start another mock exam.
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