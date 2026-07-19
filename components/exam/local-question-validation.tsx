import Link from "next/link";

import { LOCAL_MOCK_QUESTIONS } from "@/lib/exam/localQuestions";
import { validateLocalQuestionBank } from "@/lib/validation/questionRules";

export function LocalQuestionValidation() {
  const validationSummary = validateLocalQuestionBank(
    LOCAL_MOCK_QUESTIONS,
  );

  const allQuestionsValid = validationSummary.invalidCount === 0;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Question validation
        </p>

        <h1 className="mt-3 text-2xl font-bold">
          Local validation report
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This report checks every local question against required
          structure and deterministic AZ-900 question rules.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Total
            </p>
            <p className="mt-1 text-xl font-black">
              {validationSummary.totalCount}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Valid
            </p>
            <p className="mt-1 text-xl font-black">
              {validationSummary.validCount}
            </p>
          </div>

          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-950">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              Invalid
            </p>
            <p className="mt-1 text-xl font-black">
              {validationSummary.invalidCount}
            </p>
          </div>
        </div>

        <div
          className={
            allQuestionsValid
              ? "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950"
              : "mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-950"
          }
        >
          <p className="text-sm font-bold">
            {allQuestionsValid
              ? "All local questions passed"
              : "Some questions need attention"}
          </p>

          <p className="mt-2 text-sm leading-6">
            {allQuestionsValid
              ? "No structural or deterministic rule errors were found."
              : "Review the exact validation errors shown below before using the affected questions."}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-indigo-200 bg-indigo-50 px-5 py-5 text-indigo-950">
        <h2 className="text-lg font-bold">
          What this validation checks
        </h2>

        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>Required fields, supported domains, topics, and types</li>
          <li>Unique answer IDs and answer text</li>
          <li>Correct answers that exist in the option list</li>
          <li>Matching select count and correct-answer count</li>
          <li>Forbidden “all” and “none of the above” options</li>
          <li>No claims that a question is a real exam question</li>
        </ul>

        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-xs leading-5 text-indigo-800">
          This deterministic check cannot prove that every Azure fact is
          correct. Deeper factual review will remain a separate optional
          validation step later.
        </p>
      </section>

      <section className="space-y-4">
        {validationSummary.results.map((result, index) => {
          const question = LOCAL_MOCK_QUESTIONS[index];

          return (
            <article
              key={`${result.questionId}-${index}`}
              className={
                result.isValid
                  ? "rounded-3xl border border-emerald-200 bg-white px-5 py-5 text-slate-950"
                  : "rounded-3xl border border-rose-200 bg-rose-50 px-5 py-5 text-slate-950"
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  Question {index + 1}
                </span>

                <span
                  className={
                    result.isValid
                      ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900"
                      : "rounded-full bg-rose-200 px-3 py-1 text-xs font-bold text-rose-950"
                  }
                >
                  {result.isValid ? "Valid" : "Needs attention"}
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {question?.topic ?? result.questionId}
              </p>

              <h2 className="mt-2 text-base font-bold leading-7">
                {result.questionText}
              </h2>

              {result.isValid ? (
                <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">
                  No validation errors found.
                </p>
              ) : (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-white px-4 py-4">
                  <p className="text-sm font-bold text-rose-950">
                    Validation errors
                  </p>

                  <ul className="mt-3 space-y-3">
                    {result.issues.map((issue, issueIndex) => (
                      <li
                        key={`${issue.path}-${issueIndex}`}
                        className="text-sm leading-6 text-rose-900"
                      >
                        <span className="font-bold">{issue.path}: </span>
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/question-bank"
          className="block w-full rounded-2xl bg-cyan-300 px-4 py-4 text-center text-sm font-semibold text-slate-950"
        >
          Back to question bank
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