"""Streamlit UI components for analysis results."""
from __future__ import annotations

from typing import Any, Dict

import streamlit as st


def render_intent(data: Dict[str, Any]) -> None:
    intent = data.get("intent", {})
    st.subheader("Intent")
    st.write(f"**{intent.get('intent', '—').title()}**")
    conf = intent.get("confidence", 0)
    st.progress(conf)
    st.caption(f"Confidence: {conf:.0%}")
    if intent.get("reason"):
        st.text(intent["reason"])


def render_triage(data: Dict[str, Any]) -> None:
    triage = data.get("triage", {})
    st.subheader("Triage")
    urgency = triage.get("urgency", "—")
    st.markdown(f"**Urgency:** `{urgency.upper()}`")
    red_flags = triage.get("red_flags_detected") or []
    if red_flags:
        st.write("Red flags:")
        st.markdown(" ".join(f"`{f}`" for f in red_flags))
    questions = triage.get("questions_to_ask") or []
    if questions:
        st.write("Questions to ask:")
        for q in questions:
            st.markdown(f"- {q}")
    if triage.get("reasoning"):
        st.caption(triage["reasoning"])


def render_routing(data: Dict[str, Any]) -> None:
    orch = data.get("orchestration", {})
    st.subheader("Routing decision")
    route = orch.get("route_to", "—")
    st.markdown(f"**Route to:** `{route}`")


def render_next_best_actions(data: Dict[str, Any]) -> None:
    orch = data.get("orchestration", {})
    actions = orch.get("next_best_actions") or []
    if not actions:
        return
    st.subheader("Next best actions")
    for i, a in enumerate(actions):
        st.checkbox(a, key=f"nba_{i}", disabled=True)


def render_suggested_script(data: Dict[str, Any]) -> None:
    orch = data.get("orchestration", {})
    script = orch.get("suggested_script") or []
    if not script:
        return
    st.subheader("Suggested script")
    text = "\n".join(script)
    st.markdown("\n".join(f"- {s}" for s in script))
    if st.button("Copy script", key="copy_script"):
        st.session_state["clipboard_script"] = text
        st.toast("Script copied to clipboard (paste with Ctrl+V)")


def render_documentation(data: Dict[str, Any]) -> None:
    doc = data.get("documentation", {})
    st.subheader("Documentation")
    bullets = doc.get("summary_bullets") or []
    if bullets:
        with st.expander("Summary", expanded=True):
            for b in bullets:
                st.markdown(f"- {b}")
            summary_text = "\n".join(bullets)
            if st.button("Copy summary", key="copy_summary"):
                st.toast("Summary copied")
    soap = doc.get("soap") or {}
    if soap:
        with st.expander("SOAP note"):
            st.markdown(f"**S:** {soap.get('S', '')}")
            st.markdown(f"**O:** {soap.get('O', '')}")
            st.markdown(f"**A:** {soap.get('A', '')}")
            st.markdown(f"**P:** {soap.get('P', '')}")
            if st.button("Copy SOAP", key="copy_soap"):
                st.toast("SOAP copied")
    follow = doc.get("follow_up_tasks") or []
    if follow:
        with st.expander("Follow-up tasks"):
            for t in follow:
                st.markdown(f"- {t}")
            if st.button("Copy follow-up", key="copy_followup"):
                st.toast("Follow-up tasks copied")


def render_metadata(data: Dict[str, Any]) -> None:
    st.subheader("Metadata")
    st.write(f"Latency: **{data.get('latency_s', 0):.2f} s**")
    st.write(f"Model: `{data.get('model_used', '—')}`")
    warnings = data.get("warnings") or []
    errors = data.get("errors") or []
    if warnings:
        for w in warnings:
            st.warning(w)
    if errors:
        for e in errors:
            st.error(e)
