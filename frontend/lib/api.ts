import type {
  AlertStatus,
  DashboardData,
  IntakePayload,
  IntakeResult,
} from "@/types/medrush";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8003";

export const fallbackDashboard: DashboardData = {
  summary: [
    { label: "Urgent follow-ups", tone: "urgent", value: "12" },
    { label: "Stock warnings", tone: "review", value: "4" },
    { label: "Delivery routes", tone: "monitor", value: "3" },
    { label: "Check-in response", tone: "neutral", value: "84%" },
  ],
  mothers: [
    {
      adherenceRate: 72,
      clinic: "Puskesmas Cibiru",
      gestationalWeek: 28,
      id: "m-001",
      lastCheckIn: "08:12",
      missedDoses: 2,
      name: "Ayu S.",
      phone: "+62 812 4400 1001",
      riskLevel: "urgent",
      village: "Cipadung",
    },
    {
      adherenceRate: 81,
      clinic: "Klinik Melati",
      gestationalWeek: 31,
      id: "m-002",
      lastCheckIn: "08:35",
      missedDoses: 1,
      name: "Mira K.",
      phone: "+62 812 4400 1002",
      riskLevel: "review",
      village: "Pasirbiru",
    },
    {
      adherenceRate: 92,
      clinic: "Pustu Sukamaju",
      gestationalWeek: 22,
      id: "m-003",
      lastCheckIn: "09:06",
      missedDoses: 0,
      name: "Nina R.",
      phone: "+62 812 4400 1003",
      riskLevel: "monitor",
      village: "Sukamaju",
    },
  ],
  riskQueue: [
    {
      action: "Review",
      explanation: "Dizziness plus two missed iron doses needs midwife review today.",
      id: "a-001",
      motherId: "m-001",
      motherName: "Ayu S.",
      priorityScore: 94,
      receivedAt: "08:12",
      riskLevel: "urgent",
      signals: ["dizzy", "missed 2 doses"],
      status: "open",
    },
    {
      action: "Refill",
      explanation: "Mother reports tablets finished; clinic stock is below reorder point.",
      id: "a-002",
      motherId: "m-002",
      motherName: "Mira K.",
      priorityScore: 78,
      receivedAt: "08:35",
      riskLevel: "review",
      signals: ["medicine finished", "stock request"],
      status: "open",
    },
    {
      action: "Monitor",
      explanation: "Nausea reported after supplement intake; send guidance and watch trend.",
      id: "a-003",
      motherId: "m-003",
      motherName: "Nina R.",
      priorityScore: 54,
      receivedAt: "09:06",
      riskLevel: "monitor",
      signals: ["nausea"],
      status: "in_review",
    },
  ],
  inventory: [
    {
      clinic: "Klinik Melati",
      daysRemaining: 2,
      id: "i-001",
      item: "Iron folic acid tablets",
      lastUpdated: "Today 07:50",
      reorderPoint: 180,
      stock: 96,
      status: "critical",
    },
    {
      clinic: "Puskesmas Cibiru",
      daysRemaining: 5,
      id: "i-002",
      item: "Calcium tablets",
      lastUpdated: "Today 07:42",
      reorderPoint: 140,
      stock: 184,
      status: "warning",
    },
    {
      clinic: "Pustu Sukamaju",
      daysRemaining: 11,
      id: "i-003",
      item: "IFA blister packs",
      lastUpdated: "Today 06:58",
      reorderPoint: 90,
      stock: 262,
      status: "stable",
    },
  ],
  tasks: [
    {
      action: "Call Ayu S. and review dizziness symptoms",
      assignee: "Bidan Rani",
      dueInHours: 4,
      id: "t-001",
      location: "Cipadung",
      priority: "urgent",
      status: "open",
    },
    {
      action: "Prepare IFA refill for Klinik Melati",
      assignee: "Supply Team 2",
      dueInHours: 8,
      id: "t-002",
      location: "Pasirbiru",
      priority: "review",
      status: "open",
    },
    {
      action: "Send nausea guidance message",
      assignee: "Bidan Dita",
      dueInHours: 24,
      id: "t-003",
      location: "Sukamaju",
      priority: "monitor",
      status: "open",
    },
  ],
  routes: [
    {
      clinics: ["Klinik Melati", "Pustu Sukamaju"],
      etaMinutes: 42,
      id: "r-001",
      rider: "Raka",
      status: "ready",
      stops: 2,
    },
    {
      clinics: ["Puskesmas Cibiru"],
      etaMinutes: 28,
      id: "r-002",
      rider: "Nadia",
      status: "queued",
      stops: 1,
    },
  ],
  auditTrail: [
    {
      actor: "Gemma risk extraction",
      event: "Flagged dizziness and missed doses for Ayu S.",
      id: "e-001",
      time: "08:12",
    },
    {
      actor: "Bidan Rani",
      event: "Opened urgent follow-up task.",
      id: "e-002",
      time: "08:15",
    },
    {
      actor: "Inventory rule",
      event: "Raised reorder warning for Klinik Melati.",
      id: "e-003",
      time: "08:36",
    },
  ],
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`MedRush API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    return await requestJson<DashboardData>("/api/dashboard", { cache: "no-store" });
  } catch {
    return fallbackDashboard;
  }
}

export async function submitIntake(payload: IntakePayload): Promise<IntakeResult> {
  return requestJson<IntakeResult>("/api/intake", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export async function completeTask(taskId: string): Promise<DashboardData> {
  return requestJson<DashboardData>(`/api/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
}

export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
): Promise<DashboardData> {
  return requestJson<DashboardData>(`/api/alerts/${alertId}/status`, {
    body: JSON.stringify({ status }),
    method: "PATCH",
  });
}

export async function restockInventory(
  itemId: string,
  amount = 120,
): Promise<DashboardData> {
  return requestJson<DashboardData>(`/api/inventory/${itemId}/restock`, {
    body: JSON.stringify({ amount }),
    method: "POST",
  });
}

export async function activateRoute(routeId: string): Promise<DashboardData> {
  return requestJson<DashboardData>(`/api/routes/${routeId}/activate`, {
    method: "PATCH",
  });
}
