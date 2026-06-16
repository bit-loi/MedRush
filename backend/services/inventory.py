from __future__ import annotations

from schemas import DashboardData, AuditEvent
from repository import DashboardRepository
from services.dashboard import DashboardService
from services.intake import now_label, uuid4


class InventoryService:
    def __init__(self, repo: DashboardRepository, dashboard_service: DashboardService):
        self._repo = repo
        self._dashboard_service = dashboard_service

    def restock_item(self, item_id: str, amount: int) -> DashboardData:
        item = self._repo.get_inventory_item_by_id(item_id)
        if not item:
            return None

        item.stock += amount
        item.daysRemaining = max(item.daysRemaining, 14)
        item.status = "stable" if item.stock >= item.reorderPoint else "warning"
        item.lastUpdated = f"Today {now_label()}"

        self._repo.add_audit_event(
            AuditEvent(
                actor="Supply team",
                event=f"Restocked {item.item} at {item.clinic} by {amount} units.",
                id=f"e-{uuid4().hex[:8]}",
                time=now_label(),
            )
        )
        return self._dashboard_service.get_snapshot()
