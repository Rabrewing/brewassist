// Global constants for BrewVerse cockpit

export const BRAND = {
  gold: '#FFD700', // BrewGold
  teal: '#00C7B7', // BrewTeal (LED accent)
  whiteLED: '#FFFFFF', // BrewWhite LED
} as const;

export const PROJECTS = [
  'BrewLotto',
  'BrewSearch',
  'BrewExec Platform',
  'BrewGold Botanica',
  'Project-Zahav',
] as const;

export const DEFAULTS = {
  model: 'tinyllama',
  port: 11434,
  memoryFile: '.memory.md',
  logFile: '~/.brewagent.log',
} as const;

export const OVERLAYS = {
  hrm: 'brewhrm.sh',
  llm: 'brewllm.sh',
  agent: 'brewagent.sh',
  loopLLM: 'brewloop_llm.sh',
  loop: 'brewloop.sh',
  loopSilent: 'brewloop_s.sh',
  router: 'brewrouter.sh',
  assist: 'brewassist.sh', // 🆕 added
  port: 'brewport.sh',
  status: 'brewstatus.sh',
  supa: 'brewsupa.sh',
  commit: 'brewcommit.sh',
  task: 'brewtask.sh',
} as const;

export const COMMANDS = {
  hrm: '/hrm',
  llm: '/llm',
  agent: '/agent',
  loopLLM: '/loop_llm',
  loop: '/loop',
  loopSilent: '/loop_s',
  router: '/router',
  assist: '/assist', // 🆕 added
  brewassist: '/brewassist', // optional alias
} as const;

export const API_ROUTES = {
  hrm: '/api/hrm',
  llm: '/api/llm',
  agent: '/api/agent',
  router: '/api/router',
  loopLLM: '/api/loop_llm',
  loop: '/api/loop',
  loopSilent: '/api/loop_s',
  brewassist: '/api/brewassist', // 🆕 added
} as const;

export const ENV = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  SUPABASE_TOKEN: 'SUPABASE_TOKEN',
  SUPABASE_EMAIL: 'SUPABASE_EMAIL',
  OPENAI: 'OPENAI_API_KEY',
} as const;
