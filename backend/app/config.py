"""Application configuration."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Load .env from backend directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


def get_env(key: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(key, default)


# Default model (use a real model name; gpt-5.2-mini may not exist yet)
DEFAULT_MODEL: str = get_env("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY: Optional[str] = get_env("OPENAI_API_KEY")
