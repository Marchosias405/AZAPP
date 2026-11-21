import { AppShell } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { DASHBOARD_CARDS } from "@/lib/constants/dashboard";

export default function Home() {
  const cards = DASHBOARD_CARDS.filter(
    (card) => card.href !== "/generate" || process.env.NODE_ENV === "development",
  );
  return (
    <AppShell>
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Practice for the AZ-900</h2>
        {cards.map((card) => <DashboardCard key={card.href} card={card} />)}
      </section>
    </AppShell>
  );
}
