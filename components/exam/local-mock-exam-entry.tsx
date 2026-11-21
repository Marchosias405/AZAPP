"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MockExamRunner } from "@/components/exam/mock-exam-runner";
import { getLocalDisabledQuestions } from "@/lib/exam/disabledQuestions";
import { getLocalMasteredQuestions } from "@/lib/exam/masteredQuestions";
import { getMissedQuestions } from "@/lib/exam/mistakeStorage";
import { selectLocalExamQuestions } from "@/lib/exam/selectLocalExamQuestions";
import type { LocalQuestion } from "@/lib/exam/types";

export function LocalMockExamEntry({ questions }: { questions: LocalQuestion[] }) {
  const [exam, setExam] = useState<LocalQuestion[] | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const missed = getMissedQuestions();
        const pool = new Map(questions.map((q) => [q.id, q]));
        for (const q of missed) pool.set(q.id, q);
        const disabled = new Set(getLocalDisabledQuestions().map((q) => q.questionId));
        setExam(selectLocalExamQuestions({
          questions: [...pool.values()].filter((q) => !disabled.has(q.id)),
          missedQuestionIds: new Set(missed.map((q) => q.id)),
          masteredQuestionIds: new Set(getLocalMasteredQuestions().map((q) => q.questionId)),
        }));
      } catch {
        setStorageFailed(true);
      }
    });
  }, [questions]);

  if (storageFailed) {
    return <p role="alert" className="rounded-2xl bg-white p-4 text-slate-950">Your study history could not be opened. Check that browser storage is available, then reload the exam.</p>;
  }
  if (!exam) {
    return <p role="status" className="text-sm text-slate-200">Preparing your exam…</p>;
  }
  if (!exam.length) {
    return (
      <section className="rounded-2xl bg-white p-4 text-slate-950">
        <h2 className="font-bold">No active questions</h2>
        <Link className="mt-2 inline-block underline" href="/question-bank">Enable questions in the question bank</Link>
      </section>
    );
  }
  return <MockExamRunner questions={exam} />;
}
