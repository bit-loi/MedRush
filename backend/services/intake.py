from __future__ import annotations

from datetime import datetime
from uuid import uuid4
from typing import Literal

from schemas import (
    Mother,
    RiskAlert,
    FieldTask,
    AuditEvent,
    IntakePayload,
    IntakeResult,
    RiskLevel,
)
from repository import DashboardRepository
from services.dashboard import DashboardService


def now_label() -> str:
    return datetime.now().strftime("%H:%M")


def detect_signals(message: str) -> list[str]:
    text = message.lower()
    signals: list[str] = []
    keyword_map = {
        "dizziness": ["pusing", "dizzy", "dizziness", "lemas", "weak"],
        "nausea": ["mual", "nausea", "vomit", "muntah"],
        "missed dose": ["lupa", "missed", "tidak minum", "skip"],
        "stock request": ["habis", "refill", "stok", "stock", "obat", "medicine"],
        "distress": ["takut", "cemas", "anxious", "panic"],
    }

    for signal, keywords in keyword_map.items():
        if any(keyword in text for keyword in keywords):
            signals.append(signal)

    return signals or ["general check-in"]


def classify_signal(signals: list[str]) -> tuple[RiskLevel, Literal["Review", "Refill", "Monitor"], int]:
    has_symptom = bool({"dizziness", "distress"} & set(signals))
    has_adherence_risk = "missed dose" in signals
    has_stock_request = "stock request" in signals

    if has_symptom and has_adherence_risk:
        return "urgent", "Review", 92

    if has_symptom:
        return "urgent", "Review", 86

    if has_stock_request:
        return "review", "Refill", 76

    if "nausea" in signals or has_adherence_risk:
        return "monitor", "Monitor", 58

    return "monitor", "Monitor", 42


def build_explanation(
    action: Literal["Review", "Refill", "Monitor"],
    signals: list[str],
    clinic: str,
) -> str:
    signal_text = ", ".join(signals)

    if action == "Review":
        return f"Risk extraction found {signal_text}. Midwife review is recommended before action."

    if action == "Refill":
        return f"Supply signal found {signal_text}. Check {clinic} stock and prepare delivery."

    return f"Signal found {signal_text}. Send guidance and monitor the next check-in."


def create_task_entity(
    action: Literal["Review", "Refill", "Monitor"],
    mother_name: str,
    clinic: str,
    risk_level: RiskLevel,
) -> FieldTask:
    if action == "Review":
        task_action = f"Call {mother_name} and review symptom signal"
        assignee = "Midwife desk"
        due = 4
    elif action == "Refill":
        task_action = f"Prepare supplement refill for {clinic}"
        assignee = "Supply team"
        due = 8
    else:
        task_action = f"Send adherence guidance to {mother_name}"
        assignee = "Care coordinator"
        due = 24

    return FieldTask(
        action=task_action,
        assignee=assignee,
        dueInHours=due,
        id=f"t-{uuid4().hex[:8]}",
        location=clinic,
        priority=risk_level,
    )


class IntakeService:
    def __init__(self, repo: DashboardRepository, dashboard_service: DashboardService):
        self._repo = repo
        self._dashboard_service = dashboard_service

    def process_intake(self, payload: IntakePayload) -> IntakeResult:
        signals = detect_signals(payload.message)
        risk_level, action, score = classify_signal(signals)
        received_at = now_label()

        # Upsert mother
        mother_id = payload.motherId or f"m-{uuid4().hex[:8]}"
        existing = self._repo.get_mother_by_id(mother_id)

        if existing:
            existing.lastCheckIn = received_at
            existing.riskLevel = risk_level
            existing.clinic = payload.clinic
            existing.missedDoses += 1 if "miss" in payload.message.lower() else 0
        else:
            new_mother = Mother(
                adherenceRate=74 if risk_level == "urgent" else 88,
                clinic=payload.clinic,
                gestationalWeek=24,
                id=mother_id,
                lastCheckIn=received_at,
                missedDoses=1 if "miss" in payload.message.lower() else 0,
                name=payload.motherName,
                phone="WhatsApp contact",
                riskLevel=risk_level,
                village="New intake",
            )
            self._repo.add_mother(new_mother)

        # Create alert
        alert = RiskAlert(
            action=action,
            explanation=build_explanation(action, signals, payload.clinic),
            id=f"a-{uuid4().hex[:8]}",
            motherId=mother_id,
            motherName=payload.motherName,
            priorityScore=score,
            receivedAt=received_at,
            riskLevel=risk_level,
            signals=signals,
        )
        self._repo.add_alert(alert)

        # Create task
        task = create_task_entity(action, payload.motherName, payload.clinic, risk_level)
        self._repo.add_task(task)

        # Log audit trail
        self._repo.add_audit_event(
            AuditEvent(
                actor="Risk signal extraction",
                event=f"Created {action.lower()} task for {payload.motherName}.",
                id=f"e-{uuid4().hex[:8]}",
                time=received_at,
            )
        )

        # Update inventory status if refill action
        if action == "Refill":
            inventory_item = self._repo.get_inventory_item_by_clinic(payload.clinic)
            if inventory_item:
                inventory_item.status = "critical"
                inventory_item.lastUpdated = f"Today {received_at}"

        return IntakeResult(
            alert=alert,
            extractedSignals=signals,
            recommendedAction=action,
            safetyNote="AI-assisted triage support only. A health worker must approve care actions.",
            task=task,
        )
