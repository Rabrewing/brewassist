#!/usr/bin/env python3
"""
── BrewAssist Logger ──
Simple event logger for auditable and replayable actions.
"""

import os
from datetime import datetime

LOG_FILE = os.path.expanduser("~/.brewpulse_actions.log")

def log_event(action: str, target: str, details: str = ""):
    """
    Logs an event to the central action log.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} | {action.upper():<10} | {target} | {details}\n"
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_entry)

if __name__ == "__main__":
    # Example usage
    log_event("test", "system", "Logger initialized.")
    print(f"Test event written to {LOG_FILE}")