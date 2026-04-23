# Milestone: End-to-End Apply Loop (V1 Final Stretch)

**Date:** 2026-04-14
**Status:** Planning / Strategy

## Objective
Enable a complete "Sandbox -> Live Repo" code propagation loop. This is the "Holy Grail" of BrewAssist: the AI writes code in the safe sandbox, the user previews it, confirms it, and BrewAssist pushes it back to GitHub/GitLab/Bitbucket securely.

## Phase 1: Post-Onboarding "Checks & Balances"
- [ ] **Implementation:** Update `BrewCockpitCenter.tsx` or create a new agent logic to "verify" the init state.
- [ ] **Bugfix:** Persist `InitWizardModal` step progress across provider auth redirects so GitHub, GitLab, and Bitbucket authorization can resume at the expected next onboarding step instead of resetting the wizard.
- [ ] **UX:** Make provider authorization a first-class onboarding transition inside the five-step wizard so "grant repo access" completion advances into the next step rather than feeling like a restart.
- [ ] **Checks:**
    - [ ] `check-provider`: Verify valid token for selected provider.
    - [ ] `check-sandbox`: Verify directory exists in `sandbox/mirror`.
    - [ ] `check-permissions`: Dry-run a simple "git status" in the mirror to ensure it's a valid repo.
- [ ] **UI:** Show a small "Environment Ready" toast or system message once verified.

## Phase 2: The "Edit" Engine (Proposals)
- [ ] **Implementation:** Improve `pages/api/brewassist-sandbox-apply.ts` to support multi-provider paths.
- [ ] **Logic:** Ensure AI edits are written to the `sandbox/mirror/[provider]/[repo]` path instead of a flat sandbox root.
- [ ] **Stage Update:** Move workflow to `preview` automatically after a file edit is successful.

## Phase 3: The "Diff" Interface
- [ ] **Implementation:** Create a UI component to display the output of `lib/brewDiffEngine.ts`.
- [ ] **Features:** 
    - [ ] Side-by-side or Unified diff view.
    - [ ] List of affected files with "View Changes" toggle.
    - [ ] "Truth Score" display (from BrewTruth policy).

## Phase 4: The "Apply" (Push) Action
- [ ] **Implementation:** Create `/api/sandbox/apply-live`.
- [ ] **Backend Actions:**
    1.  `cd` into the sandbox mirror.
    2.  `git add .`
    3.  `git commit -m "BrewAssist: [AI Summary of changes]"`
    4.  `git push origin [current-branch]`
- [ ] **Security:** Ensure the OAuth token is injected into the push URL for authentication.

## Phase 5: Report & Replay
- [ ] **Implementation:** Record the successful push as a `run_event` in Supabase.
- [ ] **Report:** Show a final "Success" message with the commit hash and a link to the PR/Commit on the provider site.

## Follow-On UX Backlog: Conversation Surface
- [ ] Replace the center-pane opposing chat bubbles with a left-aligned conversational stream that can render block-oriented output for prose, status data, structured logs, diffs, and code.
- [ ] Preserve the existing BrewAssist color language while moving the message presentation closer to Brew Agentic / Codex / terminal-native assistant layouts.
- [ ] Keep user intent visible in the stream, but stop treating the center pane like a consumer chat app with mirrored left/right message lanes.
- [ ] Reuse `RichMarkdown` and existing workflow-stage metadata where possible so the redesign lands as a rendering upgrade instead of a parallel message system.

---
*Created by: Gemini (RB's Assistant)*
