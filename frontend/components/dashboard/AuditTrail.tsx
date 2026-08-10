import type { AuditEvent } from "@/types/medrush";
import SectionHeader from "./SectionHeader";

interface AuditTrailProps {
  auditTrail: AuditEvent[];
}

export default function AuditTrail({ auditTrail }: AuditTrailProps) {
  return (
    <section id="resources">
      <SectionHeader kicker="Safety layer" title="Audit Trail" />
      <div className="grid border-y border-[#111518]">
        {auditTrail.slice(0, 5).map((event, index) => (
          <article
            className="animate-fadeInUp grid grid-cols-[48px_1fr] gap-3 border-b border-[#111518] py-3 transition-colors duration-200 hover:bg-slate-50 last:border-b-0 sm:grid-cols-[56px_1fr] sm:gap-4 sm:py-4"
            key={event.id}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="text-[10px] font-black tabular-nums text-slate-400 sm:text-xs">
              {event.time}
            </span>
            <div>
              <p className="text-xs leading-5 text-slate-700 sm:text-sm sm:leading-6">
                {event.event}
              </p>
              <strong className="mt-0.5 block text-[10px] font-bold text-slate-400 sm:mt-1 sm:text-xs">
                {event.actor}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
