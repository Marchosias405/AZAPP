type StatusPillTone = "ready" | "soon" | "warning";

type StatusPillProps = {
  label: string;
  tone?: StatusPillTone;
};

const toneClasses: Record<StatusPillTone, string> = {
  ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  soon: "border-slate-200 bg-slate-50 text-slate-600",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

export function StatusPill({ label, tone = "soon" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}