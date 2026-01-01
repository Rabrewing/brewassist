#!/bin/bash

# S4 Lock Gate Runner
# Runs all S4 integrity checks in sequence
# Exits with non-zero code on any failure

set -e  # Exit on any error

echo "🔒 S4 Lock Gate Runner"
echo "======================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED="${GREEN}PASSED${NC}"
FAILED="${RED}FAILED${NC}"

run_check() {
    local cmd="$1"
    local desc="$2"

    echo -n "$desc... "

    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "$PASSED"
        return 0
    else
        echo -e "$FAILED"
        return 1
    fi
}

echo "Running S4 Lock Integrity Checks..."
echo ""

# 1. Lint
run_check "pnpm lint" "1. ESLint (Code Quality)"

# 2. Typecheck
run_check "pnpm typecheck" "2. TypeScript Type Check"

# 3. Unit Tests
run_check "pnpm test" "3. Jest Unit Tests"

# 4. UI Tests
run_check "pnpm test:ui" "4. Jest UI Tests"

# 5. Capability Audit
run_check "pnpm audit:capabilities" "5. Capability Registry Audit"

# 6. Build
run_check "pnpm build" "6. Production Build"

echo ""
echo "🎉 All S4 Lock Gates Passed!"
echo "✅ S4 Integrity Verified"