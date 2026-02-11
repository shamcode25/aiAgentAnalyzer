"""Documentation agent: summary, SOAP note, follow-up tasks. Conservative language."""
from app.llm import call_llm_json
from app.schemas import (
    DocumentationResult,
    SOAPNote,
    DOCUMENTATION_JSON_SCHEMA,
    OrchestrationResult,
    TriageResult,
    IntentResult,
)


SYSTEM = """You are a healthcare call documentation assistant. Create documentation from the call. Rules:
- Be conservative: no medical diagnosis. Use "possible", "reported", "caller stated".
- Summary: 4-6 bullet points.
- SOAP: S=Subjective (caller's report), O=Objective (if any from call), A=Assessment (possible/working assessment only), P=Plan (next steps). Keep aligned to urgency and route.
- Follow-up tasks: 2-5 concrete tasks.
Return only valid JSON matching the schema. No markdown, no extra keys."""


def run_documentation(
    transcript: str,
    intent: IntentResult,
    triage: TriageResult,
    orchestration: OrchestrationResult,
    model: str,
) -> DocumentationResult:
    user = (
        f"Intent: {intent.intent}. Urgency: {triage.urgency}. Route: {orchestration.route_to}.\n\n"
        f"Transcript:\n{transcript[:3000]}"
    )
    raw = call_llm_json(model, SYSTEM, user, DOCUMENTATION_JSON_SCHEMA)
    soap = raw["soap"]
    raw["soap"] = SOAPNote(S=soap["S"], O=soap["O"], A=soap["A"], P=soap["P"])
    return DocumentationResult(**raw)
