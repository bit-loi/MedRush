import { ActionButton } from "@/components/ui";
import { badgeClass, cn, rowClass, severityLabel } from "@/lib/helpers";
import type { RiskAlert, AlertStatus } from "@/types/medrush";
import type { QueueFilter, PipelineStage } from "@/lib/constants";
import SectionHeader from "./SectionHeader";
import ScoreIndicator from "./ScoreIndicator";

interface RiskQueueProps {
  visibleRiskQueue: RiskAlert[];
  queueFilter: QueueFilter;
  setQueueFilter: (filter: QueueFilter) => void;
  setActiveStage: (stage: PipelineStage) => void;
  setFocusedMetric: (metric: string) => void;
  busyAction: string | null;
  onAlertStatus: (alert: RiskAlert, status: AlertStatus) => void;
}

export default function RiskQueue({
  visibleRiskQueue,
  queueFilter,
  setQueueFilter,
  setActiveStage,
  setFocusedMetric,
  busyAction,
  onAlertStatus,
}: RiskQueueProps) {
  return (
    <section id="signals">
      <SectionHeader
        action={
          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 sm:text-sm sm:tracking-[0.2em]">
            {visibleRiskQueue.length} visible
          </span>
        }
        kicker="Live queue"
        title="Mother Risk Signals"
      />
      <div className="mb-5 flex flex-wrap gap-2 sm:mb-6 sm:gap-3">
        {(["all", "urgent", "review", "monitor"] as QueueFilter[]).map((filter) => (
          <button
            className={cn(
              "border-[3px] rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.18em]",
              queueFilter === filter
                ? "border-[var(--neo-teal)] bg-[var(--neo-teal)] text-white shadow-[2px_2px_0_var(--neo-teal-focus)]"
                : "border-slate-300 bg-white text-slate-600 hover:border-[var(--neo-teal)]",
            )}
            key={filter}
            onClick={() => {
              setQueueFilter(filter);
              setActiveStage("reason");
              setFocusedMetric(filter === "urgent" ? "Urgent follow-ups" : "All signals");
            }}
            type="button"
          >
            {filter === "all" ? "All" : severityLabel(filter)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4">
        {visibleRiskQueue.length === 0 && (
          <div className="border-[3px] border-slate-300 rounded-[var(--neo-radius)] bg-white p-6 text-sm font-semibold text-slate-500 sm:p-8">
            No active alerts match this filter.
          </div>
        )}

        {visibleRiskQueue.map((alert, index) => (
          <article
            className={cn(
              "animate-fadeInUp grid gap-4 border-[3px] border-[var(--neo-teal)] rounded-[var(--neo-radius)] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px sm:p-5 md:grid-cols-[1fr_auto] md:gap-5",
              rowClass(alert.riskLevel),
            )}
            key={alert.id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight sm:text-2xl">
                  {alert.motherName}
                </h3>
                <span
                  className={cn(
                    "border-[3px] rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] sm:px-2.5 sm:py-1 sm:text-[11px] sm:tracking-[0.12em]",
                    badgeClass(alert.riskLevel),
                  )}
                >
                  {severityLabel(alert.riskLevel)}
                </span>
                <span className="border-[3px] border-slate-200 bg-white rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 sm:px-2.5 sm:py-1 sm:text-[11px] sm:tracking-[0.12em]">
                  {alert.status.replace("_", " ")}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                  {alert.receivedAt}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7">
                {alert.explanation}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                {alert.signals.map((signal) => (
                  <span
                    className="bg-[#eef5f6] border-[2px] border-[#d4e4e6] rounded px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:px-3 sm:py-1 sm:text-xs"
                    key={`${alert.id}-${signal}`}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:gap-4 md:flex-col md:items-end">
              <ScoreIndicator score={alert.priorityScore} />
              <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                <span className="border-[3px] border-[var(--neo-teal)] bg-[var(--neo-teal-soft)] text-[var(--neo-teal-dark)] rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] sm:px-3 sm:text-xs sm:tracking-[0.14em]">
                  {alert.action}
                </span>
                {alert.status === "open" && (
                  <ActionButton
                    className="!min-h-9 !py-1 !px-3 !text-[10px] !rounded-lg sm:!min-h-10 sm:!text-xs"
                    disabled={busyAction === `${alert.id}-in_review`}
                    onClick={() => onAlertStatus(alert, "in_review")}
                  >
                    Acknowledge
                  </ActionButton>
                )}
                <ActionButton
                  className="!min-h-9 !py-1 !px-3 !text-[10px] !rounded-lg sm:!min-h-10 sm:!text-xs"
                  disabled={busyAction === `${alert.id}-resolved`}
                  onClick={() => onAlertStatus(alert, "resolved")}
                >
                  Resolve
                </ActionButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
