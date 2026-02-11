# Backend — Care Navigator Agent

FastAPI service for the Healthcare Call Center Agent Assist pipeline.

## Setup

1. **Python 3.11+** and a virtualenv:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   - `OPENAI_API_KEY` — required for `/analyze`. Get from https://platform.openai.com/api-keys
   - `OPENAI_MODEL` (optional) — e.g. `gpt-4o-mini` (default), `gpt-4o`

3. **Run:**

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   - Health: http://localhost:8000/health  
   - Docs: http://localhost:8000/docs  

## Endpoints

- **GET /health** — Returns `{"status": "ok"}`. Used by frontend to verify backend is up.
- **POST /analyze** — Request body: `{ "transcript": string, "caller_context": object|null, "channel": "phone"|"chat"|null, "debug": boolean|null }`. Returns full analysis (intent, triage, orchestration, documentation, latency, model, warnings, errors).

## Troubleshooting

- **503 on /analyze:** `OPENAI_API_KEY` is missing or empty. Set it in `backend/.env`.
- **Import errors:** Run from the `backend` directory so `app` resolves, or ensure `PYTHONPATH` includes `backend`.
- **CORS:** The app allows `http://localhost:8501` for the Streamlit frontend. For another origin, add it in `app/main.py` in `allow_origins`.
