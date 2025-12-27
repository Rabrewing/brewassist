export type CapabilityCategory = 'fs' | 'git' | 'db' | 'research' | 'system' | 'platform_devops' | 'docs' | 'support';
export type CapabilitySurface = 'wizard' | 'command' | 'assistant_auto';
export type Persona = 'admin' | 'dev' | 'support' | 'customer';
export type IntentCategory = 'PLATFORM_DEVOPS' | 'DOCS_KB' | 'SUPPORT';
export type BrewTruthPolicyType = "Yes (light)" | "Yes (strict)" | "No";

export interface BrewTruthExpectation {
  minScore?: number; // 0-1
  flags?: string[];
  policyType: BrewTruthPolicyType;
}
export type RWX = 'R' | 'W' | 'RWX';

export interface Capability {
  capabilityId: string;
  category: CapabilityCategory;
  surfaces: CapabilitySurface[];
  tierRequired: number;
  personaAllowed: Persona[];
  intentCategory: IntentCategory;
  confirmApplyRequired: boolean;
  sandboxRequired: boolean;
  gepRequired?: boolean;
  wizardId?: string;
  auditLevel: 'minimal' | 'full';
  brewTruthExpectations: BrewTruthExpectation;
  rwx?: RWX;
}

export const CAPABILITY_REGISTRY: Record<string, Capability> = {

  // Commands

    "/task": {

      capabilityId: "/task",

      category: "system",

      surfaces: ["command", "assistant_auto"],

      tierRequired: 1,

      personaAllowed: ["admin", "support", "customer"],

      intentCategory: "SUPPORT",

      confirmApplyRequired: false,

      sandboxRequired: false,

      auditLevel: "minimal",

      brewTruthExpectations: { policyType: "Yes (light)" },

    },

    "/doc": {

      capabilityId: "/doc",

      category: "system",

      surfaces: ["command", "assistant_auto"],

      tierRequired: 1,

      personaAllowed: ["admin", "support", "customer"],

      intentCategory: "DOCS_KB",

      confirmApplyRequired: false,

      sandboxRequired: false,

      auditLevel: "minimal",

      brewTruthExpectations: { policyType: "Yes (light)" },

    },

    "/patch": {

      capabilityId: "/patch",

      category: "system",

      surfaces: ["command", "wizard", "assistant_auto"],

      tierRequired: 2,

      personaAllowed: ["admin", "dev"],

      intentCategory: "PLATFORM_DEVOPS",

      confirmApplyRequired: true,

      sandboxRequired: true,

      gepRequired: true,

      wizardId: "patch",

      auditLevel: "full",

      brewTruthExpectations: { policyType: "Yes (strict)" },

    },

    "/hrm": {

      capabilityId: "/hrm",

      category: "system",

      surfaces: ["command", "assistant_auto"],

      tierRequired: 1,

      personaAllowed: ["admin", "dev"],

      intentCategory: "PLATFORM_DEVOPS",

      confirmApplyRequired: false,

      sandboxRequired: false,

      auditLevel: "minimal",

      brewTruthExpectations: { policyType: "Yes (light)" },

    },

    "/registry": {

      capabilityId: "/registry",

      category: "system",

      surfaces: ["command", "assistant_auto"],

      tierRequired: 1,

      personaAllowed: ["admin", "dev"],

      intentCategory: "PLATFORM_DEVOPS",

      confirmApplyRequired: false,

      sandboxRequired: false,

      auditLevel: "minimal",

      brewTruthExpectations: { policyType: "Yes (light)" },

    },

    "/git": {

      capabilityId: "/git",

      category: "system",

      surfaces: ["command", "wizard", "assistant_auto"],

      tierRequired: 2,

      personaAllowed: ["admin", "dev"],

      intentCategory: "PLATFORM_DEVOPS",

      confirmApplyRequired: true,

      sandboxRequired: true,

      gepRequired: true,

      wizardId: "git",

      auditLevel: "full",

      brewTruthExpectations: { policyType: "Yes (strict)" },

    },

    "/fs": {

      capabilityId: "/fs",

      category: "system",

      surfaces: ["command", "wizard", "assistant_auto"],

      tierRequired: 1,

      personaAllowed: ["admin", "dev", "support", "customer"],

      intentCategory: "PLATFORM_DEVOPS",

      confirmApplyRequired: false,

      sandboxRequired: false,

      wizardId: "fs",

      auditLevel: "full",

            brewTruthExpectations: { policyType: "Yes (strict)" },

          },

      

        // BrewDocs Capabilities

        "brewdocs.inspect": {

          capabilityId: "brewdocs.inspect",

          category: "docs",

          surfaces: ["command", "assistant_auto"],

          tierRequired: 1,

          personaAllowed: ["admin", "dev", "support", "customer"],

          intentCategory: "DOCS_KB",

          confirmApplyRequired: false,

          sandboxRequired: false,

          gepRequired: false,

          auditLevel: "minimal",

          brewTruthExpectations: { policyType: "No" },

          rwx: "R",

        },

        "brewdocs.read": {

          capabilityId: "brewdocs.read",

          category: "docs",

          surfaces: ["command", "assistant_auto"],

          tierRequired: 1,

          personaAllowed: ["admin", "dev", "support", "customer"],

          intentCategory: "DOCS_KB",

          confirmApplyRequired: false,

          sandboxRequired: false,

          gepRequired: false,

          auditLevel: "minimal",

          brewTruthExpectations: { policyType: "No" },

          rwx: "R",

        },

        "brewdocs.index": {

          capabilityId: "brewdocs.index",

          category: "docs",

          surfaces: ["command", "assistant_auto"],

          tierRequired: 1,

          personaAllowed: ["admin", "dev", "support", "customer"],

          intentCategory: "DOCS_KB",

          confirmApplyRequired: false,

          sandboxRequired: false,

          gepRequired: false,

          auditLevel: "minimal",

          brewTruthExpectations: { policyType: "No" },

          rwx: "R",

        },

      

          // MCP Tools



      fs_read: {



        capabilityId: "fs_read",



        category: "fs",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 1,



        personaAllowed: ["admin", "dev", "support", "customer"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: false,



        sandboxRequired: false,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "No" },



        rwx: "R",



      },



      fs_tree: {



        capabilityId: "fs_tree",



        category: "fs",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 1,



        personaAllowed: ["admin", "dev", "support", "customer"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: false,



        sandboxRequired: false,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "No" },



        rwx: "R",



      },



      fs_write: {



        capabilityId: "fs_write",



        category: "fs",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 2,



        personaAllowed: ["admin", "dev"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: true,



        sandboxRequired: true,



        gepRequired: true,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "Yes (strict)", flags: ["safety_concern"] },



        rwx: "W",



      },



      fs_edit: {



        capabilityId: "fs_edit",



        category: "fs",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 2,



        personaAllowed: ["admin", "dev"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: true,



        sandboxRequired: true,



        gepRequired: true,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "Yes (strict)", flags: ["partial_answer"] },



        rwx: "W",



      },



      git_status: {



        capabilityId: "git_status",



        category: "git",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 1,



        personaAllowed: ["admin", "dev"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: false,



        sandboxRequired: false,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "No" },



        rwx: "R",



      },



      git_commit: {



        capabilityId: "git_commit",



        category: "git",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 3,



        personaAllowed: ["admin", "dev"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: true,



        sandboxRequired: true,



        gepRequired: true,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "Yes (strict)", flags: ["safety_concern"] },



        rwx: "W",



      },



      db_read: {



        capabilityId: "db_read",



        category: "db",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 1,



        personaAllowed: ["admin", "dev"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: false,



        sandboxRequired: false,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "No" },



        rwx: "R",



      },



      db_write: {



        capabilityId: "db_write",



        category: "db",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 3,



        personaAllowed: ["admin", "dev"],



        intentCategory: "PLATFORM_DEVOPS",



        confirmApplyRequired: true,



        sandboxRequired: true,



        gepRequired: true,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "Yes (strict)", flags: ["safety_concern"] },



        rwx: "W",



      },



      research_web: {



        capabilityId: "research_web",



        category: "research",



        surfaces: ["wizard", "assistant_auto"],



        tierRequired: 1,



        personaAllowed: ["admin", "dev", "support", "customer"],



        intentCategory: "SUPPORT",



        confirmApplyRequired: false,



        sandboxRequired: false,



        auditLevel: "full",



        brewTruthExpectations: { policyType: "Yes (light)", flags: ["speculative"] },



        rwx: "R",



      },

};
