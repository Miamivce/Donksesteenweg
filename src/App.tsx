import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { RefreshCw } from 'lucide-react';
import { InputsForm } from './components/InputsForm';
import { SummaryCards } from './components/SummaryCards';
import { AmortTable } from './components/AmortTable';
import { Sensitivity } from './components/Sensitivity';
import { ScenarioManager } from './components/ScenarioManager';
import { ExportPanel } from './components/ExportPanel';
import { AdvisorPanel } from './components/AdvisorPanel';
import {
  DEFAULT_INPUTS,
  calculateSummary,
  buildAmort,
  type FinancialInputs,
} from './lib/finance';
import {
  generateSensitivityGrid,
  getAmounts,
  getRates,
  DEFAULT_SENSITIVITY_CONFIG,
} from './lib/sensitivity';

function App() {
  const [inputs, setInputs] = useState<FinancialInputs>(DEFAULT_INPUTS);

  const handleUpdate = (key: keyof FinancialInputs, value: string | number | boolean) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (confirm('Weet je zeker dat je alle inputs wilt resetten naar de standaardwaarden?')) {
      setInputs(DEFAULT_INPUTS);
    }
  };

  const handleLoadScenario = (scenarioInputs: FinancialInputs) => {
    setInputs(scenarioInputs);
  };

  // Calculations
  const summary = useMemo(() => calculateSummary(inputs), [inputs]);

  const bankAmort = useMemo(
    () => buildAmort(inputs.bankLoanAmount, inputs.bankRatePct / 100, inputs.bankTermYears),
    [inputs.bankLoanAmount, inputs.bankRatePct, inputs.bankTermYears]
  );

  const famAmort = useMemo(
    () =>
      buildAmort(
        inputs.familyLoanAmount,
        inputs.familyLoanRatePct / 100,
        inputs.familyLoanTermYears
      ),
    [inputs.familyLoanAmount, inputs.familyLoanRatePct, inputs.familyLoanTermYears]
  );

  const sensitivityGrid = useMemo(
    () =>
      generateSensitivityGrid(
        DEFAULT_SENSITIVITY_CONFIG,
        inputs.bankTermYears,
        summary.familyMonthly,
        inputs.netIncomeMonthly
      ),
    [inputs.bankTermYears, summary.familyMonthly, inputs.netIncomeMonthly]
  );

  const amounts = useMemo(() => getAmounts(sensitivityGrid), [sensitivityGrid]);
  const rates = useMemo(() => getRates(sensitivityGrid), [sensitivityGrid]);

  return (
    <div className="min-h-screen w-full bg-neutral-50 print:bg-white">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        {/* Header */}
        <header className="mb-6 space-y-2 print:mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
                Brasschaat Villa Planner
              </h1>
              <p className="text-neutral-600 mt-2">
                Waterdicht financieel plan voor aankoop + renovatie, inclusief familiale lening,
                gevoeligheid op rente, en cashflow.
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="print:hidden">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-8 mb-6 print:hidden">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="summary">Overzicht</TabsTrigger>
            <TabsTrigger value="ai-advies">AI-Advies</TabsTrigger>
            <TabsTrigger value="amort-bank">Bank</TabsTrigger>
            <TabsTrigger value="amort-fam">Familie</TabsTrigger>
            <TabsTrigger value="sensitivity">Gevoeligheid</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario&apos;s</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-6">
            <InputsForm inputs={inputs} onUpdate={handleUpdate} />
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <SummaryCards inputs={inputs} summary={summary} />
          </TabsContent>

          {/* AI Advisor Tab */}
          <TabsContent value="ai-advies" className="space-y-6">
            <AdvisorPanel inputs={inputs} summary={summary} />
          </TabsContent>

          {/* Bank Amortization Tab */}
          <TabsContent value="amort-bank">
            <AmortTable
              title="Bank amortisatietabel"
              rows={bankAmort}
              filename={`${inputs.projectName.replace(/\s+/g, '_')}_Bank_Amortisatie.csv`}
            />
          </TabsContent>

          {/* Family Amortization Tab */}
          <TabsContent value="amort-fam">
            <AmortTable
              title="Familie amortisatietabel"
              rows={famAmort}
              filename={`${inputs.projectName.replace(/\s+/g, '_')}_Familie_Amortisatie.csv`}
            />
          </TabsContent>

          {/* Sensitivity Tab */}
          <TabsContent value="sensitivity">
            <Sensitivity inputs={inputs} />
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios">
            <ScenarioManager currentInputs={inputs} onLoadScenario={handleLoadScenario} />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <ExportPanel
              inputs={inputs}
              summary={summary}
              bankAmort={bankAmort}
              famAmort={famAmort}
              sensitivityGrid={sensitivityGrid}
              rates={rates}
              amounts={amounts}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground print:hidden">
          <p>
            Brasschaat Villa Planner © {new Date().getFullYear()} | Alle data blijft lokaal in je
            browser
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
