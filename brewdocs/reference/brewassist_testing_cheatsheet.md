# BrewAssist Testing Cheatsheet

This document serves as a cheatsheet for successful testing patterns and solutions encountered during BrewAssist development.

---

## 1. Mocking Modules with `jest.doMock`

**Problem:** When a module (`ModuleA`) imports another module (`ModuleB`), and `ModuleB` needs to be mocked for tests of `ModuleA`, a simple `jest.mock('ModuleB', ...)` at the top of the test file might not work if `ModuleA` is imported *before* the mock is fully applied. This often results in `ModuleA` receiving the unmocked version of `ModuleB`.

**Solution:** Use `jest.doMock` and `require` the module under test *after* the mock is set up.

**Pattern:**

```typescript
// In your test file (e.g., my.test.ts)

// 1. Use jest.doMock for the module you want to mock.
//    This ensures the mock is registered before any subsequent 'require' calls.
jest.doMock('../path/to/ModuleB', () => ({
  ...jest.requireActual('../path/to/ModuleB'), // Optionally, keep actual implementations for unmocked parts
  // Mock specific functions or values from ModuleB
  myFunction: jest.fn(() => {
    console.log('Mocked myFunction called!');
    return 'mocked result';
  }),
  myValue: 'mocked value',
}));

// 2. Import the module under test (ModuleA) using 'require' *after* jest.doMock.
//    This ensures ModuleA gets the mocked version of ModuleB.
//    Note: If ModuleA itself has top-level imports that pull in ModuleB,
//    you might need to move the import of ModuleA inside the describe block
//    or use a factory function for jest.doMock.
const { myFunctionFromModuleA } = require('../path/to/ModuleA');

describe('My ModuleA Tests', () => {
  // If ModuleB's mocked functions need to be reset or reconfigured per test,
  // you can access them via the 'require'd mock.
  const { myFunction } = require('../path/to/ModuleB'); // Access the mocked function

  beforeEach(() => {
    // Reset mocks if needed for isolated tests
    (myFunction as jest.Mock).mockClear();
    // (myFunction as jest.Mock).mockReturnValue('new mocked result'); // Reconfigure if necessary
  });

  it('should use the mocked ModuleB function', () => {
    myFunctionFromModuleA();
    expect(myFunction).toHaveBeenCalled();
  });
});
```

**Key Learnings from S4.10c.4-POLICY-PERSONA-ORDER-FIX:**
- When `jest.doMock` is used, direct `import` statements at the top of the test file for the *mocked* module (e.g., `import { getActivePersona } from '...'`) will *not* get the mocked version. Instead, access the mocked functions via `require` *after* `jest.doMock`.
- Ensure that the module under test (e.g., `evaluateHandshake` in `lib/toolbelt/handshake.ts`) is imported using `require` *after* `jest.doMock` has been set up, especially if the module under test has dependencies that are being mocked.

---

## 2. Debugging Missing Arguments in Function Calls

**Problem:** A function (`myFunction`) is called with an argument (`myArg`), but inside `myFunction`, `myArg` appears as `undefined` or missing, despite being explicitly passed in the call site.

**Solution:** Trace the argument's presence at each step.

**Pattern:**

```typescript
// In the test file, immediately before calling the function:
const argsToPass = { /* ... all arguments ... */ myArg: 'expectedValue' };
console.log('Args being passed to myFunction:', argsToPass);
myFunction(argsToPass);

// Inside the function (myFunction), immediately upon entry:
function myFunction(args: { myArg: string, /* ... other args ... */ }) {
  console.log('Raw args object received by myFunction:', args);
  const { myArg, /* ... other destructured args ... */ } = args;
  console.log('Destructured myArg inside myFunction:', myArg);
  // ... rest of function logic ...
}
```

**Key Learnings from S4.10c.4-POLICY-PERSONA-ORDER-FIX:**
- A `console.log` of the *entire arguments object* (`args`) immediately upon function entry is more reliable than logging individual destructured properties, as it reveals if the property was missing from the `args` object itself.
- Logging the arguments *at the call site* (in the test) and *at the function entry* (in the implementation) helps pinpoint where the argument is being lost. In the S4.10c.4 fix, `capabilityId` was present at the call site but missing in the `args` object received by `evaluateHandshake`, which was a very unusual and difficult-to-diagnose issue. The `Raw args object` log was critical.

---

