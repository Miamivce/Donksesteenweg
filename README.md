# Brasschaat Villa Planner

Een professionele webapp voor het maken van een waterdicht financieel plan voor de aankoop en renovatie van een villa in Brasschaat, België.

## 📋 Overzicht

Deze app helpt je om:
- Een volledig financieel plan te maken voor de aankoop en renovatie van een woning
- Verschillende scenario's te vergelijken
- De financiële haalbaarheid te beoordelen met DTI (Debt-to-Income) en cashflow-analyse
- Gevoeligheidsanalyses uit te voeren voor verschillende leningbedragen en rentepercentages
- Amortisatietabellen te genereren voor bank- en familiale leningen
- Professionele rapporten te exporteren (PDF, XLSX, CSV, JSON)

## 🚀 Installatie

### Vereisten
- Node.js (versie 18 of hoger)
- npm of yarn

### Stappen

1. **Installeer dependencies:**
   ```bash
   cd brasschaat-villa-planner
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - De app opent automatisch op `http://localhost:5173`
   - Of klik op de URL in de terminal

## 🏗️ Build voor productie

```bash
npm run build
```

De gebouwde bestanden staan in de `dist/` map. Je kunt deze uploaden naar een webserver of hosting platform zoals Vercel, Netlify, of GitHub Pages.

**Preview van de productie build:**
```bash
npm run preview
```

## 🧪 Tests uitvoeren

