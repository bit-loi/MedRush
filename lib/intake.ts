import type {
  DashboardData,
  FieldTask,
  IntakePayload,
  IntakeResult,
  RiskAlert,
  RiskLevel,
} from "@/types/medrush";
import { nowLabel } from "./helpers";

export function createOfflineIntake(payload: IntakePayload): IntakeResult {
  const text = payload.message.toLowerCase();
  const hasDizzy = text.includes("pusing") || text.includes("dizzy");
  const hasMissed =
    text.includes("lupa") || text.includes("miss") || text.includes("tidak minum");
  const hasStock = text.includes("habis") || text.includes("stok") || text.includes("obat");
  const hasNausea = text.includes("mual") || text.includes("nausea");
  const signals = [
    hasDizzy ? "dizziness" : null,
    hasMissed ? "missed dose" : null,
    hasStock ? "stock request" : null,
    hasNausea ? "nausea" : null,
  ].filter(Boolean) as string[];

  const riskLevel: RiskLevel =
    hasDizzy || (hasMissed && hasNausea) ? "urgent" : hasStock ? "review" : "monitor";
  const action = riskLevel === "urgent" ? "Review" : hasStock ? "Refill" : "Monitor";
  const id = `offline-${Date.now()}`;
  const alert: RiskAlert = {
    action,
    explanation:
      riskLevel === "urgent"
        ? "Rule engine detected symptoms plus adherence risk. Human review is required."
        : hasStock
          ? "Rule engine detected a refill or stock request. Route a supply task."
          : "Rule engine detected a non-urgent signal. Continue monitoring.",
    id: `a-${id}`,
    motherId: payload.motherId ?? `m-${id}`,
    motherName: payload.motherName,
    priorityScore: riskLevel === "urgent" ? 91 : hasStock ? 76 : 48,
    receivedAt: nowLabel(),
    riskLevel,
    signals: signals.length > 0 ? signals : ["general check-in"],
    status: "open",
  };
  const task: FieldTask = {
    action:
      action === "Review"
        ? `Call ${payload.motherName} for symptom review`
        : action === "Refill"
          ? `Prepare refill for ${payload.clinic}`
          : `Send guidance message to ${payload.motherName}`,
    assignee: action === "Refill" ? "Supply Team" : "Midwife desk",
    dueInHours: action === "Monitor" ? 24 : 4,
    id: `t-${id}`,
    location: payload.clinic,
    priority: riskLevel,
    status: "open",
  };

  return {
    alert,
    extractedSignals: alert.signals,
    recommendedAction: action,
    safetyNote: "AI-assisted triage only. A health worker must approve care actions.",
    task,
  };
}

export function mergeIntake(data: DashboardData, result: IntakeResult): DashboardData {
  return {
    ...data,
    auditTrail: [
      {
        actor: "Risk signal extraction",
        event: `Created ${result.recommendedAction.toLowerCase()} task for ${result.alert.motherName}.`,
        id: `event-${result.alert.id}`,
        time: result.alert.receivedAt,
      },
      ...data.auditTrail,
    ],
    riskQueue: [result.alert, ...data.riskQueue],
    summary: data.summary.map((metric) =>
      metric.label === "Urgent follow-ups" && result.alert.riskLevel === "urgent"
        ? { ...metric, value: String(Number(metric.value) + 1) }
        : metric,
    ),
    tasks: [result.task, ...data.tasks],
  };
}
