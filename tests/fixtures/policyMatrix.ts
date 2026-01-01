export const PERSONAS = [
  { id: 'admin', side: 'admin' as const },
  { id: 'customer', side: 'customer' as const },
  { id: 'dev', side: 'admin' as const },
  { id: 'support', side: 'admin' as const },
] as const;

export const TIERS = [1, 2, 3] as const;

export const MODES = ['LLM', 'HRM', 'AGENT', 'LOOP', 'TOOL'] as const;
export const COCKPIT_MODES = ['admin', 'customer'] as const;

export const CAPABILITIES = [
  // Commands
  {
    capabilityId: '/task',
    intentCategory: 'SUPPORT',
    actions: ['W'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: '/doc',
    intentCategory: 'DOCS_KB',
    actions: ['W'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: '/patch',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['W'],
    minTier: 2,
    adminOnly: true,
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: '/hrm',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: true,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: '/registry',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: true,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: '/git',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R', 'W', 'X'],
    minTier: 2,
    adminOnly: true,
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: '/fs',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R', 'W', 'X'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },

  // BrewDocs
  {
    capabilityId: 'brewdocs.inspect',
    intentCategory: 'DOCS_KB',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'brewdocs.read',
    intentCategory: 'DOCS_KB',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'brewdocs.index',
    intentCategory: 'DOCS_KB',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },

  // FS
  {
    capabilityId: 'fs_read',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'fs_write',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['W'],
    minTier: 2,
    adminOnly: true,
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: 'fs_tree',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'fs_edit',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['W'],
    minTier: 2,
    adminOnly: true,
    requiresSandbox: true,
    requiresConfirm: true,
  },

  // Git
  {
    capabilityId: 'git_status',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: true,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'git_commit',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['W'],
    minTier: 3,
    adminOnly: true,
    requiresSandbox: true,
    requiresConfirm: true,
  },

  // DB
  {
    capabilityId: 'db_read',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: true,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'db_write',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['W'],
    minTier: 3,
    adminOnly: true,
    requiresSandbox: true,
    requiresConfirm: true,
  },

  // Research
  {
    capabilityId: 'research_web',
    intentCategory: 'SUPPORT',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },

  // Gemini Toolbelt
  {
    capabilityId: 'capability.file.read.analyze',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'capability.code.explain',
    intentCategory: 'DOCS_KB',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'capability.research.external',
    intentCategory: 'SUPPORT',
    actions: ['R'],
    minTier: 1,
    adminOnly: false,
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: 'capability.plan.assist',
    intentCategory: 'PLATFORM_DEVOPS',
    actions: ['R'],
    minTier: 2,
    adminOnly: true,
    requiresSandbox: false,
    requiresConfirm: false,
  },
] as const;

export const DEVOPS8_MODULES = [
  { id: 'files', adminOnly: true },
  { id: 'sandbox', adminOnly: true },
  { id: 'cognition', adminOnly: true },
  { id: 'guide', adminOnly: false },
  { id: 'docs', adminOnly: false },
  { id: 'help', adminOnly: false },
  { id: 'history', adminOnly: false },
] as const;
