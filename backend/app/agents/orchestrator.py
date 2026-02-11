"""Orchestrator: deterministic routing + LLM for next_best_actions and suggested_script."""
from app.llm import call_llm_json
from app.schemas import IntentResult, TriageResult, OrchestrationResult, ORCHESTRATION_JSON_SCHEMA


def _route(intent: IntentResult, triage: TriageResult) -> str:
    if intent.intent != "symptoms":
        return "agent"
    if triage.urgency == "er":
        return "er_instruction"
    if triage.urgency == "same_day":
        return "nurse"
    if triage.urgency == "telehealth":
        return "agent"
    if triage.urgency == "routine":
        return "self_service"
    return "agent"


SYSTEM = """You are a healthcare call center orchestrator. Given intent, triage urgency, and route_to, produce:
- next_best_actions: 4-8 concrete actions the agent should take (e.g., verify insurance, schedule callback).
- suggested_script: 3-6 lines the agent can say to the caller, appropriate for the route and intent.
- escalation_reason: null unless escalating; otherwise short reason.
Return only valid JSON matching the schema. No markdown, no extra keys."""


def run_orchestrator(
    transcript: str,
    intent: IntentResult,
    triage: TriageResult,
    model: str,
) -> OrchestrationResult:
    route_to = _route(intent, triage)
    user = (
        f"Intent: {intent.intent}. Urgency: {triage.urgency}. Route: {route_to}.\n\n"
        f"Transcript (excerpt): {transcript[:1500]}"
    )
    raw = call_llm_json(model, SYSTEM, user, ORCHESTRATION_JSON_SCHEMA)
    # Enforce deterministic route
    raw["route_to"] = route_to
    return OrchestrationResult(**raw)
