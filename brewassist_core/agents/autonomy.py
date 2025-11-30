#!/usr/bin/env python3
"""
── BrewAssist Autonomy Mode ──
Controls whether AI tools may apply file changes automatically.
"""

import os


def autonomy_enabled() -> bool:
    val = os.getenv("BREW_AUTONOMY", "off").strip().lower()
    return val in ("1", "true", "yes", "on")


def autonomy_label() -> str:
    return "ON" if autonomy_enabled() else "OFF"
