"""Triage agent: rule-based red flags first; if none, LLM for urgency."""
from app.llm import call_llm_json
from app.schemas import TriageResult, TRIAGE_JSON_SCHEMA
from app.triage_rules import get_red_flags, get_safety_questions


SYSTEM = """You are a healthcare triage assistant. Given a call transcript and any known red flags, determine urgency:
- er: emergency, needs ER or 911
- same_day: urgent, same-day visit
- telehealth: can be handled via telehealth
- routine: non-urgent, routine follow-up
Provide 1-5 questions_to_ask that would help clarify urgency or safety. Be concise.
Return only valid JSON matching the schema. No markdown, no extra keys."""


def run_triage(
    transcript: str,
    model: str,
    red_flags: list[str],
) -> TriageResult:
    if red_flags:
        questions = get_safety_questions(red_flags)
        return TriageResult(
            urgency="er",
            red_flags_detected=red_flags,
            questions_to_ask=questions,
            reasoning="Red flag detected; follow emergency protocol.",
        )
    raw = call_llm_json(model, SYSTEM, transcript, TRIAGE_JSON_SCHEMA)
    return TriageResult(**raw)
