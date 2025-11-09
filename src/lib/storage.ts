import { FinancialInputs, DEFAULT_INPUTS } from './finance';

export interface Scenario {
  id: string;
  name: string;
  inputs: FinancialInputs;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'brasschaat-villa-scenarios';
const DEFAULT_SCENARIO_KEY = 'brasschaat-villa-default-scenario';

/**
 * Generate unique ID
 */
function generateId(): string {
  return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load all scenarios from localStorage
 */
export function loadScenarios(): Scenario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load scenarios:', error);
    return [];
  }
}

/**
 * Save scenarios to localStorage
 */
function saveScenarios(scenarios: Scenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (error) {
    console.error('Failed to save scenarios:', error);
    throw new Error('Could not save scenarios. Storage might be full.');
  }
}

/**
 * Create a new scenario
 */
export function createScenario(
  name: string,
  inputs: FinancialInputs
): Scenario {
  const scenario: Scenario = {
    id: generateId(),
    name,
    inputs,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const scenarios = loadScenarios();
  scenarios.push(scenario);
  saveScenarios(scenarios);

  return scenario;
}

/**
 * Update an existing scenario
 */
export function updateScenario(
  id: string,
  updates: Partial<Omit<Scenario, 'id' | 'createdAt'>>
): Scenario | null {
  const scenarios = loadScenarios();
  const index = scenarios.findIndex((s) => s.id === id);

  if (index === -1) return null;

  scenarios[index] = {
    ...scenarios[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveScenarios(scenarios);
  return scenarios[index];
}

/**
 * Delete a scenario
 */
export function deleteScenario(id: string): boolean {
  const scenarios = loadScenarios();
  const filtered = scenarios.filter((s) => s.id !== id);

  if (filtered.length === scenarios.length) return false;

  saveScenarios(filtered);

  // If deleted scenario was default, clear default
  if (getDefaultScenarioId() === id) {
    clearDefaultScenario();
  }

  return true;
}

/**
 * Duplicate a scenario
 */
export function duplicateScenario(id: string, newName?: string): Scenario | null {
  const scenarios = loadScenarios();
  const source = scenarios.find((s) => s.id === id);

  if (!source) return null;

  const duplicate = createScenario(
    newName || `${source.name} (copy)`,
    source.inputs
  );

  return duplicate;
}

/**
 * Rename a scenario
 */
export function renameScenario(id: string, newName: string): Scenario | null {
  return updateScenario(id, { name: newName });
}

/**
 * Get a specific scenario
 */
export function getScenario(id: string): Scenario | null {
  const scenarios = loadScenarios();
  return scenarios.find((s) => s.id === id) || null;
}

/**
 * Set default scenario
 */
export function setDefaultScenario(id: string): void {
  localStorage.setItem(DEFAULT_SCENARIO_KEY, id);
}

/**
 * Get default scenario ID
 */
export function getDefaultScenarioId(): string | null {
  return localStorage.getItem(DEFAULT_SCENARIO_KEY);
}

/**
 * Clear default scenario
 */
export function clearDefaultScenario(): void {
  localStorage.removeItem(DEFAULT_SCENARIO_KEY);
}

/**
 * Get default scenario
 */
export function getDefaultScenario(): Scenario | null {
  const id = getDefaultScenarioId();
  if (!id) return null;
  return getScenario(id);
}

/**
 * Export all scenarios as JSON
 */
export function exportScenarios(): string {
  const scenarios = loadScenarios();
  return JSON.stringify(scenarios, null, 2);
}

/**
 * Import scenarios from JSON
 * @param merge - If true, merge with existing. If false, replace all.
 */
export function importScenarios(json: string, merge = true): number {
  try {
    const imported = JSON.parse(json) as Scenario[];

    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array of scenarios');
    }

    // Validate structure
    for (const scenario of imported) {
      if (!scenario.id || !scenario.name || !scenario.inputs) {
        throw new Error('Invalid scenario structure');
      }
    }

    let scenarios = merge ? loadScenarios() : [];

    // Generate new IDs to avoid conflicts
    const withNewIds = imported.map((s) => ({
      ...s,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    scenarios = [...scenarios, ...withNewIds];
    saveScenarios(scenarios);

    return withNewIds.length;
  } catch (error) {
    console.error('Failed to import scenarios:', error);
    throw new Error('Could not import scenarios. Invalid format.');
  }
}

/**
 * Clear all scenarios
 */
export function clearAllScenarios(): void {
  localStorage.removeItem(STORAGE_KEY);
  clearDefaultScenario();
}

/**
 * Initialize with default scenario if none exist
 */
export function initializeDefaultScenario(): Scenario | null {
  const scenarios = loadScenarios();
  if (scenarios.length === 0) {
    const scenario = createScenario('Default Plan', DEFAULT_INPUTS);
    setDefaultScenario(scenario.id);
    return scenario;
  }
  return null;
}
