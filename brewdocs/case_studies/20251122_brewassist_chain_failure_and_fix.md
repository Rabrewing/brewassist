# Case Study: BrewAssist Chain Failure and Recovery

**Date:** 2025-11-22

## 1. Problem Summary

The BrewAssist system experienced a critical failure across all integrated AI engines when attempting a simple file creation task. This highlighted a series of underlying issues in engine integration, tool handling, and fallback logic.

## 2. Error Analysis

The user initiated the following command:
`Create a file randy_world.ts at the root of brewexec that logs ‘hello world’`

This resulted in a cascade of failures:

### 2.1. Gemini Engine Failure

- **Error:** `Tool "write_file" not found in registry.` and `Tool "run_shell_command" not found in registry.`
- **Root Cause:** The Gemini CLI was invoked, which has its own separate tool registry. The tools defined for BrewAssist (like `write_file.sh`) are not registered within the Gemini CLI's native environment. The CLI's available tools were `read_file`, `web_fetch`, and `glob`, which did not match the request. This created a fatal mismatch between the planner's intent and the engine's capability.

```
Error: Command failed: /home/brewexec/.local/share/pnpm/gemini  "Create a file randy_world.ts at the root of brewexec that logs ‘hello world’"
Loaded cached credentials.
Error executing tool write_file: Tool "write_file" not found in registry. Tools must use the exact names that are registered. Did you mean one of: "read_file", "web_fetch", "glob"?
...
Error executing tool run_shell_command: Tool "run_shell_command" not found in registry. Tools must use the exact names that are registered. Did you mean one of: "search_file_content", "read_file", "web_fetch"?
...
```

### 2.2. OpenAI Engine Failure

- **Error:** `OpenAI HTTP 400: Bad Request - {"error": {"message": "Invalid type for 'messages': expected an array of objects, but got a string instead."}}`
- **Root Cause:** The `callOpenAI` function in `lib/openaiEngine.ts` was not correctly formatting the `prompt` into the required `messages` array structure. It was passing a raw string, which the OpenAI API rejects. Additionally, the engine was not configured to be aware of or use the BrewAssist Toolbelt.

```
at callOpenAI (lib/openaiEngine.ts:130:11)
...
"message": "Invalid type for 'messages': expected an array of objects, but got a string instead.",
"type": "invalid_request_error",
"param": "messages",
"code": "invalid_type"
```

### 2.3. Mistral Engine Failure

- **Error:** `Mistral HTTP 401: {"detail":"Unauthorized"}`
- **Root Cause:** The fallback to the Mistral engine failed because of an authentication issue. The required API key or endpoint configuration was missing or incorrect, leading to an immediate rejection. This indicates the fallback chain was not robustly configured.

```
at callMistral (lib/brewassistChain.ts:157:11)
...
```

## 3. Prescribed Solution: "Lock the Chain"

The user provided a detailed, multi-step plan to stabilize the system by creating a single, reliable execution path and disabling unstable components.

**Primary Goal:** Fix the OpenAI engine, make it tool-aware, and establish it as the primary engine. Configure the Gemini CLI as a "reasoning-only" fallback, and disable other broken fallbacks.

**Key Steps:**

1.  **Environment Lock:** Set `HRM_ENGINE=openai` in `.env.local` to force the chain to use the OpenAI engine.
2.  **Fix OpenAI Engine:** Correct the `callOpenAI` function in `lib/openaiEngine.ts` to properly format the `messages` array and accept `tools` and `tool_choice` parameters.
3.  **Define Toolbelt API:** Create a new API endpoint `pages/api/llm-tool-call.ts` that defines the entire BrewAssist Toolbelt (write_file, read_file, etc.) in the format OpenAI expects and routes tool calls to the corresponding shell scripts in the `/overlays` directory.
4.  **Update Planner:** Modify `brewassist_core/agents/planner.py` to send its prompts to the new `/api/llm-tool-call` endpoint and update the `.brewlast.json` file upon successful tool execution.
5.  **Stabilize the Chain:** Update `lib/brewassistChain.ts` to create a simple, robust chain:
    - **Primary:** Attempt to use the OpenAI engine (`callOpenAIEngine`).
    - **Fallback:** If OpenAI fails, fall back to a new `callGeminiFallbackCLI` function.
    - **Disable:** Temporarily remove all calls to Mistral and other experimental engines to prevent 401 errors.
6.  **Create Gemini Fallback:** Implement `lib/geminiFallback.ts`, which calls the Gemini CLI for reasoning *without* enabling its native tool usage, preventing the "tool not found" errors.

## 5. Iteration 2: Debugging the "Locked Chain"

After implementing the initial fixes, further testing revealed more subtle issues.

### 5.1. Test Execution & Logs

The user executed the `curl` command to test the `/api/brewassist` endpoint:

