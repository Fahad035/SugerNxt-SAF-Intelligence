import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

function ChartPanel({ title, subtitle, children }) {
  return (
    <section className="h-80 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
      <h3 className="text-base font-semibold text-brand-text">{title}</h3>
      <p className="mt-1 text-xs text-brand-muted">{subtitle}</p>
      <div className="mt-4 h-56">{children}</div>
    </section>
  );
}

export default function DashboardCharts({ sensitivityData, carbonData, formatNumber }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <ChartPanel
        title="SAF Sensitivity vs Molasses"
        subtitle="Estimated output response across feedstock volume."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sensitivityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="molasses" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `${formatNumber(value)} KL`} />
            <Line type="monotone" dataKey="saf" stroke="#16a34a" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Carbon Savings vs Efficiency"
        subtitle="Fermentation optimization impact on emissions benefit."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={carbonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="efficiency" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `${formatNumber(value, 0)} kgCO2e`} />
            <Line type="monotone" dataKey="carbon" stroke="#334155" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}
