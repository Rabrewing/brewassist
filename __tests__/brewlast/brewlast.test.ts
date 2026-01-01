// tests/brewlast/brewlast.test.ts

import {
  readBrewLast,
  writeBrewLast,
  updateLastMode,
  updateLastPane,
  getLastMode,
  getLastPane,
} from '../../lib/brewlast';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { BrewLastData } from '../../lib/brewlast/types';

const testDir = '/tmp/brewlast-test';
const testFile = join(testDir, '.brewlast.json');

describe('BrewLast v1', () => {
  beforeEach(() => {
    // Clean up
    if (existsSync(testFile)) {
      unlinkSync(testFile);
    }
  });

  afterEach(() => {
    if (existsSync(testFile)) {
      unlinkSync(testFile);
    }
  });

  describe('writeBrewLast', () => {
    test('should write BrewLast data to filesystem', () => {
      const data: Partial<BrewLastData> = {
        lastMode: 'admin',
        lastPane: 'flow',
        lastActivity: new Date().toISOString(),
      };

      const success = writeBrewLast(data, {}, testDir);
      expect(success).toBe(true);
      expect(existsSync(testFile)).toBe(true);
    });

    test('should merge with existing data', () => {
      // Write initial data
      writeBrewLast({ lastMode: 'admin' }, {}, testDir);

      // Update
      writeBrewLast({ lastPane: 'quality' }, {}, testDir);

      const result = readBrewLast(testDir);
      expect(result?.lastMode).toBe('admin');
      expect(result?.lastPane).toBe('quality');
    });

    test('should gate writes in customer mode', () => {
      const success = writeBrewLast(
        { lastMode: 'customer', lastPane: 'flow' },
        {},
        testDir
      );
      expect(success).toBe(false);
      expect(existsSync(testFile)).toBe(false);
    });

    test('should allow customer writes when explicitly enabled', () => {
      const success = writeBrewLast(
        { lastMode: 'customer', lastPane: 'flow' },
        { allowCustomerWrites: true },
        testDir
      );
      expect(success).toBe(true);
      expect(existsSync(testFile)).toBe(true);
    });

    test('should include required fields', () => {
      writeBrewLast({ lastMode: 'admin' }, {}, testDir);
      const result = readBrewLast(testDir);

      expect(result).toHaveProperty('version', '1.0');
      expect(result).toHaveProperty('updatedAt');
      expect(typeof result?.updatedAt).toBe('string');
    });
  });

  describe('readBrewLast', () => {
    test("should return null when file doesn't exist", () => {
      const result = readBrewLast(testDir);
      expect(result).toBeNull();
    });

    test('should read valid BrewLast data', () => {
      const data: Partial<BrewLastData> = {
        lastMode: 'admin',
        lastPane: 'flow',
        lastBuildResult: 'success',
        lastTestSummary: { passed: 5, failed: 0, total: 5 },
      };
      writeBrewLast(data, {}, testDir);

      const result = readBrewLast(testDir);
      expect(result?.lastMode).toBe('admin');
      expect(result?.lastPane).toBe('flow');
      expect(result?.lastBuildResult).toBe('success');
      expect(result?.lastTestSummary).toEqual({
        passed: 5,
        failed: 0,
        total: 5,
      });
    });

    test('should handle corrupted JSON', () => {
      // Manually create corrupted file
      const fs = require('fs');
      fs.writeFileSync(testFile, '{ invalid json');

      const result = readBrewLast(testDir);
      expect(result).toBeNull();
    });
  });

  describe('Convenience functions', () => {
    test('updateLastMode should work', () => {
      const success = updateLastMode('admin', testDir);
      expect(success).toBe(true);
      expect(getLastMode(testDir)).toBe('admin');
    });

    test('getLastPane should return stored pane', () => {
      updateLastPane('quality', testDir);
      expect(getLastPane(testDir)).toBe('quality');
    });

    test('getLastMode should return null when no data', () => {
      expect(getLastMode(testDir)).toBeNull();
    });
  });
});
