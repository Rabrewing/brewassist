# AGENTS.md - BrewAssist

- Treat `/home/brewexec/brewassist` as the repo root.
- Main UI entrypoint is `pages/index.tsx`; the primary assistant stream route is `pages/api/brewassist.ts`.
- Shared app logic lives in `lib/`; client state providers live in `contexts/`; tests live in `__tests__/`.
- TypeScript is strict, uses ES2020, `moduleResolution: bundler`, and only the `@/*` path alias from `tsconfig.json`.
- `pnpm dev` starts `next dev -p 3000` and forces `BREWTRUTH_ENABLED=true` in the script. `pnpm start` serves on port 3000.
- `next.config.cjs` uses `output: 'standalone'` and sets Turbopack root to this repo.

## Commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:chain`
- `pnpm build`
- `pnpm test -- --testPathPattern="file.test.ts"`
- `pnpm test -- --testNamePattern="specific test name"`
- `pnpm s4:lock-check`
- `pnpm s4:gate`
- `pnpm s4:manifest:verify`
- `pnpm s4:manifest:update`
- `pnpm s5:brewdocs:verify`
- `pnpm s5:support:verify`
- `pnpm audit:capabilities`

## Gotchas

- `pnpm lint` only covers `pages/`, `components/`, and `lib/`; it does not lint `contexts/`, `scripts/`, or `pages/api/`.
- `pnpm typecheck` follows `tsconfig.json`; it does not include `__tests__/`.
- `pnpm test:chain` is the key regression suite for mode splitting, tool gating, and router integrity.
- `pages/api/brewassist.ts` enforces policy and streams SSE responses; keep its response shape stable when changing assistant flow.
- `CockpitModeContext` persists `cockpitMode` in browser `localStorage`; keep that code client-only.
- Update `brewdocs/` when changing architecture or S4/S5 gate behavior.

## Current Session Rules

- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md` is the canonical online+local workflow contract.
- BrewAssist online must stay aligned to `Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay`; do not invent a second flow.
- `components/WorkspaceSidebarRight.tsx` is the real right-rail host for `Ops`/DevOps8, `Files`, `Sandbox`, and `Cognition`; do not reintroduce placeholder tabs.
- `repoProvider` and `repoRoot` are part of the request context and must be forwarded through `/api/brewassist`, `/api/fs-tree`, and `/api/fs-read`.
- Unsupported cross-repo access must fail closed until multi-repo routing is implemented.
- The sandbox mirror is the writable surface; live repo writes are not the default path.
- BrewAssist is not v1 until repo connect, sandbox bind, diff preview, confirm, report, and replay are all present in the online workflow.
