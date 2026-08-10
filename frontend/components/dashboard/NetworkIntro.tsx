import { ActionButton } from "@/components/ui";
import { cn } from "@/lib/helpers";

interface NetworkIntroProps {
  apiStatus: "checking" | "connected" | "offline";
  busyAction: string | null;
  onRefresh: () => void;
}

export default function NetworkIntro({
  apiStatus,
  busyAction,
  onRefresh,
}: NetworkIntroProps) {
  return (
    <section className="border-b border-[#dce8eb] bg-[#f7fafb]" id="network">
      <div className="mx-auto grid max-w-[1780px] gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_340px] lg:gap-10 lg:px-20 lg:py-14 xl:grid-cols-[1fr_380px]">
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-medium tracking-tight text-[#111518] sm:text-3xl lg:text-4xl">
            District teams need a live care network
          </h2>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-[#111518] sm:text-xl lg:text-2xl lg:leading-10 lg:mt-8">
            MedRush turns daily WhatsApp signals into review queues, refill tasks,
            route priorities, and an auditable operational record.
          </p>
        </div>
        <div className="grid content-start gap-3 border-t border-[#111518] pt-4 text-base sm:text-lg">
          <ActionButton
            className="!min-h-12 w-full text-base sm:text-lg"
            onClick={onRefresh}
          >
            → {busyAction === "refresh" ? "Syncing dashboard…" : "Sync dashboard"}
          </ActionButton>
          <div className="flex min-h-12 items-center justify-between border-[3px] border-[var(--neo-teal)] rounded-[var(--neo-radius)] bg-white px-5 py-2 font-bold text-slate-700">
            <span>API Connection</span>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  apiStatus === "connected" && "bg-emerald-500",
                  apiStatus === "offline" && "bg-amber-500",
                  apiStatus === "checking" && "bg-slate-400 animate-pulse",
                )}
              />
              <span className="capitalize font-black">{apiStatus}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
