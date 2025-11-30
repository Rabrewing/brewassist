"""
── Agent Tools (AI-agnostic) ──
These are the actions any engine can request.
"""

from brewassist_core.agents.file_agent import FileAgent
import os

# Initialize FileAgent with appropriate settings
# These settings should ideally come from a central config or environment variables
# For now, using sensible defaults and project root
PROJECT_ROOT = os.getenv("PROJECT_ROOT", "/home/brewexec")
ALLOW_WRITE = os.getenv("BREWASSIST_ALLOW_WRITE", "true").lower() == "true"
ALLOW_DELETE = os.getenv("BREWASSIST_ALLOW_DELETE", "false").lower() == "true"
DRY_RUN = os.getenv("BREWASSIST_DRY_RUN", "false").lower() == "true"

# Instantiate the FileAgent
file_agent_instance = FileAgent(
    root_dir=PROJECT_ROOT,
    allow_write=ALLOW_WRITE,
    allow_delete=ALLOW_DELETE,
    dry_run=DRY_RUN
)

TOOLS = {
    "read_file": file_agent_instance.read_file,
    "write_file": file_agent_instance.write_file,
    "append_file": file_agent_instance.append_file,
    "delete_file": file_agent_instance.delete_file,
    "list_dir": file_agent_instance.list_dir,
    "search_code": file_agent_instance.search_code,
    "run_shell": file_agent_instance.run_shell,
}


def execute_tool(tool_name: str, *args, **kwargs):
    if tool_name not in TOOLS:
        raise ValueError(f"Unknown tool: {tool_name}")

    return TOOLS[tool_name](*args, **kwargs)