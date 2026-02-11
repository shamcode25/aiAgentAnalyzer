# Deploy Care Navigator Agent

## Render (Backend)

### Step 1: Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `shamcode25/aiAgentAnalyzer`
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `care-navigator-backend` |
| **Region** | Oregon (or nearest) |
| **Branch** | `main` |
| **Root Directory** | `backend` ← **critical** |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### Step 2: Environment Variables
Add in Render dashboard:
- **OPENAI_API_KEY** = your OpenAI API key (from https://platform.openai.com/api-keys)

### Step 3: Deploy
Click **Create Web Service**. Wait for build to complete.

### Step 4: Verify
Open your Render URL (e.g. `https://care-navigator-backend.onrender.com`):
- **Root** `/` → `{"message": "Care Navigator Agent API", ...}`
- **Health** `/health` → `{"status":"ok"}`
- **Docs** `/docs` → Swagger UI

If you see "Not Found":
1. Check **Root Directory** is exactly `backend` (not empty, not the repo root)
2. Check **Start Command** uses `app.main:app` (with the dot)
3. Check build logs for errors
4. On free tier, first request may take 30–60s while the service wakes up

---

## Vercel (Frontend)

1. **New Project** → Import `shamcode25/aiAgentAnalyzer`
2. **Root Directory**: `frontend` ← **critical**
3. **Node.js Version**: In Project Settings → Build and Deployment → Node.js Version, select **24.x** (Node 18.x is discontinued)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variable**:
   - `VITE_API_URL` = `https://YOUR-RENDER-URL.onrender.com` (no trailing slash)

Redeploy after adding the env var.

If you see "Found invalid or discontinued Node.js Version: 18.x":
- Ensure **Root Directory** is `frontend` (so Vercel uses `frontend/package.json` with `engines.node: "24.x"`)
- In Project Settings → Build and Deployment → **Node.js Version**, select **24.x**
- Remove any `NODE_VERSION=18` env var if present
- Clear build cache and redeploy
