import type { Metadata } from "next";
import { StatsChart } from "@/features/stats/components/stats-chart";

export const metadata: Metadata = {
  title: "Estatísticas",
  description: "Visualize seu histórico de foco dos últimos 14 dias.",
};

export default function StatsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Estatísticas</h1>
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Minutos de foco por dia (últimos 14 dias)
        </h2>
        <StatsChart />
      </section>
    </main>
  );
}
