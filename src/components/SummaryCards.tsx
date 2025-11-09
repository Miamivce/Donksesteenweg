import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { FinancialInputs, Summary } from '../lib/finance';
import { formatNumber } from '../lib/export';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface SummaryCardsProps {
  inputs: FinancialInputs;
  summary: Summary;
}

function MetricRow({
  label,
  value,
  isBold = false,
  warn = false,
  success = false,
  tooltip,
}: {
  label: string;
  value: string | number;
  isBold?: boolean;
  warn?: boolean;
  success?: boolean;
  tooltip?: string;
}) {
  const textColor = warn ? 'text-red-600' : success ? 'text-green-600' : '';
  const fontWeight = isBold ? 'font-semibold' : '';

  return (
    <div
      className={`flex items-start justify-between py-1 ${fontWeight} ${textColor}`}
      title={tooltip}
    >
      <span className="flex items-center gap-1">
        {label}
        {tooltip && <Info className="w-3 h-3 text-muted-foreground" />}
      </span>
      <span className="text-right">
        {typeof value === 'number' ? `€ ${formatNumber(value, 0)}` : value}
      </span>
    </div>
  );
}

export function SummaryCards({ inputs, summary }: SummaryCardsProps) {
  // Determine affordability status
  const isFundingGapBad = summary.fundingGap > 0;
  const isDTIAmber = summary.dtiPct > 45;
  const isDTIRed = summary.dtiPct > 55;
  const isNetAfterBad = summary.netAfter < 0;

  // Overall affordability assessment
  const hasIssues = isFundingGapBad || isDTIRed || isNetAfterBad;
  const needsAttention = !hasIssues && isDTIAmber;
  const looksGood = !hasIssues && !needsAttention;

  return (
    <div className="space-y-4">
      {/* Affordability Banner */}
      <Card
        className={`shadow-sm ${
          hasIssues
            ? 'bg-red-50 border-red-300'
            : needsAttention
            ? 'bg-yellow-50 border-yellow-300'
            : 'bg-green-50 border-green-300'
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {hasIssues && <AlertTriangle className="w-6 h-6 text-red-600" />}
            {needsAttention && <Info className="w-6 h-6 text-yellow-600" />}
            {looksGood && <CheckCircle2 className="w-6 h-6 text-green-600" />}
            <div>
              <h3
                className={`text-lg font-semibold ${
                  hasIssues
                    ? 'text-red-900'
                    : needsAttention
                    ? 'text-yellow-900'
                    : 'text-green-900'
                }`}
              >
                {hasIssues
                  ? 'Financieel niet haalbaar in huidige vorm'
                  : needsAttention
                  ? 'Haalbaar maar krap'
                  : 'Financieel gezond en haalbaar'}
              </h3>
              <p
                className={`text-sm ${
                  hasIssues
                    ? 'text-red-700'
                    : needsAttention
                    ? 'text-yellow-700'
                    : 'text-green-700'
                }`}
              >
                {hasIssues
                  ? 'Er zijn ernstige aandachtspunten. Pas de parameters aan.'
                  : needsAttention
                  ? 'Let op: DTI is hoog. Overweeg meer eigen inbreng of lagere lening.'
                  : 'Goede balans tussen lening en eigen middelen. Presenteerbaar aan bank.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Project Cost */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Projectkost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <MetricRow
              label="Aankoopprijs"
              value={inputs.purchasePrice}
              tooltip="De prijs van de woning"
            />
            <MetricRow
              label={`Registratierechten (${inputs.registrationRatePct}%)`}
              value={summary.regTax}
              tooltip="Belasting bij aankoop (2% voor enige eigen woning)"
            />
            <MetricRow
              label="Notaris & admin"
              value={inputs.notaryFees}
              tooltip="Notariskosten en administratie"
            />
            <MetricRow
              label={`Renovatie (incl. ${inputs.contingencyPct}% buffer)`}
              value={summary.renoWithCont}
              tooltip="Renovatiebudget met contingency voor onvoorziene kosten"
            />
            <hr className="my-2" />
            <MetricRow
              label="TOTALE PROJECTKOST"
              value={summary.totalProject}
              isBold
              tooltip="Totale investering vereist"
            />
          </CardContent>
        </Card>

        {/* Sources */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Financieringsbronnen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <MetricRow
              label="Eigen cash"
              value={inputs.ownCash}
              tooltip="Beschikbare eigen spaargeld"
            />
            <MetricRow
              label="Crypto (netto)"
              value={inputs.cryptoNet}
              tooltip="Bitcoin of andere crypto (optioneel)"
            />
            <MetricRow
              label="Familiale lening"
              value={inputs.familyLoanAmount}
              tooltip={`Van vader: ${inputs.familyLoanRatePct}% over ${inputs.familyLoanTermYears} jaar`}
            />
            <MetricRow
              label="Banklening"
              value={inputs.bankLoanAmount}
              tooltip={`${inputs.bankRatePct}% over ${inputs.bankTermYears} jaar`}
            />
            <hr className="my-2" />
            <MetricRow label="TOTALE BRONNEN" value={summary.totalSources} />
            <MetricRow
              label="Funding gap"
              value={summary.fundingGap}
              isBold
              warn={summary.fundingGap > 0}
              success={summary.fundingGap <= 0}
              tooltip={
                summary.fundingGap > 0
                  ? 'Tekort! Verhoog financiering of verlaag kosten'
                  : 'Voldoende financiering'
              }
            />
          </CardContent>
        </Card>

        {/* Affordability */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Betaalbaarheid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <MetricRow
              label="Bank maandlast"
              value={summary.bankMonthly}
              tooltip="Maandelijkse afbetaling banklening"
            />
            <MetricRow
              label="Familie maandlast"
              value={summary.familyMonthly}
              tooltip="Maandelijkse afbetaling familiale lening"
            />
            <MetricRow
              label="TOTALE MAANDLAST"
              value={summary.totalDebt}
              isBold
              tooltip="Totale schulddienst per maand"
            />
            <MetricRow
              label="Debt-to-Income (DTI)"
              value={`${formatNumber(summary.dtiPct)}%`}
              warn={summary.dtiPct > 55}
              success={summary.dtiPct <= 45}
              tooltip={
                summary.dtiPct <= 45
                  ? 'Gezond (≤45%)'
                  : summary.dtiPct <= 55
                  ? 'Krap (45-55%)'
                  : 'Te hoog (>55%)'
              }
            />
            <hr className="my-2" />
            <MetricRow
              label="Netto gezinsinkomen"
              value={inputs.netIncomeMonthly}
              tooltip="Maandelijks netto gezinsinkomen"
            />
            <MetricRow
              label="- Andere vaste kosten"
              value={inputs.otherFixedCostsMonthly}
              tooltip="Auto, verzekeringen, kinderopvang, etc."
            />
            <MetricRow
              label={`+ Airbnb ${inputs.useAirbnbIncome ? '' : '(uit)'}`}
              value={inputs.useAirbnbIncome ? inputs.airbnbIncome : 0}
              tooltip="Bijgebouw verhuur"
            />
            <MetricRow
              label="- Totale maandlast"
              value={summary.totalDebt}
              tooltip="Schulddienst"
            />
            <hr className="my-2" />
            <MetricRow
              label="NETTO OVERSCHOT/TEKORT"
              value={summary.netAfter}
              isBold
              warn={summary.netAfter < 0}
              success={summary.netAfter > 1000}
              tooltip={
                summary.netAfter < 0
                  ? 'Tekort! Onhoudbaar'
                  : summary.netAfter < 500
                  ? 'Weinig buffer'
                  : 'Gezonde buffer'
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
