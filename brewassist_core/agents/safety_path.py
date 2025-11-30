"""
── Safety Path Layer ──
Prevents directory traversal and ensures all FS ops
stay inside /home/brewexec.
"""

import pathlib
import os

BASE = pathlib.Path("/home/brewexec").resolve()


def safe_path(path: str) -> pathlib.Path:
    real = (BASE / path).resolve()

    if not str(real).startswith(str(BASE)):
        raise PermissionError(f"🚫 Unsafe path blocked: {path}")

    return real
