// lib/brewlast/types.ts

export interface BrewLastData {
  // Last session info
  lastMode?: 'admin' | 'customer';
  lastPane?: string; // e.g., "flow", "quality"
  lastTab?: string;
  lastSessionId?: string;

  // Last execution results
  lastBuildResult?: 'success' | 'failure' | 'unknown';
  lastTestResult?: 'passed' | 'failed' | 'unknown';
  lastTestSummary?: {
    passed: number;
    failed: number;
    total: number;
  };

  // Timestamps
  lastActivity?: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // Version for schema evolution
  version: string;
}

export interface BrewLastOptions {
  // Whether to allow writes in customer mode (default: false)
  allowCustomerWrites?: boolean;
}
