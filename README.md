
live --- https://ai-agent-analyzer-two.vercel.app/

# care-navigator-agent

Healthcare Call Center Agent Assist MVP: paste a call transcript and run an agentic pipeline (intent → triage → orchestration → documentation).

## Quick start

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React)

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Select a sample scenario or paste a transcript and click **Run AI Analysis**.

(Optional Streamlit UI: from `frontend/` run `pip install -r requirements.txt` then `streamlit run app.py` → http://localhost:8501.)

## Repo structure

- **backend/** — FastAPI app: `GET /health`, `POST /analyze`. Pipeline: intent → triage (rules + LLM) → orchestrator → documentation. Uses OpenAI with structured JSON outputs.
- **frontend/** — React (Vite + Tailwind + Motion) app: AI Input Console (transcript, samples, debug toggle), Intent Intelligence, Clinical Triage Engine, Routing & Entities, Suggested Script, Next Best Actions, AI Generated Summary (SOAP, follow-up), Debug panel, and floating AI Assistant.

## Tech

- Python 3.11+
- Backend: FastAPI, Uvicorn, OpenAI SDK, Pydantic, python-dotenv
- Frontend: React 18, Vite, Tailwind CSS, Motion, lucide-react. Proxy `/api` → backend.
- No database, no auth (local dev only).

## Env

- **Backend:** `OPENAI_API_KEY` (required for `/analyze`). Optional: `OPENAI_MODEL` (default `gpt-4o-mini`).
- **Frontend:** Optional `VITE_API_URL` (default: use dev proxy `/api` → http://localhost:8000). No OpenAI key on frontend.

See `backend/README.md` and `frontend/README.md` for setup and troubleshooting.
