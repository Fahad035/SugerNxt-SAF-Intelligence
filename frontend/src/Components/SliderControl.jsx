export default function SliderControl({
  label,
  value,
  setValue,
  min,
  max,
  step = 1,
  suffix = "",
  decimals = 0,
}) {
  const handleChange = (nextValue) => {
    setValue(Number(nextValue));
  };

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-brand-muted">{label}</label>
        <span className="text-sm font-semibold text-brand-text">
          {Number(value).toFixed(decimals)}
          {suffix}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-brand-border"
      />

      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
      />
    </div>
  );
}