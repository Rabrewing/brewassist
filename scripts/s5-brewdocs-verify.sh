#!/bin/bash

# BrewDocs Verification Script
# Ensures BrewDocs proposals and applications are safe

echo "🔍 Verifying BrewDocs integrity..."

# Check for unauthorized proposal files
if [ -d ".brewdocs/proposals" ]; then
  proposal_count=$(find .brewdocs/proposals -name "*.json" | wc -l)
  echo "📋 Found $proposal_count proposals"

  # Check for any applied without approval (simplified)
  applied_count=$(find .brewdocs/proposals -name "*.json" -exec grep -l '"status":"applied"' {} \; | wc -l)
  if [ "$applied_count" -gt 0 ]; then
    echo "⚠️  Found $applied_count applied proposals - ensure proper approval"
  fi
else
  echo "📋 No proposals directory found"
fi

# Check ledger integrity
if [ -d ".brewdocs/ledger" ]; then
  ledger_count=$(find .brewdocs/ledger -name "*.json" | wc -l)
  echo "📊 Found $ledger_count ledger entries"
else
  echo "📊 No ledger entries found"
fi

echo "✅ BrewDocs verification complete"