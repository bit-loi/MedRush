import type { ReactNode } from "react";

export default function SectionHeader({
  action,
  kicker,
  title,
}: {
  action?: ReactNode;
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-6 border-t border-xdc-ink pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            {kicker}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-xdc-ink sm:text-2xl">
            {title}
          </h2>
        </div>
        {action}
      </div>
    </div>
  );
}
