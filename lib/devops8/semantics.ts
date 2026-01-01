export const DEVOPS8_PRINCIPLES = [
  {
    id: 'flow_over_batch',
    label: 'Flow over batch',
    signal: 'chunking = optimal',
  },
  {
    id: 'fast_feedback',
    label: 'Fast feedback',
    signal: 'incremental responses = on',
  },
  {
    id: 'continuous_learning',
    label: 'Continuous learning',
    signal: 'memory write = success',
  },
  {
    id: 'build_quality_in',
    label: 'Build quality in',
    signal: 'pre-validation = passed',
  },
  {
    id: 'limit_wip',
    label: 'Limit work in progress',
    signal: 'scope size = contained',
  },
  {
    id: 'automate_safely',
    label: 'Automate safely',
    signal: 'policy gates = enforced',
  },
  {
    id: 'make_work_visible',
    label: 'Make work visible',
    signal: 'reasoning surfaced = yes',
  },
  {
    id: 'optimize_for_flow',
    label: 'Optimize for flow',
    signal: 'steps reduced = yes',
  },
] as const;
