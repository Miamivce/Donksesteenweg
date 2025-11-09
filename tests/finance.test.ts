import { describe, it, expect } from 'vitest';
import {
  pmt,
  buildAmort,
  calculateSummary,
  getAmortTotals,
  toNumber,
  round2,
  DEFAULT_INPUTS,
} from '../src/lib/finance';

describe('Finance utilities', () => {
  describe('toNumber', () => {
    it('should convert string to number', () => {
      expect(toNumber('123')).toBe(123);
      expect(toNumber('123.45')).toBe(123.45);
    });

    it('should handle formatted strings', () => {
      expect(toNumber('€1,234.56')).toBe(1234.56);
    });

    it('should return default for invalid input', () => {
      expect(toNumber('invalid', 0)).toBe(0);
      expect(toNumber('invalid', 100)).toBe(100);
    });
  });

  describe('round2', () => {
    it('should round to 2 decimal places', () => {
      expect(round2(123.456)).toBe(123.46);
      expect(round2(123.454)).toBe(123.45);
    });
  });

  describe('pmt', () => {
    it('should calculate monthly payment correctly', () => {
      // 100k loan at 4% for 20 years
      const payment = pmt(0.04, 20, 100000);
      expect(payment).toBeCloseTo(605.98, 1);
    });

    it('should handle 0% interest rate', () => {
      const payment = pmt(0, 10, 120000);
      expect(payment).toBe(1000); // 120000 / 120 months
    });

    it('should return 0 for 0 principal', () => {
      expect(pmt(0.04, 20, 0)).toBe(0);
    });

    it('should return 0 for 0 years', () => {
      expect(pmt(0.04, 0, 100000)).toBe(0);
    });

    it('should match known calculation', () => {
      // Real example: €850k at 4% for 25 years
      const payment = pmt(0.04, 25, 850000);
      expect(payment).toBeCloseTo(4484.01, 1);
    });
  });

  describe('buildAmort', () => {
    it('should build correct amortization table', () => {
      const amort = buildAmort(100000, 0.04, 10);

      // Should have 120 rows (10 years * 12 months)
      expect(amort).toHaveLength(120);

      // First row
      expect(amort[0].month).toBe(1);
      expect(amort[0].balance).toBeLessThan(100000);

      // Last row
      expect(amort[119].month).toBe(120);
      expect(amort[119].balance).toBe(0);
    });

    it('should have consistent payments', () => {
      const amort = buildAmort(100000, 0.04, 10);
      const firstPayment = amort[0].payment;

      // All payments should be equal (except possibly the last due to rounding)
      amort.forEach((row, idx) => {
        if (idx < amort.length - 1) {
          expect(row.payment).toBeCloseTo(firstPayment, 2);
        }
      });
    });

    it('should have decreasing interest over time', () => {
      const amort = buildAmort(100000, 0.04, 10);

      // Interest should decrease
      expect(amort[0].interest).toBeGreaterThan(amort[60].interest);
      expect(amort[60].interest).toBeGreaterThan(amort[119].interest);
    });

    it('should have increasing principal over time', () => {
      const amort = buildAmort(100000, 0.04, 10);

      // Principal should increase
      expect(amort[0].principal).toBeLessThan(amort[60].principal);
      expect(amort[60].principal).toBeLessThan(amort[119].principal);
    });
  });

  describe('getAmortTotals', () => {
    it('should calculate correct totals', () => {
      const amort = buildAmort(100000, 0.04, 10);
      const totals = getAmortTotals(amort);

      // Total principal should equal original loan
      expect(totals.totalPrincipal).toBeCloseTo(100000, 0);

      // Total interest should be positive
      expect(totals.totalInterest).toBeGreaterThan(0);

      // Total interest + principal should equal total paid
      const totalPaid = amort[0].payment * amort.length;
      expect(totals.totalInterest + totals.totalPrincipal).toBeCloseTo(totalPaid, 0);
    });
  });

  describe('calculateSummary', () => {
    it('should calculate all metrics correctly', () => {
      const summary = calculateSummary(DEFAULT_INPUTS);

      // Registration tax should be 2% of purchase price
      expect(summary.regTax).toBe(700000 * 0.02);

      // Renovation with contingency
      expect(summary.renoWithCont).toBe(450000 * 1.12);

      // Total project
      const expectedTotal = 700000 + summary.regTax + 5000 + summary.renoWithCont;
      expect(summary.totalProject).toBeCloseTo(expectedTotal, 0);

      // Total sources
      const expectedSources = 30000 + 0 + 200000 + 850000;
      expect(summary.totalSources).toBe(expectedSources);

      // Funding gap
      expect(summary.fundingGap).toBe(summary.totalProject - summary.totalSources);
    });

    it('should calculate DTI correctly', () => {
      const summary = calculateSummary(DEFAULT_INPUTS);
      const expectedDTI = (summary.totalDebt / DEFAULT_INPUTS.netIncomeMonthly) * 100;
      expect(summary.dtiPct).toBeCloseTo(expectedDTI, 1);
    });

    it('should handle disabled Airbnb income', () => {
      const inputs = { ...DEFAULT_INPUTS, useAirbnbIncome: false };
      const summary = calculateSummary(inputs);

      // Net after should not include Airbnb
      const expected =
        inputs.netIncomeMonthly - inputs.otherFixedCostsMonthly - summary.totalDebt;
      expect(summary.netAfter).toBeCloseTo(expected, 0);
    });

    it('should include Airbnb when enabled', () => {
      const inputs = { ...DEFAULT_INPUTS, useAirbnbIncome: true };
      const summary = calculateSummary(inputs);

      // Net after should include Airbnb
      const expected =
        inputs.netIncomeMonthly -
        inputs.otherFixedCostsMonthly +
        inputs.airbnbIncome -
        summary.totalDebt;
      expect(summary.netAfter).toBeCloseTo(expected, 0);
    });
  });
});
