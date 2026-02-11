"""Intent classification agent using LLM with structured output."""
from app.llm import call_llm_json
from app.schemas import IntentResult, INTENT_JSON_SCHEMA

SYSTEM = """You are a healthcare call center intent classifier. Given a call transcript, classify the primary intent into exactly one of: scheduling, billing, refill, symptoms.
- scheduling: appointment booking, rescheduling, cancellation, availability
- billing: charges, insurance, payment, statements
- refill: prescription refill, medication renewal
- symptoms: patient describing symptoms, seeking medical advice, feeling unwell
Return only valid JSON matching the schema. No markdown, no extra keys."""


def run_intent(transcript: str, model: str) -> IntentResult:
    raw = call_llm_json(model, SYSTEM, transcript, INTENT_JSON_SCHEMA)
    return IntentResult(**raw)
