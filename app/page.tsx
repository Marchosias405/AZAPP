import { AppShell } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { StatusPill } from "@/components/ui/status-pill";
import { BUILD_STATUS_ITEMS, PART_LABEL } from "@/lib/constants/app";
import { DASHBOARD_CARDS } from "@/lib/constants/dashboard";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
          <StatusPill label={PART_LABEL} tone="ready" />

          <h2 className="mt-4 text-xl font-bold">
            Mistakes Only is connected
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            You can now start a local mock exam, review your results, and open
            Mistakes Only from the dashboard to practice missed questions.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5">
          <h2 className="text-base font-semibold text-white">Current status</h2>

          <ul className="mt-4 space-y-3">
            {BUILD_STATUS_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-800"
              >
                <span>{item}</span>
                <StatusPill label="Done" tone="ready" />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Study dashboard
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              What do you want to do?
            </h2>
          </div>

          <div className="space-y-4">
            {DASHBOARD_CARDS.map((card) => (
              <DashboardCard key={card.title} card={card} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-cyan-300/40 bg-cyan-300/10 px-5 py-5">
          <h2 className="text-base font-semibold text-cyan-100">
            Next feature after you confirm
          </h2>

          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            Part 8 can add a proper mistake review page with filters, empty
            states, and clearer history before we move toward Supabase.
          </p>
        </section>
      </div>
    </AppShell>
  );
}