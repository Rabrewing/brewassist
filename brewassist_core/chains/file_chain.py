from typing import Dict
from agents.file_agent import FileAgent

def apply_changes(root_dir: str, allow_paths, allow_write: bool, allow_delete: bool,
                  dry_run: bool, actions_log: str, ops: Dict) -> Dict:
    """
    ops = {
      "writes": [{"path":"brewdocs/PLAN.md","content":"..."}],
      "deletes":[{"path":"archive/tmp.txt"}]
    }
    """
    fa = FileAgent(root_dir, allow_paths, allow_write, allow_delete, dry_run, actions_log)
    results = {"writes": [], "deletes": []}
    for w in ops.get("writes", []):
      results["writes"].append(fa.write(w["path"], w.get("content","")))
    for d in ops.get("deletes", []):
      results["deletes"].append(fa.delete(d["path"]))
    return {"ok": True, "results": results}
