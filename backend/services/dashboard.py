from __future__ import annotations

from schemas import DashboardData, SummaryMetric
from repository import DashboardRepository


class DashboardService:
    def __init__(self, repo: DashboardRepository):
        self._repo = repo

    def get_snapshot(self) -> DashboardData:
        # Recalculate summary metrics before returning snapshot
        mothers = self._repo.get_mothers()
        alerts = self._repo.get_alerts()
        inventory = self._repo.get_inventory()
        routes = self._repo.get_routes()

        urgent_count = sum(1 for alert in alerts if alert.riskLevel == "urgent")
        stock_warnings = sum(
            1 for item in inventory if item.status in {"critical", "warning"}
        )
        active_routes = sum(1 for route in routes if route.status in {"ready", "active"})
        response_rate = 0
        if mothers:
            response_rate = round(
                sum(mother.adherenceRate for mother in mothers) / len(mothers)
            )

        new_summary = [
            SummaryMetric(label="Urgent follow-ups", tone="urgent", value=str(urgent_count)),
            SummaryMetric(label="Stock warnings", tone="review", value=str(stock_warnings)),
            SummaryMetric(label="Delivery routes", tone="monitor", value=str(active_routes)),
            SummaryMetric(label="Check-in response", tone="neutral", value=f"{response_rate}%"),
        ]

        # Retrieve a deepcopied state to mutate its summary property for return values
        data = self._repo.get_data()
        data.summary = new_summary
        return data
