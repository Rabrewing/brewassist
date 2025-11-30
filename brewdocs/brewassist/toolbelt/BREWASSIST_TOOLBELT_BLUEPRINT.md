# BREWASSIST TOOLBELT BLUEPRINT

## 1. North Star: How BrewAssist should behave

> Goal: I want BrewAssist to function like an intelligent DevOps co-pilot inside my terminal, not like DOS. I want to type natural language (with or without /task) and have BrewAssist:

1.  Understand my intent in plain English.
2.  Know which project and directory it’s in (e.g. brewexec at /home/brewexec).
3.  Choose the right tool(s) from its toolbelt.
4.  Call those tools with correct arguments (paths, content, commands).
5.  Update a state file so the Work Pane + Preview Pane can show what happened.

Examples of desired behavior:

“Create a file randy_world.ts at the root that logs ‘hello world’.
“Show me all usages of BrewJump.
“Fix the ESLint error in WorkspaceSidebarRight.tsx and re-run lint.

BrewAssist should not repeatedly ask “what path? or “what project? if it already knows it from context.

---

## 2. Tier 1 Toolbelt – Tools BrewAssist MUST have

These are the minimum tools BrewAssist needs to be real, not roleplay.
Each tool should be:

*   Implemented as a script or Python function
*   Registered in the BrewAssist tool registry (MCP/tools config / agent_tools.py)
*   Visible to the LLM (Gemini) as callable tools

### 2.1 write_file – create/update files (critical)

**Purpose:**
Let BrewAssist create and overwrite files inside the project root.

**Implementation (example shell script):**
Create: `/home/brewexec/overlays/write_file.sh`

```bash
#!/usr/bin/env bash
# BrewAssist Tool – safely write content to a file

set -euo pipefail

# Args:
#   $1 = absolute file path
#   stdin = file content

FILE_PATH="$1"
PROJECT_ROOT="${BREW_PROJECT_ROOT:-/home/brewexec}"

if [[ -z "$FILE_PATH" ]]; then
  echo "ERROR: FILE_PATH is required." >&2
  exit 1
fi

# SECURITY: only allow writes under PROJECT_ROOT
case "$FILE_PATH" in
  "$PROJECT_ROOT"/*) ;;
  *)
    echo "ERROR: Security violation: '$FILE_PATH' is outside '$PROJECT_ROOT'." >&2
    exit 1
    ;;
esac

# Read content from stdin
FILE_CONTENT="$(cat)"

# Ensure directory exists
mkdir -p "$(dirname "$FILE_PATH")"

# Write file
printf "%s" "$FILE_CONTENT" > "$FILE_PATH"

echo "OK: Wrote file '$FILE_PATH'"
```

Then:

`chmod +x /home/brewexec/overlays/write_file.sh`

**Tool registration (conceptual):**

In whatever file defines tools (e.g. `brewassist_core/agents/agent_tools.py`), define a `write_file` tool that:

*   Takes `{ "path": "string", "content": "string" }`
*   Calls `/home/brewexec/overlays/write_file.sh "$path"`
*   Pipes content via stdin
*   Returns stdout/stderr to the LLM

The LLM must see this in its tools schema as `write_file`.

---

### 2.2 read_file – inspect code

**Purpose:**
Allow BrewAssist to read file contents for debugging, edits, explanations.

**Behavior:**

*   Input: `{ "path": "string" }`
*   Ensures path is under `BREW_PROJECT_ROOT`
*   Returns the file content (up to some safe size)

**Implementation** can be similar to `write_file` but with `cat "$FILE_PATH"` and no writes.

---

### 2.3 list_dir – see directory structure

**Purpose:**
Let BrewAssist explore project folders (e.g. `components/`, `pages/api/`, `lib/`).

**Behavior:**

*   Input: `{ "path": "string" }` (or default to `BREW_PROJECT_ROOT`)
*   Output: list of files and directories in JSON or text form

---

### 2.4 search_code – grep/rg search

**Purpose:**
Enable “find all usages of X”, refactor mapping, etc.

**Behavior:**

*   Input: `{ "query": "string", "path": "string (optional)" }`
*   Uses `rg` or `grep -R` from `BREW_PROJECT_ROOT`
*   Returns file:line:snippet matches

---

### 2.5 run_shell – safe command execution

**Purpose:**
Allow BrewAssist to run basic dev commands: lint, tests, etc.

**Behavior:**

*   Input: `{ "command": "string" }`
*   Whitelist: `pnpm`, `npm`, `yarn`, `git status`, `supabase`, etc.
*   Deny destructive patterns: `rm -rf`, `:(){ :|:& };:`, etc.

---

## 3. Project Context – How BrewAssist knows where it is

Right now BrewAssist keeps asking: “What path? What file? What project?”
We want it to already know that when we launch it.

### 3.1 Environment variables

The BrewAssist CLI / overlay that starts the MCP should set:

```bash
# Example for brewexec
export BREW_PROJECT="brewexec"
export BREW_PROJECT_ROOT="/home/brewexec"
```

For BrewLotto, BrewSearch, etc., you’ll change these values.

