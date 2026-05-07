import { cn } from "@/lib/utils";
import type { KeyRatio } from "@/lib/types";

interface KeyRatiosStripProps {
  ratios: KeyRatio[];
}

const ASSESSMENT_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; gradient: string; hoverShadow: string }> = {
  strong: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    gradient: "bg-gradient-to-br from-emerald-500/[0.10] via-emerald-500/[0.03] to-transparent",
    hoverShadow: "hover:shadow-emerald-500/[0.08]",
  },
  moderate: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
    gradient: "bg-gradient-to-br from-blue-500/[0.10] via-blue-500/[0.03] to-transparent",
    hoverShadow: "hover:shadow-blue-500/[0.08]",
  },
  weak: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    gradient: "bg-gradient-to-br from-rose-500/[0.10] via-rose-500/[0.03] to-transparent",
    hoverShadow: "hover:shadow-rose-500/[0.08]",
  },
  neutral: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
    gradient: "bg-gradient-to-br from-primary/[0.06] via-primary/[0.01] to-transparent",
    hoverShadow: "hover:shadow-primary/[0.05]",
  },
};

export function KeyRatiosStrip({ ratios }: KeyRatiosStripProps) {
  if (!ratios || ratios.length === 0) return null;

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x snap-mandatory">
        {ratios.map((ratio, i) => {
          const style = ASSESSMENT_STYLES[ratio.assessment] ?? ASSESSMENT_STYLES.neutral;
          return (
            <div
              key={i}
              className={cn(
                "group relative flex flex-col gap-2 rounded-xl border p-4 min-w-[180px] max-w-[220px] shrink-0 snap-start",
                "hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default",
                style.gradient, style.border, style.hoverShadow
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

              {/* Assessment dot */}
              <div className="flex items-center gap-2 relative">
                <div className={cn("h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-125", style.dot)} />
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {ratio.name}
                </span>
              </div>

              {/* Value */}
              <span className={cn("text-2xl font-black tracking-tight transition-transform duration-300 group-hover:scale-[1.02] origin-left", style.text)}>
                {ratio.value}
              </span>

              {/* Context */}
              <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                {ratio.context}
              </span>

              {/* Assessment badge */}
              <span className={cn(
                "self-start text-[11px] font-medium px-2 py-0.5 transition-colors duration-300",
                style.bg, style.text
              )}>
                {ratio.assessment}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
