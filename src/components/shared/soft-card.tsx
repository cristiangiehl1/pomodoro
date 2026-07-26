import { cn } from "@/lib/utils";

type Tone = "sky" | "meadow" | "amber" | "clay";

interface SoftCardProps {
  children: React.ReactNode;
  className?: string;
  /** Realce de borda superior, no espírito das cores Ghibli. */
  tone?: Tone;
}

/**
 * Cartão de "pergaminho fosco" — superfície translúcida, cantos arredondados e
 * sombra macia (sem glow neon). Reutilizado em toda a UI Ghibli lo-fi.
 */
const toneAccent: Record<Tone, string> = {
  sky: "before:bg-primary/70",
  meadow: "before:bg-secondary-foreground/50",
  amber: "before:bg-accent/80",
  clay: "before:bg-chart-4/70",
};

export function SoftCard({ children, className, tone = "sky" }: SoftCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70",
        "bg-card/85 shadow-soft backdrop-blur-xl",
        // faixa de cor suave no topo do cartão
        "before:absolute before:inset-x-0 before:top-0 before:h-1",
        toneAccent[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