```bash
# Run tests
npm test

# Run tests met UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

## 📖 Gebruikshandleiding

### 1. Inputs Tab

Vul alle parameters in:

**Project informatie:**
- Project naam (wordt gebruikt in exports)
- Rapportnotities (optioneel, voor PDF)

**Projectkosten:**
- Aankoopprijs
- Registratierechten (%) - standaard 2% voor "enige eigen woning"
- Notaris & administratiekosten
- Renovatiebudget
- Contingency (%) - aanbevolen 10-15%

**Financieringsbronnen:**
- Eigen cash
- Crypto (optioneel)
- Familiale lening (bedrag, rente, looptijd)
- Banklening (bedrag, rente, looptijd)

**Inkomen & kosten:**
- Netto gezinsinkomen per maand
- Andere vaste kosten (auto, verzekeringen, kinderopvang)
- Airbnb-inkomen (optioneel, met aan/uit toggle)
- Zakelijk gebruik (% voor boekhouding)

### 2. Overzicht Tab

**Haalbaarheidsassessment:**
- 🟢 **Groen**: Financieel gezond en haalbaar
  - Funding gap ≤ 0
  - DTI ≤ 45%
  - Maandelijks overschot > 0

- 🟡 **Geel**: Haalbaar maar krap
  - DTI tussen 45-55%
  - Beperkte buffer

- 🔴 **Rood**: Niet haalbaar
  - Funding gap > 0 (tekort aan financiering)
  - DTI > 55% (te hoge schuldratio)
  - Maandelijks tekort

**Key metrics:**
- **Funding gap**: Verschil tussen totale kosten en beschikbare financiering
- **DTI (Debt-to-Income)**: Percentage van inkomen dat naar schuld gaat
  - ≤ 45%: Gezond
  - 45-55%: Acceptabel maar krap
  - > 55%: Te hoog, afwijzing door bank waarschijnlijk
- **Maandelijks overschot**: Wat er overblijft na alle kosten

### 3. Bank & Familie Tabs

**Amortisatietabellen:**
- Volledige maand-per-maand afbetalingstabellen
- Voor elke maand zie je:
  - Maandelijkse betaling
  - Interest
  - Aflossing (principal)
  - Restschuld (balance)
- Totalen onderaan: totale interest en aflossing
- **Download CSV** knop voor export naar Excel

**Wat betekent dit?**
- In het begin betaal je vooral interest
- Naarmate de tijd vordert, gaat meer naar aflossing
- De laatste betaling brengt de restschuld naar €0

### 4. Gevoeligheid Tab

**Gevoeligheidsanalyse:**
- Tabel (heatmap) of grafiek van maandlasten
- X-as: Rentepercentages (configureerbaar)
- Y-as: Leningbedragen (configureerbaar)
- Kleurcodering:
  - 🟢 Groen: Lage maandlast
  - 🟡 Geel: Gemiddelde maandlast
  - 🟠 Oranje: Hoge maandlast
  - 🔴 Rood: DTI > 45% (niet comfortabel)
- **Groene rand**: DTI ≤ 45% (comfortabel volgens bankstandaarden)

**Gebruik:**
1. Configureer bereik (min/max bedrag en rente)
2. Wissel tussen tabel en grafiek
3. Identificeer welke combinaties haalbaar zijn
4. Download als CSV voor verdere analyse

### 5. Scenario's Tab

**Scenario Manager:**

**Nieuwe scenario's aanmaken:**
1. Vul inputs in
2. Klik "Nieuw scenario"
3. Scenario wordt opgeslagen met huidige inputs

**Scenario's beheren:**
- **Laad**: Laadt inputs van scenario
- **Dupliceer**: Maakt kopie voor variaties
- **Hernoem**: Geef duidelijke namen (bijv. "Conservatief", "Optimistisch")
- **Standaard**: Markeer als favoriet met ster
- **Verwijder**: Verwijder scenario permanent

**Import/Export:**
- **Exporteer alle**: Download alle scenario's als JSON-bestand
- **Importeer**: Laad scenario's van JSON-bestand
- **Wis alles**: Verwijder alle scenario's (met bevestiging)

**Gebruik cases:**
- Scenario A: Conservatief (hoge contingency, lage Airbnb)
- Scenario B: Realistisch (gemiddelde waarden)
- Scenario C: Optimistisch (lage contingency, hoge Airbnb)

### 6. Export Tab

**Beschikbare exports:**

**JSON:**
- Inputs + samenvatting
- Voor backup en delen met andere tools
- Kleinst bestand

**CSV (Samenvatting):**
- Alle key metrics in tabel
- Makkelijk te openen in Excel/Google Sheets
- Goed voor quick analyse

**XLSX (Volledig):**
- Meerdere tabbladen:
  - Summary
  - Bank Amortization
  - Family Amortization
  - Sensitivity
- Ideaal voor gedetailleerde analyse
- Te openen in Excel

**PDF (Presentatie):**
- Professioneel rapport (1-3 pagina's)
- Bevat:
  - Project info en timestamp
  - Financial summary met key metrics
  - Project costs breakdown
  - Bank amortization preview (eerste 24 maanden)
  - Rapportnotities
- **Perfect voor bank of familie**
- Print-ready

## 🖨️ Printen

### Optie 1: Direct printen vanuit browser

1. Open de **Overzicht** tab
2. Druk `Ctrl+P` (Windows) of `Cmd+P` (Mac)
3. Selecteer printer of "Save as PDF"
4. Kies instellingen:
   - A4 formaat
   - Portret oriëntatie
   - Zonder headers/footers
5. Print of opslaan

**Wat wordt geprint:**
- Summary cards met alle key metrics
- Kleurcodering (groen/geel/rood) blijft zichtbaar
- Clean A4 layout zonder navigatie

### Optie 2: PDF Export

1. Ga naar **Export** tab
2. Klik "Download PDF"
3. PDF wordt automatisch gedownload
4. Open en print via PDF viewer

**Voordelen PDF export:**
- Professionelere layout
- Amortization preview included
- Rapportnotities included
- Consistent resultaat

### Print tips:

- **Voor bank presentatie**: Gebruik PDF export + XLSX voor details
- **Voor familie**: Print overzicht + eerste pagina amortization
- **Voor archief**: Print Summary + bewaar XLSX
- Zet "Background graphics" aan voor kleurcodering
- Gebruik "Scale to fit" indien nodig

## 🧮 Formules & Berekeningen

### Registration Tax (Registratierechten)
```
Registration Tax = Purchase Price × (Registration Rate% / 100)
```
Standaard 2% voor "enige eigen woning" in Vlaanderen.

### Renovation with Contingency
```
Renovation Total = Renovation Budget × (1 + Contingency% / 100)
```
Aanbevolen contingency: 10-15%

### Total Project Cost
```
Total = Purchase Price + Registration Tax + Notary Fees + Renovation Total
```

### Funding Sources
```
Total Sources = Own Cash + Crypto + Family Loan + Bank Loan
```

### Funding Gap
```
Funding Gap = Total Project Cost - Total Sources
```
Moet ≤ 0 zijn voor haalbaarheid.

### Monthly Payment (PMT)
```
r = Annual Rate / 12
n = Years × 12
PMT = P × (r × (1+r)^n) / ((1+r)^n - 1)