```bash
curl -X POST http://localhost:3000/api/brewassist \
-H 'Content-Type: application/json' \
-d '{"prompt":"Create a file randy_world.ts at the root of brewexec that logs hello world to the console"}'
```

The API returned a text-only response, indicating that the tool-calling part of the chain was still failing:
```json
{"kind":"text","text":"Sure! Here's how you can create a file named randy_world.ts..."}
```

The server logs revealed two distinct errors:

**Error 1: Missing `messages` parameter**

The `llm-tool-call` endpoint was still calling `callOpenAI` incorrectly, leading to an HTTP 400 error.

```
Error: OpenAI HTTP 400: Bad Request - { "error": { "message": "Missing required parameter: 'messages'.", "type": "invalid_request_error", "param": "messages", "code": "missing_required_parameter" } }
at callOpenAI (lib/openaiEngine.ts:75:11)
at async handler (pages/api/llm-tool-call.ts:120:22)
```

**Error 2: Relative Path Violation**

On a subsequent attempt, the `write_file.sh` script failed its security check because it received a relative path instead of an absolute one.

```
Error: Command failed: /home/brewexec/overlays/write_file.sh randy_world.ts
ERROR: Security violation: 'randy_world.ts' is outside '/home/brewexec'.
```

### 5.2. Root Cause Analysis

1.  **Incorrect `callOpenAI` Usage:** The `pages/api/llm-tool-call.ts` handler was passing a raw prompt string to `callOpenAI`, but the underlying function required a structured `messages` array.
2.  **Relative Path in Tool Call:** The LLM, when generating the tool call, provided a relative path (`randy_world.ts`). The `runScript` function in `llm-tool-call.ts` did not resolve this to an absolute path before passing it to the `write_file.sh` script, causing the security check to fail.
3.  **Environment Variable Scope:** The `BREW_PROJECT_ROOT` environment variable, set by `brewjump.sh` in the shell, was not available to the Next.js server process. This was fixed by adding it to `.env.local`.

### 5.3. Prescribed Solution 2.0

The user provided a single, comprehensive replacement for `pages/api/llm-tool-call.ts` to fix both outstanding issues simultaneously.

1.  **Correct `callOpenAI` Usage:** The new `llm-tool-call.ts` correctly passes the prompt string to `callOpenAI`, which is now responsible for wrapping it in the `messages` array.
2.  **Absolute Path Resolution:** The `runScript` helper within `llm-tool-call.ts` was updated to detect when `write_file.sh` is being called. If the path argument is relative, it prepends the `projectRoot` to create a secure, absolute path.

This final change is expected to make the BrewAssist Toolbelt fully operational.

## 6. Iteration 3: Forcing Tool Usage and Finalizing Router

Even after the previous fixes, testing showed that the model was still not reliably calling tools, and a legacy API route was still causing errors.

### 6.1. Test Execution & Logs

The `curl` test still resulted in a text-only response, indicating OpenAI was choosing to respond with instructions rather than using the `write_file` tool.

A "Missing required parameter: 'messages'" error was still being thrown, but this time it was traced back to the `/api/router` endpoint, which was calling the chain in a way that bypassed the new `llm-tool-call` logic.

```
OpenAI engine failed, falling back to Gemini CLI: Error: OpenAI HTTP 400: Bad Request - { "error": { "message": "Missing required parameter: 'messages'.", "type": "invalid_request_error", "param": "messages", "code": "missing_required_parameter" } }
at callOpenAI (lib/openaiEngine.ts:75:11)
at async callOpenAIEngine (lib/openaiEngineWrapper.ts:19:22)
at async runBrewAssistChain (lib/brewassistChain.ts:66:26)
at async handler (pages/api/router.ts:35:39)
...
POST /api/router 200 in 31.3s
```

### 6.2. Root Cause Analysis

1.  **Insufficient Tool-Use Prompting:** The prompt sent to `llm-tool-call` was just a user string. The model was not being explicitly instructed to use a tool, so it defaulted to a conversational response.
2.  **Legacy API Route:** The `/api/router` endpoint was still configured to call `runBrewAssistChain` directly, which in turn called the OpenAI engine without the tool-forcing context, leading to the persistent `messages` error.

### 6.3. Prescribed Solution 3.0

1.  **Force Tool Usage:** The `callOpenAI` invocation inside `pages/api/llm-tool-call.ts` was updated to include a strong system message, instructing the model that it *must* use a tool when file operations are requested.
2.  **Simplify Router:** The `/pages/api/router.ts` file was replaced with a simplified version that correctly delegates to `runBrewAssistChain`, ensuring a consistent execution path and eliminating the final source of the `messages` error.

## 7. Prescribed Solution 4.0: The Final Stabilization Plan

After multiple iterations, a final, comprehensive plan was developed to achieve a stable, tool-enabled baseline for BrewAssist. This plan consolidates all previous learnings.

