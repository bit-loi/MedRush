from __future__ import annotations

from abc import ABC, abstractmethod
from copy import deepcopy
from schemas import (
    DashboardData,
    Mother,
    RiskAlert,
    InventoryItem,
    FieldTask,
    DeliveryRoute,
    AuditEvent,
)


class DashboardRepository(ABC):
    @abstractmethod
    def get_data(self) -> DashboardData:
        pass

    @abstractmethod
    def get_mothers(self) -> list[Mother]:
        pass

    @abstractmethod
    def get_mother_by_id(self, mother_id: str) -> Mother | None:
        pass

    @abstractmethod
    def add_mother(self, mother: Mother) -> None:
        pass

    @abstractmethod
    def get_alerts(self) -> list[RiskAlert]:
        pass

    @abstractmethod
    def get_alert_by_id(self, alert_id: str) -> RiskAlert | None:
        pass

    @abstractmethod
    def add_alert(self, alert: RiskAlert) -> None:
        pass

    @abstractmethod
    def get_inventory(self) -> list[InventoryItem]:
        pass

    @abstractmethod
    def get_inventory_item_by_id(self, item_id: str) -> InventoryItem | None:
        pass

    @abstractmethod
    def get_inventory_item_by_clinic(self, clinic: str) -> InventoryItem | None:
        pass

    @abstractmethod
    def get_tasks(self) -> list[FieldTask]:
        pass

    @abstractmethod
    def get_task_by_id(self, task_id: str) -> FieldTask | None:
        pass

    @abstractmethod
    def add_task(self, task: FieldTask) -> None:
        pass

    @abstractmethod
    def get_routes(self) -> list[DeliveryRoute]:
        pass

    @abstractmethod
    def get_route_by_id(self, route_id: str) -> DeliveryRoute | None:
        pass

    @abstractmethod
    def add_audit_event(self, event: AuditEvent) -> None:
        pass


class InMemoryDashboardRepository(DashboardRepository):
    def __init__(self, initial_state: DashboardData):
        self._state = initial_state

    def get_data(self) -> DashboardData:
        return deepcopy(self._state)

    def get_mothers(self) -> list[Mother]:
        return self._state.mothers

    def get_mother_by_id(self, mother_id: str) -> Mother | None:
        return next((m for m in self._state.mothers if m.id == mother_id), None)

    def add_mother(self, mother: Mother) -> None:
        self._state.mothers.append(mother)

    def get_alerts(self) -> list[RiskAlert]:
        return self._state.riskQueue

    def get_alert_by_id(self, alert_id: str) -> RiskAlert | None:
        return next((a for a in self._state.riskQueue if a.id == alert_id), None)

    def add_alert(self, alert: RiskAlert) -> None:
        self._state.riskQueue.insert(0, alert)

    def get_inventory(self) -> list[InventoryItem]:
        return self._state.inventory

    def get_inventory_item_by_id(self, item_id: str) -> InventoryItem | None:
        return next((i for i in self._state.inventory if i.id == item_id), None)

    def get_inventory_item_by_clinic(self, clinic: str) -> InventoryItem | None:
        return next((i for i in self._state.inventory if i.clinic == clinic), None)

    def get_tasks(self) -> list[FieldTask]:
        return self._state.tasks

    def get_task_by_id(self, task_id: str) -> FieldTask | None:
        return next((t for t in self._state.tasks if t.id == task_id), None)

    def add_task(self, task: FieldTask) -> None:
        self._state.tasks.insert(0, task)

    def get_routes(self) -> list[DeliveryRoute]:
        return self._state.routes

    def get_route_by_id(self, route_id: str) -> DeliveryRoute | None:
        return next((r for r in self._state.routes if r.id == route_id), None)

    def add_audit_event(self, event: AuditEvent) -> None:
        self._state.auditTrail.insert(0, event)
