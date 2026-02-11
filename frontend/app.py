"""Streamlit frontend for Care Navigator Agent. Calls backend for /health and /analyze."""
import os
from pathlib import Path

import requests
import streamlit as st

from dotenv import load_dotenv

from samples import SAMPLES, get_sample_by_id
from ui_components import (
    render_intent,
    render_triage,
    render_routing,
    render_next_best_actions,
    render_suggested_script,
    render_documentation,
    render_metadata,
)

# Load .env from frontend directory
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")


def check_health() -> bool:
    try:
        r = requests.get(f"{BACKEND_URL}/health", timeout=5)
        return r.status_code == 200
    except Exception:
        return False


st.set_page_config(page_title="Care Navigator Agent", layout="wide")
st.title("Care Navigator Agent")
st.caption("Healthcare Call Center Agent Assist — paste a call transcript and run the pipeline.")

# Health check on startup
if not check_health():
    st.error(
        "Backend is unreachable. Make sure the FastAPI server is running at "
        f"**{BACKEND_URL}** (e.g. `uvicorn app.main:app --reload --port 8000` from the backend directory)."
    )
    st.stop()
st.success("Backend connected.")

# Layout: left column = input, right = results
col_left, col_right = st.columns([1, 1])

with col_left:
    st.subheader("Input")
    sample_options = {s.label: s.id for s in SAMPLES}
    selected_label = st.selectbox(
        "Sample transcript",
        options=list(sample_options.keys()),
        index=0,
    )
    sample_id = sample_options[selected_label]
    sample = get_sample_by_id(sample_id)
    default_text = sample.transcript if sample else ""
    transcript = st.text_area(
        "Call transcript",
        value=default_text,
        height=200,
        placeholder="Paste or type the call transcript here.",
    )
    debug = st.checkbox("Debug", value=False)
    analyze_clicked = st.button("Analyze")

with col_right:
    st.subheader("Results")
    if analyze_clicked:
        if not transcript.strip():
            st.warning("Please enter a transcript.")
        else:
            with st.spinner("Running pipeline..."):
                try:
                    r = requests.post(
                        f"{BACKEND_URL}/analyze",
                        json={
                            "transcript": transcript,
                            "caller_context": None,
                            "channel": None,
                            "debug": debug,
                        },
                        timeout=120,
                    )
                    r.raise_for_status()
                    data = r.json()
                except requests.exceptions.RequestException as e:
                    st.error(f"Request failed: {e}. Is the backend running at {BACKEND_URL}?")
                    st.stop()
            # Render sections in order
            render_intent(data)
            render_triage(data)
            render_routing(data)
            render_next_best_actions(data)
            render_suggested_script(data)
            render_documentation(data)
            render_metadata(data)
    else:
        st.info("Click **Analyze** to run the pipeline on the transcript.")
