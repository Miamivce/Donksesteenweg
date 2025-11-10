export interface FinancialInputs {
  // Project costs
  purchasePrice: number;
  registrationRatePct: number;
  notaryFees: number;
  renovationBudget: number;
  contingencyPct: number;

  // Sources
  ownCash: number;
  cryptoNet: number;
  familyLoanAmount: number;
  familyLoanRatePct: number;
  familyLoanTermYears: number;
  bankLoanAmount: number;
  bankRatePct: number;
  bankTermYears: number;

  // Income & costs
  netIncomeMonthly: number;
  otherFixedCostsMonthly: number;
  airbnbIncome: number;
  useAirbnbIncome: boolean;

  // Optional
  businessUsePct: number;
  projectName: string;
  reportNotes: string;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface Summary {
  regTax: number;
  renoWithCont: number;
  totalProject: number;
  totalSources: number;
  fundingGap: number;
  bankMonthly: number;
  familyMonthly: number;
  totalDebt: number;
  dtiPct: number;
  netAfter: number;
}

/**
 * Round to 2 decimal places
 */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Convert any value to number, defaulting to 0
 */
export const toNumber = (v: any, d = 0): number => {
  const n = typeof v === "string" ? v.replace(/[^0-9.-]/g, "") : v;
  const parsed = Number(n);
  return Number.isFinite(parsed) ? parsed : d;
};

/**
 * Calculate monthly payment using PMT formula
 * PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 * If rate = 0: PMT = P / n
 */
export function pmt(rateAnnual: number, years: number, principal: number): number {
  const m = years * 12;
  const r = rateAnnual / 12;

  if (principal <= 0 || years <= 0) return 0;
  if (rateAnnual <= 0) return principal / m;

  return (principal * (r * Math.pow(1 + r, m))) / (Math.pow(1 + r, m) - 1);
}

/**
 * Build amortization table
 */
export function buildAmort(
  principal: number,
  rateAnnual: number,
  years: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  const m = years * 12;
  const pay = pmt(rateAnnual, years, principal);
  let bal = principal;
  const r = rateAnnual / 12;

  for (let i = 1; i <= m; i++) {
    const interest = bal * r;
    const princ = Math.min(pay - interest, bal);
    bal = Math.max(0, bal - princ);
    rows.push({
      month: i,
      payment: round2(pay),
      interest: round2(interest),
      principal: round2(princ),
      balance: round2(bal),
    });
  }

  return rows;
}

/**
 * Calculate summary metrics
 */
export function calculateSummary(inputs: FinancialInputs): Summary {
  const regTax = inputs.purchasePrice * (inputs.registrationRatePct / 100);
  const renoWithCont = inputs.renovationBudget * (1 + inputs.contingencyPct / 100);
  const totalProject = inputs.purchasePrice + regTax + inputs.notaryFees + renoWithCont;

  const totalSources =
    inputs.ownCash +
    inputs.cryptoNet +
    inputs.familyLoanAmount +
    inputs.bankLoanAmount;
  const fundingGap = round2(totalProject - totalSources);

  const bankMonthly = pmt(
    inputs.bankRatePct / 100,
    inputs.bankTermYears,
    inputs.bankLoanAmount
  );
  const familyMonthly = pmt(
    inputs.familyLoanRatePct / 100,
    inputs.familyLoanTermYears,
    inputs.familyLoanAmount
  );
  const totalDebt = bankMonthly + familyMonthly;

  const airbnb = inputs.useAirbnbIncome ? inputs.airbnbIncome : 0;
  const netAfter =
    inputs.netIncomeMonthly - inputs.otherFixedCostsMonthly + airbnb - totalDebt;
  const dtiPct =
    inputs.netIncomeMonthly > 0 ? (totalDebt / inputs.netIncomeMonthly) * 100 : 0;

  return {
    regTax: round2(regTax),
    renoWithCont: round2(renoWithCont),
    totalProject: round2(totalProject),
    totalSources: round2(totalSources),
    fundingGap,
    bankMonthly: round2(bankMonthly),
    familyMonthly: round2(familyMonthly),
    totalDebt: round2(totalDebt),
    dtiPct: round2(dtiPct),
    netAfter: round2(netAfter),
  };
}

/**
 * Calculate total interest and principal from amortization table
 */
export function getAmortTotals(rows: AmortizationRow[]) {
  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);
  return {
    totalInterest: round2(totalInterest),
    totalPrincipal: round2(totalPrincipal),
  };
}

/**
 * Calculate bank loan amount automatically based on project costs and other sources
 * Bank Loan = Total Project - Own Cash - Crypto - Family Loan
 */
export function calculateBankLoanAmount(inputs: FinancialInputs): number {
  const regTax = inputs.purchasePrice * (inputs.registrationRatePct / 100);
  const renoWithCont = inputs.renovationBudget * (1 + inputs.contingencyPct / 100);
  const totalProject = inputs.purchasePrice + regTax + inputs.notaryFees + renoWithCont;

  const otherSources = inputs.ownCash + inputs.cryptoNet + inputs.familyLoanAmount;
  const bankLoan = totalProject - otherSources;

  // Bank loan cannot be negative
  return Math.max(0, round2(bankLoan));
}

/**
 * Default inputs matching the spec
 */
const DEFAULT_INPUTS_BASE = {
  purchasePrice: 700000,
  registrationRatePct: 2,
  notaryFees: 5000,
  renovationBudget: 450000,
  contingencyPct: 12,
  ownCash: 30000,
  cryptoNet: 0,
  familyLoanAmount: 200000,
  familyLoanRatePct: 1.5,
  familyLoanTermYears: 15,
  bankLoanAmount: 0, // Will be calculated
  bankRatePct: 4,
  bankTermYears: 25,
  airbnbIncome: 800,
  useAirbnbIncome: true,
  businessUsePct: 15,
  netIncomeMonthly: 10500,
  otherFixedCostsMonthly: 1500,
  projectName: "Brasschaat Villa Plan",
  reportNotes: "",
};

// Calculate bank loan amount automatically
export const DEFAULT_INPUTS: FinancialInputs = {
  ...DEFAULT_INPUTS_BASE,
  bankLoanAmount: calculateBankLoanAmount(DEFAULT_INPUTS_BASE as FinancialInputs),
};
