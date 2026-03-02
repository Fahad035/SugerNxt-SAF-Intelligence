const icons = {
  saf: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 15h8l3 4h2l-1.5-4H21l-2-2h-5l-4-8H7l2 8H3z" />
    </svg>
  ),
  carbon: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21c4.5 0 8-3.6 8-8 0-6-8-11-8-11S4 7 4 13c0 4.4 3.5 8 8 8Z" />
      <path d="M9.5 13.5c1.7 0 3-1.3 3-3" />
    </svg>
  ),
  roi: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18h16" />
      <path d="M6 15l3-4 3 2 4-6 2 2" />
      <path d="M16 9h4V5" />
    </svg>
  ),
};

export default function KPICard({ title, value, subtitle, delta, icon = "saf" }) {
  const hasDelta = Number.isFinite(delta);
  const deltaPositive = hasDelta && delta >= 0;

  return (
    <div className="h-36 rounded-2xl border border-brand-border bg-brand-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-text">
          <span className="rounded-lg bg-brand-surface p-2">{icons[icon] || icons.saf}</span>
          <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
        </div>
        {hasDelta && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              deltaPositive
                ? "bg-blue-500/20 text-blue-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {deltaPositive ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-brand-text">{value}</p>
      <p className="mt-1 text-xs text-brand-muted">{subtitle}</p>
    </div>
  );
}