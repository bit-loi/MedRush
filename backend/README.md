# MedRush Backend

FastAPI service for the MedRush hackathon prototype.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8003
```

## Main endpoints

- `GET /health`
- `GET /api/dashboard`
- `POST /api/intake`
- `PATCH /api/tasks/{task_id}/complete`
- `POST /api/inventory/{item_id}/restock`

The prototype uses in-memory seed data. Swap this layer for PostgreSQL when moving beyond the demo.
