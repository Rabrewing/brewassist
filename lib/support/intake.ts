import { SupportTrace } from './types';

export function intakeSupportTrace(
  traceData: Omit<SupportTrace, 'timestamp'>
): SupportTrace {
  // Normalize and validate the trace
  const normalizedTrace: SupportTrace = {
    ...traceData,
    timestamp: new Date().toISOString(),
  };

  // Ensure deterministic ordering and no PII
  normalizedTrace.input = sanitizeInput(normalizedTrace.input);
  normalizedTrace.response = sanitizeInput(normalizedTrace.response);

  // Validate required fields
  validateSupportTrace(normalizedTrace);

  return normalizedTrace;
}

function sanitizeInput(input: string): string {
  // Remove potential PII and normalize
  return input
    .replace(/\b\d{10,}\b/g, '[REDACTED_PHONE]')
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[REDACTED_EMAIL]'
    );
}

function validateSupportTrace(trace: SupportTrace): void {
  if (!trace.persona) throw new Error('Persona required');
  if (!['LLM', 'HRM', 'AGENT', 'LOOP'].includes(trace.activeMode))
    throw new Error('Invalid activeMode');
  if (!trace.input || !trace.response)
    throw new Error('Input and response required');
  if (trace.brewTruthScore < 0 || trace.brewTruthScore > 1)
    throw new Error('Invalid brewTruthScore');
}
