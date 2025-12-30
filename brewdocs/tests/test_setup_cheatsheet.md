# BrewAssist Testing Cheat Sheet: Component & DOM Tests

This document outlines the necessary setup and best practices for creating Jest tests for React components (`.tsx` files) in this project. Following these steps will prevent regressions and ensure new tests run correctly.

## 1. The Problem: Why Component Tests Were Failing

Initially, tests for React components (`.tsx` files) were failing for several reasons related to the Jest environment configuration:

1.  **`testMatch` Pattern:** The `jest.config.cjs` was only configured to find `.test.ts` files, completely ignoring `.test.tsx` files.
2.  **`testEnvironment`:** The environment was set to `node`, which lacks a DOM (i.e., no `document` object). React Testing Library requires a DOM environment to render components.
3.  **Missing `jsdom` Environment:** Newer versions of Jest do not bundle `jest-environment-jsdom` by default. It must be installed explicitly.
4.  **Missing DOM Matchers:** Assertions like `.toBeInTheDocument()` and `.toBeDisabled()` are not built into Jest. They are provided by `@testing-library/jest-dom` and were not configured.
5.  **Module Syntax Error:** The Jest setup file was using ES Module `import` syntax in a CommonJS (`.cjs`) file, causing a syntax error.

## 2. The Solution: Configuration Fixes

The following changes were made to create a stable testing environment for React components:

### Step 1: Update `jest.config.cjs` for `.tsx` Files

The `testMatch` pattern was updated to include both `.ts` and `.tsx` files.

```javascript
// jest.config.cjs
module.exports = {
  // ...
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"], // <-- Updated
  // ...
};
```

### Step 2: Set Test Environment to `jsdom`

The `testEnvironment` was changed from `node` to `jsdom`.

```javascript
// jest.config.cjs
module.exports = {
  // ...
  testEnvironment: 'jsdom', // <-- Updated
  // ...
};
```

### Step 3: Install `jest-environment-jsdom`

This package was added as a dev dependency:

```bash
pnpm add -D jest-environment-jsdom
```

### Step 4: Add DOM Matchers

We installed `@testing-library/jest-dom` to provide useful DOM-related assertions.

```bash
pnpm add -D @testing-library/jest-dom
```

### Step 5: Create and Configure Jest Setup File

A `jest.setup.cjs` file was created in the root directory to import the DOM matchers before any tests run.

```javascript
// jest.setup.cjs
require('@testing-library/jest-dom');
```

This file was then wired into the Jest config:

```javascript
// jest.config.cjs
module.exports = {
  // ...
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'], // <-- Added
  // ...
};
```

## 3. Best Practices for New Component Tests

To prevent future regressions and ensure consistency, follow these guidelines when writing new tests for React components.

### A. Use Specific Queries to Avoid Ambiguity

When an element might appear multiple times (like a badge or icon), global queries like `screen.getByText('...')` can fail.

**Instead, scope your query to a specific parent element using `within`.**

```javascript
import { render, screen, within } from '@testing-library/react';

// ...

// GOOD: Find the button first, then find the badge *inside* it.
const uploadImageItem = screen.getByRole('button', { name: /upload image/i });
const sandboxBadge = within(uploadImageItem).getByText(/sandbox/i);
expect(sandboxBadge).toBeInTheDocument();

// BAD: This might find other 'sandbox' badges on the page.
const sandboxBadge = screen.getByText(/sandbox/i);
```

### B. Ensure Mocks Receive Expected Data

When mocking a function, ensure the mock's logic accounts for the actual arguments being passed by the component. Our tests failed because the mock expected a `label` property that wasn't being passed to `evaluateHandshake`.

**The Fix:** The component was updated to pass the `label` to the function, making the mock's logic valid.

```javascript
// In the component:
policy={evaluateHandshake({
  // ...
  label: "Upload File", // <-- Ensure this is passed
})}

// In the test mock:
mockEvaluateHandshake.mockImplementation((args) => {
  // Now `args.label` is available and can be used
  if (args.capabilityId === 'fs_write' && args.label.includes('Upload File')) {
    // ... return specific policy
  }
});
```

By following this cheat sheet, we can maintain a stable and reliable test suite for our components.
