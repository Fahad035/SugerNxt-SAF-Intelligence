import { useMemo, useState } from "react";

const PATHWAY_OPTIONS = {
  "ATJ-SAF Core": {
    yieldMultiplier: 1,
    capexMultiplier: 1,
    opexMultiplier: 1,
    carbonIntensity: 36,
    note: "Balanced baseline pathway for sugar-derived ethanol to jet blending.",
  },
  "ATJ + Bagasse CHP": {
    yieldMultiplier: 1.04,
    capexMultiplier: 1.12,
    opexMultiplier: 0.93,
    carbonIntensity: 30,
    note: "Integrates bagasse power for lower energy cost and better LCA performance.",
  },
  "ATJ + Biochar Loop": {
    yieldMultiplier: 0.98,
    capexMultiplier: 1.08,
    opexMultiplier: 0.95,
    carbonIntensity: 24,
    note: "Adds pyrolysis route for carbon lock-in and premium carbon-credit potential.",
  },
};

const BYPRODUCT_OPTIONS = {
  powerExport: { label: "Bagasse Power Export", creditPerKl: 28, readinessBoost: 0.8 },
  co2Capture: { label: "Biogenic CO₂ Capture", creditPerKl: 19, readinessBoost: 0.5 },
  biochar: { label: "Biochar to Soil Markets", creditPerKl: 16, readinessBoost: 0.6 },
  ligninChem: { label: "Lignin Chemical Intermediates", creditPerKl: 22, readinessBoost: 0.4 },
};

const TRL_EVIDENCE = [
  { id: "lab_data", label: "Lab conversion data package" },
  { id: "astm_plan", label: "ASTM / fuel spec validation plan" },
  { id: "pilot_pfd", label: "Pilot PFD + mass-energy balance" },
  { id: "offtake_mou", label: "Airline or fuel trader offtake MOU" },
  { id: "lca_model", label: "Third-party LCA model" },
  { id: "permit_path", label: "Permitting and EHS pathway" },
];

