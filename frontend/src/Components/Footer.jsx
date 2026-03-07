import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  const year = new Date().getFullYear();
  const [timeNow, setTimeNow] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeNow(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <footer className="mt-12 bg-brand-bg">
      <div className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <h3 className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-sm font-semibold uppercase tracking-[0.2em] text-transparent">
            SugarNxt
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-brand-muted">
            Decision intelligence for SAF operations, emissions reduction, and financial planning.
          </p>
          <div className="mt-5 h-px w-28 bg-gradient-to-r from-blue-400/80 to-indigo-400/40" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-brand-text">Navigation</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-muted">
            <li>
              <Link to="/" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/sugar-process" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Sugar Process
              </Link>
            </li>
            <li>
              <Link to="/sugar-news" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Sugar News
              </Link>
            </li>
            <li>
              <Link to="/digital-twin" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Digital Twin
              </Link>
            </li>
            <li>
              <Link to="/financial" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Financial
              </Link>
            </li>
            <li>
              <Link to="/strategy" className="transition hover:translate-x-0.5 hover:text-blue-300">
                Strategy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-brand-text">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-muted">
            <li>Model-assisted SAF prediction</li>
            <li>Scenario comparison and export</li>
            <li>Operational and ROI analytics</li>
            <li>TRL, market, and scale-up roadmap</li>
          </ul>

          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="rounded-lg p-2 text-brand-muted transition hover:text-blue-300"
            >
              <FaLinkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-brand-muted transition hover:text-blue-300"
            >
              <FaGithub className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@sugarnxt.com"
              aria-label="Email"
              className="rounded-lg p-2 text-brand-muted transition hover:text-blue-300"
            >
              <MdEmail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-border/30 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-brand-muted sm:flex-row">
          <p>© {year} SugarNxt SAF • Built for sustainable aviation fuel intelligence. All rights reserved</p>
          <p className="rounded-md border border-brand-border/50 bg-brand-surface/50 px-2.5 py-1 font-mono text-[11px] text-blue-200">
            Time: {timeNow}
          </p>
        </div>
      </div>
    </footer>
  );
}
