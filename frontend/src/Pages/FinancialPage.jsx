import { lazy, Suspense, useMemo } from "react";
import { buildWaterfallData } from "../utils/safCalculations";

const FinancialWaterfallChart = lazy(() => import("../Components/charts/FinancialWaterfallChart"));

export default function Financial() {
  const snapshot = useMemo(() => {
    const raw = localStorage.getItem("saf_snapshot_latest");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const outputs = snapshot?.outputs;
  const waterfallData = outputs ? buildWaterfallData(outputs) : [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const paybackYears = outputs
    ? Math.max(outputs.totalCost / Math.max(outputs.netProfit, 1), 0).toFixed(2)
    : "-";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="premium-panel premium-reveal p-6 sm:p-8">
          <h1 className="premium-heading premium-title sm:text-3xl">Financial Analysis</h1>
          <p className="premium-subtitle mt-2">
            ROI waterfall and profitability view from your latest dashboard snapshot.
          </p>
        </section>

        {!snapshot ? (
          <section className="rounded-2xl border border-amber-500/40 bg-amber-900/30 p-5 text-sm text-amber-200">
            No simulation snapshot found. Run prediction from Dashboard and export/store a snapshot first.
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="premium-card p-5">
                <p className="text-sm text-brand-muted">Revenue</p>
                <p className="mt-1 text-2xl font-semibold text-brand-text">
                  {formatCurrency(outputs.revenue)}
                </p>
              </div>
              <div className="premium-card p-5">
                <p className="text-sm text-brand-muted">Net Profit</p>
                <p className="mt-1 text-2xl font-semibold text-brand-text">
                  {formatCurrency(outputs.netProfit)}
                </p>
              </div>
              <div className="premium-card p-5">
                <p className="text-sm text-brand-muted">Payback (years)</p>
                <p className="mt-1 text-2xl font-semibold text-brand-text">{paybackYears}</p>
              </div>
            </section>

            <Suspense
              fallback={
                <section className="premium-panel p-5">
                  <div className="h-80 animate-pulse rounded-xl bg-brand-card" />
                </section>
              }
            >
              <FinancialWaterfallChart
                waterfallData={waterfallData}
                formatCurrency={formatCurrency}
              />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}