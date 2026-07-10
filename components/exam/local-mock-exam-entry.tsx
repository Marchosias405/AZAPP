"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MockExamRunner } from "@/components/exam/mock-exam-runner";
import { getLocalDisabledQuestions } from "@/lib/exam/disabledQuestions";
import type { LocalQuestion } from "@/lib/exam/types";

type LocalMockExamEntryProps = {
  questions: LocalQuestion[];
};

export function LocalMockExamEntry({ questions }: LocalMockExamEntryProps) {
  const [activeQuestions, setActiveQuestions] = useState<LocalQuestion[] | null>(
    null,
  );
  const [disabledCount, setDisabledCount] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      const disabledQuestionIds = new Set(
        getLocalDisabledQuestions().map(
          (disabledQuestion) => disabledQuestion.questionId,
        ),
      );

      const enabledQuestions = questions.filter(
        (question) => !disabledQuestionIds.has(question.id),
      );

      setActiveQuestions(enabledQuestions);
      setDisabledCount(questions.length - enabledQuestions.length);
    });
  }, [questions]);

  if (activeQuestions === null) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h2 className="text-xl font-bold">Loading local exam...</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Checking whether any local questions are disabled.
        </p>
      </section>
    );
  }

  if (activeQuestions.length === 0) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-5 text-rose-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          No active questions
        </p>

        <h2 className="mt-3 text-xl font-bold">
          All local questions are disabled
        </h2>

        <p className="mt-2 text-sm leading-6">
          You disabled all local questions. Re-enable at least one question in
          the Question Bank before starting a local mock exam.
        </p>

        <Link
          href="/question-bank"
          className="mt-5 block w-full rounded-2xl bg-rose-400 px-4 py-4 text-center text-sm font-bold text-rose-950"
        >
          Open question bank
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {disabledCount > 0 ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-5 text-amber-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            Disabled questions skipped
          </p>

          <p className="mt-2 text-sm leading-6">
            {disabledCount} local question{disabledCount === 1 ? "" : "s"}{" "}
            disabled in the Question Bank will not appear in this mock exam.
          </p>

          <Link
            href="/question-bank"
            className="mt-4 block w-full rounded-2xl border border-amber-300 bg-white px-4 py-3 text-center text-sm font-bold text-amber-950"
          >
            Manage disabled questions
          </Link>
        </section>
      ) : null}

      <MockExamRunner questions={activeQuestions} />
    </div>
  );
}