import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import type { FinancialInputs, Summary, AmortizationRow } from '../lib/finance';
import type { SensitivityCell } from '../lib/sensitivity';
import {
  exportJSON,
  exportSummaryCSV,
  exportXLSX,
  exportPDF,
} from '../lib/export';

interface ExportPanelProps {
  inputs: FinancialInputs;
  summary: Summary;
  bankAmort: AmortizationRow[];
  famAmort: AmortizationRow[];
  sensitivityGrid: SensitivityCell[][];
  rates: number[];
  amounts: number[];
}

export function ExportPanel({
  inputs,
  summary,
  bankAmort,
  famAmort,
  sensitivityGrid,
  rates,
  amounts,
}: ExportPanelProps) {
  const [loading, setLoading] = useState(false);

  const handleExportJSON = () => {
    exportJSON(inputs, summary);
  };

  const handleExportCSV = () => {
    exportSummaryCSV(inputs, summary);
  };

  const handleExportXLSX = () => {
    setLoading(true);
    try {
      exportXLSX(inputs, summary, bankAmort, famAmort, sensitivityGrid, rates, amounts);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await exportPDF(inputs, summary, bankAmort);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export mislukt. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Exports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Download je financieel plan in verschillende formaten om te delen met familie, bank, of
          voor archivering.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* JSON */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <FileJson className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">JSON</h3>
                <p className="text-xs text-muted-foreground">
                  Inputs + samenvatting in JSON-formaat. Handig voor backup of delen met andere
                  tools.
                </p>
              </div>
            </div>
            <Button onClick={handleExportJSON} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </div>

          {/* CSV */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">CSV (Samenvatting)</h3>
                <p className="text-xs text-muted-foreground">
                  Samenvatting in CSV-formaat. Makkelijk te openen in Excel, Google Sheets, etc.
                </p>
              </div>
            </div>
            <Button onClick={handleExportCSV} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {/* XLSX */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">XLSX (Volledig)</h3>
                <p className="text-xs text-muted-foreground">
                  Volledig Excel-bestand met alle tabellen: samenvatting, amortisaties,
                  gevoeligheidsanalyse.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportXLSX}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download XLSX
            </Button>
          </div>

          {/* PDF */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">PDF (Presentatie)</h3>
                <p className="text-xs text-muted-foreground">
                  Professioneel PDF-rapport (1-3 pagina&apos;s). Ideaal om te printen of te presenteren
                  aan bank/familie.
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportPDF}
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-1">💡 Tip voor presentatie aan bank:</p>
          <p className="text-blue-800">
            Download het PDF-rapport en het XLSX-bestand. Het PDF geeft een snel overzicht, terwijl
            het XLSX alle details bevat voor grondige analyse.
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Privacy:</strong> Alle data blijft lokaal in je browser. Er worden geen
            gegevens naar externe servers verzonden.
          </p>
          <p>
            <strong>Print tip:</strong> Gebruik de browser print-functie (Ctrl+P / Cmd+P) om direct
            vanaf het scherm te printen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
