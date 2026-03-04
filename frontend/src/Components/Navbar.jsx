import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const navItemClass = ({ isActive }) =>
    `rounded-md border-b px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "border-blue-400 text-blue-300"
        : "border-transparent text-brand-muted hover:border-blue-500/60 hover:text-brand-text"
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isMobileMenuOpen) return;
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between border-b border-brand-border/40 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-transparent">
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-lg font-black text-transparent">SN</span>
          </div>
          <div className="leading-tight">
            <h1 className="bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-base font-bold tracking-wide text-transparent sm:text-lg">
              SugarNxt SAF Intelligence
            </h1>
            <p className="hidden text-[11px] uppercase tracking-[0.2em] text-brand-muted sm:block">
              Aviation Fuel Decision Platform
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-brand-text transition duration-200 hover:text-blue-300 lg:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-5 w-5 transition-transform duration-300 ${
              isMobileMenuOpen ? "rotate-90" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isMobileMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-2 lg:flex">
          <NavLink to="/" className={navItemClass} onClick={closeMobileMenu}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navItemClass} onClick={closeMobileMenu}>
            Dashboard
          </NavLink>
          <NavLink to="/sugar-process" className={navItemClass} onClick={closeMobileMenu}>
            Sugar Process
          </NavLink>
          <NavLink to="/sugar-news" className={navItemClass} onClick={closeMobileMenu}>
            Sugar News
          </NavLink>
          <NavLink to="/digital-twin" className={navItemClass} onClick={closeMobileMenu}>
            Digital Twin
          </NavLink>
          <NavLink to="/financial" className={navItemClass} onClick={closeMobileMenu}>
            Financial
          </NavLink>
        </nav>
      </div>

      <div
        className={`overflow-hidden border-t border-brand-border/40 bg-brand-bg/95 px-4 transition-all duration-300 ease-out lg:hidden ${
          isMobileMenuOpen
            ? "max-h-64 py-3 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <div
          className={`transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            <NavLink to="/" className={navItemClass} onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={navItemClass} onClick={closeMobileMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/sugar-process" className={navItemClass} onClick={closeMobileMenu}>
              Sugar Process
            </NavLink>
            <NavLink to="/sugar-news" className={navItemClass} onClick={closeMobileMenu}>
              Sugar News
            </NavLink>
            <NavLink to="/digital-twin" className={navItemClass} onClick={closeMobileMenu}>
              Digital Twin
            </NavLink>
            <NavLink to="/financial" className={navItemClass} onClick={closeMobileMenu}>
              Financial
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}