### 3.2 Tool behavior

Each tool (`write_file`, `read_file`, etc.) should:

*   Treat relative paths as relative to `BREW_PROJECT_ROOT`
*   Strictly enforce that absolute paths are under `BREW_PROJECT_ROOT`

So if the LLM only says "randy_world.ts", the agent resolves it to:

`/home/brewexec/randy_world.ts`

before calling `write_file`.

---

## 4. Agent Brain – Natural Language → Tools

This is the piece that is missing and causing the “DOS feel.”

We need a function (call it `handle_task`) that:

1.  Receives the user’s natural language instruction.
2.  Has access to:
    *   `BREW_PROJECT`, `BREW_PROJECT_ROOT`
    *   The tool schema (including `write_file`, `read_file`, etc.)
3.  Asks the LLM (Gemini) to:
    *   Interpret the request
    *   Decide which tools to call in what order
    *   Generate arguments for those tools
4.  Executes the tool calls

5.  Logs results to a state file (see section 5)

### 4.1 Planner Behavior – Example for “create randy_world.ts”

User says:

> “Create a file name randy_world.ts that says hello world at the root directory.”

Planner (conceptual pseudocode):

```python
def handle_task(user_prompt: str, context: Context):
    # 1. Ask LLM to interpret the task and decide on a tool call
    plan = llm_with_tools(
        prompt=user_prompt,
        tools=["write_file", "read_file", "list_dir", "search_code", "run_shell"],
        context={
            "project": context.project,
            "project_root": context.project_root,
        }
    )

    # 2. LLM returns something like:
    # {
    #   "tool": "write_file",
    #   "args": {
    #       "path": "randy_world.ts",
    #       "content": "console.log(\"hello world\");"
    #   }
    # }

    if plan.tool == "write_file":
        path = plan.args["path"]
        # Resolve path relative to project root if it's not absolute
        if not path.startswith("/"):
            path = os.path.join(context.project_root, path)

        result = tools.write_file(path=path, content=plan.args["content"])

        # 3. Update state so work/preview pane can show it
        update_brewlast(
            project=context.project,
            action="write_file",
            path=path,
            summary=f"Created file {path} with hello world content",
            raw_output=result
        )

        return result
```

Key points:

*   The LLM chooses the tool and arguments.
*   The runtime code:
    *   Resolves paths using `BREW_PROJECT_ROOT`
    *   Calls the tool
    *   Updates `.brewlast.json` (see next section)

---

## 5. Work Pane / Preview Pane – State File

Your UI will only update when there’s a single source of truth describing the last thing BrewAssist did.

Let’s define a simple JSON file, e.g.:

`/home/brewexec/.brewlast.json`

### 5.1 Suggested schema

```json
{
  "project": "brewexec",
  "timestamp": "2025-11-22T03:45:12Z",
  "action": "write_file",
  "path": "/home/brewexec/randy_world.ts",
  "summary": "Created file randy_world.ts with hello world content",
  "details": {
    "tool": "write_file",
    "args": {
      "path": "/home/brewexec/randy_world.ts"
    },
    "output": "OK: Wrote file '/home/brewexec/randy_world.ts'"
  }
}
```

### 5.2 When to update .brewlast.json

Every time a Tier 1 tool is successfully called:

*   `write_file` → log last file written
*   `read_file` → log last file read
*   `search_code` → log last query
*   `run_shell` → log last command

Then the Work Pane + Preview Pane can:

*   Read `.brewlast.json` on refresh
*   Show:
    *   Project name
    *   Last action summary
    *   Last file path
    *   Code preview (if action is `write_file` or `read_file`)

---

## 6. End-to-End Test Scenarios

Gemini (inside BrewAssist) should use this as a checklist after implementation.

### Test 1 – Simple file creation

**Command / Prompt:**

> “Create a file randy_world.ts at the root of brewexec that logs ‘hello world’.”

**Expected behavior:**

1.  Planner chooses `write_file`.
2.  Path gets resolved to `/home/brewexec/randy_world.ts`.
3.  `write_file` is called with that path and content.
4.  `.brewlast.json` is updated with:
    *   `action: "write_file"`
    *   `path: "/home/brewexec/randy_world.ts"`
5.  In a separate terminal:
    `cat /home/brewexec/randy_world.ts`
    shows:
    `console.log("hello world");`

---


### Test 2 – Directory awareness

**Setup:**

*   Ensure `BREW_PROJECT=brewexec`
*   Ensure `BREW_PROJECT_ROOT=/home/brewexec`

**Prompt:**

> “Create testdir/hello.txt with the text BrewAssist is alive.”

**Expected:**

*   Final path: `/home/brewexec/testdir/hello.txt`
*   Directory `testdir` auto-created
*   File contains `BrewAssist is alive`

---


### Test 3 – Work Pane / Preview update

After Test 1 or 2:

*   `.brewlast.json` exists and includes:
    *   `project`
    *   `action`
    *   `path`
    *   `summary`

Work Pane/Preview Pane should read that and:

*   Show last action summary
*   Show code preview for the last file if it’s a file action

