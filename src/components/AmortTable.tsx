import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import type { AmortizationRow } from '../lib/finance';
import { getAmortTotals } from '../lib/finance';
import { exportAmortCSV, formatNumber } from '../lib/export';

interface AmortTableProps {
  title: string;
  rows: AmortizationRow[];
  filename: string;
}

export function AmortTable({ title, rows, filename }: AmortTableProps) {
  const totals = getAmortTotals(rows);

  const handleDownloadCSV = () => {
    exportAmortCSV(rows, filename, totals.totalInterest, totals.totalPrincipal);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        <Button onClick={handleDownloadCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        {/* Totals Summary */}
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Totale interest:</span>
              <p className="font-semibold text-lg">€ {formatNumber(totals.totalInterest, 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Totale aflossing:</span>
              <p className="font-semibold text-lg">
                € {formatNumber(totals.totalPrincipal, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[32rem] rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white border-b">
              <tr className="text-left">
                <th className="p-3 font-medium">Maand</th>
                <th className="p-3 font-medium text-right">Betaling</th>
                <th className="p-3 font-medium text-right">Interest</th>
                <th className="p-3 font-medium text-right">Aflossing</th>
                <th className="p-3 font-medium text-right">Restschuld</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="odd:bg-neutral-50 hover:bg-neutral-100">
                  <td className="p-3">{row.month}</td>
                  <td className="p-3 text-right font-mono">
                    € {formatNumber(row.payment, 0)}
                  </td>
                  <td className="p-3 text-right font-mono text-muted-foreground">
                    € {formatNumber(row.interest, 0)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    € {formatNumber(row.principal, 0)}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold">
                    € {formatNumber(row.balance, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted font-semibold">
              <tr>
                <td className="p-3">TOTAAL</td>
                <td className="p-3 text-right font-mono">
                  € {formatNumber(rows[0]?.payment * rows.length || 0, 0)}
                </td>
                <td className="p-3 text-right font-mono">
                  € {formatNumber(totals.totalInterest, 0)}
                </td>
                <td className="p-3 text-right font-mono">
                  € {formatNumber(totals.totalPrincipal, 0)}
                </td>
                <td className="p-3 text-right font-mono">€ 0</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          {rows.length} maanden totaal. Interest en aflossing tellen op tot totale betaling.
        </p>
      </CardContent>
    </Card>
  );
}
