from __future__ import annotations

from typing import Literal
from schemas import DashboardData, AuditEvent
from repository import DashboardRepository
from services.dashboard import DashboardService
from services.intake import now_label, uuid4


class AlertService:
    def __init__(self, repo: DashboardRepository, dashboard_service: DashboardService):
        self._repo = repo
        self._dashboard_service = dashboard_service

    def update_alert_status(self, alert_id: str, status: Literal["open", "in_review", "resolved"]) -> DashboardData:
        alert = self._repo.get_alert_by_id(alert_id)
        if not alert:
            return None

        alert.status = status
        self._repo.add_audit_event(
            AuditEvent(
                actor="District operator",
                event=f"Set alert for {alert.motherName} to {status.replace('_', ' ')}.",
                id=f"e-{uuid4().hex[:8]}",
                time=now_label(),
            )
        )
        return self._dashboard_service.get_snapshot()
