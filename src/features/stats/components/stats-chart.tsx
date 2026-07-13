"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStatsQuery } from "../queries/use-stats-query";

export function StatsChart() {
  const { data, isLoading, isError } = useStatsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Carregando estatísticas...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-48 text-destructive">
        Erro ao carregar estatísticas.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Nenhuma sessão registrada nos últimos 14 dias.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date,
    minutos: Math.round(d.focusSeconds / 60),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            label={{
              value: "minutos",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "minutos") return [`${value} min`, "Foco"];
              return [`${value}`, `${name}`];
            }}
          />
          <Bar dataKey="minutos" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
