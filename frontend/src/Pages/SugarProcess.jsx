const processSteps = [
  {
    title: "Cane Preparation",
    detail:
      "Sugarcane is washed, chopped, and shredded to increase surface area for efficient juice extraction.",
  },
  {
    title: "Juice Extraction",
    detail:
      "Prepared cane passes through milling or diffusion systems to separate raw juice from bagasse (fibrous residue).",
  },
  {
    title: "Clarification",
    detail:
      "Lime treatment and heating remove suspended solids and impurities, producing clarified juice.",
  },
  {
    title: "Evaporation",
    detail:
      "Multi-effect evaporators remove water and concentrate the juice into thick syrup.",
  },
  {
    title: "Crystallization",
    detail:
      "Vacuum pans promote sucrose crystal formation under controlled supersaturation.",
  },
  {
    title: "Centrifugation & Drying",
    detail:
      "Crystals are separated from molasses by centrifuges, then dried and cooled before storage.",
  },
];

const chemistryData = [
  {
    name: "Sucrose",
    formula: "C12H22O11",
    note: "Main sugar molecule produced and recovered from cane juice.",
  },
  {
    name: "Glucose",
    formula: "C6H12O6",
    note: "Reducing sugar present in small quantity in raw cane juice.",
  },
  {
    name: "Fructose",
    formula: "C6H12O6",
    note: "Another reducing sugar affecting crystallization behavior.",
  },
  {
    name: "Calcium Hydroxide (Lime)",
    formula: "Ca(OH)2",
    note: "Used during clarification to neutralize acidity and aid flocculation.",
  },
  {
    name: "Carbon Dioxide",
    formula: "CO2",
    note: "Used in carbonation-based purification pathways.",
  },
];

function renderFormula(formula) {
  const chunks = formula.split(/(\d+)/g);
  return chunks.map((chunk, index) =>
    /\d+/.test(chunk) ? <sub key={`${chunk}-${index}`}>{chunk}</sub> : chunk
  );
}

export default function SugarProcess() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="premium-panel premium-reveal p-6 sm:p-8">
          <h1 className="premium-heading premium-title sm:text-3xl">
            Sugar Production from Sugarcane
          </h1>
          <p className="premium-subtitle mt-3 max-w-4xl">
            End-to-end industrial process, from harvested cane to refined sugar crystals, including key chemistry references used in clarification and crystallization stages.
          </p>
        </section>

        <section className="premium-panel premium-reveal premium-reveal-delay-1 p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">Process Flow</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {processSteps.map((step, index) => (
              <article key={step.title} className="premium-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-base font-semibold text-brand-text">{step.title}</h3>
                <p className="premium-body mt-2">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="premium-panel premium-reveal premium-reveal-delay-2 p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">Key Chemical Formulas</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="px-3 py-2">Compound</th>
                  <th className="px-3 py-2">Formula</th>
                  <th className="px-3 py-2">Role in Process</th>
                </tr>
              </thead>
              <tbody>
                {chemistryData.map((compound) => (
                  <tr key={compound.name} className="border-b border-brand-border/50 text-brand-text">
                    <td className="px-3 py-3 font-medium">{compound.name}</td>
                    <td className="px-3 py-3 font-mono text-blue-300">{renderFormula(compound.formula)}</td>
                    <td className="px-3 py-3 text-brand-muted">{compound.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
