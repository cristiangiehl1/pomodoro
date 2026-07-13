import { cn } from "@/lib/utils";

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "magenta" | "cyan" | "yellow";
}

const accentStyles: Record<string, string> = {
  magenta:
    "border-[#ff2e97]/60 shadow-[0_0_16px_2px_rgba(255,46,151,0.25),inset_0_0_32px_rgba(255,46,151,0.04)]",
  cyan: "border-[#05d9e8]/60 shadow-[0_0_16px_2px_rgba(5,217,232,0.25),inset_0_0_32px_rgba(5,217,232,0.04)]",
  yellow:
    "border-[#f7e733]/60 shadow-[0_0_16px_2px_rgba(247,231,51,0.25),inset_0_0_32px_rgba(247,231,51,0.04)]",
};

export function NeonCard({
  children,
  className,
  accent = "cyan",
}: NeonCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-[rgba(13,0,21,0.75)] backdrop-blur-md",
        accentStyles[accent],
        className
      )}
    >
      {children}
    </div>
  );
}
