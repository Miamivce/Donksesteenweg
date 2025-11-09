import { pmt, round2 } from './finance';

export interface SensitivityCell {
  amount: number;
  rate: number;
  monthly: number;
  isComfortable: boolean; // DTI <= 45%
}

export interface SensitivityConfig {
  minAmount: number;
  maxAmount: number;
  stepAmount: number;
  minRate: number;
  maxRate: number;
  stepRate: number;
}

export const DEFAULT_SENSITIVITY_CONFIG: SensitivityConfig = {
  minAmount: 600000,
  maxAmount: 1000000,
  stepAmount: 25000,
  minRate: 3.0,
  maxRate: 5.5,
  stepRate: 0.25,
};

/**
 * Generate sensitivity heatmap grid
 * @param config - Grid configuration
 * @param bankTermYears - Bank loan term in years
 * @param familyMonthly - Family loan monthly payment
 * @param netIncomeMonthly - Net household income
 * @param otherFixedCostsMonthly - Other fixed costs
 * @returns 2D array of sensitivity cells
 */
export function generateSensitivityGrid(
  config: SensitivityConfig,
  bankTermYears: number,
  familyMonthly: number,
  netIncomeMonthly: number,
  otherFixedCostsMonthly: number
): SensitivityCell[][] {
  const grid: SensitivityCell[][] = [];

  for (
    let amount = config.minAmount;
    amount <= config.maxAmount;
    amount += config.stepAmount
  ) {
    const row: SensitivityCell[] = [];

    for (
      let rate = config.minRate;
      rate <= config.maxRate;
      rate += config.stepRate
    ) {
      const monthly = pmt(rate / 100, bankTermYears, amount);
      const totalDebt = monthly + familyMonthly;
      const dti = netIncomeMonthly > 0 ? (totalDebt / netIncomeMonthly) * 100 : 100;

      row.push({
        amount,
        rate: round2(rate),
        monthly: round2(monthly),
        isComfortable: dti <= 45,
      });
    }

    grid.push(row);
  }

  return grid;
}

/**
 * Get unique amounts from grid (Y-axis)
 */
export function getAmounts(grid: SensitivityCell[][]): number[] {
  return grid.map((row) => row[0].amount);
}

/**
 * Get unique rates from grid (X-axis)
 */
export function getRates(grid: SensitivityCell[][]): number[] {
  if (grid.length === 0) return [];
  return grid[0].map((cell) => cell.rate);
}

/**
 * Find min and max monthly payments for color scaling
 */
export function getMonthlyRange(grid: SensitivityCell[][]): {
  min: number;
  max: number;
} {
  let min = Infinity;
  let max = -Infinity;

  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.monthly < min) min = cell.monthly;
      if (cell.monthly > max) max = cell.monthly;
    });
  });

  return { min, max };
}

/**
 * Get color class based on monthly payment (for Tailwind)
 */
export function getColorClass(
  monthly: number,
  min: number,
  max: number,
  isComfortable: boolean
): string {
  const range = max - min;
  const normalized = range > 0 ? (monthly - min) / range : 0;

  // If not comfortable (DTI > 45%), use red regardless
  if (!isComfortable) {
    return 'bg-red-100 text-red-900';
  }

  // Green to yellow gradient based on payment amount
  if (normalized < 0.33) {
    return 'bg-green-100 text-green-900';
  } else if (normalized < 0.67) {
    return 'bg-yellow-100 text-yellow-900';
  } else {
    return 'bg-orange-100 text-orange-900';
  }
}
