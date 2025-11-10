import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import type { FinancialInputs, Summary } from '../lib/finance';
import { analyzeFinancials, type AIAnalysis } from '../lib/advisor';
import { formatNumber } from '../lib/export';

interface AdvisorPanelProps {
  inputs: FinancialInputs;
  summary: Summary;
}

export function AdvisorPanel({ inputs, summary }: AdvisorPanelProps) {
  const [showFullText, setShowFullText] = useState(false);

  // Generate AI analysis
  const analysis: AIAnalysis = useMemo(() => {
    return analyzeFinancials(inputs, summary);
  }, [inputs, summary]);

  const handleExportPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Financieel Advies - ${inputs.projectName}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #1f2937; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .risk-low { color: #059669; }
          .risk-medium { color: #d97706; }
          .risk-high { color: #dc2626; }
          ul { line-height: 1.8; }
          .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          pre { white-space: pre-wrap; font-family: inherit; line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>AI Financieel Advies</h1>
        <p><strong>Project:</strong> ${inputs.projectName}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-BE')}</p>

        <div class="summary">
          <h2>Samenvatting</h2>
          <p>${analysis.summaryText}</p>
          <p><strong>Risico-indicatie:</strong> ${analysis.riskLevel}</p>
        </div>

        <h2>Scenario-analyse</h2>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Rente</th>
              <th>Inkomen</th>
              <th>Maandlast</th>
              <th>DTI %</th>
              <th>Netto marge</th>
              <th>Risico</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.scenarios.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.rate.toFixed(1)}%</td>
                <td>${s.incomeDelta > 0 ? '+' : ''}${s.incomeDelta}%</td>
                <td>€${formatNumber(s.totalDebt, 0)}</td>
                <td>${formatNumber(s.dtiPct, 1)}%</td>
                <td>€${formatNumber(s.monthlyNet, 0)}</td>
                <td class="risk-${s.risk === 'Laag' ? 'low' : s.risk === 'Gemiddeld' ? 'medium' : 'high'}">${s.risk}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Aanbevelingen</h2>
        <ul>
          ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>

        <h2>Uitgebreide analyse</h2>
        <pre>${analysis.fullText}</pre>

        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Risk icon
  const RiskIcon =
    analysis.riskColor === 'green'
      ? CheckCircle
      : analysis.riskColor === 'yellow'
      ? AlertTriangle
      : AlertCircle;

  const riskColorClass =
    analysis.riskColor === 'green'
      ? 'bg-green-50 border-green-300 text-green-900'
      : analysis.riskColor === 'yellow'
      ? 'bg-yellow-50 border-yellow-300 text-yellow-900'
      : 'bg-red-50 border-red-300 text-red-900';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <CardTitle>AI Financieel Advies</CardTitle>
            </div>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporteer PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Op basis van je ingevoerde cijfers analyseert de AI je financiële situatie en
            genereert verschillende scenario&apos;s met concrete aanbevelingen.
          </p>
        </CardContent>
      </Card>

      {/* Summary Balloon */}
      <Card className={`shadow-md border-2 ${riskColorClass}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <RiskIcon className="w-8 h-8 flex-shrink-0 mt-1" />
            <div className="flex-1 space-y-3">
              <p className="text-base leading-relaxed">{analysis.summaryText}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-current/20">
                <span className="font-semibold">Risico-indicatie:</span>
                <span>{analysis.riskLevel}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Scenario-vergelijking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">Scenario</th>
                  <th className="p-3 text-right font-semibold">Rente</th>
                  <th className="p-3 text-right font-semibold">Inkomen</th>
                  <th className="p-3 text-right font-semibold">Maandlast</th>
                  <th className="p-3 text-right font-semibold">DTI %</th>
                  <th className="p-3 text-right font-semibold">Netto marge</th>
                  <th className="p-3 text-center font-semibold">Risico</th>
                </tr>
              </thead>
              <tbody>
                {analysis.scenarios.map((scenario, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      idx === 1 ? 'bg-blue-50 font-semibold' : 'odd:bg-white even:bg-neutral-50'
                    }`}
                  >
                    <td className="p-3">
                      {scenario.name}
                      {idx === 1 && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          Huidig
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {scenario.rate.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right font-mono">
                      {scenario.incomeDelta > 0 ? '+' : ''}
                      {scenario.incomeDelta}%
                    </td>
                    <td className="p-3 text-right font-mono">
                      €{formatNumber(scenario.totalDebt, 0)}
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-semibold ${
                        scenario.dtiPct <= 45
                          ? 'text-green-700'
                          : scenario.dtiPct <= 55
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}
                    >
                      {formatNumber(scenario.dtiPct, 1)}%
                    </td>
                    <td
                      className={`p-3 text-right font-mono ${
                        scenario.monthlyNet >= 1500
                          ? 'text-green-700'
                          : scenario.monthlyNet >= 500
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}
                    >
                      €{formatNumber(scenario.monthlyNet, 0)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          scenario.risk === 'Laag'
                            ? 'bg-green-100 text-green-800'
                            : scenario.risk === 'Gemiddeld'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {scenario.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * Optimistisch: rente −0.5%, inkomen +10% | Conservatief: rente +0.5%, inkomen
            −10%
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Aanbevelingen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm leading-relaxed pt-0.5">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Full Text (Expandable) */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Uitgebreide analyse</CardTitle>
            <Button
              onClick={() => setShowFullText(!showFullText)}
              variant="ghost"
              size="sm"
            >
              {showFullText ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Verberg
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Toon meer
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showFullText && (
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div
                className="whitespace-pre-wrap text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: analysis.fullText
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>'),
                }}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Disclaimer */}
      <Card className="shadow-sm bg-neutral-50">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> Deze AI-analyse is gebaseerd op de door jou
            ingevulde cijfers en dient als indicatie. Het is geen vervanging voor
            professioneel financieel, fiscaal of juridisch advies. Raadpleeg altijd je bank,
            notaris en accountant voordat je definitieve beslissingen neemt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
