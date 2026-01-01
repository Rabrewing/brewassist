# AGENTS.md - BrewAssist Development Guidelines

This document serves as the authoritative guide for agentic coding assistants working on the BrewAssist codebase. It contains essential information about build commands, testing, code style, and project conventions.

## Build, Lint, and Test Commands

### Development Server

```bash
pnpm dev          # Start dev server on port 3000 with BREWTRUTH_ENABLED=true
pnpm start        # Start production server on port 3000
pnpm build        # Build for production
```

### Testing

```bash
pnpm test                    # Run all tests
pnpm test:chain             # Run Chain Gates regression suite (8 critical tests)
pnpm test -- --testNamePattern="specific test name"  # Run single test by name
pnpm test -- --testPathPattern="file.test.ts"        # Run tests in specific file
```

### Code Quality

```bash
pnpm lint          # Run ESLint on pages/, components/, lib/ (ext: .ts,.tsx,.js,.jsx)
pnpm format        # Run Prettier formatting on entire codebase
```

**Always run `pnpm lint` and `pnpm test:chain` after making changes to ensure code quality and prevent regressions.**

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode**: Enabled - all type checking is enforced
- **Target**: ES2020
- **JSX**: React JSX (not preserve)
- **Module resolution**: bundler
- **Path aliases**:
  - `@/*` → `./*` (root directory)
  - `@lib/*` → `./lib/*`

### Import Organization

```typescript
// 1. React imports
import React from 'react';

// 2. External library imports (alphabetical)
import { useState, useEffect } from 'react';

// 3. Internal absolute imports with @ alias
import { BrewTier } from '@/lib/commands/types';
import type { CockpitMode } from '@/lib/brewTypes';

// 4. Relative imports (only when necessary)
import { helper } from './helpers';
```

### Component Patterns

```typescript
// Functional components with TypeScript
interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: ComponentProps) {
  return (
    <div onClick={onClick}>
      {title}
    </div>
  );
}
```

### Error Handling

```typescript
// Async operations with proper error handling
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error(`Failed to perform operation: ${error.message}`);
}
```

### Naming Conventions

- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- **Types/Interfaces**: `PascalCase` (e.g., `BrewAssistEngineOptions`)
- **Variables/Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Enums**: `PascalCase`

### Testing Patterns

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle success case', async () => {
    // Arrange
    const mockData = {
      /* ... */
    };

    // Act
    const result = await operation(mockData);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### API Route Patterns

```typescript
// pages/api/endpoint.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Implementation
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### State Management

- Use React Context for global state (e.g., `CockpitModeContext`)
- Prefer local state with `useState` for component-specific state
- Use custom hooks for reusable stateful logic

### File Structure Conventions

```
lib/                    # Utility functions and business logic
  ├── commands/         # Command definitions and types
  ├── capabilities/     # Feature flags and permissions
  ├── brewassist-engine.ts  # Core AI engine
  └── types.ts          # Shared type definitions

components/             # React components
  ├── ui/              # Reusable UI components
  ├── mcp/             # MCP tool components
  └── contexts/        # React context providers

pages/                  # Next.js pages and API routes
  ├── api/             # API endpoints
  └── index.tsx        # Main page

__tests__/             # Test files
  ├── helpers/         # Test utilities
  └── *.test.ts       # Test suites
```

### Security Best Practices

- Never log or commit API keys, secrets, or sensitive data
- Validate all user inputs on both client and server
- Use environment variables for configuration
- Implement proper error handling without exposing internal details

### Performance Considerations

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect/useCallback
- Avoid unnecessary re-renders
- Use lazy loading for heavy components

### Git Workflow

- Use descriptive commit messages following conventional commits
- Run `pnpm lint` and `pnpm test:chain` before committing
- Use feature branches for new work
- Keep commits atomic and focused

### Documentation

- Update relevant docs in `brewdocs/` when making architectural changes
- Add JSDoc comments for complex functions
- Keep this AGENTS.md updated as conventions evolve

### Agent Behavior Guidelines (from .gemini/GEMINI.md)

- Treat each repository as a completely separate universe
- Always treat the current working directory as the project root
- Use `brewdocs/` as the local project knowledge base, scoped to this project
- Respect project-specific BrewDocs structure
- Avoid causing ENOENT errors by verifying file existence before imports
- Communicate changes clearly before editing multiple files
- Prefer creating new Markdown files instead of overwriting existing ones

---

## Critical Reminders for Agents

1. **Always run `pnpm lint` and `pnpm test:chain` after code changes**
2. **Maintain strict TypeScript typing throughout**
3. **Follow existing patterns and conventions**
4. **Test API changes with curl requests to verify contracts**
5. **Update documentation when making breaking changes**
6. **Use the Chain Gates tests to validate core functionality**

## Current Project Context (S4.10)

BrewAssist is currently in S4.10 phase implementing Admin/Customer mode separation. Key areas:

- Mode-based UI gating (sandbox, MCP tools, etc.)
- Toolbelt tier enforcement
- Intent gatekeeper system
- BrewTruth integration
- Multi-provider AI routing (OpenAI, Gemini, Mistral, NIMs)

Refer to `brewdocs/project/S4.10_MASTER_SPEC.md` for current phase details.</content>
<parameter name="filePath">/home/brewexec/brewassist/AGENTS.md