Als rate = 0: PMT = P / n
```

### Debt-to-Income (DTI)
```
DTI% = (Total Monthly Debt / Net Monthly Income) × 100
```
- ≤ 45%: Gezond
- 45-55%: Acceptabel
- > 55%: Te hoog

### Monthly Net After
```
Net After = Net Income - Other Fixed Costs + Airbnb - Total Debt Service
```

## 🔒 Privacy & Security

- **100% lokaal**: Alle data blijft in je browser (localStorage)
- **Geen externe calls**: Geen data wordt verzonden naar servers
- **Geen tracking**: Geen analytics of cookies
- **Clear data**: Gebruik "Wis alles" in Scenario Manager om alle data te verwijderen

## 🏛️ Belgische Context

**Registratierechten:**
- Vlaanderen: 2% voor "enige eigen woning"
- Voorwaarden:
  - Je hebt geen andere woning
  - Je bewoont de woning binnen 3 jaar
  - Standaard: 12% (indien niet voldaan)

**Familiale lening:**
- Lening van familie met lage rente (1-2%)
- Moet contractueel vastgelegd worden
- Fiscaal aftrekbaar onder voorwaarden
- Registreer bij belastingen

**Banklening:**
- Hypothecaire lening voor hoofdverblijfplaats
- Typisch 20-25 jaar looptijd
- Rente momenteel 3-5% (afhankelijk van profiel)
- Bank kijkt naar DTI, stabiliteit inkomen, etc.

**Zakelijk gebruik:**
- Als je deel van woning als kantoor gebruikt
- Percentage voor boekhouder (geen fiscale logica in app)
- Bespreek met boekhouder voor correcte behandeling

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Charts
- **SheetJS (xlsx)** - Excel exports
- **jsPDF** - PDF generation
- **Vitest** - Testing

## 📁 Project Structure

```
brasschaat-villa-planner/
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── InputsForm.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── AmortTable.tsx
│   │   ├── Sensitivity.tsx
│   │   ├── ScenarioManager.tsx
│   │   └── ExportPanel.tsx
│   ├── lib/
│   │   ├── finance.ts         # PMT, amortization, calculations
│   │   ├── sensitivity.ts     # Heatmap grid helpers
│   │   ├── storage.ts         # localStorage scenario CRUD
│   │   ├── export.ts          # CSV/XLSX/PDF helpers
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx                # Main app with tabs
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles + print CSS
├── tests/                     # Vitest tests
├── public/                    # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🐛 Troubleshooting

**App laadt niet:**
- Check console voor errors (F12)
- Verwijder `node_modules` en run `npm install` opnieuw
- Clear browser cache

**LocalStorage vol:**
- Browser heeft limiet (~5-10MB)
- Gebruik "Wis alles" in Scenario Manager
- Of clear browser data voor deze site

**Print ziet er raar uit:**
- Gebruik PDF export i.p.v. direct printen
- Check browser print settings
- Zet "Background graphics" aan

**Exports werken niet:**
- Check browser console voor errors
- Sommige browsers blokkeren auto-downloads
- Sta downloads toe voor deze site

**Tests falen:**
- Run `npm install` opnieuw
- Check Node.js versie (moet ≥18 zijn)
- Run `npm run test -- --reporter=verbose` voor details

## 💡 Tips & Best Practices

**Voor beste resultaten:**
1. **Wees conservatief** met inkomensschattingen
2. **Gebruik contingency** van 12-15% voor renovatie
3. **Test meerdere scenario's** (optimistisch, realistisch, pessimistisch)
4. **Let op DTI**: Houd onder 45% voor comfortabele goedkeuring
5. **Buffer**: Zorg voor minimaal €500-1000 maandelijks overschot
6. **Airbnb**: Wees voorzichtig met inkomsten (€500-1000 realistisch)
7. **Familiale lening**: Leg contractueel vast en registreer
8. **Bank**: Presenteer meerdere scenario's + XLSX voor transparantie

**Voor bank presentatie:**
1. Maak 3 scenario's (conservatief/realistisch/optimistisch)
2. Toon dat DTI < 45% in alle scenario's
3. Export PDF + XLSX
4. Print Summary voor visuele presentatie
5. Gebruik XLSX om details te bespreken
6. Toon gevoeligheidsanalyse voor rente-wijzigingen

**Voor familie:**
1. Wees transparant over alle cijfers
2. Toon duidelijk de familiale lening voorwaarden
3. Leg uit hoe aflossing werkt (amortization table)
4. Laat zien dat het haalbaar is (groen assessment)
5. Deel scenario's voor verschillende situaties

## 📞 Support

Voor vragen of problemen:
- Check deze README grondig
- Inspecteer console errors (F12)
- Test in verschillende browsers
- Clear localStorage en probeer opnieuw

## 📜 Licentie

Privé project - Alle rechten voorbehouden.

---

**Gemaakt met ❤️ voor de Brasschaat Villa**

_Laatste update: 2025_
