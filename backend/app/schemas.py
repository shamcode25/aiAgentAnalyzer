"""Pydantic schemas and JSON Schema dicts for OpenAI Structured Outputs."""
from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


# --- Request ---
class AnalyzeRequest(BaseModel):
    transcript: str
    caller_context: Optional[Dict[str, Any]] = None
    channel: Optional[str] = None  # "phone" | "chat"
    debug: Optional[bool] = None


# --- Intent ---
class IntentResult(BaseModel):
    intent: str  # "scheduling" | "billing" | "refill" | "symptoms"
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str


INTENT_JSON_SCHEMA: Dict[str, Any] = {
    "name": "intent_result",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "intent": {"type": "string", "enum": ["scheduling", "billing", "refill", "symptoms"]},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
            "reason": {"type": "string"},
        },
        "required": ["intent", "confidence", "reason"],
        "additionalProperties": False,
    },
}


# --- Triage ---
class TriageResult(BaseModel):
    urgency: str  # "er" | "same_day" | "telehealth" | "routine"
    red_flags_detected: list[str] = Field(default_factory=list)
    questions_to_ask: list[str] = Field(default_factory=list)
    reasoning: str


TRIAGE_JSON_SCHEMA: Dict[str, Any] = {
    "name": "triage_result",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "urgency": {"type": "string", "enum": ["er", "same_day", "telehealth", "routine"]},
            "red_flags_detected": {"type": "array", "items": {"type": "string"}},
            "questions_to_ask": {"type": "array", "items": {"type": "string"}},
            "reasoning": {"type": "string"},
        },
        "required": ["urgency", "red_flags_detected", "questions_to_ask", "reasoning"],
        "additionalProperties": False,
    },
}


# --- Orchestration ---
class OrchestrationResult(BaseModel):
    route_to: str  # "agent" | "nurse" | "er_instruction" | "self_service"
    next_best_actions: list[str] = Field(default_factory=list)
    suggested_script: list[str] = Field(default_factory=list)
    escalation_reason: Optional[str] = None


ORCHESTRATION_JSON_SCHEMA: Dict[str, Any] = {
    "name": "orchestration_result",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "route_to": {"type": "string", "enum": ["agent", "nurse", "er_instruction", "self_service"]},
            "next_best_actions": {"type": "array", "items": {"type": "string"}},
            "suggested_script": {"type": "array", "items": {"type": "string"}},
            "escalation_reason": {"type": ["string", "null"]},
        },
        "required": ["route_to", "next_best_actions", "suggested_script", "escalation_reason"],
        "additionalProperties": False,
    },
}


# --- Documentation (SOAP) ---
class SOAPNote(BaseModel):
    S: str
    O: str
    A: str
    P: str


class DocumentationResult(BaseModel):
    summary_bullets: list[str] = Field(default_factory=list)
    soap: SOAPNote
    follow_up_tasks: list[str] = Field(default_factory=list)


DOCUMENTATION_JSON_SCHEMA: Dict[str, Any] = {
    "name": "documentation_result",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "summary_bullets": {"type": "array", "items": {"type": "string"}},
            "soap": {
                "type": "object",
                "properties": {
                    "S": {"type": "string"},
                    "O": {"type": "string"},
                    "A": {"type": "string"},
                    "P": {"type": "string"},
                },
                "required": ["S", "O", "A", "P"],
                "additionalProperties": False,
            },
            "follow_up_tasks": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["summary_bullets", "soap", "follow_up_tasks"],
        "additionalProperties": False,
    },
}


# --- Full API response ---
class FullAnalysisResponse(BaseModel):
    request_id: str
    intent: IntentResult
    triage: TriageResult
    orchestration: OrchestrationResult
    documentation: DocumentationResult
    latency_s: float
    model_used: str
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
