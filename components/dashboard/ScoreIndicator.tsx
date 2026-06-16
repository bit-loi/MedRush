import { badgeClass, cn, severityFromScore } from "@/lib/helpers";

export default function ScoreIndicator({ score }: { score: number }) {
  const level = severityFromScore(score);
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full border text-sm font-black tabular-nums",
          badgeClass(level),
        )}
      >
        {score}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Risk
      </span>
    </div>
  );
}
