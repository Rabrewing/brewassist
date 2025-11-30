#!/usr/bin/env python3
"""
── BrewAssist File Agent ──
Unified and safe read/write/delete API for ALL engines:
Gemini, Grok, Mistral, HRM, TinyLLaMA, future engines.

Human-readable, auditable, replayable.
"""

import os
import pathlib
from datetime import datetime
from brewassist_core.agents.autonomy import autonomy_enabled
from brewassist_core.agents.logger import log_event
from brewassist_core.agents.safety_path import safe_path
import subprocess
import json # For list_dir output


class FileAgent:
    def __init__(self, root_dir: str, allow_paths=None, allow_write: bool = True, allow_delete: bool = False, dry_run: bool = False, actions_log=None):
        self.root_dir = pathlib.Path(root_dir).resolve()
        self.allow_paths = allow_paths if allow_paths is not None else []
        self.allow_write = allow_write
        self.allow_delete = allow_delete
        self.dry_run = dry_run
        self.actions_log = actions_log

    def _guard(self, action: str, real_path: pathlib.Path):
        if not autonomy_enabled() and action in {"write", "append", "delete"}:
            log_event("blocked", str(real_path), f"{action} blocked, autonomy OFF")
            raise PermissionError(
                f"\U00014008 Autonomy is OFF — {action} on {real_path} requires confirmation."
            )
        if self.dry_run:
            log_event("dry_run", str(real_path), f"{action} dry-run to {real_path}")
            raise Exception(f"Dry run: Would have performed {action} on {real_path}")

    def read_file(self, path: str) -> str:
        real = safe_path(path)
        process = subprocess.run(
            ["/home/brewexec/overlays/read_file.sh", path],
            capture_output=True,
            text=True,
            check=False
        )
        if process.returncode != 0:
            log_event("error", str(real), f"read_file failed: {process.stderr.strip()}")
            raise IOError(f"Failed to read file: {process.stderr.strip()}")
        log_event("read", str(real), f"Read {len(process.stdout)} chars")
        return process.stdout

    def write_file(self, path: str, content: str):
        real = safe_path(path)
        self._guard("write", real)
        process = subprocess.run(
            ["/home/brewexec/overlays/write_file.sh", path],
            input=content.encode('utf-8'),
            capture_output=True,
            text=True,
            check=False
        )
        if process.returncode != 0:
            log_event("error", str(real), f"write_file failed: {process.stderr.strip()}")
            raise IOError(f"Failed to write file: {process.stderr.strip()}")
        log_event("write", str(real), f"Wrote {len(content)} chars")
        return f"✓ File written: {real}"

    def append_file(self, path: str, content: str):
        real = safe_path(path)
        self._guard("append", real)
        with open(real, "a", encoding="utf-8") as f:
            f.write("\n" + content)
        log_event("append", str(real), f"Appended {len(content)} chars")
        return f"✓ Appended text → {real}"

    def delete_file(self, path: str):
        real = safe_path(path)
        self._guard("delete", real)
        process = subprocess.run(
            ["/usr/bin/rm", str(real)],
            capture_output=True,
            text=True,
            check=False
        )
        if process.returncode != 0:
            log_event("error", str(real), f"delete_file failed: {process.stderr.strip()}")
            raise OSError(f"Failed to delete file: {process.stderr.strip()}")
        log_event("delete", str(real), "File deleted")
        return f"✓ Deleted file: {real}"

    def list_dir(self, path: str) -> str:
        real = safe_path(path)
        process = subprocess.run(
            ["/home/brewexec/overlays/list_dir.sh", path],
            capture_output=True,
            text=True,
            check=False
        )
        if process.returncode != 0:
            log_event("error", str(real), f"list_dir failed: {process.stderr.strip()}")
            raise IOError(f"Failed to list directory: {process.stderr.strip()}")
        log_event("list_dir", str(real), "Listed directory")
        return process.stdout

    def search_code(self, term: str, path: str = "") -> str:
        process = subprocess.run(
            ["/home/brewexec/overlays/search_code.sh", term, path],
            capture_output=True,
            text=True,
            check=False
        )
        if process.returncode != 0:
            log_event("error", f"Search for '{term}' in '{path}'", f"search_code failed: {process.stderr.strip()}")
            raise ValueError(f"Failed to search code: {process.stderr.strip()}")
        log_event("search_code", f"Search for '{term}' in '{path}'", f"Performed search, found {process.stdout.count('\n')} lines")
        return process.stdout

    def run_shell(self, command: str) -> str:
        process = subprocess.run(
            ["/home/brewexec/overlays/run_shell.sh", command],
            capture_output=True,
            text=True,
            check=False
        )
        if process.returncode != 0:
            log_event("error", f"Shell command: '{command}'", f"run_shell failed: {process.stderr.strip()}")
            raise ValueError(f"Failed to run shell command: {process.stderr.strip()}")
        log_event("run_shell", f"Shell command: '{command}'", "Executed shell command")
        return process.stdout