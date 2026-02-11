"""LLM client: OpenAI with Structured Outputs (JSON Schema), retry on parse failure."""
from __future__ import annotations

import json
import logging
from typing import Any, Dict

from openai import OpenAI

from app.config import OPENAI_API_KEY, DEFAULT_MODEL

logger = logging.getLogger(__name__)

# OpenAI Responses API uses response_format with json_schema
# Chat Completions API: response_format={"type": "json_schema", "json_schema": {...}}
REPAIR_INSTRUCTION = (
    "Your previous response was invalid JSON or had extra keys. "
    "Return valid JSON only, no markdown, no code blocks, no extra keys. "
    "Match the required schema exactly."
)


def call_llm_json(
    model: str,
    system: str,
    user: str,
    json_schema: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Call OpenAI with strict JSON Schema output. One retry with repair instruction on parse/validation failure.
    Raises clean exceptions for the pipeline to catch.
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=OPENAI_API_KEY)
    schema_for_api = json_schema.get("schema", json_schema) if "schema" in json_schema else json_schema
    name = json_schema.get("name", "response")
    strict = json_schema.get("strict", True)

    system_with_instruction = (
        system + "\n\nReturn JSON only. No markdown. No extra keys. No code blocks."
    )

    def _call(user_message: str) -> Dict[str, Any]:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_with_instruction},
                {"role": "user", "content": user_message},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": name,
                    "strict": strict,
                    "schema": schema_for_api,
                },
            },
        )
        choice = response.choices[0]
        text = (choice.message.content or "").strip()
        if not text:
            raise ValueError("Empty response from model")
        # Remove markdown code blocks if present
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines)
        return json.loads(text)

    try:
        return _call(user)
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        logger.warning("First LLM parse/validation failed: %s", e)
        try:
            return _call(user + "\n\n" + REPAIR_INSTRUCTION)
        except (json.JSONDecodeError, ValueError, KeyError) as e2:
            raise ValueError(f"LLM response invalid after retry: {e2}") from e2
