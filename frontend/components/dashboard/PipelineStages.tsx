import { cn } from "@/lib/helpers";
import { pipelineStages } from "@/lib/constants";
import type { PipelineStage } from "@/lib/constants";

interface PipelineStagesProps {
  activeStage: PipelineStage;
  setActiveStage: (stage: PipelineStage) => void;
}

export default function PipelineStages({
  activeStage,
  setActiveStage,
}: PipelineStagesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {pipelineStages.map((stage, index) => {
        const isActive = activeStage === stage.id;
        return (
          <button
            className={cn(
              "group min-h-24 border-[3px] border-[var(--neo-teal)] rounded-[var(--neo-radius)] p-4 text-left transition-all duration-200 sm:min-h-28 sm:p-6 lg:min-h-32 outline-none shadow-sm",
              isActive ? "bg-[var(--neo-teal)]" : "bg-white hover:bg-[var(--neo-teal-soft)]",
            )}
            key={stage.id}
            onClick={() => setActiveStage(stage.id)}
            type="button"
          >
            <p
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.25em]",
                isActive ? "text-[var(--neo-teal-soft)]" : "text-slate-400",
              )}
            >
              0{index + 1}
            </p>
            <div className="mt-3 flex items-center justify-between gap-4 sm:mt-5">
              <strong
                className={cn(
                  "text-xl font-bold sm:text-2xl lg:text-3xl tracking-tight",
                  isActive ? "text-white" : "text-[var(--neo-teal-dark)]",
                )}
              >
                {stage.label}
              </strong>
              <span
                className={cn(
                  "text-lg transition-transform duration-200 group-hover:translate-x-1",
                  isActive ? "text-[var(--neo-teal-soft)]" : "text-[var(--neo-teal)]",
                )}
              >
                →
              </span>
            </div>
            <p
              className={cn(
                "mt-2 text-xs font-semibold sm:mt-4 sm:text-sm leading-relaxed",
                isActive ? "text-[var(--neo-teal-soft)]/90" : "text-slate-500",
              )}
            >
              {stage.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
