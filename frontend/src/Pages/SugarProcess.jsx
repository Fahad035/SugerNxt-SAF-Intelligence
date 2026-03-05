const processSteps = [
  {
    title: "Cane Reception & Preparation",
    objective: "Deliver clean, uniformly prepared cane to maximize extraction efficiency.",
    operations: [
      "Weighbridge sampling, trash separation, and cane quality indexing (pol, fiber, mud).",
      "Cane knives, fibrizers, and shredders increase ruptured cell percentage.",
      "Magnetic tramp-metal removal protects downstream mills and pumps.",
    ],
    controls: "Prepared cane index, imbibition readiness, and stable feed rate to milling train.",
    equipment: "Carrier, leveller, cane knives, shredder/fibrizer, belt scales, magnetic separators.",
  },
  {
    title: "Juice Extraction (Milling/Diffusion)",
    objective: "Recover maximum sucrose into juice while minimizing sucrose loss in bagasse.",
    operations: [
      "4–6 roller mills with pressure settings and imbibition water addition.",
      "Alternative diffuser operation with prepared cane bed washing.",
      "Bagasse moisture and pol monitoring to track extraction losses.",
    ],
    controls: "Extraction efficiency, bagasse pol, imbibition ratio, and torque/load balance across mills.",
    equipment: "Mill tandem or diffuser, juice screens, imbibition pumps, bagasse conveyors.",
  },
  {
    title: "Juice Screening, Heating & Sulphitation / Phosphatation",
    objective: "Condition raw juice for robust clarification and color control.",
    operations: [
      "Primary and secondary juice screening removes coarse solids.",
      "Juice heating improves reaction kinetics and settling behavior.",
      "Optional sulphitation/phosphatation pre-treatment for impurity and color management.",
    ],
    controls: "Juice temperature profile, color trend, and stable solids loading to clarifier.",
    equipment: "Static screens, juice heaters, reaction tanks, dosing skids.",
  },
  {
    title: "Clarification",
    objective: "Remove suspended and colloidal impurities, producing clear juice for evaporation.",
    operations: [
      "Lime dosing to raise pH and precipitate non-sugars.",
      "Flocculant addition and residence time management in clarifier.",
      "Mud withdrawal to filtration; clear juice overflow to evaporation.",
    ],
    controls: "pH window, turbidity, mud solids, and low inversion risk.",
    equipment: "Lime preparation system, flash tank, clarifier, mud mixers, dosing pumps.",
  },
  {
    title: "Mud Filtration & Juice Recovery",
    objective: "Recover entrained sucrose from mud and reduce sugar loss.",
    operations: [
      "Rotary vacuum filters or pressure filters process clarifier mud.",
      "Filter cake washing recovers residual sucrose-rich liquor.",
      "Cake discharge to compost/soil conditioning stream.",
    ],
    controls: "Filterability, cake moisture, filtrate clarity, and sucrose recovery.",
    equipment: "Rotary vacuum filter / pressure filter, cake conveyors, filtrate tanks.",
  },
  {
    title: "Evaporation",
    objective: "Concentrate clarified juice into syrup with minimal color formation and scaling.",
    operations: [
      "Multiple-effect evaporation (typically 4–5 effects) for steam economy.",
      "Vapor bleeding and condensate recovery for energy integration.",
      "Scale management and periodic chemical cleaning routines.",
    ],
    controls: "Brix rise to syrup target, steam consumption, condensate quality, and ΔT profile.",
    equipment: "Multiple-effect evaporators, vapor separators, condensate polishers.",
  },
  {
    title: "Vacuum Pan Boiling & Crystallization",
    objective: "Generate controlled sucrose crystal growth at target size distribution and purity.",
    operations: [
      "Pan strike starts with concentration to metastable supersaturation.",
      "Seeding/graining introduces nuclei; growth proceeds by syrup feed control.",
      "A/B/C massecuite strategy recovers sucrose through staged crystallization.",
    ],
    controls: "Supersaturation coefficient, pan vacuum, massecuite viscosity, grain size trend.",
    equipment: "Batch/continuous vacuum pans, condensers, calandria, magma/melter systems.",
  },
  {
    title: "Centrifugation, Drying, Cooling & Grading",
    objective: "Separate mother liquor, dry crystals to safe moisture, and classify final product.",
    operations: [
      "High-speed centrifuges separate crystals from molasses.",
      "Steam/water washing controls crystal color and purity.",
      "Fluidized bed or rotary drying, cooling, sieving, and silo conditioning.",
    ],
    controls: "Sugar moisture, crystal temperature, color ICUMSA, and final granulometry.",
    equipment: "Batch/continuous centrifuges, dryers, coolers, vibrating screens, silos.",
  },
  {
    title: "Refining, Packaging & Dispatch",
    objective: "Meet customer quality specs and ensure stable shelf-life logistics.",
    operations: [
      "Optional remelt, decolorization, and recrystallization for refined grades.",
      "Automated bagging/bulk loading with metal detection and traceability labels.",
      "Warehouse humidity control and FIFO shipment management.",
    ],
    controls: "Purity, color, moisture, microbiological safety, and dispatch integrity.",
    equipment: "Refinery trains, bagging lines, palletizers, warehouse monitoring systems.",
  },
];

