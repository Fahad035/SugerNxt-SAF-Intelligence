import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const valueCards = [
  {
    title: "Operational Intelligence",
    text: "Turn feedstock, efficiency, and energy assumptions into actionable production forecasts.",
  },
  {
    title: "Financial Clarity",
    text: "Quantify ROI, cost drivers, and payback outlook before committing to scale-up decisions.",
  },
  {
    title: "Market Readiness",
    text: "Track sugar-market signals and align SAF strategy with real-time business dynamics.",
  },
];

const outcomes = [
  "Improve SAF yield planning with scenario-led simulations",
  "Reduce technical and commercial risk before capex decisions",
  "Support investor and board conversations with data-backed storytelling",
  "Build a future-ready path from sugar value chain to clean aviation fuel",
];

const faqs = [
  {
    question: "How should a new user start with SugarNxt?",
    answer:
      "Start in the Dashboard, select a preset, adjust key assumptions, and run prediction. Then review KPIs, compare scenarios, and use the Strategy page to convert results into commercialization decisions.",
  },
  {
    question: "What does the Dashboard prediction represent?",
    answer:
      "The prediction estimates SAF output from your selected feedstock and process assumptions. SugarNxt also derives carbon savings, cost outlook, and ROI signals so teams can assess both technical and commercial feasibility.",
  },
  {
    question: "When should I use the Digital Twin page?",
    answer:
      "Use Digital Twin when you want an operations view. It reflects process-stage behavior and performance insights that help validate whether the selected scenario is practical for plant-level execution.",
  },
  {
    question: "How is the Financial page useful for decision-making?",
    answer:
      "The Financial page converts your latest simulation snapshot into a profitability view, including cost structure and payback indicators, helping investors and managers evaluate whether to proceed, optimize, or pause.",
  },
  {
    question: "What is the purpose of the Strategy module?",
    answer:
      "Strategy links technical output with TRL readiness, market capture assumptions, and industrial-scale finance. It is designed to support commercialization planning, partner discussions, and hackathon-grade business storytelling.",
  },
  {
    question: "Can I save and share my simulation work?",
    answer:
      "Yes. Export snapshots from the Dashboard to keep records of assumptions and results. These files can be shared with teammates to align technical, financial, and strategy discussions around the same scenario baseline.",
  },
];

export default function LandingPage() {
  const [glowPoint, setGlowPoint] = useState({ x: 50, y: 35 });
  const [activeFaq, setActiveFaq] = useState(0);

  const heroStyle = useMemo(
    () => ({
      "--mx": `${glowPoint.x}%`,
      "--my": `${glowPoint.y}%`,
    }),
    [glowPoint]
  );

  const handleHeroMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlowPoint({ x, y });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-bg bg-[radial-gradient(circle_at_20%_0%,rgba(79,140,255,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(117,81,255,0.16),transparent_35%)]">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div
          style={heroStyle}
          onMouseMove={handleHeroMouseMove}
          className="landing-hero premium-reveal p-2 sm:p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
            SugarNxt SAF Intelligence
          </p>
          <h1 className="premium-title mt-4 max-w-5xl bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent sm:text-4xl lg:text-6xl">
            Transforming sugar ecosystem insights into scalable sustainable aviation fuel strategy.
          </h1>
          <p className="premium-subtitle mt-5 max-w-3xl sm:text-lg">
            SugerNxt helps producers, investors, and decision-makers simulate SAF production performance,
            evaluate financial outcomes, and plan future-ready business moves with confidence.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:from-blue-400 hover:to-indigo-400"
            >
              Explore Dashboard
            </Link>
            <Link
              to="/digital-twin"
              className="rounded-xl border border-brand-border/70 bg-transparent px-5 py-3 text-sm font-semibold text-brand-text transition duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-300"
            >
              View Digital Twin
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                97%+
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-muted">Twin Confidence</p>
            </div>
            <div>
              <p className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Real-time
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-muted">Decision Support</p>
            </div>
            <div>
              <p className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                ROI-led
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-muted">Commercial Planning</p>
            </div>
            <div>
              <p className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Net Zero
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-brand-muted">Aviation Pathway</p>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {valueCards.map((item, index) => (
            <article
              key={item.title}
              className={`premium-reveal border-l-2 border-blue-400/50 pl-5 transition duration-300 hover:border-blue-300 ${
                index === 0
                  ? "premium-reveal-delay-1"
                  : index === 1
                    ? "premium-reveal-delay-2"
                    : ""
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Capability</p>
              <h2 className="mt-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-xl font-semibold leading-tight text-transparent">
                {item.title}
              </h2>
              <p className="premium-body mt-3">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="premium-reveal premium-reveal-delay-2 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="premium-title bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent sm:text-3xl">
              Why this matters for future business
            </h2>
            <p className="premium-body mt-4">
              Global aviation decarbonization depends on reliable SAF scale-up. SugerNxt bridges operations,
              economics, and market signals so teams can move from pilot-stage thinking to strategic execution.
            </p>
            <ul className="mt-6 space-y-3">
              {outcomes.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-brand-muted">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-transparent blur-3xl" />
            <div className="relative space-y-5 border-l-2 border-blue-400/60 pl-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Business Impact</p>
              <div>
                <p className="bg-gradient-to-r from-blue-200 to-indigo-300 bg-clip-text text-4xl font-bold text-transparent">+18%</p>
                <p className="text-sm text-brand-muted">Potential improvement in scenario-led planning accuracy</p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-blue-200 to-indigo-300 bg-clip-text text-4xl font-bold text-transparent">-12%</p>
                <p className="text-sm text-brand-muted">Estimated reduction in avoidable process-energy overspend</p>
              </div>
              <div>
                <p className="bg-gradient-to-r from-blue-200 to-indigo-300 bg-clip-text text-4xl font-bold text-transparent">Faster</p>
                <p className="text-sm text-brand-muted">Decision cycles for commercial and technical teams</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
        <div className="premium-panel premium-reveal p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Help Center</p>
              <h2 className="premium-heading mt-2 text-2xl font-semibold">Frequently Asked Questions</h2>
            </div>
            <span className="rounded-md border border-brand-border bg-brand-card px-3 py-1.5 text-xs text-brand-muted">
              Quick user onboarding
            </span>
          </div>

          <div className="premium-divider mt-4" />

          <div className="mt-5 grid grid-cols-1 gap-3">
            {faqs.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <article
                  key={item.question}
                  className="premium-card overflow-hidden border border-brand-border/75"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq((prev) => (prev === index ? -1 : index))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-brand-text">{item.question}</span>
                    <span className={`text-base text-blue-300 transition ${isOpen ? "rotate-45" : "rotate-0"}`}>
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-brand-border/60 px-4 py-3 text-sm text-brand-muted">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
