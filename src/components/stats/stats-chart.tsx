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
import { useStatsQuery } from "@/queries/stats/use-stats-query";

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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,224,203,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#b6a488" }}
            stroke="rgba(236,224,203,0.2)"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#b6a488" }}
            stroke="rgba(236,224,203,0.2)"
            label={{
              value: "minutos",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#b6a488" },
            }}
          />
          <Tooltip
            cursor={{ fill: "rgba(236,224,203,0.06)" }}
            contentStyle={{
              background: "#29211a",
              border: "1px solid rgba(236,224,203,0.15)",
              borderRadius: 12,
              color: "#ece0cb",
            }}
            formatter={(value, name) => {
              if (name === "minutos") return [`${value} min`, "Foco"];
              return [`${value}`, `${name}`];
            }}
          />
          <Bar dataKey="minutos" fill="#d95a48" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