const crystallizationDetail = [
  {
    phase: "Supersaturation Control",
    purpose: "Maintain the liquor in metastable zone to favor crystal growth over false nucleation.",
    keyPoints: [
      "Undersaturated zone: no growth; unstable zone: spontaneous nucleation and fines.",
      "Metastable zone: controlled growth on existing seed crystals.",
      "Supersaturation is managed through vacuum, heating surface, feed syrup rate, and brix trajectory.",
    ],
  },
  {
    phase: "Seeding / Graining",
    purpose: "Create controlled nuclei population for target crystal count and final size.",
    keyPoints: [
      "Slurry seeding introduces microcrystals at precise supersaturation.",
      "Shock seeding risks wide crystal size distribution and high fines.",
      "Nucleation count determines final grain size at fixed mass of crystallized sucrose.",
    ],
  },
  {
    phase: "Crystal Growth",
    purpose: "Deposit sucrose uniformly on seed surfaces while preventing conglomeration.",
    keyPoints: [
      "Growth rate depends on supersaturation, purity, viscosity, and circulation.",
      "Pan feeding profile follows growth demand to keep mother liquor in metastable region.",
      "High viscosity near strike end requires careful temperature/vacuum balancing.",
    ],
  },
  {
    phase: "Massecuite Conditioning",
    purpose: "Prepare massecuite rheology and temperature for efficient centrifugation.",
    keyPoints: [
      "Massecuite is dropped to crystallizers for exhaustion and temperature equalization.",
      "Cooling crystallizers can increase recovery but may raise viscosity.",
      "Residence time optimization balances recovery vs centrifuge throughput.",
    ],
  },
  {
    phase: "A / B / C Boiling Scheme",
    purpose: "Maximize total sucrose recovery via staged crystallization of progressively lower purity liquors.",
    keyPoints: [
      "A massecuite generates primary sugar product with highest quality.",
      "B and C strikes process lower purity mother liquors, often remelted or recycled.",
      "Final molasses is withdrawn when further recovery becomes uneconomic or quality-limited.",
    ],
  },
];

const qualityTargets = [
  {
    parameter: "Clear juice turbidity",
    target: "Low and stable",
    impact: "Improves evaporator performance and minimizes downstream color formation.",
  },
  {
    parameter: "Syrup Brix",
    target: "High concentration before pan",
    impact: "Reduces pan boiling time and energy intensity.",
  },
  {
    parameter: "Massecuite crystal size CV",
    target: "Narrow distribution",
    impact: "Improves centrifuge separation and uniform product grade.",
  },
  {
    parameter: "Final sugar moisture",
    target: "Low and uniform",
    impact: "Prevents caking and microbial instability during storage.",
  },
  {
    parameter: "Color (ICUMSA)",
    target: "As per market grade",
    impact: "Determines product class and commercial value.",
  },
  {
    parameter: "Pol in molasses",
    target: "Minimized",
    impact: "Lower sucrose loss and better overall recovery.",
  },
];

const troubleshooting = [
  {
    issue: "Excess fines in sugar",
    probableCause: "Overseeding or unstable supersaturation in vacuum pan.",
    correctiveAction: "Reduce seed loading, tighten brix/vacuum control, and smooth feed profile.",
  },
  {
    issue: "High sugar in molasses",
    probableCause: "Poor crystal growth, short crystallizer retention, or centrifuge inefficiency.",
    correctiveAction: "Improve massecuite conditioning, optimize crystal size, tune centrifuge cycle.",
  },
  {
    issue: "Dark sugar color",
    probableCause: "Insufficient clarification, high temperature residence, or wash control issues.",
    correctiveAction: "Improve clarification chemistry, reduce thermal abuse, optimize centrifugal wash.",
  },
  {
    issue: "Evaporator scaling",
    probableCause: "High hardness/silica load and weak cleaning schedule.",
    correctiveAction: "Enhance pretreatment, monitor scaling index, and tighten CIP intervals.",
  },
  {
    issue: "Caking in storage",
    probableCause: "High residual moisture and insufficient cooling before silo entry.",
    correctiveAction: "Improve dryer/cooler tuning and maintain warehouse humidity control.",
  },
];

