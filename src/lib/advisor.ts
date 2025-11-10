import type { FinancialInputs, Summary } from './finance';
import { pmt, round2 } from './finance';

export interface ScenarioAnalysis {
  name: string;
  rate: number;
  incomeDelta: number;
  bankMonthly: number;
  familyMonthly: number;
  totalDebt: number;
  dtiPct: number;
  monthlyNet: number;
  risk: 'Laag' | 'Gemiddeld' | 'Hoog';
}

export interface AIAnalysis {
  summaryText: string;
  riskLevel: string;
  riskColor: 'green' | 'yellow' | 'red';
  scenarios: ScenarioAnalysis[];
  recommendations: string[];
  fullText: string;
}

/**
 * Analyze financial situation and generate scenarios
 */
export function analyzeFinancials(
  inputs: FinancialInputs,
  summary: Summary
): AIAnalysis {
  // Generate 3 scenarios
  const scenarios = generateScenarios(inputs, summary);

  // Determine overall risk
  const { riskLevel, riskColor } = assessOverallRisk(summary, scenarios);

  // Generate summary text
  const summaryText = generateSummaryText(summary);

  // Generate recommendations
  const recommendations = generateRecommendations(inputs, summary, scenarios);

  // Generate full detailed text
  const fullText = generateFullText(inputs, summary, scenarios, recommendations);

  return {
    summaryText,
    riskLevel,
    riskColor,
    scenarios,
    recommendations,
    fullText,
  };
}

/**
 * Generate 3 scenarios: Optimistic, Realistic, Conservative
 */
function generateScenarios(
  inputs: FinancialInputs,
  summary: Summary
): ScenarioAnalysis[] {
  const scenarios: ScenarioAnalysis[] = [];

  // Scenario 1: Optimistisch (rente -0.5%, inkomen +10%)
  const optimisticRate = Math.max(0.5, inputs.bankRatePct - 0.5);
  const optimisticIncome = inputs.netIncomeMonthly * 1.1;
  scenarios.push(
    calculateScenario(
      'Optimistisch',
      optimisticRate,
      10,
      optimisticIncome,
      inputs,
      summary.familyMonthly
    )
  );

  // Scenario 2: Realistisch (huidige waarden)
  scenarios.push(
    calculateScenario(
      'Realistisch',
      inputs.bankRatePct,
      0,
      inputs.netIncomeMonthly,
      inputs,
      summary.familyMonthly
    )
  );

  // Scenario 3: Conservatief (rente +0.5%, inkomen -10%)
  const conservativeRate = inputs.bankRatePct + 0.5;
  const conservativeIncome = inputs.netIncomeMonthly * 0.9;
  scenarios.push(
    calculateScenario(
      'Conservatief',
      conservativeRate,
      -10,
      conservativeIncome,
      inputs,
      summary.familyMonthly
    )
  );

  return scenarios;
}

/**
 * Calculate a single scenario
 */
function calculateScenario(
  name: string,
  bankRate: number,
  incomeDelta: number,
  netIncome: number,
  inputs: FinancialInputs,
  familyMonthly: number
): ScenarioAnalysis {
  // Calculate bank monthly with adjusted rate
  const bankMonthly = pmt(
    bankRate / 100,
    inputs.bankTermYears,
    inputs.bankLoanAmount
  );

  const totalDebt = bankMonthly + familyMonthly;
  const dtiPct = netIncome > 0 ? (totalDebt / netIncome) * 100 : 100;

  const airbnb = inputs.useAirbnbIncome ? inputs.airbnbIncome : 0;
  const monthlyNet =
    netIncome - inputs.otherFixedCostsMonthly + airbnb - totalDebt;

  // Assess risk
  let risk: 'Laag' | 'Gemiddeld' | 'Hoog';
  if (dtiPct <= 45 && monthlyNet > 1000) {
    risk = 'Laag';
  } else if (dtiPct <= 55 && monthlyNet > 0) {
    risk = 'Gemiddeld';
  } else {
    risk = 'Hoog';
  }

  return {
    name,
    rate: round2(bankRate),
    incomeDelta,
    bankMonthly: round2(bankMonthly),
    familyMonthly: round2(familyMonthly),
    totalDebt: round2(totalDebt),
    dtiPct: round2(dtiPct),
    monthlyNet: round2(monthlyNet),
    risk,
  };
}

