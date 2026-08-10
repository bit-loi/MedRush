import type { RiskLevel, SummaryMetric } from "@/types/medrush";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function severityFromScore(score: number): RiskLevel {
  if (score >= 82) return "urgent";
  if (score >= 65) return "review";
  return "monitor";
}

export function severityLabel(level: RiskLevel) {
  if (level === "urgent") return "Urgent";
  if (level === "review") return "Review";
  return "Monitor";
}

export function badgeClass(level: RiskLevel | "neutral") {
  if (level === "urgent") return "border-rose-400 bg-rose-50 text-rose-700";
  if (level === "review") return "border-amber-400 bg-amber-50 text-amber-800";
  if (level === "monitor") return "border-xdc-cyan bg-cyan-50 text-xdc-deep";
  return "border-slate-300 bg-white text-slate-700";
}

export function rowClass(level: RiskLevel) {
  if (level === "urgent") return "border-l-rose-500 bg-rose-50/60";
  if (level === "review") return "border-l-amber-500 bg-amber-50/60";
  return "border-l-xdc-cyan bg-white";
}

export function progressClass(status: "critical" | "warning" | "stable") {
  if (status === "critical") return "bg-rose-500";
  if (status === "warning") return "bg-amber-500";
  return "bg-xdc-cyan";
}

export function summaryToneClass(tone: SummaryMetric["tone"]) {
  if (tone === "urgent") return "text-rose-600";
  if (tone === "review") return "text-amber-700";
  if (tone === "monitor") return "text-xdc-deep";
  return "text-xdc-ink";
}

export function nowLabel() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
