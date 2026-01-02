#!/bin/bash

# S5.6 Support Intelligence Verification Script
# Ensures support traces are properly persisted, triaged, and governed

echo "🔍 Verifying S5.6 Support Intelligence integrity..."

# Check for support-intel directory
if [ -d "support-intel" ]; then
  echo "📁 Found support-intel directory"

  # Check for log files
  for log in daily.log unresolved.log candidates.log deferred.log; do
    if [ -f "support-intel/$log" ]; then
      line_count=$(wc -l < "support-intel/$log")
      echo "📋 $log: $line_count entries"
    else
      echo "⚠️  Missing $log"
    fi
  done

  # Check for silent writes (unauthorized files)
  extra_files=$(find support-intel -type f ! -name "*.log" | wc -l)
  if [ "$extra_files" -gt 0 ]; then
    echo "🚨 Silent write detected: $extra_files unauthorized files"
    exit 1
  fi

  # Check traces have BrewTruth
  missing_brewtruth=$(grep -L '"brewTruthScore"' support-intel/*.log | wc -l)
  if [ "$missing_brewtruth" -gt 0 ]; then
    echo "🚨 Trace missing BrewTruth: $missing_brewtruth files"
    exit 1
  fi

  # Check for PII leaks
  pii_count=$(grep -r "password\|secret\|token\|email\|phone" support-intel/ | wc -l)
  if [ "$pii_count" -gt 0 ]; then
    echo "🚨 Potential PII leak detected: $pii_count occurrences"
    exit 1
  fi

else
  echo "📁 No support-intel directory found"
fi

# Check proposals are read-only (no actual writes to brewdocs)
echo "🔒 Checking proposal governance..."
# Since read-only, ensure no direct writes in code
proposal_writes=$(grep -r "writeFile.*brewdocs" lib/support/ | wc -l)
if [ "$proposal_writes" -gt 0 ]; then
  echo "🚨 Proposal bypass detected: $proposal_writes unauthorized writes"
  exit 1
fi

echo "✅ S5.6 Support Intelligence verification complete"