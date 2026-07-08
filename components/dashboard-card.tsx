import type { DashboardCard as DashboardCardType } from "@/lib/constants/dashboard";
import { StatusPill } from "@/components/ui/status-pill";

type DashboardCardProps = {
  card: DashboardCardType;
};

export function DashboardCard({ card }: DashboardCardProps) {
  const isReady = card.status === "ready";

  return (
    <article className="rounded-3xl border border-white/10 bg-white px-5 py-5 text-slate-950 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold leading-7">{card.title}</h2>

        <StatusPill
          label={isReady ? "Ready" : "Locked"}
          tone={isReady ? "ready" : "soon"}
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {card.description}
      </p>

      <button
        disabled={!isReady}
        className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {card.buttonLabel}
      </button>
    </article>
  );
}