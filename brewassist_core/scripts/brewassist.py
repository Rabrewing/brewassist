#!/usr/bin/env python3
import os, argparse, json, sys
from pathlib import Path
import yaml
import asyncio # Import asyncio

# Load .env (simple)
def load_env(env_path: Path):
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if not line or line.startswith("#") or "=" not in line: continue
            k,v = line.split("=",1); os.environ.setdefault(k.strip(), v.strip())

ROOT = Path(__file__).resolve().parents[1]
load_env(ROOT / ".env")
CFG = yaml.safe_load((ROOT / "config" / "brewassist.yaml").read_text(encoding="utf-8"))

async def main(): # Make main async
    ap = argparse.ArgumentParser(description="BrewAssist — local agentic cockpit")
    ap.add_argument("--mode", default="auto", help="auto|hrm|file")
    ap.add_argument("--chain", default="HRM>FILE", help="future use")
    ap.add_argument("--ops", default="", help='file ops JSON: {"writes":[...],"deletes":[...]}')
    ap.add_argument("prompt", nargs="*", help="prompt text")
    args = ap.parse_args()

    mode = args.mode.lower()
    prompt = " ".join(args.prompt).strip()

    root_dir = CFG["root_dir"]
    allow_paths = CFG.get("allow_paths", [])
    model_cfg = CFG.get("model", {})
    logs_cfg = CFG.get("logs", {})
    actions_log = logs_cfg.get("actions")

    allow_write = os.getenv("BREWASSIST_ALLOW_WRITE","true").lower() == "true"
    allow_delete = os.getenv("BREWASSIST_ALLOW_DELETE","false").lower() == "true"
    dry_run = os.getenv("BREWASSIST_DRY_RUN","false").lower() == "true"

    if mode == "hrm":
        from chains.hrm_chain import run
        out = await run(prompt) # Await the async run function
        print(json.dumps(out, ensure_ascii=False)); return

    if mode == "file":
        from chains.file_chain import apply_changes
        ops = json.loads(args.ops or "{}")
        out = apply_changes(root_dir, allow_paths, allow_write, allow_delete, dry_run, actions_log, ops)
        print(json.dumps(out, ensure_ascii=False)); return

    # auto → do hrm plan; you can pipe results into a file op next step
    from chains.hrm_chain import run
    out = await run(prompt) # Await the async run function
    print(json.dumps(out, ensure_ascii=False))

if __name__ == "__main__":
    sys.path.insert(0, str(ROOT))
    asyncio.run(main()) # Run the async main function