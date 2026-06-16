from __future__ import annotations

from schemas import DashboardData, AuditEvent
from repository import DashboardRepository
from services.dashboard import DashboardService
from services.intake import now_label, uuid4


class RouteService:
    def __init__(self, repo: DashboardRepository, dashboard_service: DashboardService):
        self._repo = repo
        self._dashboard_service = dashboard_service

    def activate_route(self, route_id: str) -> DashboardData:
        route = self._repo.get_route_by_id(route_id)
        if not route:
            return None

        # Set other active routes to queued
        for entry in self._repo.get_routes():
            if entry.status == "active":
                entry.status = "queued"

        route.status = "active"

        self._repo.add_audit_event(
            AuditEvent(
                actor="Supply dispatcher",
                event=f"Activated delivery route for {', '.join(route.clinics)}.",
                id=f"e-{uuid4().hex[:8]}",
                time=now_label(),
            )
        )
        return self._dashboard_service.get_snapshot()
