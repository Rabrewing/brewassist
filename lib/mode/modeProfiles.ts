export interface ModeProfile {
  mode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP';
  defaultTone: 'safe' | 'balanced' | 'directive';
  allowedTools: string[];
  toolbeltTier: 1 | 2 | 3;
  sandboxPolicy: 'required' | 'optional' | 'disabled';
  memoryPolicy: 'read-only' | 'write-allowed' | 'full-access';
  brewtruthLevel: 'minimal' | 'standard' | 'detailed';
}

export function getHRMProfile(): ModeProfile {
  return {
    mode: 'HRM',
    defaultTone: 'safe',
    allowedTools: [
      'read',
      'grep',
      'glob',
      'webfetch',
      'codesearch',
      'capability.file.read.analyze',
      'capability.code.explain',
      'capability.plan.assist',
    ],
    toolbeltTier: 2,
    sandboxPolicy: 'required',
    memoryPolicy: 'read-only',
    brewtruthLevel: 'detailed',
  };
}

export function getLLMProfile(): ModeProfile {
  return {
    mode: 'LLM',
    defaultTone: 'balanced',
    allowedTools: [
      'read',
      'grep',
      'glob',
      'webfetch',
      'codesearch',
      'websearch',
      'capability.code.explain',
      'capability.research.external',
    ],
    toolbeltTier: 1,
    sandboxPolicy: 'optional',
    memoryPolicy: 'write-allowed',
    brewtruthLevel: 'standard',
  };
}

export function getAgentProfile(): ModeProfile {
  return {
    mode: 'AGENT',
    defaultTone: 'directive',
    allowedTools: [
      'read',
      'grep',
      'glob',
      'webfetch',
      'codesearch',
      'websearch',
      'bash',
      'edit',
      'write',
      'task',
      'capability.file.read.analyze',
      'capability.code.explain',
      'capability.research.external',
      'capability.plan.assist',
    ],
    toolbeltTier: 3,
    sandboxPolicy: 'required',
    memoryPolicy: 'full-access',
    brewtruthLevel: 'detailed',
  };
}

export function getLoopProfile(): ModeProfile {
  return {
    mode: 'LOOP',
    defaultTone: 'balanced',
    allowedTools: [
      'read',
      'grep',
      'glob',
      'webfetch',
      'codesearch',
      'bash',
      'edit',
      'write',
      'capability.code.explain',
    ],
    toolbeltTier: 2,
    sandboxPolicy: 'required',
    memoryPolicy: 'write-allowed',
    brewtruthLevel: 'standard',
  };
}