**Core Principle:** Lock the architecture to a single, testable path: OpenAI for tool use, and Gemini CLI for reasoning-only fallback. All other engines (Mistral) are disabled.

**Key Steps:**

1.  **Environment (`.env.local`):** Standardize the `BREW_PROJECT_ROOT` variable to `/home/brewexec` to ensure the Next.js server and shell scripts share the same context.
2.  **OpenAI Engine (`lib/openaiEngine.ts`):** Replace the core engine file to guarantee the `messages:[]` array is always correctly constructed for all API calls, eliminating the last of the `400 Bad Request` errors.
3.  **BrewAssist Chain (`lib/brewassistChain.ts`):** Simplify and enforce the primary execution chain: attempt to use OpenAI first, and only fall back to the reasoning-only Gemini CLI if the primary call fails.
4.  **Toolbelt (`/api/llm-tool-call.ts` & `overlays/write_file.sh`):**
    - In `llm-tool-call.ts`, ensure the `BREW_PROJECT_ROOT` is correctly read.
    - In `write_file.sh`, add logic to resolve relative paths to absolute paths within the project root, fixing the final "Security violation" error.

This plan represents the definitive strategy to bring the core file modification feature of BrewAssist online.

## 8. Iteration 4: The Double-Wrapped Prompt

Despite implementing the comprehensive 5-step plan, the smoke test revealed a persistent issue with the prompt being incorrectly processed.

### 8.1. Test Execution & Logs

The `curl` command to `/api/brewassist` yielded the following:

```
{"output":"It looks like you sent \"[object Object]\". Could you please provide more details or clarify your request? I'm here to help with any architecture or DevOps-related questions.","engine":"chatgpt","emoji":"🟦"}
```

Followed by an incomplete JSON response:

```
{"kind":"text"}
```

And the file was not created:

```
ls: cannot access '/home/brewexec/randy_world.ts': No such file or directory
sed: can't read /home/brewexec/randy_world.ts: No such file or directory
```

### 8.2. Root Cause Analysis

The `brewassistChain` was receiving a double-wrapped prompt object, specifically `{ prompt: { prompt: "..." } }`, instead of the expected `{ prompt: "..." }`. This caused the `prompt.trim()` operation within the chain to result in `"[object Object]"`, leading to an empty or malformed prompt being passed to subsequent functions.

This error was traced back to `pages/api/brewassist.ts`, where the `prompt` was being extracted incorrectly from the request body. The line `const prompt = req.body` was assigning the entire request body (which was already an object containing a `prompt` field) to the `prompt` variable, instead of extracting `req.body.prompt`.

This fundamental input error prevented the toolbelt from ever receiving the correct prompt, leading to the `write_file` tool not being called and the file not being created.

### 8.3. Prescribed Solution 4.1

The solution is to correct the prompt extraction in `pages/api/brewassist.ts` to ensure that `runBrewAssistChain` receives the plain string prompt as intended.

## 9. Iteration 5: Reset to Clean V1 Baseline

Following a detailed analysis by ChatG, the decision was made to perform a full reset of the BrewAssist integration to a clean, minimal, and working version 1. This approach prioritizes stability and a clear execution path over immediate feature completeness.

**Core Principle:**
- **Only OpenAI is allowed to touch tools / overlays.**
- **Gemini = reasoning-only fallback.**
- **Mistral = OFF** (no API until local server is set up later).

The goal is to establish a rock-solid base where:
> Chat → `/api/brewassist` → OpenAI → `/api/llm-tool-call` → overlays (`write_file.sh`, `read_file.sh`, etc.) → `.brewlast` + filesystem.

**Key Steps (File Replacements):**

1.  **`.env.local`:** Ensure the active `.env.local` has the minimal core variables set for `BREW_ACTIVE_PROJECT`, `BREWPULSE_TIER`, `BREW_MODEL_PRIMARY`, `OPENAI_API_KEY`, and `OPENAI_MODEL`.
2.  **`lib/openaiEngine.ts`:** Replace with a single, solid OpenAI wrapper that correctly handles string prompts and constructs the `messages` array internally.
3.  **`lib/brewassistChain.ts`:** Replace with an **OpenAI-only** chain that directly calls `callOpenAI` and provides a simple human-friendly error fallback (no other engines yet).
4.  **`pages/api/brewassist.ts`:** Replace with a simple API handler that correctly extracts the `prompt` from `req.body` and calls `runBrewAssistChain`.
5.  **`components/BrewCockpitCenter.tsx`:** Replace with a version that matches the `CommandBar` props and talks only to `/api/brewassist`.
6.  **`components/CommandBar.tsx`:** Replace with a version that supports the new thinking/cancel/edit behavior and routes all commands through `/api/brewassist`.

This reset is intended to eliminate all current integration issues and provide a stable foundation for future development.
