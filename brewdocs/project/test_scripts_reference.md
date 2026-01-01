# BrewAssist Test Scripts Reference

This document catalogs all available `pnpm` scripts for testing, development, and quality assurance in the BrewAssist project.

## Script Categories

### 1. Development Scripts

Scripts for running the application in development or production.

- **`pnpm dev`**  
  Starts the development server on port 3000 with BREWTRUTH*ENABLED=true.  
  \_Use for local development.*

- **`pnpm build`**  
  Builds the application for production.  
  _Run before deploying._

- **`pnpm start`**  
  Starts the production server on port 3000.  
  _Use after building for production._

### 2. Testing Scripts

Scripts for running various test suites.

- **`pnpm test`**  
  Runs all unit and integration tests using Jest.  
  _Comprehensive test run._

- **`pnpm test:chain`**  
  Runs the critical BrewAssist Chain Gates regression suite (8 tests).  
  _Must pass before commits._

- **`pnpm test:ui`**  
  Runs UI-specific tests (components, rendering, interactions).  
  _Tests React components and DOM interactions._

- **`pnpm typecheck`**  
  Runs TypeScript type checking on production code (excludes test files).  
  _Ensures type safety._

### 3. Quality Assurance Scripts

Scripts for code quality, linting, and formatting.

- **`pnpm lint`**  
  Runs ESLint on pages, components, lib, and contexts.  
  _Checks code style and potential issues._

- **`pnpm format`**  
  Runs Prettier formatting on the entire codebase.  
  _Auto-formats code._

- **`pnpm lint:staged`**  
  Runs linting on staged files (used in git hooks).  
  _Pre-commit quality check._

### 4. Special/Utility Scripts

Advanced or project-specific scripts.

- **`pnpm s4:lock-check`**  
  Runs full S4 Lock integrity verification: lint + typecheck + test + test:ui + audit:capabilities + build.  
  _Must pass for S4 Lock compliance._

- **`pnpm audit:capabilities`**  
  Audits capability IDs usage against the registry.  
  _Ensures no missing or undefined capabilities._

- **`pnpm sandbox:mirror`**  
  Runs the sandbox build mirror script.  
  _Sets up sandbox environment._

- **`pnpm smoke:sandbox`**  
  Runs a smoke test on the sandbox API.  
  _Quick sanity check for sandbox._

## Usage Examples

```bash
# Start development
pnpm dev

# Run all tests
pnpm test

# Check code quality
pnpm lint

# Full lock check
pnpm s4:lock-check
```

## API Testing Endpoints

BrewAssist provides API endpoints for manual testing of various components:

- **`GET /api/test`**  
  Basic API health check.  
  _Returns: "BrewAssist API is healthy"_

- **`POST /api/test-gemini`**  
  Tests Gemini AI integration.  
  _Payload: { "prompt": "test message" }_

- **`POST /api/test-nim`**  
  Tests NIM (NVIDIA Inference Microservices) integration.  
  _Payload: { "prompt": "test message" }_

### Manual Testing Commands

```bash
# Test sandbox API
curl -X POST http://localhost:3000/api/sandbox \
  -H "Content-Type: application/json" \
  -d '{"engine":"tiny","prompt":"smoke"}'

# Test BrewAssist chain
curl -X POST http://localhost:3000/api/brewassist \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Health check
curl http://localhost:3000/api/brewassist-health
```

## Jest API Tests

Specific Jest tests for API endpoints (located in `__tests__/api/`):

- **`pnpm test -- --testPathPattern="brewassist.test.ts"`**  
  Tests main BrewAssist API functionality.  
  _Covers chat, commands, persona switching._

- **`pnpm test -- --testPathPattern="brewtruth.test.ts"`**  
  Tests BrewTruth validation and safety checks.  
  _Verifies truth scoring and policy enforcement._

- **`pnpm test -- --testPathPattern="sandbox.test.ts"`**  
  Tests sandbox environment operations.  
  _Checks file operations, command execution._

- **`pnpm test -- --testPathPattern="brewassist.chain.test.ts"`**  
  Tests AI chain processing and fallbacks.  
  _Verifies OpenAI, Gemini, NIM routing._

- **`pnpm test -- --testPathPattern="intent.greeting.allow.test.ts"`**  
  Tests intent gatekeeper for greetings.  
  _Ensures proper filtering._

### Running API Tests

```bash
# Run all API tests
pnpm test __tests__/api/

# Run specific API test
pnpm test -- --testPathPattern="brewassist.test.ts"

# Run with verbose output
pnpm test -- --testPathPattern="brewassist.test.ts" --verbose
```

## Notes

- All scripts are defined in `package.json`.
- Test scripts use Jest with jsdom for UI tests.
- S4 Lock scripts ensure no regressions in core functionality.
- Run `pnpm test:chain` before any commit to prevent breaking changes.
- API endpoints require the dev server running (`pnpm dev`).

## Contact

BrewMaster RB - Project Lead