/**
 * Assess overall risk level
 */
function assessOverallRisk(
  summary: Summary,
  scenarios: ScenarioAnalysis[]
): { riskLevel: string; riskColor: 'green' | 'yellow' | 'red' } {
  const realisticScenario = scenarios[1]; // Middle scenario

  // Check funding gap
  if (summary.fundingGap > 0) {
    return {
      riskLevel: `Hoog risico — Tekort van €${Math.round(summary.fundingGap).toLocaleString('nl-BE')} in financiering`,
      riskColor: 'red',
    };
  }

  // Check realistic scenario risk
  if (realisticScenario.risk === 'Hoog') {
    return {
      riskLevel: 'Hoog risico — DTI te hoog en/of onvoldoende buffer',
      riskColor: 'red',
    };
  }

  if (realisticScenario.risk === 'Gemiddeld') {
    return {
      riskLevel: 'Gemiddeld risico — Haalbaar mits stabiel inkomen en buffer',
      riskColor: 'yellow',
    };
  }

  return {
    riskLevel: 'Laag risico — Financieel gezond en haalbaar',
    riskColor: 'green',
  };
}

/**
 * Generate summary text (2-4 sentences)
 */
function generateSummaryText(summary: Summary): string {
  const parts: string[] = [];

  // Total cost
  parts.push(
    `Het project kost in totaal €${Math.round(summary.totalProject).toLocaleString('nl-BE')}, waarvan €${Math.round(summary.totalSources).toLocaleString('nl-BE')} wordt gefinancierd via leningen en eigen middelen.`
  );

  // Funding gap
  if (summary.fundingGap > 0) {
    parts.push(
      `Er is een tekort van €${Math.round(summary.fundingGap).toLocaleString('nl-BE')} — dit moet opgevuld worden.`
    );
  } else if (summary.fundingGap < -10000) {
    parts.push(
      `Er is €${Math.round(Math.abs(summary.fundingGap)).toLocaleString('nl-BE')} overschot in de financiering.`
    );
  }

  // DTI assessment
  if (summary.dtiPct > 55) {
    parts.push(
      `De maandlast is erg hoog (DTI ${summary.dtiPct.toFixed(0)}%), wat banken als risicovol zien.`
    );
  } else if (summary.dtiPct > 45) {
    parts.push(
      `De maandlast is stevig (DTI ${summary.dtiPct.toFixed(0)}%), maar nog acceptabel voor de meeste banken.`
    );
  } else {
    parts.push(
      `De maandlast is gezond (DTI ${summary.dtiPct.toFixed(0)}%), ruim binnen de bankelijke normen.`
    );
  }

  // Monthly net
  if (summary.netAfter < 0) {
    parts.push(`Let op: er blijft maandelijks een tekort van €${Math.round(Math.abs(summary.netAfter)).toLocaleString('nl-BE')} over.`);
  } else if (summary.netAfter < 500) {
    parts.push(`De maandelijkse buffer is krap (€${Math.round(summary.netAfter).toLocaleString('nl-BE')}).`);
  } else if (summary.netAfter < 1500) {
    parts.push(`Er blijft maandelijks €${Math.round(summary.netAfter).toLocaleString('nl-BE')} over voor onverwachte kosten.`);
  } else {
    parts.push(`Er blijft een gezonde buffer van €${Math.round(summary.netAfter).toLocaleString('nl-BE')} per maand over.`);
  }

  return parts.join(' ');
}

/**
 * Generate recommendations (3-5 concrete points)
 */
