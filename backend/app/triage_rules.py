"""Rule-based red-flag detection for triage. Case-insensitive keyword matching."""
import re
# Red-flag phrases (case-insensitive). Each tuple: (pattern, label for reasoning).
RED_FLAG_PATTERNS: list[tuple[str, str]] = [
    (r"\bchest\s+pain\b", "chest pain"),
    (r"\btrouble\s+breathing\b", "trouble breathing"),
    (r"\bshortness\s+of\s+breath\b", "shortness of breath"),
    (r"\bface\s+droop\b", "stroke symptoms (face droop)"),
    (r"\bslurred\s+speech\b", "stroke symptoms (slurred speech)"),
    (r"\bstroke\s+symptoms\b", "stroke symptoms"),
    (r"\bunconscious\b", "unconscious/fainting"),
    (r"\bfainting\b", "unconscious/fainting"),
    (r"\bpassed\s+out\b", "unconscious/fainting"),
    (r"\bsevere\s+bleeding\b", "severe bleeding"),
    (r"\bheavy\s+bleeding\b", "severe bleeding"),
    (r"\bsevere\s+allergic\s+reaction\b", "severe allergic reaction"),
    (r"\bthroat\s+swelling\b", "severe allergic reaction swelling"),
    (r"\bswelling\s+of\s+(the\s+)?throat\b", "severe allergic reaction swelling"),
    (r"\bsuicidal\s+thoughts\b", "suicidal thoughts"),
    (r"\bthinking\s+about\s+suicide\b", "suicidal thoughts"),
    (r"\bwant\s+to\s+die\b", "suicidal thoughts"),
]


def get_red_flags(text: str) -> list[str]:
    """Return list of detected red-flag labels (no duplicates, order of first match)."""
    if not text or not text.strip():
        return []
    text_lower = text.lower()
    seen: set[str] = set()
    out: list[str] = []
    for pattern, label in RED_FLAG_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE) and label not in seen:
            seen.add(label)
            out.append(label)
    return out


def get_safety_questions(red_flags: list[str]) -> list[str]:
    """Return 1–3 safety questions based on detected red flags."""
    questions: list[str] = []
    if not red_flags:
        return questions
    # Generic safety questions when any red flag is present
    if any("chest" in f or "breath" in f for f in red_flags):
        questions.append("Are you currently having chest pain or difficulty breathing right now?")
    if any("stroke" in f or "face" in f or "slurred" in f for f in red_flags):
        questions.append("Are you or the patient currently experiencing any weakness on one side or speech difficulty?")
    if any("suicidal" in f or "suicide" in f or "die" in f for f in red_flags):
        questions.append("Are you in a safe place? Do you have access to weapons or means to harm yourself?")
    if any("unconscious" in f or "fainting" in f for f in red_flags):
        questions.append("Is the person conscious and breathing normally now?")
    if any("allergic" in f or "swelling" in f for f in red_flags):
        questions.append("Is there any swelling of the face, lips, or throat? Can they breathe normally?")
    if any("bleeding" in f for f in red_flags):
        questions.append("Is the bleeding under control with direct pressure?")
    # Cap at 3
    return questions[:3] if len(questions) > 3 else (questions or ["Can you describe what happened and how you feel right now?"])
