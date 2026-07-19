import { AppShell } from "@/components/app-shell";
import { LocalProgressStats } from "@/components/exam/local-progress-stats";

export default function StatsPage() {
  return (
    <AppShell>
      <LocalProgressStats />
    </AppShell>
  );
}