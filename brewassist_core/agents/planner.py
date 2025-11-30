# brewassist_core/agents/planner.py

import os
import json
from datetime import datetime

import httpx

LLM_TOOL_CALL_URL = "http://localhost:3000/api/llm-tool-call"  # adjust if different

def _update_brewlast(project: str, action: str, path: str, summary: str, details: dict):
  root = os.environ.get("BREW_PROJECT_ROOT") or os.getcwd()
  brewwlast_path = os.path.join(root, ".brewlast.json")

  payload = {
    "project": project,
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "action": action,
    "path": path,
    "summary": summary,
    "details": details,
  }

  with open(brewwlast_path, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)

async def make_plan(prompt: str):
  project = os.environ.get("BREW_PROJECT") or "unknown"
  root = os.environ.get("BREW_PROJECT_ROOT") or os.getcwd()

  # 1) Ask the LLM+tools endpoint to handle the prompt
  async with httpx.AsyncClient() as client:
    r = await client.post(
      LLM_TOOL_CALL_URL,
      json={"prompt": prompt},
      timeout=60.0,
    )
    r.raise_for_status()
    data = r.json()

  # If no tool was used, just return the text
  if "tool" not in data:
    return {
      "kind": "text_only",
      "message": data.get("result", ""),
    }

  tool_name = data["tool"]
  result = data["result"]

  # 2) Update .brewlast.json for work/preview panes
  path = result.get("path") or root
  summary = f"{tool_name} executed on {path}"

  _update_brewlast(
    project=project,
    action=tool_name,
    path=path,
    summary=summary,
    details=result,
  )

  return {
    "kind": "tool",
    "tool": tool_name,
    "result": result,
  }