const PHASES = [
  { key: "demo", title: "Phase 1 — Demo Validation", targetTrl: 5 },
  { key: "pilot", title: "Phase 2 — Pilot Integration", targetTrl: 7 },
  { key: "commercial", title: "Phase 3 — First Commercial Unit", targetTrl: 8 },
  { key: "scale", title: "Phase 4 — Multi-site Scale-up", targetTrl: 9 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function computeIrr(cashflows) {
  let low = -0.9;
  let high = 1.5;

  const npvAt = (rate) =>
    cashflows.reduce((sum, cash, index) => sum + cash / (1 + rate) ** index, 0);

  let lowNpv = npvAt(low);
  let highNpv = npvAt(high);
  if (lowNpv * highNpv > 0) return null;

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const midNpv = npvAt(mid);
    if (Math.abs(midNpv) < 0.0001) return mid;
    if (lowNpv * midNpv <= 0) {
      high = mid;
      highNpv = midNpv;
    } else {
      low = mid;
      lowNpv = midNpv;
    }
  }

  return (low + high) / 2;
}

function computeNpv(cashflows, discountRate) {
  return cashflows.reduce((sum, cash, year) => sum + cash / (1 + discountRate) ** year, 0);
}

const formatNumber = (value, digits = 0) => Number(value).toFixed(digits);
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function StrategyPage() {
  const latestSnapshot = useMemo(() => {
    const raw = localStorage.getItem("saf_snapshot_latest");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const baseSafPerDay = Number(latestSnapshot?.outputs?.safYield || 175);

  const [pathway, setPathway] = useState("ATJ-SAF Core");
  const [trlLevel, setTrlLevel] = useState(5);
  const [evidenceState, setEvidenceState] = useState(() =>
    TRL_EVIDENCE.reduce((acc, row) => ({ ...acc, [row.id]: false }), {})
  );

  const [marketInputs, setMarketInputs] = useState({
    annualJetDemandKl: 6_500_000,
    safMandatePct: 3.5,
    reachablePct: 38,
    capturePct: 9,
    offtakeKl: 62_000,
    pricePerKl: 1150,
  });

  const [financeInputs, setFinanceInputs] = useState({
    scaleFactor: 3.2,
    projectYears: 12,
    discountRatePct: 12,
    baseCapex: 36_000_000,
    baseOpexPerKl: 680,
    annualGrowthPct: 2.5,
  });

  const selectedPathway = PATHWAY_OPTIONS[pathway];

  const byproductCredit = useMemo(() => {
    return Object.entries(BYPRODUCT_OPTIONS).reduce((sum, [key, item]) => {
      return evidenceState[key] ? sum + item.creditPerKl : sum;
    }, 0);
  }, [evidenceState]);

  const readinessBoost = useMemo(() => {
    return Object.entries(BYPRODUCT_OPTIONS).reduce((sum, [key, item]) => {
      return evidenceState[key] ? sum + item.readinessBoost : sum;
    }, 0);
  }, [evidenceState]);

  const trlEvidenceCount = useMemo(
    () => TRL_EVIDENCE.reduce((sum, item) => sum + (evidenceState[item.id] ? 1 : 0), 0),
    [evidenceState]
  );

  const model = useMemo(() => {
    const annualProductionKl =
      baseSafPerDay * 330 * selectedPathway.yieldMultiplier * financeInputs.scaleFactor;

    const tamKl = marketInputs.annualJetDemandKl * (marketInputs.safMandatePct / 100);
    const samKl = tamKl * (marketInputs.reachablePct / 100);
    const somKl = samKl * (marketInputs.capturePct / 100);

    const demandSignalKl = Math.max(somKl, marketInputs.offtakeKl);
    const soldKl = Math.min(annualProductionKl, demandSignalKl);
    const utilization = annualProductionKl > 0 ? (soldKl / annualProductionKl) * 100 : 0;

    const capex = financeInputs.baseCapex * financeInputs.scaleFactor * selectedPathway.capexMultiplier;
    const adjustedOpexPerKl =
      financeInputs.baseOpexPerKl * selectedPathway.opexMultiplier - byproductCredit;

    const cashflows = [-capex];
    for (let year = 1; year <= financeInputs.projectYears; year += 1) {
      const growth = (1 + financeInputs.annualGrowthPct / 100) ** (year - 1);
      const revenue = soldKl * marketInputs.pricePerKl * growth;
      const opex = annualProductionKl * adjustedOpexPerKl * growth;
      cashflows.push(revenue - opex);
    }

    const discountRate = financeInputs.discountRatePct / 100;
    const npv = computeNpv(cashflows, discountRate);
    const irr = computeIrr(cashflows);
    const annualCash = cashflows[1] || 0;
    const paybackYears = annualCash > 0 ? capex / annualCash : null;

    const marginPct = soldKl > 0 ? ((cashflows[1] || 0) / (soldKl * marketInputs.pricePerKl)) * 100 : 0;
    const riskScore = clamp(
      100 - trlLevel * 8 - trlEvidenceCount * 4 - readinessBoost * 3 - Math.min(utilization, 95) * 0.25,
      8,
      92
    );

    return {
      annualProductionKl,
      tamKl,
      samKl,
      somKl,
      soldKl,
      utilization,
      capex,
      adjustedOpexPerKl,
      npv,
      irr,
      paybackYears,
      marginPct,
      riskScore,
    };
  }, [
    baseSafPerDay,
    byproductCredit,
    financeInputs,
    marketInputs,
    readinessBoost,
    selectedPathway,
    trlEvidenceCount,
    trlLevel,
  ]);

  const evidenceCoverage = (trlEvidenceCount / TRL_EVIDENCE.length) * 100;

  const phaseStatus = (targetTrl) => {
    if (trlLevel >= targetTrl && evidenceCoverage >= 65) return "Ready";
    if (trlLevel >= targetTrl - 1) return "In progress";
    return "Blocked";
  };

  const setMarketValue = (key, value) => {
    setMarketInputs((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const setFinanceValue = (key, value) => {
    setFinanceInputs((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const toggleEvidence = (key) => {
    setEvidenceState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="premium-panel p-6 premium-reveal">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Hackathon Readiness Engine</p>
              <h1 className="premium-heading premium-title mt-1">Advanced Strategy Module</h1>
              <p className="premium-subtitle mt-3 max-w-3xl">
                Decision layer for pathway selection, TRL evidence confidence, market capture realism, and industrial-scale finance.
              </p>
            </div>
            <div className="rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm text-brand-muted">
              Baseline from latest run: <span className="font-semibold text-brand-text">{formatNumber(baseSafPerDay, 2)} KL/day</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
          <section className="premium-card p-5 premium-reveal premium-reveal-delay-1">
            <h2 className="text-lg font-semibold text-brand-text">Pathway + TRL Evidence</h2>

            <label className="mt-4 block text-sm text-brand-muted">Pathway selection</label>
            <select
              value={pathway}
              onChange={(event) => setPathway(event.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-card px-3 py-2 text-sm text-brand-text outline-none ring-blue-400/40 focus:ring"
            >
              {Object.keys(PATHWAY_OPTIONS).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-brand-muted">{selectedPathway.note}</p>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-lg border border-brand-border bg-brand-card p-2">
                Yield x{formatNumber(selectedPathway.yieldMultiplier, 2)}
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-card p-2">
                CAPEX x{formatNumber(selectedPathway.capexMultiplier, 2)}
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-card p-2">
                CI {formatNumber(selectedPathway.carbonIntensity, 0)} gCO₂e/MJ
              </div>
            </div>

            <label className="mt-5 block text-sm text-brand-muted">Current TRL: {trlLevel}</label>
            <input
              type="range"
              min="3"
              max="9"
              step="1"
              value={trlLevel}
              onChange={(event) => setTrlLevel(Number(event.target.value))}
              className="mt-2 w-full accent-blue-500"
            />

            <p className="mt-4 text-sm font-medium text-brand-text">Evidence matrix</p>
            <div className="mt-2 space-y-2">
              {[...TRL_EVIDENCE, ...Object.entries(BYPRODUCT_OPTIONS).map(([id, row]) => ({ id, label: row.label }))].map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-lg border border-brand-border/80 bg-brand-card px-3 py-2 text-sm text-brand-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(evidenceState[item.id])}
                    onChange={() => toggleEvidence(item.id)}
                    className="accent-blue-500"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </section>

          <section className="premium-card p-5 premium-reveal premium-reveal-delay-2">
            <h2 className="text-lg font-semibold text-brand-text">Market + Industrial Finance</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm text-brand-muted">
                Annual jet demand (KL)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={marketInputs.annualJetDemandKl} onChange={(event) => setMarketValue("annualJetDemandKl", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                SAF mandate (%)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={marketInputs.safMandatePct} onChange={(event) => setMarketValue("safMandatePct", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Reachable share (%)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={marketInputs.reachablePct} onChange={(event) => setMarketValue("reachablePct", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Capture share (%)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={marketInputs.capturePct} onChange={(event) => setMarketValue("capturePct", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Secured offtake (KL)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={marketInputs.offtakeKl} onChange={(event) => setMarketValue("offtakeKl", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Price (USD/KL)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={marketInputs.pricePerKl} onChange={(event) => setMarketValue("pricePerKl", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Scale factor
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={financeInputs.scaleFactor} onChange={(event) => setFinanceValue("scaleFactor", event.target.value)} step="0.1" />
              </label>
              <label className="text-sm text-brand-muted">
                CAPEX baseline (USD)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={financeInputs.baseCapex} onChange={(event) => setFinanceValue("baseCapex", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                OPEX baseline (USD/KL)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={financeInputs.baseOpexPerKl} onChange={(event) => setFinanceValue("baseOpexPerKl", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Discount rate (%)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={financeInputs.discountRatePct} onChange={(event) => setFinanceValue("discountRatePct", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Project years
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={financeInputs.projectYears} onChange={(event) => setFinanceValue("projectYears", event.target.value)} />
              </label>
              <label className="text-sm text-brand-muted">
                Annual growth (%)
                <input type="number" className="mt-1 w-full rounded-lg border border-brand-border bg-brand-card px-3 py-2 text-brand-text" value={financeInputs.annualGrowthPct} onChange={(event) => setFinanceValue("annualGrowthPct", event.target.value)} step="0.1" />
              </label>
            </div>
          </section>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="premium-card p-4">
            <p className="text-xs uppercase tracking-wide text-brand-muted">TAM / SAM / SOM</p>
            <p className="mt-1 text-xl font-semibold text-brand-text">{formatNumber(model.tamKl, 0)} / {formatNumber(model.samKl, 0)} / {formatNumber(model.somKl, 0)} KL</p>
          </article>
          <article className="premium-card p-4">
            <p className="text-xs uppercase tracking-wide text-brand-muted">Utilization</p>
            <p className="mt-1 text-xl font-semibold text-brand-text">{formatNumber(model.utilization, 1)}%</p>
            <p className="text-xs text-brand-muted">Sold {formatNumber(model.soldKl, 0)} KL / capacity {formatNumber(model.annualProductionKl, 0)} KL</p>
          </article>
          <article className="premium-card p-4">
            <p className="text-xs uppercase tracking-wide text-brand-muted">NPV + IRR</p>
            <p className="mt-1 text-xl font-semibold text-brand-text">{formatCurrency(model.npv)}</p>
            <p className="text-xs text-brand-muted">IRR {model.irr === null ? "N/A" : `${formatNumber(model.irr * 100, 2)}%`}</p>
          </article>
          <article className="premium-card p-4">
            <p className="text-xs uppercase tracking-wide text-brand-muted">Payback + Risk</p>
            <p className="mt-1 text-xl font-semibold text-brand-text">
              {model.paybackYears ? `${formatNumber(model.paybackYears, 2)} yrs` : "No payback"}
            </p>
            <p className="text-xs text-brand-muted">Commercial risk score: {formatNumber(model.riskScore, 0)}/100</p>
          </article>
        </section>

        <section className="premium-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-text">Commercialization Roadmap</h2>
            <span className="text-xs text-brand-muted">Evidence coverage {formatNumber(evidenceCoverage, 0)}%</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {PHASES.map((phase) => {
              const status = phaseStatus(phase.targetTrl);
              const statusClass =
                status === "Ready"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : status === "In progress"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                    : "border-rose-500/35 bg-rose-500/10 text-rose-200";

              return (
                <article key={phase.key} className="rounded-xl border border-brand-border bg-brand-card p-4">
                  <p className="text-sm font-semibold text-brand-text">{phase.title}</p>
                  <p className="mt-1 text-xs text-brand-muted">Target TRL {phase.targetTrl}</p>
                  <span className={`mt-3 inline-flex rounded-md border px-2 py-1 text-xs ${statusClass}`}>
                    {status}
                  </span>
                </article>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-muted">
            Primary go-to-market signal combines offtake coverage, TRL evidence depth, and pathway-specific economics. Current gross margin estimate: <span className="font-semibold text-brand-text">{formatNumber(model.marginPct, 2)}%</span>, adjusted OPEX: <span className="font-semibold text-brand-text">{formatCurrency(model.adjustedOpexPerKl)} / KL</span>.
          </div>
        </section>
      </div>
    </div>
  );
}
