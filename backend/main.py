from __future__ import annotations

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    DashboardData,
    Mother,
    RiskAlert,
    InventoryItem,
    FieldTask,
    DeliveryRoute,
    AuditEvent,
    IntakePayload,
    IntakeResult,
    RestockPayload,
    AlertStatusPayload,
)
from repository import InMemoryDashboardRepository
from services import (
    DashboardService,
    IntakeService,
    TaskService,
    AlertService,
    InventoryService,
    RouteService,
)

# Initialize application
app = FastAPI(
    title="MedRush API",
    description="WhatsApp-first maternal health adherence and supply coordination API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
)

# Mock Dataset State
initial_state = DashboardData(
    summary=[],
    mothers=[
        Mother(
            adherenceRate=72,
            clinic="Puskesmas Cibiru",
            gestationalWeek=28,
            id="m-001",
            lastCheckIn="08:12",
            missedDoses=2,
            name="Ayu S.",
            phone="+62 812 4400 1001",
            riskLevel="urgent",
            village="Cipadung",
        ),
        Mother(
            adherenceRate=81,
            clinic="Klinik Melati",
            gestationalWeek=31,
            id="m-002",
            lastCheckIn="08:35",
            missedDoses=1,
            name="Mira K.",
            phone="+62 812 4400 1002",
            riskLevel="review",
            village="Pasirbiru",
        ),
        Mother(
            adherenceRate=92,
            clinic="Pustu Sukamaju",
            gestationalWeek=22,
            id="m-003",
            lastCheckIn="09:06",
            missedDoses=0,
            name="Nina R.",
            phone="+62 812 4400 1003",
            riskLevel="monitor",
            village="Sukamaju",
        ),
    ],
    riskQueue=[
        RiskAlert(
            action="Review",
            explanation="Dizziness plus two missed iron doses needs midwife review today.",
            id="a-001",
            motherId="m-001",
            motherName="Ayu S.",
            priorityScore=94,
            receivedAt="08:12",
            riskLevel="urgent",
            signals=["dizzy", "missed 2 doses"],
        ),
        RiskAlert(
            action="Refill",
            explanation="Mother reports tablets finished; clinic stock is below reorder point.",
            id="a-002",
            motherId="m-002",
            motherName="Mira K.",
            priorityScore=78,
            receivedAt="08:35",
            riskLevel="review",
            signals=["medicine finished", "stock request"],
        ),
        RiskAlert(
            action="Monitor",
            explanation="Nausea reported after supplement intake; send guidance and watch trend.",
            id="a-003",
            motherId="m-003",
            motherName="Nina R.",
            priorityScore=54,
            receivedAt="09:06",
            riskLevel="monitor",
            signals=["nausea"],
            status="in_review",
        ),
    ],
    inventory=[
        InventoryItem(
            clinic="Klinik Melati",
            daysRemaining=2,
            id="i-001",
            item="Iron folic acid tablets",
            lastUpdated="Today 07:50",
            reorderPoint=180,
            stock=96,
            status="critical",
        ),
        InventoryItem(
            clinic="Puskesmas Cibiru",
            daysRemaining=5,
            id="i-002",
            item="Calcium tablets",
            lastUpdated="Today 07:42",
            reorderPoint=140,
            stock=184,
            status="warning",
        ),
        InventoryItem(
            clinic="Pustu Sukamaju",
            daysRemaining=11,
            id="i-003",
            item="IFA blister packs",
            lastUpdated="Today 06:58",
            reorderPoint=90,
            stock=262,
            status="stable",
        ),
    ],
    tasks=[
        FieldTask(
            action="Call Ayu S. and review dizziness symptoms",
            assignee="Bidan Rani",
            dueInHours=4,
            id="t-001",
            location="Cipadung",
            priority="urgent",
        ),
        FieldTask(
            action="Prepare IFA refill for Klinik Melati",
            assignee="Supply Team 2",
            dueInHours=8,
            id="t-002",
            location="Pasirbiru",
            priority="review",
        ),
        FieldTask(
            action="Send nausea guidance message",
            assignee="Bidan Dita",
            dueInHours=24,
            id="t-003",
            location="Sukamaju",
            priority="monitor",
        ),
    ],
    routes=[
        DeliveryRoute(
            clinics=["Klinik Melati", "Pustu Sukamaju"],
            etaMinutes=42,
            id="r-001",
            rider="Raka",
            status="ready",
            stops=2,
        ),
        DeliveryRoute(
            clinics=["Puskesmas Cibiru"],
            etaMinutes=28,
            id="r-002",
            rider="Nadia",
            status="queued",
            stops=1,
        ),
    ],
    auditTrail=[
        AuditEvent(
            actor="Gemma risk extraction",
            event="Flagged dizziness and missed doses for Ayu S.",
            id="e-001",
            time="08:12",
        ),
        AuditEvent(
            actor="Bidan Rani",
            event="Opened urgent follow-up task.",
            id="e-002",
            time="08:15",
        ),
        AuditEvent(
            actor="Inventory rule",
            event="Raised reorder warning for Klinik Melati.",
            id="e-003",
            time="08:36",
        ),
    ],
)

