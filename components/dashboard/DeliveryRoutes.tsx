import { ActionButton } from "@/components/ui";
import { cn } from "@/lib/helpers";
import type { DeliveryRoute } from "@/types/medrush";
import SectionHeader from "./SectionHeader";

interface DeliveryRoutesProps {
  routes: DeliveryRoute[];
  busyAction: string | null;
  onActivateRoute: (routeId: string) => void;
}

export default function DeliveryRoutes({
  routes,
  busyAction,
  onActivateRoute,
}: DeliveryRoutesProps) {
  return (
    <section id="routes">
      <SectionHeader kicker="Route plan" title="Delivery Routes" />
      <div className="grid gap-2 sm:gap-3">
        {routes.map((route, index) => (
          <article
            className={cn(
              "animate-fadeInUp border-[3px] p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-px sm:p-5 rounded-[var(--neo-radius)]",
              route.status === "active"
                ? "border-[var(--neo-teal)] bg-[var(--neo-teal-soft)]"
                : "border-slate-300 bg-white hover:border-[var(--neo-teal)]",
            )}
            key={route.id}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-center justify-between gap-3">
              <strong className="text-base font-semibold sm:text-xl">{route.rider}</strong>
              <span className="border-[3px] border-slate-200 bg-white rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.12em]">
                {route.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">
              {route.clinics.join(" → ")}
            </p>
            <p className="mt-2 text-[10px] font-bold text-slate-500 sm:mt-3 sm:text-xs">
              {route.stops} stops | {route.etaMinutes} min ETA
            </p>
            <ActionButton
              fullWidth
              className="mt-3 !min-h-9 !py-1 !px-3 !text-[10px] !rounded-lg sm:mt-4 sm:!min-h-11 sm:!text-xs"
              disabled={route.status === "active" || busyAction === `route-${route.id}`}
              onClick={() => onActivateRoute(route.id)}
            >
              {route.status === "active"
                ? "Active route"
                : busyAction === `route-${route.id}`
                  ? "Activating…"
                  : "Activate route"}
            </ActionButton>
          </article>
        ))}
      </div>
    </section>
  );
}