const chemistryData = [
  {
    name: "Sucrose",
    formula: "C12H22O11",
    note: "Primary disaccharide crystallized as final sugar product.",
  },
  {
    name: "Glucose",
    formula: "C6H12O6",
    note: "Reducing sugar that increases viscosity and affects crystal habit.",
  },
  {
    name: "Fructose",
    formula: "C6H12O6",
    note: "Reducing sugar contributing to inversion effects and color pickup risk.",
  },
  {
    name: "Calcium Hydroxide (Lime)",
    formula: "Ca(OH)2",
    note: "Raises pH, precipitates impurities, and supports flocculation during clarification.",
  },
  {
    name: "Phosphoric Acid",
    formula: "H3PO4",
    note: "Used in phosphatation to form removable precipitates with lime.",
  },
  {
    name: "Sulfur Dioxide",
    formula: "SO2",
    note: "Applied in sulphitation route for bleaching and pH conditioning.",
  },
  {
    name: "Carbon Dioxide",
    formula: "CO2",
    note: "Used in carbonation pathway to precipitate calcium salts and improve juice purity.",
  },
];

const byproductMap = [
  {
    stream: "Bagasse",
    composition: "Fiber-rich lignocellulosic residue",
    utilization: "Boiler fuel, cogeneration steam-power, paper/board, second-gen biofuels.",
  },
  {
    stream: "Molasses",
    composition: "Non-crystallizable sugar-rich mother liquor",
    utilization: "Ethanol fermentation, yeast, animal feed, biochemicals.",
  },
  {
    stream: "Press Mud / Filter Cake",
    composition: "Organic solids + precipitated impurities",
    utilization: "Compost, soil amendment, biofertilizer feedstock.",
  },
  {
    stream: "Condensate",
    composition: "Recovered process water",
    utilization: "Boiler makeup (after treatment), process washing, cooling utilities.",
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
            Complete industrial pathway from cane preparation to final sugar dispatch, with special focus on crystallization science, vacuum pan operation, mass recovery logic, quality controls, and troubleshooting.
          </p>
        </section>

        <section className="premium-panel premium-reveal premium-reveal-delay-1 p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">Complete Manufacturing Flow</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {processSteps.map((step, index) => (
              <article key={step.title} className="premium-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-base font-semibold text-brand-text">{step.title}</h3>
                <p className="premium-body mt-2">{step.objective}</p>
                <div className="mt-3 rounded-lg border border-brand-border/70 bg-brand-card p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Core Operations</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-brand-muted">
                    {step.operations.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-300" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 text-sm text-brand-muted">
                  <span className="font-semibold text-brand-text">Control focus:</span> {step.controls}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  <span className="font-semibold text-brand-text">Typical equipment:</span> {step.equipment}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="premium-panel premium-reveal premium-reveal-delay-2 p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">Crystallization Deep Dive</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {crystallizationDetail.map((item, index) => (
              <article key={item.phase} className="premium-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Phase {index + 1}</p>
                <h3 className="mt-2 text-base font-semibold text-brand-text">{item.phase}</h3>
                <p className="premium-body mt-2">{item.purpose}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-brand-muted">
                  {item.keyPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-brand-border bg-brand-card p-4 text-sm text-brand-muted">
            <span className="font-semibold text-brand-text">Operational note:</span> Stable supersaturation and controlled seeding are the highest-leverage controls for crystal size distribution, centrifuge performance, and overall sucrose recovery.
          </div>
        </section>

        <section className="premium-panel p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">Quality Control & Process KPIs</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="px-3 py-2">Parameter</th>
                  <th className="px-3 py-2">Target Direction</th>
                  <th className="px-3 py-2">Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                {qualityTargets.map((row) => (
                  <tr key={row.parameter} className="border-b border-brand-border/50 text-brand-text">
                    <td className="px-3 py-3 font-medium">{row.parameter}</td>
                    <td className="px-3 py-3 text-blue-300">{row.target}</td>
                    <td className="px-3 py-3 text-brand-muted">{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="premium-panel p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">Troubleshooting Guide</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="px-3 py-2">Issue</th>
                  <th className="px-3 py-2">Probable Cause</th>
                  <th className="px-3 py-2">Corrective Action</th>
                </tr>
              </thead>
              <tbody>
                {troubleshooting.map((row) => (
                  <tr key={row.issue} className="border-b border-brand-border/50 text-brand-text">
                    <td className="px-3 py-3 font-medium">{row.issue}</td>
                    <td className="px-3 py-3 text-brand-muted">{row.probableCause}</td>
                    <td className="px-3 py-3 text-brand-muted">{row.correctiveAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="premium-panel p-6 sm:p-8">
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

        <section className="premium-panel p-6 sm:p-8">
          <h2 className="premium-heading text-xl font-semibold">By-Product & Utility Integration</h2>
          <div className="premium-divider mt-4" />
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="px-3 py-2">Stream</th>
                  <th className="px-3 py-2">Nature</th>
                  <th className="px-3 py-2">Industrial Value Pathway</th>
                </tr>
              </thead>
              <tbody>
                {byproductMap.map((row) => (
                  <tr key={row.stream} className="border-b border-brand-border/50 text-brand-text">
                    <td className="px-3 py-3 font-medium">{row.stream}</td>
                    <td className="px-3 py-3 text-brand-muted">{row.composition}</td>
                    <td className="px-3 py-3 text-brand-muted">{row.utilization}</td>
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
