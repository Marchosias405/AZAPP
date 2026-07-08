import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/ui/status-pill";
import {
  BUILD_STATUS_ITEMS,
  PART_LABEL,
} from "@/lib/constants/app";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusPill label={PART_LABEL} tone="ready" />
              <h2 className="mt-4 text-xl font-bold">Base app is ready</h2>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This first step creates the clean project foundation before adding
            dashboard cards, mock exams, Supabase, Gemini, validation, or CI/CD.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5">
          <h2 className="text-base font-semibold text-white">Setup includes</h2>

          <ul className="mt-4 space-y-3">
            {BUILD_STATUS_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-800"
              >
                <span>{item}</span>
                <StatusPill label="Done" tone="ready" />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-dashed border-cyan-300/40 bg-cyan-300/10 px-5 py-5">
          <h2 className="text-base font-semibold text-cyan-100">
            Next feature after you confirm
          </h2>
          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            Part 2 will add the static mobile-first dashboard with navigation
            cards for Mock Exam, Mistakes Only, Progress Stats, Generate
            Questions, and Question Bank.
          </p>

          <button
            disabled
            className="mt-4 w-full rounded-2xl bg-slate-700 px-4 py-4 text-sm font-semibold text-slate-300 opacity-70"
          >
            Dashboard cards coming in Part 2
          </button>
        </section>
      </div>
    </AppShell>
  );
}