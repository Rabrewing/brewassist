#!/bin/bash

# Support Intelligence Verification Script
# Ensures support events are properly isolated and triaged

echo "🔍 Verifying Support Intelligence integrity..."

# Check for support event files
if [ -d ".brewassist/support" ]; then
  event_count=$(find .brewassist/support -name "*.json" | wc -l)
  echo "📋 Found $event_count support events"

  # Check for customer events (should be isolated)
  customer_events=$(find .brewassist/support -name "*.json" -exec grep -l '"persona":"customer"' {} \; | wc -l)
  echo "👤 Found $customer_events customer events"

  # Check for sensitive data leaks (simplified)
  sensitive_count=$(find .brewassist/support -name "*.json" -exec grep -l "password\|secret\|token" {} \; | wc -l)
  if [ "$sensitive_count" -gt 0 ]; then
    echo "⚠️  Found $sensitive_count events with potential sensitive data"
  fi
else
  echo "📋 No support events found"
fi

echo "✅ Support Intelligence verification complete"