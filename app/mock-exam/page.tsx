import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MockQuestionCard } from "@/components/exam/mock-question-card";
import {
  getLocalQuestionByIndex,
  getTotalLocalQuestionCount,
} from "@/lib/exam/localQuestions";

type MockExamPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
};

function getSafeQuestionNumber(rawQuestionNumber: string | undefined) {
  const totalQuestions = getTotalLocalQuestionCount();
  const parsedNumber = Number(rawQuestionNumber ?? "1");

  if (!Number.isFinite(parsedNumber)) {
    return 1;
  }

  if (parsedNumber < 1) {
    return 1;
  }

  if (parsedNumber > totalQuestions) {
    return totalQuestions;
  }

  return Math.floor(parsedNumber);
}

export default async function MockExamPage({
  searchParams,
}: MockExamPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawQuestionNumber = Array.isArray(params.q) ? params.q[0] : params.q;

  const totalQuestions = getTotalLocalQuestionCount();
  const questionNumber = getSafeQuestionNumber(rawQuestionNumber);
  const questionIndex = questionNumber - 1;
  const question = getLocalQuestionByIndex(questionIndex);

  const hasPreviousQuestion = questionNumber > 1;
  const hasNextQuestion = questionNumber < totalQuestions;

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Local mock exam
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Basic exam screen
          </h2>

          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            This page uses local sample questions only. No Supabase, Gemini, or
            answer tracking is connected yet.
          </p>
        </section>

        <MockQuestionCard
          question={question}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="grid grid-cols-2 gap-3">
          {hasPreviousQuestion ? (
            <Link
              href={`/mock-exam?q=${questionNumber - 1}`}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-slate-500">
              Previous
            </span>
          )}

          {hasNextQuestion ? (
            <Link
              href={`/mock-exam?q=${questionNumber + 1}`}
              className="rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-2xl bg-slate-700 px-4 py-4 text-center text-sm font-semibold text-slate-300">
              Last question
            </span>
          )}
        </div>

        <button
          disabled
          className="w-full rounded-2xl bg-slate-700 px-4 py-4 text-sm font-semibold text-slate-300 opacity-70"
        >
          Submit answer coming in Part 4
        </button>

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