## 3. Fixing `Persona 'undefined'` and Policy Order

**Problem:** Policy evaluation returns "Persona 'undefined'" or incorrect policy reasons (e.g., "Tier too low" before "Persona not allowed").

**Solution:**
1.  Ensure the `Persona` object is correctly passed to the policy evaluation function.
2.  Verify the policy evaluation logic's order of checks.

**Key Learnings from S4.10c.4-POLICY-PERSONA-ORDER-FIX:**
- The `evaluateHandshake` function expects a `Persona` object, not just a `PersonaId` string. Tests must pass a full `Persona` object (or a mock of it).
- The policy evaluation order in `lib/toolbelt/handshake.ts` (Persona check -> Tier check -> other checks) was confirmed to be correct. The issue was that the capability-specific checks were not being reached due to `capabilityId` being `undefined` (as debugged in point 2). Once `capabilityId` was correctly passed, the existing policy order worked as expected.

---

## 4. Centralized Persona Resolution (`S4.10c.4-PERSONA-RESOLUTION-FIX-002`)

**Problem:** Persona was `undefined` in policy evaluation across multiple test suites, leading to incorrect policy decisions and failing tests. This was due to `evaluateHandshake` expecting a full `Persona` object, while some call sites (especially in API handlers and older tests) were providing only a `PersonaId` string or relying on a global `getActivePersona()` that wasn't always mocked correctly.

**Solution:** Implement a centralized `resolvePersona(ctx)` helper function that consistently determines the active `Persona` object based on a defined priority, and integrate it into the `evaluateHandshake` function.

**Pattern:**

```typescript
// In lib/toolbelt/handshake.ts (or a shared policy helper)

/**
 * Resolves the active Persona based on provided context.
 * Priority: ctx.persona (full object) > ctx.cockpitMode > default 'customer'.
 * @param ctx The context object containing potential persona information.
 * @returns A full Persona object.
 */
function resolvePersona(ctx: {
  persona?: Persona; // From direct argument
  cockpitMode?: CockpitMode; // From cockpitMode
  // Potentially add headers if needed for direct policy calls outside API handler
}): Persona {
  // a) ctx.persona (if provided)
  if (ctx.persona && ctx.persona.id) {
    return ctx.persona;
  }

  let resolvedPersonaId: PersonaId = 'customer'; // e) default persona = 'customer' (safe default)

  // b) ctx.cockpitMode when mode is 'admin'|'customer'
  //    (This covers ctx.headers['x-brewassist-mode'] as it's usually mapped to cockpitMode)
  if (ctx.cockpitMode === 'admin') {
    resolvedPersonaId = 'admin';
  } else if (ctx.cockpitMode === 'customer') {
    resolvedPersonaId = 'customer';
  }

  // Construct a full Persona object with placeholder values for other properties
  // as evaluateHandshake primarily uses persona.id.
  return {
    id: resolvedPersonaId,
    label: `Resolved Persona: ${resolvedPersonaId}`,
    tone: 'Neutral',
    emotionTier: resolvedPersonaId === 'admin' ? 3 : 1,
    safetyMode: resolvedPersonaId === 'admin' ? 'full-override' : 'soft-stop',
    memoryWindow: resolvedPersonaId === 'admin' ? 3 : 1,
    systemPrompt: `Persona derived from context: ${resolvedPersonaId}`,
  };
}

// In evaluateHandshake function:
export function evaluateHandshake(args: {
  // ... other args ...
  persona?: Persona; // Make persona optional in args, as it will be resolved
  cockpitMode?: "admin" | "customer";
  // ...
}): UnifiedPolicyEnvelope {
  const resolvedPersona = resolvePersona(args); // Resolve persona first

  // ... use resolvedPersona.id for all persona checks ...
}
```

**Key Learnings from S4.10c.4-PERSONA-RESOLUTION-FIX-002:**
- The `evaluateHandshake` function's `persona` argument was made optional, and the `resolvePersona` helper was introduced to centralize persona determination.
- This helper ensures that a valid `Persona` object is always available for policy checks, preventing `Persona 'undefined'` errors.
- Tests that previously passed string literals for `persona` were updated to pass full `Persona` objects (or mock `Persona` objects), aligning them with the `evaluateHandshake` function's expectations after the `resolvePersona` integration.
- The policy order (Persona check before Tier check) was confirmed to be correct once the persona was reliably resolved.

---