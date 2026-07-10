import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LocalMockExamEntry } from "@/components/exam/local-mock-exam-entry";
import { LOCAL_MOCK_QUESTIONS } from "@/lib/exam/localQuestions";

export default function MockExamPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Local mock exam
          </p>

          <h2 className="mt-2 text-xl font-bold text-white">
            Score calculation mode
          </h2>

          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            Complete up to five active local questions to see your score and
            missed questions. Disabled questions are excluded, and
            non-mastered questions are selected before mastered questions.
          </p>
        </section>

        <LocalMockExamEntry questions={LOCAL_MOCK_QUESTIONS} />

        <Link
          href="/"
          className="block w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-center text-sm font-semibold text-white"
        >
          Exit exam and return to dashboard
        </Link>
      </div>
    </AppShell>
  );
}