function generateRecommendations(
  inputs: FinancialInputs,
  summary: Summary,
  scenarios: ScenarioAnalysis[]
): string[] {
  const recommendations: string[] = [];

  // Recommendation 1: Funding gap
  if (summary.fundingGap > 0) {
    const gap = Math.round(summary.fundingGap);
    recommendations.push(
      `Vul het tekort van €${gap.toLocaleString('nl-BE')} aan via extra familiale lening, eigen spaargeld, of verlaag de renovatiekosten.`
    );
  }

  // Recommendation 2: DTI too high
  if (summary.dtiPct > 45) {
    const reduction = Math.ceil((summary.totalDebt * inputs.netIncomeMonthly * 0.45 / 100) - summary.totalDebt);
    const loanReduction = Math.abs(Math.round(reduction * 12 * 10)); // Rough estimate

    if (summary.dtiPct > 55) {
      recommendations.push(
        `DTI is te hoog (${summary.dtiPct.toFixed(0)}%). Verlaag de banklening met circa €${loanReduction.toLocaleString('nl-BE')} of verhoog familiale lening om DTI onder 45% te brengen.`
      );
    } else {
      recommendations.push(
        `DTI van ${summary.dtiPct.toFixed(0)}% is acceptabel maar aan de hoge kant. Overweeg €${loanReduction.toLocaleString('nl-BE')} extra familiale steun voor meer comfort.`
      );
    }
  }

  // Recommendation 3: Buffer/emergency fund
  if (summary.netAfter < 1000) {
    recommendations.push(
      `Behoud minimaal €30.000–50.000 buffer (naast contingency) voor onverwachte zaken tijdens de renovatie.`
    );
  }

  // Recommendation 4: Interest rate risk
  const conservativeScenario = scenarios[2];
  if (conservativeScenario.dtiPct > 60) {
    recommendations.push(
      `Bij rentestijging naar ${conservativeScenario.rate}% loopt DTI op tot ${conservativeScenario.dtiPct.toFixed(0)}%. Overweeg rentevastperiode of kortere looptijd.`
    );
  }

  // Recommendation 5: Airbnb dependency
  if (inputs.useAirbnbIncome && inputs.airbnbIncome > 500) {
    recommendations.push(
      `Je plan rekent op €${inputs.airbnbIncome}/maand Airbnb-inkomen. Zorg dat het plan ook werkt zonder dit inkomen voor zekerheid.`
    );
  }

  // Recommendation 6: Contingency
  if (inputs.contingencyPct < 12) {
    recommendations.push(
      `Verhoog contingency naar minimaal 12–15% voor een villa uit de jaren '80 — onverwachte kosten zijn bijna zeker.`
    );
  }

  // Recommendation 7: Positive note if all is good
  if (
    summary.fundingGap <= 0 &&
    summary.dtiPct <= 45 &&
    summary.netAfter >= 1500 &&
    recommendations.length < 2
  ) {
    recommendations.push(
      `Het plan ziet er financieel solide uit. Zorg dat je inkomen stabiel blijft en bouw een extra buffer op voor rust.`
    );
  }

  // Limit to 5 recommendations
  return recommendations.slice(0, 5);
}

/**
 * Generate full detailed text
 */
