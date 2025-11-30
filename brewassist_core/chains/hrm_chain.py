from typing import Dict
from agents.planner import make_plan
from agents.codegen_runner import run_mistral_chat

async def run(prompt: str) -> Dict:
    p = await make_plan(prompt)
    narrative = run_mistral_chat(f"Give a reassuring, concise narrative for: {prompt}\nUse 2 short paragraphs.")
    return {"ok": True, "plan": p, "narrative": narrative}