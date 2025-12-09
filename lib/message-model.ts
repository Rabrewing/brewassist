export type BrewMessageRole =
  | 'user'
  | 'system'
  | 'hrm'
  | 'llm'
  | 'agent'
  | 'loop'
  | 'sandbox';

export interface BrewMessage {
  id: string;
  role: BrewMessageRole;
  content: string;
  createdAt: string; // ISO timestamp
  meta?: {
    mode?: 'hrm' | 'llm' | 'agent' | 'loop' | 'sandbox';
    model?: string;
    truthScore?: number;
    source?: 'user' | 'assistant' | 'system';
  };
}