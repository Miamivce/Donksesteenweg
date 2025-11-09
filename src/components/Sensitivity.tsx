import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Download } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { FinancialInputs } from '../lib/finance';
import { pmt } from '../lib/finance';
import {
  generateSensitivityGrid,
  getAmounts,
  getRates,
  getColorClass,
  getMonthlyRange,
  DEFAULT_SENSITIVITY_CONFIG,
} from '../lib/sensitivity';
import { formatNumber, exportSensitivityCSV } from '../lib/export';

interface SensitivityProps {
  inputs: FinancialInputs;
}

export function Sensitivity({ inputs }: SensitivityProps) {
  const [config, setConfig] = useState(DEFAULT_SENSITIVITY_CONFIG);
  const [showChart, setShowChart] = useState(false);

  // Calculate family monthly payment
  const familyMonthly = useMemo(
    () =>
      pmt(
        inputs.familyLoanRatePct / 100,
        inputs.familyLoanTermYears,
        inputs.familyLoanAmount
      ),
    [inputs.familyLoanAmount, inputs.familyLoanRatePct, inputs.familyLoanTermYears]
  );

  const grid = useMemo(
    () =>
      generateSensitivityGrid(
        config,
        inputs.bankTermYears,
        familyMonthly,
        inputs.netIncomeMonthly,
        inputs.otherFixedCostsMonthly
      ),
    [config, inputs.bankTermYears, familyMonthly, inputs.netIncomeMonthly, inputs.otherFixedCostsMonthly]
  );

  const amounts = useMemo(() => getAmounts(grid), [grid]);
  const rates = useMemo(() => getRates(grid), [grid]);
  const { min, max } = useMemo(() => getMonthlyRange(grid), [grid]);

  // For line chart
  const chartData = useMemo(() => {
    return rates.map((rate, rateIdx) => {
      const dataPoint: any = { rate: `${rate.toFixed(2)}%` };
      amounts.forEach((amount, amountIdx) => {
        const cell = grid[amountIdx][rateIdx];
        dataPoint[`€${(amount / 1000).toFixed(0)}k`] = cell.monthly;
      });
      return dataPoint;
    });
  }, [grid, rates, amounts]);

  const handleDownloadCSV = () => {
    exportSensitivityCSV(
      grid,
      rates,
      amounts,
      `${inputs.projectName.replace(/\s+/g, '_')}_Sensitivity.csv`
    );
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Gevoeligheidsanalyse: Maandlast per bedrag & rente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bereken maandelijkse afbetaling voor verschillende leningbedragen en rentepercentages.
            Cellen met groene rand = comfortabel (DTI ≤ 45%).
          </p>

          {/* Config */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min bedrag (€)</Label>
              <Input
                id="minAmount"
                type="number"
                value={config.minAmount}
                onChange={(e) =>
                  setConfig({ ...config, minAmount: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max bedrag (€)</Label>
              <Input
                id="maxAmount"
                type="number"
                value={config.maxAmount}
                onChange={(e) =>
                  setConfig({ ...config, maxAmount: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minRate">Min rente (%)</Label>
              <Input
                id="minRate"
                type="number"
                step="0.1"
                value={config.minRate}
                onChange={(e) => setConfig({ ...config, minRate: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRate">Max rente (%)</Label>
              <Input
                id="maxRate"
                type="number"
                step="0.1"
                value={config.maxRate}
                onChange={(e) => setConfig({ ...config, maxRate: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Toggle view */}
          <div className="flex gap-2">
            <Button
              variant={!showChart ? 'default' : 'outline'}
              onClick={() => setShowChart(false)}
            >
              Tabel
            </Button>
            <Button
              variant={showChart ? 'default' : 'outline'}
              onClick={() => setShowChart(true)}
            >
              Grafiek
            </Button>
            <Button variant="outline" onClick={handleDownloadCSV} className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {/* Heatmap Table */}
          {!showChart && (
            <div className="overflow-auto rounded-lg border">
              <table className="min-w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left font-medium sticky left-0 bg-muted z-10">
                      Bedrag ↓ / Rente →
                    </th>
                    {rates.map((rate) => (
                      <th key={rate} className="p-2 text-center font-medium">
                        {rate.toFixed(2)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grid.map((row, rowIdx) => (
                    <tr key={amounts[rowIdx]}>
                      <td className="p-2 font-semibold sticky left-0 bg-white border-r">
                        €{formatNumber(amounts[rowIdx], 0)}
                      </td>
                      {row.map((cell, colIdx) => {
                        const colorClass = getColorClass(
                          cell.monthly,
                          min,
                          max,
                          cell.isComfortable
                        );
                        return (
                          <td
                            key={colIdx}
                            className={`p-2 text-center ${colorClass} ${
                              cell.isComfortable ? 'ring-2 ring-green-500 ring-inset' : ''
                            }`}
                            title={`${formatNumber(cell.monthly, 0)} €/maand. DTI ${
                              cell.isComfortable ? '≤' : '>'
                            } 45%`}
                          >
                            €{formatNumber(cell.monthly, 0)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Line Chart */}
          {showChart && (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="rate"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    label={{
                      value: 'Maandlast (€)',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  {amounts.map((amount, idx) => (
                    <Line
                      key={amount}
                      type="monotone"
                      dataKey={`€${(amount / 1000).toFixed(0)}k`}
                      stroke={`hsl(${(idx * 360) / amounts.length}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Legende:</strong> Groen = lage maandlast, Rood = hoge maandlast.
            </p>
            <p>
              <strong>Groene rand:</strong> DTI ≤ 45% (comfortabel volgens bankstandaarden).
            </p>
            <p>
              Deze tabel gaat uit van banklening over {inputs.bankTermYears} jaar en familiale
              lening van €{formatNumber(inputs.familyLoanAmount, 0)}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
