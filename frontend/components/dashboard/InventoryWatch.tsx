import { ActionButton } from "@/components/ui";
import { badgeClass, cn, progressClass } from "@/lib/helpers";
import type { InventoryItem } from "@/types/medrush";
import type { InventoryFilter, PipelineStage } from "@/lib/constants";
import SectionHeader from "./SectionHeader";

interface InventoryWatchProps {
  visibleInventory: InventoryItem[];
  inventoryFilter: InventoryFilter;
  setInventoryFilter: (filter: InventoryFilter) => void;
  setFocusedMetric: (metric: string) => void;
  setActiveStage: (stage: PipelineStage) => void;
  criticalStock: number;
  busyAction: string | null;
  onRestock: (itemId: string) => void;
}

export default function InventoryWatch({
  visibleInventory,
  inventoryFilter,
  setInventoryFilter,
  setFocusedMetric,
  setActiveStage,
  criticalStock,
  busyAction,
  onRestock,
}: InventoryWatchProps) {
  return (
    <section id="inventory">
      <SectionHeader
        action={
          <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 sm:text-sm sm:tracking-[0.2em]">
            {criticalStock} critical
          </span>
        }
        kicker="Supply chain"
        title="Inventory Watch"
      />
      <div className="mb-5 flex flex-wrap gap-2 sm:mb-6 sm:gap-3">
        {[
          ["all", "All stock"],
          ["attention", "Needs attention"],
        ].map(([value, label]) => (
          <button
            className={cn(
              "border-[3px] rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.18em]",
              inventoryFilter === value
                ? "border-[var(--neo-teal)] bg-[var(--neo-teal)] text-white shadow-[2px_2px_0_var(--neo-teal-focus)]"
                : "border-slate-300 bg-white text-slate-600 hover:border-[var(--neo-teal)]",
            )}
            key={value}
            onClick={() => {
              setInventoryFilter(value as InventoryFilter);
              setFocusedMetric(value === "attention" ? "Stock warnings" : "All inventory");
              if (value === "attention") setActiveStage("route");
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleInventory.map((item, index) => {
          const width = `${Math.min(
            100,
            Math.max(8, (item.stock / (item.reorderPoint * 2)) * 100)
          )}%`;
          return (
            <article
              className={cn(
                "animate-fadeInUp grid min-h-48 gap-4 border-[3px] rounded-[var(--neo-radius)] bg-white p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px sm:min-h-56 sm:gap-5 sm:p-5",
                item.status === "critical"
                  ? "border-rose-400"
                  : "border-slate-300 hover:border-[var(--neo-teal)]",
              )}
              key={item.id}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base font-semibold sm:text-xl">{item.clinic}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                    {item.item}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 border-[3px] rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] sm:px-2.5 sm:py-1 sm:text-[11px] sm:tracking-[0.12em]",
                    item.status === "critical"
                      ? badgeClass("urgent")
                      : item.status === "warning"
                        ? badgeClass("review")
                        : badgeClass("monitor"),
                  )}
                >
                  {item.status}
                </span>
              </div>
              <div>
                <div className="mb-1.5 flex justify-between text-[10px] font-bold text-slate-500 sm:mb-2 sm:text-xs">
                  <span>{item.stock} units</span>
                  <span>{item.daysRemaining} days left</span>
                </div>
                <div className="h-1.5 bg-slate-200 sm:h-2">
                  <span
                    className={cn("block h-full transition-all duration-500", progressClass(item.status))}
                    style={{ width }}
                  />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                Reorder point {item.reorderPoint} | {item.lastUpdated}
              </p>
              <ActionButton
                className="!min-h-9 !py-1 !px-3 !text-[10px] !rounded-lg sm:!min-h-11 sm:!text-xs"
                disabled={busyAction === `restock-${item.id}`}
                onClick={() => onRestock(item.id)}
              >
                {busyAction === `restock-${item.id}` ? "Restocking…" : "Restock +120"}
              </ActionButton>
            </article>
          );
        })}
      </div>
    </section>
  );
}
