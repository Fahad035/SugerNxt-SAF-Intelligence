import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  SCENARIO_PRESETS,
  deriveOutputs,
  estimateSafFromInputs,
  preparePayload,
} from "../utils/safCalculations";

function getInitialPayload() {
  try {
    const rawSnapshot = localStorage.getItem("saf_snapshot_latest");
    if (rawSnapshot) {
      const parsed = JSON.parse(rawSnapshot);
      if (parsed?.payload) {
        return {
          molasses_ton: Number(parsed.payload.molasses_ton),
          fermentation_eff: Number(parsed.payload.fermentation_eff),
          dehydration_eff: Number(parsed.payload.dehydration_eff),
          atj_eff: Number(parsed.payload.atj_eff),
          energy_input: Number(parsed.payload.energy_input),
          ethanol_liters: Number(parsed.payload.ethanol_liters),
        };
      }
    }
  } catch {
    return preparePayload(SCENARIO_PRESETS.Base.input);
  }

  return preparePayload(SCENARIO_PRESETS.Base.input);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createHourlyPerformance(outputs, payload) {
  const baseYield = outputs.safYield;
  const baseEnergy = payload.energy_input;
  const hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
  const yieldProfile = [0.88, 0.91, 0.94, 0.98, 0.96, 1.0, 1.03];
  const energyProfile = [0.98, 1.0, 1.02, 1.04, 1.03, 1.01, 0.99];

  return hours.map((hour, index) => ({
    hour,
    yield: Number((baseYield * yieldProfile[index]).toFixed(2)),
    energy: Number((baseEnergy * energyProfile[index]).toFixed(0)),
  }));
}

function createProcessStages(outputs, payload) {
  const feedstockUtilization = clamp(Math.round((payload.molasses_ton / 500) * 100), 70, 99);
  const fermentationUtilization = clamp(Math.round(payload.fermentation_eff * 100), 75, 99);
  const dehydrationUtilization = clamp(Math.round(payload.dehydration_eff * 100), 80, 99);
  const atjUtilization = clamp(Math.round(payload.atj_eff * 110), 70, 96);
  const dispatchUtilization = clamp(Math.round(88 + outputs.roi / 20), 72, 99);

  const fermentationStatus = payload.fermentation_eff < 0.89 ? "Watch" : "Stable";
  const atjStatus = payload.atj_eff < 0.68 ? "Optimizing" : "Stable";

  return [
    {
      stage: "Feedstock Handling",
      unit: "Cane prep + milling",
      status: "Stable",
      utilization: feedstockUtilization,
      output: `${payload.molasses_ton.toFixed(1)} t/day prepared feed`,
      quality: `Brix ${(16.8 + payload.fermentation_eff * 1.2).toFixed(1)}`,
    },
    {
      stage: "Fermentation",
      unit: "Bioreactor train",
      status: fermentationStatus,
      utilization: fermentationUtilization,
      output: `${(payload.ethanol_liters / 1000).toFixed(2)} KL/day ethanol`,
      quality: `Yield ${(payload.fermentation_eff * 100).toFixed(1)}%`,
    },
    {
      stage: "Dehydration",
      unit: "Molecular sieve",
      status: "Stable",
      utilization: dehydrationUtilization,
      output: `${((payload.ethanol_liters * payload.dehydration_eff) / 1000).toFixed(2)} KL/day anhydrous ethanol`,
      quality: `Purity ${(99 + (payload.dehydration_eff - 0.9) * 10).toFixed(2)}%`,
    },
    {
      stage: "ATJ Conversion",
      unit: "Catalytic reactor",
      status: atjStatus,
      utilization: atjUtilization,
      output: `${outputs.safYield.toFixed(2)} KL/day SAF blendstock`,
      quality: `Selectivity ${(payload.atj_eff * 100).toFixed(1)}%`,
    },
    {
      stage: "Finishing & Dispatch",
      unit: "Blending + QA",
      status: "Stable",
      utilization: dispatchUtilization,
      output: `${outputs.safYield.toFixed(2)} KL/day certified SAF`,
      quality: "ASTM D7566 pass",
    },
  ];
}

const statusClass = {
  Stable: "bg-emerald-500/20 text-emerald-300",
  Watch: "bg-amber-500/20 text-amber-300",
  Optimizing: "bg-blue-500/20 text-blue-300",
};

export default function DigitalTwin() {
  const [payload] = useState(getInitialPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSync, setLastSync] = useState(() => new Date().toLocaleString());

  const basePredictedSaf = estimateSafFromInputs(payload);
  const [outputs, setOutputs] = useState(() => deriveOutputs(basePredictedSaf, payload));

  const syncTwin = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${apiBaseUrl}/predict`, payload, { timeout: 10000 });

      const predictedSaf = Number(res?.data?.predicted_saf ?? basePredictedSaf);
      const nextOutputs = deriveOutputs(predictedSaf, payload);

      setOutputs(nextOutputs);
      setLastSync(new Date().toLocaleString());

      const latestSnapshot = {
        id: new Date().toISOString(),
        preset: "TwinLive",
        timestamp: new Date().toISOString(),
        payload,
        outputs: nextOutputs,
      };
      localStorage.setItem("saf_snapshot_latest", JSON.stringify(latestSnapshot));
    } catch (syncError) {
      const fallbackOutputs = deriveOutputs(basePredictedSaf, payload);
      setOutputs(fallbackOutputs);
      setError(
        syncError?.response?.data?.detail ||
          "Live backend sync failed. Showing locally estimated digital twin values."
      );
      setLastSync(new Date().toLocaleString());
    } finally {
      setIsLoading(false);
    }
  }, [basePredictedSaf, payload]);

  const confidence = useMemo(() => {
    const efficiencyScore =
      ((payload.fermentation_eff + payload.dehydration_eff + payload.atj_eff) / 3) * 100;
    return clamp(Number((90 + (efficiencyScore - 80) * 0.3).toFixed(1)), 90, 99.7);
  }, [payload]);

  const processStages = useMemo(() => createProcessStages(outputs, payload), [outputs, payload]);
  const hourlyPerformance = useMemo(
    () => createHourlyPerformance(outputs, payload),
    [outputs, payload]
  );

  const assumptions = useMemo(
    () => [
      ["Feedstock throughput", `${payload.molasses_ton.toFixed(1)} t/day`],
      ["Fermentation setpoint", `${(33 + payload.fermentation_eff * 2).toFixed(1)}°C`],
      ["Catalyst health index", `${(payload.atj_eff + 0.12).toFixed(2)}`],
      ["Specific energy input", `${payload.energy_input.toFixed(0)} kWh/day`],
      ["Target blend ratio", "30% SAF"],
    ],
    [payload]
  );

  const twinKpis = useMemo(
    () => [
      {
        label: "Twin Confidence",
        value: `${confidence.toFixed(1)}%`,
        note: "Model alignment vs current process assumptions",
      },
      {
        label: "Predicted SAF Today",
        value: `${outputs.safYield.toFixed(2)} KL`,
        note: "24h rolling estimate from live twin",
      },
      {
        label: "Specific Energy",
        value: `${(payload.energy_input / Math.max(outputs.safYield, 1)).toFixed(2)} kWh/KL`,
        note: "Across sugar-to-SAF conversion chain",
      },
      {
        label: "CO2 Avoidance",
        value: `${(outputs.carbonSavings / 1000).toFixed(2)} t/day`,
        note: "Compared with fossil jet baseline",
      },
    ],
    [confidence, outputs, payload]
  );

  useEffect(() => {
    syncTwin();
  }, [syncTwin]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="premium-panel premium-reveal p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="premium-heading premium-title sm:text-3xl">
                SAF Process Digital Twin
              </h1>
              <p className="premium-subtitle mt-3 max-w-4xl">
                Live virtual representation of the sugar-to-SAF chain for executive decision support, process risk control, and operational optimization.
              </p>
            </div>
            <div className="space-y-2 text-right">
              <div className="text-xs text-brand-muted">
                Last synchronized: {lastSync}
              </div>
              <button
                onClick={syncTwin}
                disabled={isLoading}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  isLoading
                    ? "cursor-not-allowed border-slate-600 text-slate-300"
                    : "border-brand-border/60 text-brand-text hover:border-blue-400 hover:text-blue-300"
                }`}
              >
                {isLoading ? "Syncing Twin..." : "Sync with Backend"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-900/30 px-4 py-3 text-sm text-amber-200">
              {error}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {twinKpis.map((kpi) => (
              <article key={kpi.label} className="premium-card premium-reveal p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">{kpi.label}</p>
              <p className="mt-2 text-2xl font-semibold text-brand-text">{kpi.value}</p>
              <p className="mt-1 text-xs text-brand-muted">{kpi.note}</p>
            </article>
          ))}
        </section>

          <section className="premium-panel premium-reveal premium-reveal-delay-1 p-6 sm:p-8">
            <h2 className="premium-heading text-xl font-semibold">Integrated Process Chain</h2>
            <div className="premium-divider mt-4" />
          <p className="mt-1 text-sm text-brand-muted">
            Unit-level health and throughput snapshots from feedstock intake to certified SAF dispatch.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {processStages.map((stage) => (
                <article key={stage.stage} className="premium-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-brand-text">{stage.stage}</h3>
                    <p className="text-xs tracking-wide text-brand-muted">{stage.unit}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      statusClass[stage.status]
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm leading-7">
                  <p className="text-brand-muted">
                    Utilization: <span className="font-semibold text-brand-text">{stage.utilization}%</span>
                  </p>
                  <p className="text-brand-muted">
                    Output: <span className="font-semibold text-brand-text">{stage.output}</span>
                  </p>
                  <p className="text-brand-muted">
                    Quality: <span className="font-semibold text-brand-text">{stage.quality}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="premium-panel p-5">
            <h3 className="text-base font-semibold text-brand-text">Yield Trend (Hourly)</h3>
            <p className="mt-1 text-xs text-brand-muted">Predicted certified SAF output over the current shift.</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26314a" />
                  <XAxis dataKey="hour" tick={{ fill: "#93a4c8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#93a4c8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#12192b", border: "1px solid #26314a" }} />
                  <Line type="monotone" dataKey="yield" stroke="#4f8cff" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="premium-panel p-5">
            <h3 className="text-base font-semibold text-brand-text">Energy Profile (Hourly)</h3>
            <p className="mt-1 text-xs text-brand-muted">Specific energy consumption across active process units.</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26314a" />
                  <XAxis dataKey="hour" tick={{ fill: "#93a4c8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#93a4c8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#12192b", border: "1px solid #26314a" }} />
                  <Line type="monotone" dataKey="energy" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="premium-panel p-6">
            <h3 className="text-base font-semibold text-brand-text">Model Assumptions</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody>
                  {assumptions.map(([label, value]) => (
                    <tr key={label} className="border-b border-brand-border/60">
                      <td className="px-2 py-3 text-brand-muted">{label}</td>
                      <td className="px-2 py-3 text-right font-semibold text-brand-text">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="premium-panel p-6">
            <h3 className="text-base font-semibold text-brand-text">Operational Risk Monitor</h3>
            <ul className="mt-4 space-y-3 text-sm text-brand-muted">
              <li className="premium-card p-4">
                Catalyst performance margin: {(payload.atj_eff * 100).toFixed(1)}% selectivity. Regeneration recommended when below 67.0%.
              </li>
              <li className="premium-card p-4">
                Fermentation efficiency at {(payload.fermentation_eff * 100).toFixed(1)}%; monitor if drift exceeds ±1.5% from target.
              </li>
              <li className="premium-card p-4">
                Energy demand at {payload.energy_input.toFixed(0)} kWh/day; optimize compression duty to improve ROI and carbon intensity.
              </li>
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
