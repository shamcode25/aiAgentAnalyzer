"""Agentic pipeline: intent -> triage (rules then LLM) -> orchestrator -> documentation."""
from __future__ import annotations

import time
import uuid
from typing import Any, Dict, Optional

from app.config import DEFAULT_MODEL
from app.schemas import (
    FullAnalysisResponse,
    IntentResult,
    TriageResult,
    OrchestrationResult,
    DocumentationResult,
    SOAPNote,
)
from app.triage_rules import get_red_flags
from app.agents.intent_agent import run_intent
from app.agents.triage_agent import run_triage
from app.agents.orchestrator import run_orchestrator
from app.agents.documentation_agent import run_documentation


def run_pipeline(
    transcript: str,
    caller_context: Optional[Dict[str, Any]] = None,
    channel: Optional[str] = None,
    debug: Optional[bool] = None,
) -> FullAnalysisResponse:
    request_id = str(uuid.uuid4())
    model = DEFAULT_MODEL
    start = time.perf_counter()
    warnings: list[str] = []
    errors: list[str] = []

    intent: Optional[IntentResult] = None
    triage: Optional[TriageResult] = None
    orchestration: Optional[OrchestrationResult] = None
    documentation: Optional[DocumentationResult] = None

    # Step 1: Intent
    try:
        intent = run_intent(transcript, model)
    except Exception as e:
        errors.append(f"Intent: {str(e)}")
        intent = IntentResult(intent="symptoms", confidence=0.0, reason="Fallback after error.")

    if not intent:
        intent = IntentResult(intent="symptoms", confidence=0.0, reason="Fallback.")

    # Step 2: Triage (rules first)
    red_flags = get_red_flags(transcript)
    try:
        triage = run_triage(transcript, model, red_flags)
    except Exception as e:
        errors.append(f"Triage: {str(e)}")
        triage = TriageResult(
            urgency="routine",
            red_flags_detected=red_flags,
            questions_to_ask=[],
            reasoning="Fallback after error.",
        )
    if not triage:
        triage = TriageResult(
            urgency="routine",
            red_flags_detected=red_flags,
            questions_to_ask=[],
            reasoning="Fallback.",
        )

    # Step 3: Orchestrator
    try:
        orchestration = run_orchestrator(transcript, intent, triage, model)
    except Exception as e:
        errors.append(f"Orchestration: {str(e)}")
        route = "er_instruction" if triage.urgency == "er" else "agent"
        orchestration = OrchestrationResult(
            route_to=route,
            next_best_actions=[],
            suggested_script=[],
            escalation_reason=None,
        )
    if not orchestration:
        orchestration = OrchestrationResult(
            route_to="agent",
            next_best_actions=[],
            suggested_script=[],
            escalation_reason=None,
        )

    # Step 4: Documentation
    try:
        documentation = run_documentation(transcript, intent, triage, orchestration, model)
    except Exception as e:
        errors.append(f"Documentation: {str(e)}")
        documentation = DocumentationResult(
            summary_bullets=[],
            soap=SOAPNote(S="", O="", A="", P=""),
            follow_up_tasks=[],
        )
    if not documentation:
        documentation = DocumentationResult(
            summary_bullets=[],
            soap=SOAPNote(S="", O="", A="", P=""),
            follow_up_tasks=[],
        )

    latency_s = time.perf_counter() - start

    return FullAnalysisResponse(
        request_id=request_id,
        intent=intent,
        triage=triage,
        orchestration=orchestration,
        documentation=documentation,
        latency_s=round(latency_s, 3),
        model_used=model,
        warnings=warnings,
        errors=errors,
    )
