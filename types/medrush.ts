export type RiskLevel = "urgent" | "review" | "monitor";

export type Mother = {
  adherenceRate: number;
  clinic: string;
  gestationalWeek: number;
  id: string;
  lastCheckIn: string;
  missedDoses: number;
  name: string;
  phone: string;
  riskLevel: RiskLevel;
  village: string;
};

export type RiskAlert = {
  action: "Review" | "Refill" | "Monitor";
  explanation: string;
  id: string;
  motherId: string;
  motherName: string;
  priorityScore: number;
  receivedAt: string;
  riskLevel: RiskLevel;
  signals: string[];
  status: "open" | "in_review" | "resolved";
};

export type AlertStatus = RiskAlert["status"];

export type InventoryItem = {
  clinic: string;
  daysRemaining: number;
  id: string;
  item: string;
  lastUpdated: string;
  reorderPoint: number;
  stock: number;
  status: "critical" | "warning" | "stable";
};

export type FieldTask = {
  action: string;
  assignee: string;
  dueInHours: number;
  id: string;
  location: string;
  priority: RiskLevel;
  status: "open" | "done";
};

export type DeliveryRoute = {
  clinics: string[];
  etaMinutes: number;
  id: string;
  rider: string;
  status: "ready" | "active" | "queued";
  stops: number;
};

export type AuditEvent = {
  actor: string;
  event: string;
  id: string;
  time: string;
};

export type SummaryMetric = {
  label: string;
  tone: RiskLevel | "neutral";
  value: string;
};

export type DashboardData = {
  auditTrail: AuditEvent[];
  inventory: InventoryItem[];
  mothers: Mother[];
  riskQueue: RiskAlert[];
  routes: DeliveryRoute[];
  summary: SummaryMetric[];
  tasks: FieldTask[];
};

export type IntakePayload = {
  clinic: string;
  message: string;
  motherId?: string;
  motherName: string;
};

export type IntakeResult = {
  alert: RiskAlert;
  extractedSignals: string[];
  recommendedAction: string;
  safetyNote: string;
  task: FieldTask;
};
