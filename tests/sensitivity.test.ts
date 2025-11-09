import { describe, it, expect } from 'vitest';
import {
  generateSensitivityGrid,
  getAmounts,
  getRates,
  getMonthlyRange,
  getColorClass,
  DEFAULT_SENSITIVITY_CONFIG,
} from '../src/lib/sensitivity';

describe('Sensitivity Analysis', () => {
  const config = {
    minAmount: 600000,
    maxAmount: 700000,
    stepAmount: 50000,
    minRate: 3.0,
    maxRate: 4.0,
    stepRate: 0.5,
  };

  describe('generateSensitivityGrid', () => {
    it('should generate correct grid dimensions', () => {
      const grid = generateSensitivityGrid(config, 25, 1000, 10000);

      // (700000 - 600000) / 50000 + 1 = 3 amounts
      expect(grid).toHaveLength(3);

      // (4.0 - 3.0) / 0.5 + 1 = 3 rates
      expect(grid[0]).toHaveLength(3);
    });

    it('should calculate monthly payments', () => {
      const grid = generateSensitivityGrid(config, 25, 0, 10000);

      // Each cell should have valid monthly payment
      grid.forEach((row) => {
        row.forEach((cell) => {
          expect(cell.monthly).toBeGreaterThan(0);
          expect(cell.amount).toBeGreaterThanOrEqual(config.minAmount);
          expect(cell.amount).toBeLessThanOrEqual(config.maxAmount);
          expect(cell.rate).toBeGreaterThanOrEqual(config.minRate);
          expect(cell.rate).toBeLessThanOrEqual(config.maxRate);
        });
      });
    });

    it('should mark comfortable DTI correctly', () => {
      const grid = generateSensitivityGrid(config, 25, 1000, 10000);

      // Check that comfort assessment is based on DTI
      grid.forEach((row) => {
        row.forEach((cell) => {
          const totalDebt = cell.monthly + 1000; // family monthly
          const dti = (totalDebt / 10000) * 100;
          expect(cell.isComfortable).toBe(dti <= 45);
        });
      });
    });

    it('should have higher payments for higher amounts', () => {
      const grid = generateSensitivityGrid(config, 25, 0, 10000);

      // For same rate, higher amount = higher payment
      const rate = 0; // Use first rate column
      expect(grid[1][rate].monthly).toBeGreaterThan(grid[0][rate].monthly);
      expect(grid[2][rate].monthly).toBeGreaterThan(grid[1][rate].monthly);
    });

    it('should have higher payments for higher rates', () => {
      const grid = generateSensitivityGrid(config, 25, 0, 10000);

      // For same amount, higher rate = higher payment
      const amount = 0; // Use first amount row
      expect(grid[amount][1].monthly).toBeGreaterThan(grid[amount][0].monthly);
      expect(grid[amount][2].monthly).toBeGreaterThan(grid[amount][1].monthly);
    });
  });

  describe('getAmounts', () => {
    it('should extract amounts from grid', () => {
      const grid = generateSensitivityGrid(config, 25, 0, 10000);
      const amounts = getAmounts(grid);

      expect(amounts).toEqual([600000, 650000, 700000]);
    });
  });

  describe('getRates', () => {
    it('should extract rates from grid', () => {
      const grid = generateSensitivityGrid(config, 25, 0, 10000);
      const rates = getRates(grid);

      expect(rates).toEqual([3.0, 3.5, 4.0]);
    });
  });

  describe('getMonthlyRange', () => {
    it('should find min and max monthly payments', () => {
      const grid = generateSensitivityGrid(config, 25, 0, 10000);
      const { min, max } = getMonthlyRange(grid);

      expect(min).toBeLessThan(max);

      // Min should be lowest amount at lowest rate
      expect(min).toBeCloseTo(grid[0][0].monthly, 0);

      // Max should be highest amount at highest rate
      const lastRow = grid.length - 1;
      const lastCol = grid[0].length - 1;
      expect(max).toBeCloseTo(grid[lastRow][lastCol].monthly, 0);
    });
  });

  describe('getColorClass', () => {
    it('should return red for uncomfortable DTI', () => {
      const color = getColorClass(3000, 2000, 4000, false);
      expect(color).toContain('red');
    });

    it('should return green for low payments and comfortable DTI', () => {
      const color = getColorClass(2100, 2000, 4000, true);
      expect(color).toContain('green');
    });

    it('should return yellow for mid-range payments', () => {
      const color = getColorClass(3000, 2000, 4000, true);
      expect(color).toContain('yellow');
    });

    it('should return orange for high payments', () => {
      const color = getColorClass(3800, 2000, 4000, true);
      expect(color).toContain('orange');
    });
  });

  describe('DEFAULT_SENSITIVITY_CONFIG', () => {
    it('should have valid default config', () => {
      expect(DEFAULT_SENSITIVITY_CONFIG.minAmount).toBeLessThan(
        DEFAULT_SENSITIVITY_CONFIG.maxAmount
      );
      expect(DEFAULT_SENSITIVITY_CONFIG.minRate).toBeLessThan(
        DEFAULT_SENSITIVITY_CONFIG.maxRate
      );
      expect(DEFAULT_SENSITIVITY_CONFIG.stepAmount).toBeGreaterThan(0);
      expect(DEFAULT_SENSITIVITY_CONFIG.stepRate).toBeGreaterThan(0);
    });
  });
});