function generateFullText(
  inputs: FinancialInputs,
  summary: Summary,
  scenarios: ScenarioAnalysis[],
  recommendations: string[]
): string {
  const sections: string[] = [];

  // Section 1: Project overview
  sections.push(`**Projectoverzicht**

De villa in Brasschaat heeft een aankoopprijs van €${inputs.purchasePrice.toLocaleString('nl-BE')}, met daarbovenop €${Math.round(summary.regTax).toLocaleString('nl-BE')} registratierechten (${inputs.registrationRatePct}%) en €${inputs.notaryFees.toLocaleString('nl-BE')} notariskosten. De renovatie kost €${inputs.renovationBudget.toLocaleString('nl-BE')}, met ${inputs.contingencyPct}% contingency komt dat op €${Math.round(summary.renoWithCont).toLocaleString('nl-BE')}. In totaal: €${Math.round(summary.totalProject).toLocaleString('nl-BE')}.`);

  // Section 2: Financing structure
  sections.push(`**Financieringsstructuur**

Je brengt zelf €${inputs.ownCash.toLocaleString('nl-BE')} cash in${inputs.cryptoNet > 0 ? ` + €${inputs.cryptoNet.toLocaleString('nl-BE')} crypto` : ''}. De familiale lening bedraagt €${inputs.familyLoanAmount.toLocaleString('nl-BE')} aan ${inputs.familyLoanRatePct}% over ${inputs.familyLoanTermYears} jaar (€${Math.round(summary.familyMonthly).toLocaleString('nl-BE')}/maand). De banklening is €${inputs.bankLoanAmount.toLocaleString('nl-BE')} aan ${inputs.bankRatePct}% over ${inputs.bankTermYears} jaar (€${Math.round(summary.bankMonthly).toLocaleString('nl-BE')}/maand).

Totale financiering: €${Math.round(summary.totalSources).toLocaleString('nl-BE')}.
${summary.fundingGap > 0 ? `⚠️ Tekort: €${Math.round(summary.fundingGap).toLocaleString('nl-BE')}` : summary.fundingGap < -10000 ? `✓ Overschot: €${Math.round(Math.abs(summary.fundingGap)).toLocaleString('nl-BE')}` : '✓ Perfect in balans'}`);

  // Section 3: Monthly affordability
  sections.push(`**Maandelijkse betaalbaarheid**

Netto gezinsinkomen: €${inputs.netIncomeMonthly.toLocaleString('nl-BE')}/maand
Schulddienst: €${Math.round(summary.totalDebt).toLocaleString('nl-BE')}/maand (€${Math.round(summary.bankMonthly).toLocaleString('nl-BE')} bank + €${Math.round(summary.familyMonthly).toLocaleString('nl-BE')} familie)
Andere vaste kosten: €${inputs.otherFixedCostsMonthly.toLocaleString('nl-BE')}/maand
${inputs.useAirbnbIncome ? `Airbnb-inkomen: +€${inputs.airbnbIncome.toLocaleString('nl-BE')}/maand` : 'Airbnb-inkomen: niet meegenomen'}

**DTI (Debt-to-Income): ${summary.dtiPct.toFixed(1)}%**
${summary.dtiPct <= 45 ? '✓ Gezond (≤45%)' : summary.dtiPct <= 55 ? '⚠ Acceptabel (45-55%)' : '❌ Te hoog (>55%)'}

**Maandelijks netto overschot: €${Math.round(summary.netAfter).toLocaleString('nl-BE')}**
${summary.netAfter >= 1500 ? '✓ Gezonde buffer' : summary.netAfter >= 500 ? '⚠ Krappe buffer' : '❌ Onvoldoende buffer'}`);

  // Section 4: Scenario comparison
  sections.push(`**Scenario-vergelijking**

${scenarios.map(s => `**${s.name}** (${s.incomeDelta > 0 ? '+' : ''}${s.incomeDelta}% inkomen, ${s.rate}% rente):
- Maandlast: €${Math.round(s.totalDebt).toLocaleString('nl-BE')}
- DTI: ${s.dtiPct.toFixed(1)}%
- Netto over: €${Math.round(s.monthlyNet).toLocaleString('nl-BE')}
- Risico: ${s.risk}`).join('\n\n')}`);

  // Section 5: Recommendations
  sections.push(`**Aanbevelingen**

${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n\n')}`);

  // Section 6: Important notes
  sections.push(`**Belangrijke opmerkingen**

- Deze analyse is gebaseerd op de door jou ingevulde cijfers en is geen vervanging voor professioneel financieel advies.
- Overleg met je bank over de actuele rentetarieven en voorwaarden.
- Bespreek de familiale lening met je notaris om alles correct vast te leggen.
- Plan een extra buffer voor onvoorziene uitgaven tijdens de renovatie.
- Zorg dat je inkomen stabiel blijft gedurende de looptijd van de leningen.`);

  return sections.join('\n\n');
}
