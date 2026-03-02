import { lazy, Suspense, useMemo, useState } from "react";
import axios from "axios";
import KPICard from "../Components/KpiCard";
import SliderControl from "../Components/SliderControl";
import {
  SCENARIO_PRESETS,
  preparePayload,
  estimateSafFromInputs,
  deriveOutputs,
  createSensitivityData,
  createCarbonVsEfficiencyData,
} from "../utils/safCalculations";
const DashboardCharts = lazy(() => import("../Components/charts/DashboardCharts"));

export default function Dashboard() {
  const [selectedPreset, setSelectedPreset] = useState("Base");
  const [inputs, setInputs] = useState({ ...SCENARIO_PRESETS.Base.input });
  const [result, setResult] = useState(null);
  const [scenarioRuns, setScenarioRuns] = useState(() => {
    const stored = localStorage.getItem("saf_scenario_runs");
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const payload = useMemo(() => preparePayload(inputs), [inputs]);
  const estimatedSaf = useMemo(() => estimateSafFromInputs(payload), [payload]);
  const previewOutputs = useMemo(() => deriveOutputs(estimatedSaf, payload), [estimatedSaf, payload]);

  const sensitivityData = useMemo(() => createSensitivityData(payload), [payload]);
  const carbonData = useMemo(() => createCarbonVsEfficiencyData(payload), [payload]);

  const basePresetPayload = useMemo(
    () => preparePayload(SCENARIO_PRESETS.Base.input),
    []
  );
  const baseOutputs = useMemo(() => {
    const baseSaf = estimateSafFromInputs(basePresetPayload);
    return deriveOutputs(baseSaf, basePresetPayload);
  }, [basePresetPayload]);

  const activeOutputs = result?.outputs || previewOutputs;

  const toDeltaPercent = (current, baseline) => {
    if (!baseline) return 0;
    return ((current - baseline) / baseline) * 100;
  };

  const onInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const applyPreset = (presetName) => {
    setSelectedPreset(presetName);
    setInputs({ ...SCENARIO_PRESETS[presetName].input });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value, digits = 2) => Number(value).toFixed(digits);

  const runPrediction = async () => {
    setIsLoading(true);
    setApiError("");

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${apiBaseUrl}/predict`, payload, {
        timeout: 10000,
      });

      const predictedSaf = Number(res?.data?.predicted_saf ?? estimatedSaf);
      const outputs = deriveOutputs(predictedSaf, payload);
      const timestamp = new Date().toISOString();

      const runSnapshot = {
        id: timestamp,
        preset: selectedPreset,
        timestamp,
        payload,
        outputs,
      };

      setResult(runSnapshot);
      setLastUpdated(new Date(timestamp).toLocaleString());

      setScenarioRuns((prev) => {
        const next = [runSnapshot, ...prev].slice(0, 8);
        localStorage.setItem("saf_scenario_runs", JSON.stringify(next));
        return next;
      });

      localStorage.setItem("saf_snapshot_latest", JSON.stringify(runSnapshot));
    } catch (error) {
      setApiError(
        error?.response?.data?.detail ||
          "Prediction failed. Check backend status and API URL."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const exportSnapshot = () => {
    const payloadToExport = {
      exportedAt: new Date().toISOString(),
      latestRun: result,
      comparedRuns: scenarioRuns,
    };

    const blob = new Blob([JSON.stringify(payloadToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `saf-snapshot-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold text-brand-text">Simulation Controls</h2>
          <p className="mt-1 text-sm text-brand-muted">Tune assumptions and run model predictions.</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {Object.keys(SCENARIO_PRESETS).map((presetName) => (
              <button
                key={presetName}
                onClick={() => applyPreset(presetName)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  selectedPreset === presetName
                    ? "border-brand-accent bg-brand-accent/15 text-blue-300"
                    : "border-brand-border text-brand-muted hover:border-blue-500/60"
                }`}
              >
                {presetName}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <SliderControl
              label="Molasses Input"
              value={inputs.molasses_ton}
              setValue={(val) => onInputChange("molasses_ton", val)}
              min={50}
              max={500}
              step={1}
              suffix=" t"
            />
            <SliderControl
              label="Fermentation Efficiency"
              value={inputs.fermentation_eff}
              setValue={(val) => onInputChange("fermentation_eff", val)}
              min={0.85}
              max={0.96}
              step={0.01}
              suffix=""
              decimals={2}
            />
            <SliderControl
              label="Dehydration Efficiency"
              value={inputs.dehydration_eff}
              setValue={(val) => onInputChange("dehydration_eff", val)}
              min={0.9}
              max={0.99}
              step={0.01}
              decimals={2}
            />
            <SliderControl
              label="ATJ Efficiency"
              value={inputs.atj_eff}
              setValue={(val) => onInputChange("atj_eff", val)}
              min={0.6}
              max={0.76}
              step={0.01}
              decimals={2}
            />
            <SliderControl
              label="Energy Input"
              value={inputs.energy_input}
              setValue={(val) => onInputChange("energy_input", val)}
              min={800}
              max={1400}
              step={10}
              suffix=" kWh"
            />
            <SliderControl
              label="Ethanol Factor"
              value={inputs.ethanol_factor}
              setValue={(val) => onInputChange("ethanol_factor", val)}
              min={220}
              max={260}
              step={1}
              suffix=" L/t"
            />
          </div>

          <button
            onClick={runPrediction}
            disabled={isLoading}
            className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
              isLoading
                ? "cursor-not-allowed bg-slate-600"
                : "bg-brand-accent hover:bg-brand-accentSoft"
            }`}
          >
            {isLoading ? "Running prediction..." : "Run Prediction"}
          </button>
          <button
            onClick={exportSnapshot}
            className="mt-2 w-full rounded-xl border border-brand-border bg-brand-card px-4 py-3 text-sm font-semibold text-brand-text hover:bg-brand-surface"
          >
            Export Snapshot
          </button>
        </aside>

        <main className="space-y-6">
          <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-brand-text">SAF AI Dashboard</h1>
                <p className="mt-1 text-sm text-brand-muted">
                  Professional operational and commercial insights for SAF production.
                </p>
              </div>
              <div className="rounded-lg bg-brand-card px-3 py-2 text-xs font-medium text-brand-muted">
                Last updated: {lastUpdated || "Not yet run"}
              </div>
            </div>

            {apiError && (
              <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-200">
                {apiError}
              </div>
            )}
          </section>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-2xl border border-brand-border bg-brand-surface" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <KPICard
                title="SAF Yield"
                value={`${formatNumber(activeOutputs.safYield)} KL`}
                subtitle="Net sustainable fuel production"
                delta={toDeltaPercent(activeOutputs.safYield, baseOutputs.safYield)}
                icon="saf"
              />
              <KPICard
                title="Carbon Savings"
                value={`${formatNumber(activeOutputs.carbonSavings, 0)} kgCO2e`}
                subtitle="Lifecycle emissions avoided"
                delta={toDeltaPercent(activeOutputs.carbonSavings, baseOutputs.carbonSavings)}
                icon="carbon"
              />
              <KPICard
                title="ROI"
                value={`${formatNumber(activeOutputs.roi)} %`}
                subtitle="Return against variable operating cost"
                delta={toDeltaPercent(activeOutputs.roi, baseOutputs.roi)}
                icon="roi"
              />
            </div>
          )}

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="h-80 animate-pulse rounded-2xl border border-brand-border bg-brand-surface" />
                <div className="h-80 animate-pulse rounded-2xl border border-brand-border bg-brand-surface" />
              </div>
            }
          >
            <DashboardCharts
              sensitivityData={sensitivityData}
              carbonData={carbonData}
              formatNumber={formatNumber}
            />
          </Suspense>

          <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-brand-text">Scenario Comparison</h3>
              <span className="text-xs text-brand-muted">Latest 8 runs</span>
            </div>

            {scenarioRuns.length === 0 ? (
              <p className="rounded-lg bg-brand-card p-4 text-sm text-brand-muted">
                No runs yet. Choose a preset and run prediction to start comparisons.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border text-left text-brand-muted">
                      <th className="px-3 py-2">Scenario</th>
                      <th className="px-3 py-2">SAF (KL)</th>
                      <th className="px-3 py-2">Carbon (kgCO2e)</th>
                      <th className="px-3 py-2">ROI (%)</th>
                      <th className="px-3 py-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioRuns.map((run) => (
                      <tr key={run.id} className="border-b border-brand-border/50 text-brand-text">
                        <td className="px-3 py-2 font-medium">{run.preset}</td>
                        <td className="px-3 py-2">{formatNumber(run.outputs.safYield)}</td>
                        <td className="px-3 py-2">{formatNumber(run.outputs.carbonSavings, 0)}</td>
                        <td className="px-3 py-2">{formatNumber(run.outputs.roi)}</td>
                        <td className="px-3 py-2">
                          {new Date(run.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 rounded-lg bg-brand-card px-4 py-3 text-sm text-brand-muted">
              Preview Net Profit: {formatCurrency(activeOutputs.netProfit)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}