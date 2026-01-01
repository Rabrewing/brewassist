import { brewtruth } from '../brewtruth';

export function emitInitCompletedEvent(profile: any) {
  brewtruth.emitEvent({
    type: 'init_completed',
    payload: profile,
    timestamp: new Date().toISOString(),
  });
}

export function emitInitDetectionEvent(detection: any) {
  brewtruth.emitEvent({
    type: 'init_detection',
    payload: detection,
    timestamp: new Date().toISOString(),
  });
}
