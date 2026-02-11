# Frontend — Care Navigator Agent

React (Vite + Tailwind + Motion) UI matching the Care Navigator Agent design. Calls the backend for health check and analysis.

## Setup

1. **Node.js 18+** and npm:

   ```bash
   cd frontend
   npm install
   ```

2. **Environment (optional):**

   Create a `.env` file if the backend is not at `http://localhost:8000`:

   ```bash
   VITE_API_URL=http://localhost:8000
   ```

   With the default Vite dev server proxy, `/api` is forwarded to the backend, so you usually don't need this.

3. **Run:**

   ```bash
   npm run dev
   ```

   Open http://localhost:5173.

## Usage

- **Backend status** is shown in the header (Backend Online / Offline). Start the backend first.
- Choose a **Sample Scenario** or paste your own **Call Transcript**.
- Toggle **Debug Mode** to show the full API response and metadata.
- Click **Run AI Analysis** to run the pipeline. Results: Intent Intelligence, Clinical Triage Engine, Routing & Entities, Suggested Script, Next Best Actions, AI Generated Summary (with SOAP and follow-up). Use the copy button on the summary to copy to clipboard.
- **AI Assistant** (bottom-right) opens a chat panel for quick questions about the analysis.

## Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static host. Set `VITE_API_URL` to your backend URL when deploying.

## Troubleshooting

- **Backend Offline:** Start the backend: `cd backend && uvicorn app.main:app --reload --port 8000`. Ensure `OPENAI_API_KEY` is set in `backend/.env`.
- **Request failed / 503:** Backend is running but `OPENAI_API_KEY` is missing or invalid. Check `backend/.env`.
- **CORS errors:** Backend allows `http://localhost:5173` and `http://localhost:8501`. If using another origin, add it in `backend/app/main.py` (allow_origins).

## Legacy Streamlit app

The repo also includes a Streamlit UI. From `frontend/` with Python venv and `pip install -r requirements.txt` (Streamlit deps), run:

```bash
streamlit run app.py
```

Then open http://localhost:8501.
