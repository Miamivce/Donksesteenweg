import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import type { FinancialInputs } from '../lib/finance';
import { toNumber } from '../lib/finance';

interface InputsFormProps {
  inputs: FinancialInputs;
  onUpdate: (key: keyof FinancialInputs, value: string | number | boolean) => void;
}

export function InputsForm({ inputs, onUpdate }: InputsFormProps) {
  const handleNumberInput = (key: keyof FinancialInputs, value: string) => {
    const num = toNumber(value, 0);
    onUpdate(key, Math.max(0, num)); // Clamp to non-negative
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Project informatie</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project naam</Label>
              <Input
                id="projectName"
                value={inputs.projectName}
                onChange={(e) => onUpdate('projectName', e.target.value)}
                placeholder="Brasschaat Villa Plan"
              />
            </div>
          </div>
        </div>

        {/* Project Costs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Projectkosten</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Aankoopprijs (€)</Label>
              <Input
                id="purchasePrice"
                type="text"
                inputMode="decimal"
                value={inputs.purchasePrice}
                onChange={(e) => handleNumberInput('purchasePrice', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationRate">Registratierechten (%)</Label>
              <Input
                id="registrationRate"
                type="text"
                inputMode="decimal"
                value={inputs.registrationRatePct}
                onChange={(e) => handleNumberInput('registrationRatePct', e.target.value)}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Standaard 2% voor enige eigen woning
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notaryFees">Notaris & admin (€)</Label>
              <Input
                id="notaryFees"
                type="text"
                inputMode="decimal"
                value={inputs.notaryFees}
                onChange={(e) => handleNumberInput('notaryFees', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renovationBudget">Renovatiebudget (€)</Label>
              <Input
                id="renovationBudget"
                type="text"
                inputMode="decimal"
                value={inputs.renovationBudget}
                onChange={(e) => handleNumberInput('renovationBudget', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contingency">Contingency (%)</Label>
              <Input
                id="contingency"
                type="text"
                inputMode="decimal"
                value={inputs.contingencyPct}
                onChange={(e) => handleNumberInput('contingencyPct', e.target.value)}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">Aanbevolen: 10-15%</p>
            </div>
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Financieringsbronnen</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownCash">Eigen cash (€)</Label>
              <Input
                id="ownCash"
                type="text"
                inputMode="decimal"
                value={inputs.ownCash}
                onChange={(e) => handleNumberInput('ownCash', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cryptoNet">Crypto (netto, €)</Label>
              <Input
                id="cryptoNet"
                type="text"
                inputMode="decimal"
                value={inputs.cryptoNet}
                onChange={(e) => handleNumberInput('cryptoNet', e.target.value)}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">Optioneel, enkel indien nodig</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyLoanAmount">Familiale lening - bedrag (€)</Label>
              <Input
                id="familyLoanAmount"
                type="text"
                inputMode="decimal"
                value={inputs.familyLoanAmount}
                onChange={(e) => handleNumberInput('familyLoanAmount', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyLoanRate">Familiale lening - rente (%)</Label>
              <Input
                id="familyLoanRate"
                type="text"
                inputMode="decimal"
                value={inputs.familyLoanRatePct}
                onChange={(e) => handleNumberInput('familyLoanRatePct', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyLoanTerm">Familiale lening - looptijd (jaren)</Label>
              <Input
                id="familyLoanTerm"
                type="text"
                inputMode="decimal"
                value={inputs.familyLoanTermYears}
                onChange={(e) => handleNumberInput('familyLoanTermYears', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bankLoanAmount">Banklening - bedrag (€)</Label>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                  Auto-berekend
                </span>
              </div>
              <Input
                id="bankLoanAmount"
                type="text"
                inputMode="decimal"
                value={inputs.bankLoanAmount}
                disabled
                className="text-right bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Automatisch berekend op basis van projectkosten minus andere financiering
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankRate">Banklening - rente (%)</Label>
              <Input
                id="bankRate"
                type="text"
                inputMode="decimal"
                value={inputs.bankRatePct}
                onChange={(e) => handleNumberInput('bankRatePct', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankTerm">Banklening - looptijd (jaren)</Label>
              <Input
                id="bankTerm"
                type="text"
                inputMode="decimal"
                value={inputs.bankTermYears}
                onChange={(e) => handleNumberInput('bankTermYears', e.target.value)}
                className="text-right"
              />
            </div>
          </div>
        </div>

        {/* Income & Costs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Inkomen & kosten</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="netIncome">Netto gezinsinkomen (€/maand)</Label>
              <Input
                id="netIncome"
                type="text"
                inputMode="decimal"
                value={inputs.netIncomeMonthly}
                onChange={(e) => handleNumberInput('netIncomeMonthly', e.target.value)}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Conservatief, na belastingen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherCosts">Andere vaste kosten (€/maand)</Label>
              <Input
                id="otherCosts"
                type="text"
                inputMode="decimal"
                value={inputs.otherFixedCostsMonthly}
                onChange={(e) =>
                  handleNumberInput('otherFixedCostsMonthly', e.target.value)
                }
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Auto, verzekeringen, kinderopvang, etc.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="airbnbIncome">Airbnb-inkomen (€/maand)</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="useAirbnb" className="text-xs text-muted-foreground">
                    Gebruiken
                  </Label>
                  <Switch
                    id="useAirbnb"
                    checked={inputs.useAirbnbIncome}
                    onCheckedChange={(checked) => onUpdate('useAirbnbIncome', checked)}
                  />
                </div>
              </div>
              <Input
                id="airbnbIncome"
                type="text"
                inputMode="decimal"
                value={inputs.airbnbIncome}
                onChange={(e) => handleNumberInput('airbnbIncome', e.target.value)}
                className="text-right"
                disabled={!inputs.useAirbnbIncome}
              />
              <p className="text-xs text-muted-foreground">
                Voorzichtig: €500-1000 realistisch
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessUse">Zakelijk gebruik (% vloeropp.)</Label>
              <Input
                id="businessUse"
                type="text"
                inputMode="decimal"
                value={inputs.businessUsePct}
                onChange={(e) => handleNumberInput('businessUsePct', e.target.value)}
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                Voor boekhouding (geen fiscale logica in app)
              </p>
            </div>
          </div>
        </div>

        {/* Report Notes */}
        <div className="space-y-2">
          <Label htmlFor="reportNotes">Rapportnotities (optioneel)</Label>
          <Textarea
            id="reportNotes"
            value={inputs.reportNotes}
            onChange={(e) => onUpdate('reportNotes', e.target.value)}
            placeholder="Extra notities voor PDF-export..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
