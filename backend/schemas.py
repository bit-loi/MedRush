from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field

RiskLevel = Literal["urgent", "review", "monitor"]
TaskStatus = Literal["open", "done"]


class Mother(BaseModel):
    adherenceRate: int
    clinic: str
    gestationalWeek: int
    id: str
    lastCheckIn: str
    missedDoses: int
    name: str
    phone: str
    riskLevel: RiskLevel
    village: str


class RiskAlert(BaseModel):
    action: Literal["Review", "Refill", "Monitor"]
    explanation: str
    id: str
    motherId: str
    motherName: str
    priorityScore: int
    receivedAt: str
    riskLevel: RiskLevel
    signals: list[str]
    status: Literal["open", "in_review", "resolved"] = "open"


class InventoryItem(BaseModel):
    clinic: str
    daysRemaining: int
    id: str
    item: str
    lastUpdated: str
    reorderPoint: int
    stock: int
    status: Literal["critical", "warning", "stable"]


class FieldTask(BaseModel):
    action: str
    assignee: str
    dueInHours: int
    id: str
    location: str
    priority: RiskLevel
    status: TaskStatus = "open"


class DeliveryRoute(BaseModel):
    clinics: list[str]
    etaMinutes: int
    id: str
    rider: str
    status: Literal["ready", "active", "queued"]
    stops: int


class AuditEvent(BaseModel):
    actor: str
    event: str
    id: str
    time: str


class SummaryMetric(BaseModel):
    label: str
    tone: Literal["urgent", "review", "monitor", "neutral"]
    value: str


class DashboardData(BaseModel):
    auditTrail: list[AuditEvent]
    inventory: list[InventoryItem]
    mothers: list[Mother]
    riskQueue: list[RiskAlert]
    routes: list[DeliveryRoute]
    summary: list[SummaryMetric]
    tasks: list[FieldTask]


class IntakePayload(BaseModel):
    clinic: str
    message: str = Field(min_length=2)
    motherId: str | None = None
    motherName: str = Field(min_length=2)


class IntakeResult(BaseModel):
    alert: RiskAlert
    extractedSignals: list[str]
    recommendedAction: str
    safetyNote: str
    task: FieldTask


class RestockPayload(BaseModel):
    amount: int = Field(gt=0)


class AlertStatusPayload(BaseModel):
    status: Literal["open", "in_review", "resolved"]
