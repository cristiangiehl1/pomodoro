interface OrDividerProps {
  label?: string;
}

/** Divisor horizontal com um rótulo centralizado (ex.: "ou"). */
export function OrDivider({ label = "ou" }: OrDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
