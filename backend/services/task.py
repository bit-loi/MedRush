from __future__ import annotations

from schemas import DashboardData, AuditEvent
from repository import DashboardRepository
from services.dashboard import DashboardService
from services.intake import now_label, uuid4


class TaskService:
    def __init__(self, repo: DashboardRepository, dashboard_service: DashboardService):
        self._repo = repo
        self._dashboard_service = dashboard_service

    def complete_task(self, task_id: str) -> DashboardData:
        task = self._repo.get_task_by_id(task_id)
        if not task:
            return None

        task.status = "done"
        self._repo.add_audit_event(
            AuditEvent(
                actor=task.assignee,
                event=f"Completed task: {task.action}",
                id=f"e-{uuid4().hex[:8]}",
                time=now_label(),
            )
        )
        return self._dashboard_service.get_snapshot()