# Global Repository Instance (acts as our Database Engine)
db_repo = InMemoryDashboardRepository(initial_state)

# Dependency Injection Providers
def get_repo() -> InMemoryDashboardRepository:
    return db_repo

def get_dashboard_service(repo: InMemoryDashboardRepository = Depends(get_repo)) -> DashboardService:
    return DashboardService(repo)

def get_intake_service(
    repo: InMemoryDashboardRepository = Depends(get_repo),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> IntakeService:
    return IntakeService(repo, dashboard_service)

def get_task_service(
    repo: InMemoryDashboardRepository = Depends(get_repo),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> TaskService:
    return TaskService(repo, dashboard_service)

def get_alert_service(
    repo: InMemoryDashboardRepository = Depends(get_repo),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> AlertService:
    return AlertService(repo, dashboard_service)

def get_inventory_service(
    repo: InMemoryDashboardRepository = Depends(get_repo),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> InventoryService:
    return InventoryService(repo, dashboard_service)

def get_route_service(
    repo: InMemoryDashboardRepository = Depends(get_repo),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> RouteService:
    return RouteService(repo, dashboard_service)


# ── Web Endpoint Controllers ──

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "medrush-api"}


@app.get("/api/dashboard", response_model=DashboardData)
def get_dashboard(
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardData:
    return dashboard_service.get_snapshot()


@app.get("/api/mothers", response_model=list[Mother])
def list_mothers(
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> list[Mother]:
    return dashboard_service.get_snapshot().mothers


@app.post("/api/intake", response_model=IntakeResult)
def create_intake(
    payload: IntakePayload,
    intake_service: IntakeService = Depends(get_intake_service),
) -> IntakeResult:
    return intake_service.process_intake(payload)


@app.patch("/api/tasks/{task_id}/complete", response_model=DashboardData)
def complete_task(
    task_id: str,
    task_service: TaskService = Depends(get_task_service),
) -> DashboardData:
    data = task_service.complete_task(task_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return data


@app.patch("/api/alerts/{alert_id}/status", response_model=DashboardData)
def update_alert_status(
    alert_id: str,
    payload: AlertStatusPayload,
    alert_service: AlertService = Depends(get_alert_service),
) -> DashboardData:
    data = alert_service.update_alert_status(alert_id, payload.status)
    if data is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return data


@app.post("/api/inventory/{item_id}/restock", response_model=DashboardData)
def restock_item(
    item_id: str,
    payload: RestockPayload,
    inventory_service: InventoryService = Depends(get_inventory_service),
) -> DashboardData:
    data = inventory_service.restock_item(item_id, payload.amount)
    if data is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return data


@app.patch("/api/routes/{route_id}/activate", response_model=DashboardData)
def activate_route(
    route_id: str,
    route_service: RouteService = Depends(get_route_service),
) -> DashboardData:
    data = route_service.activate_route(route_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return data
