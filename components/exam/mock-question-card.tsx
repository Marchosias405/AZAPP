import type { LocalQuestion, QuestionType } from "@/lib/exam/types";
import { StatusPill } from "@/components/ui/status-pill";

type MockQuestionCardProps = {
  question: LocalQuestion;
  questionNumber: number;
  totalQuestions: number;
};

const questionTypeLabels: Record<QuestionType, string> = {
  "single-answer": "Choose 1 answer",
  "choose-2": "Choose 2 answers",
  "choose-3": "Choose 3 answers",
  scenario: "Scenario question",
  "common-confusion": "Common confusion",
};

export function MockQuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: MockQuestionCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill
          label={`Question ${questionNumber}/${totalQuestions}`}
          tone="ready"
        />
        <StatusPill label={questionTypeLabels[question.questionType]} />
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {question.domain}
        </p>
        <p className="text-sm font-medium text-slate-600">{question.topic}</p>
      </div>

      <h2 className="mt-5 text-xl font-bold leading-8">
        {question.questionText}
      </h2>

      <div className="mt-5 space-y-3">
        {question.options.map((option) => (
          <div
            key={option.id}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {option.id}
            </span>
            <span>{option.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        Answer selection, submit behavior, explanations, and memory hooks are
        coming in Part 4.
      </div>
    </article>
  );
}