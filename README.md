# MedRush

WhatsApp-first maternal health adherence and supply-chain coordination.

This repo contains a fullstack hackathon prototype:

- **Frontend:** Next.js dashboard for district teams.
- **Backend:** FastAPI service for WhatsApp intake, triage signals, task routing, inventory warnings, and audit trail.

## Run the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8003
```

Health check:

```bash
curl http://127.0.0.1:8003/health
```

## Run the frontend

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

The frontend reads `NEXT_PUBLIC_API_BASE_URL`; by default it uses `http://127.0.0.1:8003`. If the API is offline, the dashboard still loads with fallback demo data and local intake simulation.

## Prototype flow

1. A mother sends a WhatsApp check-in or voice transcript.
2. The backend extracts adherence, symptom, and stock signals.
3. MedRush creates a prioritized alert and field task.
4. The district dashboard shows follow-up, inventory, route, and audit context.

Safety boundary: MedRush is AI-assisted triage support, not automatic medical diagnosis.
