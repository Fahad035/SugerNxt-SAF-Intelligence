import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function FinancialWaterfallChart({ waterfallData, formatCurrency }) {
  return (
    <section className="premium-panel p-5">
      <h3 className="premium-heading text-base font-semibold">ROI Waterfall</h3>
      <p className="mt-1 text-xs text-brand-muted">
        Revenue and cost bridge to final net contribution.
      </p>

      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterfallData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name, item) => {
                if (name === "amount") {
                  return formatCurrency(item.payload.rawDelta);
                }
                return null;
              }}
            />
            <Bar dataKey="base" stackId="flow" fill="transparent" />
            <Bar dataKey="amount" stackId="flow" fill="currentColor">
              {waterfallData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.positive ? "#16a34a" : "#e11d48"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
