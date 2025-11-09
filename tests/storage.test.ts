import { describe, it, expect, beforeEach } from 'vitest';
import {
  createScenario,
  loadScenarios,
  updateScenario,
  deleteScenario,
  duplicateScenario,
  renameScenario,
  clearAllScenarios,
  exportScenarios,
  importScenarios,
  setDefaultScenario,
  getDefaultScenarioId,
  clearDefaultScenario,
} from '../src/lib/storage';
import { DEFAULT_INPUTS } from '../src/lib/finance';

describe('Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearAllScenarios();
  });

  describe('createScenario', () => {
    it('should create a new scenario', () => {
      const scenario = createScenario('Test Scenario', DEFAULT_INPUTS);

      expect(scenario.name).toBe('Test Scenario');
      expect(scenario.inputs).toEqual(DEFAULT_INPUTS);
      expect(scenario.id).toBeDefined();
      expect(scenario.createdAt).toBeDefined();
      expect(scenario.updatedAt).toBeDefined();
    });

    it('should persist scenario to localStorage', () => {
      createScenario('Test', DEFAULT_INPUTS);
      const scenarios = loadScenarios();

      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].name).toBe('Test');
    });
  });

  describe('loadScenarios', () => {
    it('should return empty array when no scenarios', () => {
      const scenarios = loadScenarios();
      expect(scenarios).toEqual([]);
    });

    it('should load all scenarios', () => {
      createScenario('Scenario 1', DEFAULT_INPUTS);
      createScenario('Scenario 2', DEFAULT_INPUTS);

      const scenarios = loadScenarios();
      expect(scenarios).toHaveLength(2);
    });
  });

  describe('updateScenario', () => {
    it('should update scenario name', () => {
      const scenario = createScenario('Original', DEFAULT_INPUTS);
      const updated = updateScenario(scenario.id, { name: 'Updated' });

      expect(updated?.name).toBe('Updated');
    });

    it('should update scenario inputs', () => {
      const scenario = createScenario('Test', DEFAULT_INPUTS);
      const newInputs = { ...DEFAULT_INPUTS, purchasePrice: 800000 };
      const updated = updateScenario(scenario.id, { inputs: newInputs });

      expect(updated?.inputs.purchasePrice).toBe(800000);
    });

    it('should return null for non-existent id', () => {
      const updated = updateScenario('fake-id', { name: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('deleteScenario', () => {
    it('should delete scenario', () => {
      const scenario = createScenario('Test', DEFAULT_INPUTS);
      const deleted = deleteScenario(scenario.id);

      expect(deleted).toBe(true);
      expect(loadScenarios()).toHaveLength(0);
    });

    it('should return false for non-existent id', () => {
      const deleted = deleteScenario('fake-id');
      expect(deleted).toBe(false);
    });
  });

  describe('duplicateScenario', () => {
    it('should duplicate scenario', () => {
      const original = createScenario('Original', DEFAULT_INPUTS);
      const duplicate = duplicateScenario(original.id);

      expect(duplicate).toBeDefined();
      expect(duplicate?.name).toContain('copy');
      expect(duplicate?.inputs).toEqual(original.inputs);
      expect(duplicate?.id).not.toBe(original.id);
    });

    it('should allow custom name', () => {
      const original = createScenario('Original', DEFAULT_INPUTS);
      const duplicate = duplicateScenario(original.id, 'Custom Name');

      expect(duplicate?.name).toBe('Custom Name');
    });
  });

  describe('renameScenario', () => {
    it('should rename scenario', () => {
      const scenario = createScenario('Original', DEFAULT_INPUTS);
      const renamed = renameScenario(scenario.id, 'New Name');

      expect(renamed?.name).toBe('New Name');
    });
  });

  describe('default scenario', () => {
    it('should set and get default scenario', () => {
      const scenario = createScenario('Test', DEFAULT_INPUTS);
      setDefaultScenario(scenario.id);

      const defaultId = getDefaultScenarioId();
      expect(defaultId).toBe(scenario.id);
    });

    it('should clear default scenario', () => {
      const scenario = createScenario('Test', DEFAULT_INPUTS);
      setDefaultScenario(scenario.id);
      clearDefaultScenario();

      const defaultId = getDefaultScenarioId();
      expect(defaultId).toBeNull();
    });
  });

  describe('import/export', () => {
    it('should export scenarios as JSON', () => {
      createScenario('Test 1', DEFAULT_INPUTS);
      createScenario('Test 2', DEFAULT_INPUTS);

      const json = exportScenarios();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('should import scenarios', () => {
      const scenario1 = createScenario('Test 1', DEFAULT_INPUTS);
      const json = exportScenarios();

      clearAllScenarios();

      const count = importScenarios(json, false);
      expect(count).toBe(1);

      const scenarios = loadScenarios();
      expect(scenarios).toHaveLength(1);
      expect(scenarios[0].name).toBe('Test 1');
    });

    it('should merge when importing', () => {
      createScenario('Existing', DEFAULT_INPUTS);

      const scenario = createScenario('New', DEFAULT_INPUTS);
      const json = JSON.stringify([scenario]);
      clearAllScenarios();
      createScenario('Existing', DEFAULT_INPUTS);

      const count = importScenarios(json, true);
      expect(count).toBe(1);

      const scenarios = loadScenarios();
      expect(scenarios).toHaveLength(2);
    });
  });

  describe('clearAllScenarios', () => {
    it('should clear all scenarios', () => {
      createScenario('Test 1', DEFAULT_INPUTS);
      createScenario('Test 2', DEFAULT_INPUTS);

      clearAllScenarios();

      const scenarios = loadScenarios();
      expect(scenarios).toHaveLength(0);
    });
  });
});
