export interface SupportEvent {
  id: string;
  persona: string;
  intent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  description: string;
  timestamp: string;
  resolution?: string;
  resolvedAt?: string;
}
