import type { Metadata } from "next";
import { StatsChart } from "@/features/stats/components/stats-chart";
import { GridBackground } from "@/components/shared/grid-background";
import { AppNav } from "@/components/shared/app-nav";

export const metadata: Metadata = {
  title: "Estatísticas",
  description: "Visualize seu histórico de foco dos últimos 14 dias.",
};

export default function StatsPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <GridBackground />
      <AppNav />
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <h1
          className="text-2xl font-semibold mb-6"
          style={{
            color: "#05d9e8",
            textShadow: "0 0 8px rgba(5,217,232,0.6)",
          }}
        >
          Estatísticas
        </h1>
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Minutos de foco por dia (últimos 14 dias)
          </h2>
          <StatsChart />
        </section>
      </main>
    </div>
  );
}
