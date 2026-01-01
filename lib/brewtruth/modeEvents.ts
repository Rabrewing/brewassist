import { brewtruth } from '../brewtruth';

export function emitModeSelectedEvent(mode: string, profile: any) {
  brewtruth.emitEvent({
    type: 'mode_selected',
    payload: { mode, profile },
    timestamp: new Date().toISOString(),
  });
}

export function emitModeBlockedEvent(mode: string, reason: string) {
  brewtruth.emitEvent({
    type: 'mode_blocked',
    payload: { mode, reason },
    timestamp: new Date().toISOString(),
  });
}

export function emitToolDeniedEvent(tool: string, mode: string) {
  brewtruth.emitEvent({
    type: 'tool_denied',
    payload: { tool, mode },
    timestamp: new Date().toISOString(),
  });
}

export function emitInitAssumptionsEvent(assumptions: any) {
  brewtruth.emitEvent({
    type: 'init_assumptions',
    payload: assumptions,
    timestamp: new Date().toISOString(),
  });
}
