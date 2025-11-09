import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type { FinancialInputs, Summary, AmortizationRow } from './finance';
import type { SensitivityCell } from './sensitivity';

/**
 * Format number for Belgian locale
 */
export function formatNumber(n: number, decimals = 2): string {
  return new Intl.NumberFormat('nl-BE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/**
 * Download a file
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data as JSON
 */
export function exportJSON(inputs: FinancialInputs, summary: Summary): void {
  const data = { inputs, summary };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  downloadFile(blob, `${inputs.projectName.replace(/\s+/g, '_')}.json`);
}

/**
 * Export data as CSV
 */
export function exportCSV(data: any[][], filename: string): void {
  const csv = data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

/**
 * Export summary as CSV
 */
export function exportSummaryCSV(inputs: FinancialInputs, summary: Summary): void {
  const data: any[][] = [
    ['Metric', 'Value'],
    ['Project Name', inputs.projectName],
    [''],
    ['PROJECT COSTS', ''],
    ['Purchase Price', `€${formatNumber(inputs.purchasePrice)}`],
    ['Registration Tax', `€${formatNumber(summary.regTax)}`],
    ['Notary & Admin Fees', `€${formatNumber(inputs.notaryFees)}`],
    ['Renovation (incl. contingency)', `€${formatNumber(summary.renoWithCont)}`],
    ['TOTAL Project Cost', `€${formatNumber(summary.totalProject)}`],
    [''],
    ['SOURCES', ''],
    ['Own Cash', `€${formatNumber(inputs.ownCash)}`],
    ['Crypto (net)', `€${formatNumber(inputs.cryptoNet)}`],
    ['Family Loan', `€${formatNumber(inputs.familyLoanAmount)}`],
    ['Bank Loan', `€${formatNumber(inputs.bankLoanAmount)}`],
    ['TOTAL Sources', `€${formatNumber(summary.totalSources)}`],
    ['Funding Gap', `€${formatNumber(summary.fundingGap)}`],
    [''],
    ['AFFORDABILITY', ''],
    ['Bank Monthly Payment', `€${formatNumber(summary.bankMonthly)}`],
    ['Family Monthly Payment', `€${formatNumber(summary.familyMonthly)}`],
    ['TOTAL Monthly Debt', `€${formatNumber(summary.totalDebt)}`],
    ['Debt-to-Income %', `${formatNumber(summary.dtiPct)}%`],
    ['Net Income Monthly', `€${formatNumber(inputs.netIncomeMonthly)}`],
    ['Other Fixed Costs', `€${formatNumber(inputs.otherFixedCostsMonthly)}`],
    [
      'Airbnb Income',
      inputs.useAirbnbIncome ? `€${formatNumber(inputs.airbnbIncome)}` : '€0 (disabled)',
    ],
    ['Monthly Net After', `€${formatNumber(summary.netAfter)}`],
  ];

  exportCSV(data, `${inputs.projectName.replace(/\s+/g, '_')}_Summary.csv`);
}

/**
 * Export amortization table as CSV
 */
export function exportAmortCSV(
  rows: AmortizationRow[],
  filename: string,
  totalInterest: number,
  totalPrincipal: number
): void {
  const data: any[][] = [
    ['Month', 'Payment', 'Interest', 'Principal', 'Balance'],
    ...rows.map((r) => [
      r.month,
      formatNumber(r.payment),
      formatNumber(r.interest),
      formatNumber(r.principal),
      formatNumber(r.balance),
    ]),
    [''],
    ['TOTALS', '', formatNumber(totalInterest), formatNumber(totalPrincipal), ''],
  ];

  exportCSV(data, filename);
}

/**
 * Export sensitivity grid as CSV
 */
export function exportSensitivityCSV(
  grid: SensitivityCell[][],
  rates: number[],
  amounts: number[],
  filename: string
): void {
  const headers = ['Amount', ...rates.map((r) => `${r.toFixed(2)}%`)];
  const data: any[][] = [
    headers,
    ...grid.map((row, i) => [
      `€${formatNumber(amounts[i], 0)}`,
      ...row.map((cell) => formatNumber(cell.monthly)),
    ]),
  ];

  exportCSV(data, filename);
}

/**
 * Export as XLSX
 */
export function exportXLSX(
  inputs: FinancialInputs,
  summary: Summary,
  bankAmort: AmortizationRow[],
  famAmort: AmortizationRow[],
  sensitivityGrid: SensitivityCell[][],
  rates: number[],
  amounts: number[]
): void {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData: any[][] = [
    ['Brasschaat Villa Planner - Summary'],
    ['Project Name:', inputs.projectName],
    [''],
    ['PROJECT COSTS', ''],
    ['Purchase Price', inputs.purchasePrice],
    ['Registration Tax', summary.regTax],
    ['Notary & Admin Fees', inputs.notaryFees],
    ['Renovation (incl. contingency)', summary.renoWithCont],
    ['TOTAL Project Cost', summary.totalProject],
    [''],
    ['SOURCES', ''],
    ['Own Cash', inputs.ownCash],
    ['Crypto (net)', inputs.cryptoNet],
    ['Family Loan', inputs.familyLoanAmount],
    ['Bank Loan', inputs.bankLoanAmount],
    ['TOTAL Sources', summary.totalSources],
    ['Funding Gap', summary.fundingGap],
    [''],
    ['AFFORDABILITY', ''],
    ['Bank Monthly Payment', summary.bankMonthly],
    ['Family Monthly Payment', summary.familyMonthly],
    ['TOTAL Monthly Debt', summary.totalDebt],
    ['Debt-to-Income %', summary.dtiPct],
    ['Net Income Monthly', inputs.netIncomeMonthly],
    ['Other Fixed Costs', inputs.otherFixedCostsMonthly],
    [
      'Airbnb Income',
      inputs.useAirbnbIncome ? inputs.airbnbIncome : 0,
    ],
    ['Monthly Net After', summary.netAfter],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Bank amortization sheet
  const bankData = [
    ['Month', 'Payment', 'Interest', 'Principal', 'Balance'],
    ...bankAmort.map((r) => [r.month, r.payment, r.interest, r.principal, r.balance]),
  ];
  const bankSheet = XLSX.utils.aoa_to_sheet(bankData);
  XLSX.utils.book_append_sheet(wb, bankSheet, 'Bank Amortization');

  // Family amortization sheet
  const famData = [
    ['Month', 'Payment', 'Interest', 'Principal', 'Balance'],
    ...famAmort.map((r) => [r.month, r.payment, r.interest, r.principal, r.balance]),
  ];
  const famSheet = XLSX.utils.aoa_to_sheet(famData);
  XLSX.utils.book_append_sheet(wb, famSheet, 'Family Amortization');

  // Sensitivity sheet
  const sensHeaders = ['Amount', ...rates.map((r) => `${r.toFixed(2)}%`)];
  const sensData = [
    sensHeaders,
    ...sensitivityGrid.map((row, i) => [
      amounts[i],
      ...row.map((cell) => cell.monthly),
    ]),
  ];
  const sensSheet = XLSX.utils.aoa_to_sheet(sensData);
  XLSX.utils.book_append_sheet(wb, sensSheet, 'Sensitivity');

  // Write file
  XLSX.writeFile(wb, `${inputs.projectName.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Export as PDF using html2canvas + jsPDF
 */
export async function exportPDF(
  inputs: FinancialInputs,
  summary: Summary,
  bankAmort: AmortizationRow[]
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  let y = margin;

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Brasschaat Villa Planner', margin, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(inputs.projectName, margin, y);
  y += 6;

  pdf.setFontSize(9);
  pdf.text(new Date().toLocaleString('nl-BE'), margin, y);
  y += 10;

  // Summary section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Financial Summary', margin, y);
  y += 7;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const summaryItems = [
    `Total Project Cost: €${formatNumber(summary.totalProject, 0)}`,
    `Total Sources: €${formatNumber(summary.totalSources, 0)}`,
    `Funding Gap: €${formatNumber(summary.fundingGap, 0)}${summary.fundingGap > 0 ? ' ⚠️' : ''}`,
    ``,
    `Bank Monthly: €${formatNumber(summary.bankMonthly)}`,
    `Family Monthly: €${formatNumber(summary.familyMonthly)}`,
    `Total Debt Service: €${formatNumber(summary.totalDebt)}`,
    `Debt-to-Income: ${formatNumber(summary.dtiPct)}%${summary.dtiPct > 45 ? ' ⚠️' : ''}`,
    ``,
    `Net Income Monthly: €${formatNumber(inputs.netIncomeMonthly)}`,
    `Other Fixed Costs: €${formatNumber(inputs.otherFixedCostsMonthly)}`,
    `Airbnb Income: €${formatNumber(inputs.useAirbnbIncome ? inputs.airbnbIncome : 0)}`,
    `Monthly Net After: €${formatNumber(summary.netAfter)}${summary.netAfter < 0 ? ' ⚠️' : ''}`,
  ];

  summaryItems.forEach((item) => {
    if (item === '') {
      y += 3;
    } else {
      pdf.text(item, margin, y);
      y += 5;
    }
  });

  y += 5;

  // Project costs breakdown
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Project Costs', margin, y);
  y += 6;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const costs = [
    `Purchase Price: €${formatNumber(inputs.purchasePrice, 0)}`,
    `Registration Tax (${inputs.registrationRatePct}%): €${formatNumber(summary.regTax, 0)}`,
    `Notary & Admin: €${formatNumber(inputs.notaryFees, 0)}`,
    `Renovation (incl. ${inputs.contingencyPct}% contingency): €${formatNumber(summary.renoWithCont, 0)}`,
  ];

  costs.forEach((item) => {
    pdf.text(item, margin, y);
    y += 5;
  });

  y += 5;

  // Amortization preview (first 24 months)
  if (y + 60 > pageHeight - margin) {
    pdf.addPage();
    y = margin;
  }

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bank Amortization (First 24 months)', margin, y);
  y += 7;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');

  const preview = bankAmort.slice(0, 24);
  const colWidths = [15, 25, 25, 25, 30];
  const headers = ['Month', 'Payment', 'Interest', 'Principal', 'Balance'];

  // Table headers
  pdf.setFont('helvetica', 'bold');
  headers.forEach((h, i) => {
    const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    pdf.text(h, x, y);
  });
  y += 5;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  preview.forEach((row) => {
    if (y > pageHeight - margin - 10) {
      pdf.addPage();
      y = margin;
      // Repeat headers
      pdf.setFont('helvetica', 'bold');
      headers.forEach((h, i) => {
        const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        pdf.text(h, x, y);
      });
      y += 5;
      pdf.setFont('helvetica', 'normal');
    }

    const values = [
      String(row.month),
      `€${formatNumber(row.payment, 0)}`,
      `€${formatNumber(row.interest, 0)}`,
      `€${formatNumber(row.principal, 0)}`,
      `€${formatNumber(row.balance, 0)}`,
    ];

    values.forEach((v, i) => {
      const x = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      pdf.text(v, x, y);
    });
    y += 4;
  });

  // Report notes
  if (inputs.reportNotes) {
    if (y + 20 > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }

    y += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes', margin, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(inputs.reportNotes, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      if (y > pageHeight - margin - 10) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += 5;
    });
  }

  // Footer
  const footer = `Generated with Brasschaat Villa Planner | ${new Date().toLocaleDateString('nl-BE')}`;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save
  pdf.save(`${inputs.projectName.replace(/\s+/g, '_')}.pdf`);
}
