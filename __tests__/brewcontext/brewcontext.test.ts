// tests/brewcontext/brewcontext.test.ts

import {
  getBrewContext,
  setBrewContext,
  updateBrewContext,
  clearBrewContext,
  initializeBrewContext,
  getCurrentIntent,
  getActiveConstraints,
  getLastToolUsed,
  getCurrentPhaseId,
  getSessionId,
} from '../../lib/brewcontext';

describe('BrewContext Engine v1', () => {
  beforeEach(() => {
    clearBrewContext();
  });

  describe('initializeBrewContext', () => {
    test('should initialize context with session info', () => {
      const context = initializeBrewContext('test-session');

      expect(context.sessionId).toBe('test-session');
      expect(context.startedAt).toBeDefined();
      expect(context.activeConstraints).toEqual([]);
      expect(context.workingMemory).toEqual({});
    });

    test('should generate session ID if not provided', () => {
      const context = initializeBrewContext();

      expect(context.sessionId).toMatch(/^session_\d+_/);
      expect(context.startedAt).toBeDefined();
    });
  });

  describe('Context CRUD', () => {
    test('should set and get context', () => {
      const data = {
        currentIntent: 'Test intent',
        activeConstraints: ['constraint1'],
        lastToolUsed: 'test-tool',
        currentPhaseId: 'phase-1',
      };

      setBrewContext(data);
      const retrieved = getBrewContext();

      expect(retrieved).toEqual(data);
    });

    test('should update existing context', () => {
      setBrewContext({ currentIntent: 'Initial intent' });
      updateBrewContext({ lastToolUsed: 'updated-tool' });

      const context = getBrewContext();
      expect(context?.currentIntent).toBe('Initial intent');
      expect(context?.lastToolUsed).toBe('updated-tool');
    });

    test('should clear context', () => {
      setBrewContext({ currentIntent: 'Test' });
      clearBrewContext();

      expect(getBrewContext()).toBeNull();
    });
  });

  describe('Convenience getters', () => {
    beforeEach(() => {
      setBrewContext({
        currentIntent: 'Test intent',
        activeConstraints: ['c1', 'c2'],
        lastToolUsed: 'tool-x',
        currentPhaseId: 'phase-test',
        sessionId: 'session-123',
      });
    });

    test('getCurrentIntent should return intent', () => {
      expect(getCurrentIntent()).toBe('Test intent');
    });

    test('getActiveConstraints should return constraints', () => {
      expect(getActiveConstraints()).toEqual(['c1', 'c2']);
    });

    test('getLastToolUsed should return last tool', () => {
      expect(getLastToolUsed()).toBe('tool-x');
    });

    test('getCurrentPhaseId should return phase ID', () => {
      expect(getCurrentPhaseId()).toBe('phase-test');
    });

    test('getSessionId should return session ID', () => {
      expect(getSessionId()).toBe('session-123');
    });

    test('should return undefined/null when no context', () => {
      clearBrewContext();

      expect(getCurrentIntent()).toBeUndefined();
      expect(getActiveConstraints()).toEqual([]);
      expect(getLastToolUsed()).toBeUndefined();
      expect(getCurrentPhaseId()).toBeUndefined();
      expect(getSessionId()).toBeUndefined();
    });
  });

  describe('Working memory', () => {
    test('should store arbitrary data in working memory', () => {
      const memory = {
        tempValue: 42,
        tempArray: [1, 2, 3],
        tempObject: { key: 'value' },
      };

      setBrewContext({ workingMemory: memory });
      const context = getBrewContext();

      expect(context?.workingMemory).toEqual(memory);
    });

    test('should update working memory', () => {
      setBrewContext({ workingMemory: { a: 1 } });
      updateBrewContext({ workingMemory: { b: 2 } });

      const context = getBrewContext();
      expect(context?.workingMemory).toEqual({ a: 1, b: 2 });
    });
  });
});
