import { badgeClass, cn, summaryToneClass } from "@/lib/helpers";
import type { SummaryMetric } from "@/types/medrush";

interface SummaryMetricsProps {
  isLoading: boolean;
  summary: SummaryMetric[];
  focusedMetric: string;
  onSummaryFocus: (label: string) => void;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse border border-slate-200 bg-white p-6">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-6 h-10 w-16 rounded bg-slate-200" />
    </div>
  );
}

export default function SummaryMetrics({
  isLoading,
  summary,
  focusedMetric,
  onSummaryFocus,
}: SummaryMetricsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : summary.map((metric, index) => (
            <button
              className={cn(
                "animate-fadeInUp border border-[#111518] bg-transparent p-4 text-left transition-all duration-200 hover:bg-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111518] active:translate-y-0 active:shadow-none sm:p-6",
                focusedMetric === metric.label &&
                  "bg-white shadow-[6px_6px_0_#111518] -translate-y-0.5 sm:shadow-[8px_8px_0_#111518]",
              )}
              key={metric.label}
              onClick={() => onSummaryFocus(metric.label)}
              style={{ animationDelay: `${index * 80}ms` }}
              type="button"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 sm:text-xs sm:tracking-[0.25em]">
                {metric.label}
              </p>
              <div className="mt-5 flex items-end justify-between sm:mt-8">
                <strong
                  className={cn(
                    "text-4xl font-medium leading-none tabular-nums sm:text-5xl lg:text-6xl",
                    summaryToneClass(metric.tone),
                  )}
                >
                  {metric.value}
                </strong>
                <span
                  className={cn(
                    "border px-2 py-0.5 text-[10px] font-black sm:px-3 sm:py-1 sm:text-xs",
                    badgeClass(metric.tone),
                  )}
                >
                  {focusedMetric === metric.label ? "Focused" : "Today"}
                </span>
              </div>
            </button>
          ))}
    </div>
  );
}
