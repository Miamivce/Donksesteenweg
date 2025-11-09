import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Plus,
  Copy,
  Edit2,
  Trash2,
  Star,
  Download,
  Upload,
  AlertCircle,
} from 'lucide-react';
import type { Scenario } from '../lib/storage';
import type { FinancialInputs } from '../lib/finance';
import {
  loadScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  duplicateScenario,
  renameScenario,
  getDefaultScenarioId,
  setDefaultScenario,
  clearAllScenarios,
  exportScenarios,
  importScenarios,
} from '../lib/storage';

interface ScenarioManagerProps {
  currentInputs: FinancialInputs;
  onLoadScenario: (inputs: FinancialInputs) => void;
}

export function ScenarioManager({ currentInputs, onLoadScenario }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadAll = () => {
    setScenarios(loadScenarios());
    setDefaultId(getDefaultScenarioId());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateNew = () => {
    try {
      const newName = `Scenario ${scenarios.length + 1}`;
      createScenario(newName, currentInputs);
      loadAll();
      showMessage('success', `Scenario "${newName}" aangemaakt`);
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleLoad = (scenario: Scenario) => {
    onLoadScenario(scenario.inputs);
    showMessage('success', `Scenario "${scenario.name}" geladen`);
  };

  const handleDuplicate = (scenario: Scenario) => {
    try {
      const dup = duplicateScenario(scenario.id);
      if (dup) {
        loadAll();
        showMessage('success', `Scenario gedupliceerd: "${dup.name}"`);
      }
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleStartEdit = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setEditingName(scenario.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      renameScenario(editingId, editingName.trim());
      loadAll();
      setEditingId(null);
      showMessage('success', 'Scenario hernoemd');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (scenario: Scenario) => {
    if (confirm(`Weet je zeker dat je "${scenario.name}" wilt verwijderen?`)) {
      deleteScenario(scenario.id);
      loadAll();
      showMessage('success', 'Scenario verwijderd');
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultScenario(id);
    setDefaultId(id);
    showMessage('success', 'Standaard scenario ingesteld');
  };

  const handleExport = () => {
    try {
      const json = exportScenarios();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brasschaat-scenarios.json';
      a.click();
      URL.revokeObjectURL(url);
      showMessage('success', 'Scenario\'s geëxporteerd');
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const count = importScenarios(text, true);
        loadAll();
        showMessage('success', `${count} scenario(s) geïmporteerd`);
      } catch (error: any) {
        showMessage('error', error.message);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (
      confirm(
        'WAARSCHUWING: Dit verwijdert ALLE scenario\'s permanent. Weet je het zeker?'
      )
    ) {
      clearAllScenarios();
      loadAll();
      showMessage('success', 'Alle scenario\'s verwijderd');
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Scenario Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Bewaar en vergelijk verschillende financiële scenario&apos;s. Data wordt lokaal opgeslagen in
          je browser.
        </p>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-md flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nieuw scenario
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporteer alle
          </Button>
          <Button onClick={handleImport} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importeer
          </Button>
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Wis alles
          </Button>
        </div>

        {/* Scenario List */}
        <div className="space-y-2">
          {scenarios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Geen scenario&apos;s opgeslagen. Klik op &quot;Nieuw scenario&quot; om te beginnen.
            </p>
          ) : (
            scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-3 rounded-lg border ${
                  defaultId === scenario.id ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                {editingId === scenario.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button onClick={handleSaveEdit} size="sm">
                      Opslaan
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm">
                      Annuleer
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{scenario.name}</h4>
                        {defaultId === scenario.id && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aangemaakt: {new Date(scenario.createdAt).toLocaleString('nl-BE')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleLoad(scenario)}
                        variant="outline"
                        size="sm"
                      >
                        Laad
                      </Button>
                      <Button
                        onClick={() => handleDuplicate(scenario)}
                        variant="outline"
                        size="sm"
                        title="Dupliceer"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleStartEdit(scenario)}
                        variant="outline"
                        size="sm"
                        title="Hernoem"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleSetDefault(scenario.id)}
                        variant="outline"
                        size="sm"
                        title="Stel in als standaard"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(scenario)}
                        variant="destructive"
                        size="sm"
                        title="Verwijder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
