"""
selector.py — Engine dispatcher
Now includes:
- Gemini
- Grok
- Mistral GGUF
- TinyLLaMA
- HRM
- File Tools
"""

from brewassist_core.agents.agent_tools import execute_tool

def dispatch(engine: str, prompt: str, chain):
    engine = engine.lower().strip()

    # File-tool invocation syntax
    if prompt.startswith("file:"):
        """
        Format examples:
        file:read path=brewdocs/README.md
        file:write path=foo.txt content='Hello'
        file:delete path=legacy/tmp.md
        """
        return _dispatch_file_tool(prompt)

    # Engine selection
    if engine == "gemini":
        return chain["gemini"](prompt)

    if engine == "grok":
        return chain["grok"](prompt)

    if engine == "mistral":
        return chain["mistral"](prompt)

    if engine == "tiny":
        return chain["tiny"](prompt)

    if engine == "hrm":
        return chain["hrm"](prompt)

    return "# Unknown engine"


def _dispatch_file_tool(prompt: str):
    """
    Parses instructions like:
    file:write path=foo.txt content='Hello world'
    """
    text = prompt.replace("file:", "").strip()
    parts = dict(kv.split("=", 1) for kv in text.split(" ") if "=" in kv)

    action = parts.pop("action", None) or text.split()[0]
    path = parts.get("path")
    content = parts.get("content", "")

    return execute_tool(action, path, content)
