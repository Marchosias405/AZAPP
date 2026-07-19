"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MockExamRunner } from "@/components/exam/mock-exam-runner";
import { getLocalDisabledQuestions } from "@/lib/exam/disabledQuestions";
import { getLocalMasteredQuestions } from "@/lib/exam/masteredQuestions";
import {
  LOCAL_MOCK_EXAM_MAX_QUESTIONS,
  selectLocalExamQuestions,
} from "@/lib/exam/selectLocalExamQuestions";
import type { LocalQuestion } from "@/lib/exam/types";

type LocalMockExamEntryProps = {
  questions: LocalQuestion[];
};

export function LocalMockExamEntry({ questions }: LocalMockExamEntryProps) {
  const [examQuestions, setExamQuestions] = useState<LocalQuestion[] | null>(
    null,
  );
  const [disabledCount, setDisabledCount] = useState(0);
  const [activeQuestionCount, setActiveQuestionCount] = useState(0);
  const [activeMasteredCount, setActiveMasteredCount] = useState(0);
  const [selectedMasteredCount, setSelectedMasteredCount] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      const disabledQuestionIds = new Set(
        getLocalDisabledQuestions().map(
          (disabledQuestion) => disabledQuestion.questionId,
        ),
      );

      const masteredQuestionIds = new Set(
        getLocalMasteredQuestions().map(
          (masteredQuestion) => masteredQuestion.questionId,
        ),
      );

      const enabledQuestions = questions.filter(
        (question) => !disabledQuestionIds.has(question.id),
      );

      const selectedQuestions = selectLocalExamQuestions({
        questions: enabledQuestions,
        masteredQuestionIds,
      });

      const enabledMasteredQuestionCount = enabledQuestions.filter((question) =>
        masteredQuestionIds.has(question.id),
      ).length;

      const selectedMasteredQuestionCount = selectedQuestions.filter(
        (question) => masteredQuestionIds.has(question.id),
      ).length;

      setExamQuestions(selectedQuestions);
      setDisabledCount(questions.length - enabledQuestions.length);
      setActiveQuestionCount(enabledQuestions.length);
      setActiveMasteredCount(enabledMasteredQuestionCount);
      setSelectedMasteredCount(selectedMasteredQuestionCount);
    });
  }, [questions]);

  if (examQuestions === null) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <h2 className="text-xl font-bold">Preparing local exam...</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Checking disabled and mastered questions, then selecting your exam.
        </p>
      </section>
    );
  }

  if (examQuestions.length === 0) {
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

  const skippedActiveCount = activeQuestionCount - examQuestions.length;
  const shouldShowSelectionSummary =
    activeMasteredCount > 0 || skippedActiveCount > 0;

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

      {shouldShowSelectionSummary ? (
        <section className="rounded-3xl border border-indigo-200 bg-indigo-50 px-5 py-5 text-indigo-950">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            Local exam selection
          </p>

          <h2 className="mt-2 text-lg font-bold">
            Non-mastered questions come first
          </h2>

          <p className="mt-2 text-sm leading-6">
            This exam uses {examQuestions.length} of {activeQuestionCount}{" "}
            active question{activeQuestionCount === 1 ? "" : "s"}.
            Non-mastered questions fill the exam first. Mastered questions are
            only included when needed to fill up to{" "}
            {LOCAL_MOCK_EXAM_MAX_QUESTIONS} spots.
          </p>

          {activeMasteredCount > 0 ? (
            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold leading-6">
              Included {selectedMasteredCount} of {activeMasteredCount} active
              mastered question{activeMasteredCount === 1 ? "" : "s"}.
            </p>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-indigo-800">
            Question order and any mastered-question slots are randomized when
            the exam starts.
          </p>
        </section>
      ) : null}

      <MockExamRunner questions={examQuestions} />
    </div>
  );
}