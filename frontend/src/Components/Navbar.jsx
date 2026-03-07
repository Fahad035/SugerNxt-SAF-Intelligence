import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { clearAuthSession, getStoredAuth } from "../utils/authSession";

const WARNING_THRESHOLD_SECONDS = 120;

function formatRemainingTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function Navbar() {
  const initialSession = getStoredAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(initialSession.user);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(initialSession.expiresAt);
  const [clockTick, setClockTick] = useState(initialSession.expiresAt || 0);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const headerRef = useRef(null);

  const navItemClass = ({ isActive }) =>
    `rounded-md border-b px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "border-blue-400 text-blue-300"
        : "border-transparent text-brand-muted hover:border-blue-500/60 hover:text-brand-text"
    }`;

  const authButtonClass = ({ isActive }) =>
    `rounded-lg border px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "border-blue-400 bg-blue-500/20 text-blue-200"
        : "border-brand-border/80 bg-brand-surface/70 text-brand-text hover:border-blue-400/70 hover:bg-blue-500/10"
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const refreshSessionUser = useCallback(() => {
    const session = getStoredAuth();
    setSessionUser(session.user);
    setSessionExpiresAt(session.expiresAt);
    setDismissedWarning(false);
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    setSessionUser(null);
    setSessionExpiresAt(0);
    setDismissedWarning(false);
    setIsMobileMenuOpen(false);
    window.location.href = "/login";
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!sessionUser || !sessionExpiresAt) return 0;
    return Math.max(0, Math.floor((sessionExpiresAt - clockTick) / 1000));
  }, [clockTick, sessionExpiresAt, sessionUser]);

  const isWarningWindow = Boolean(
    sessionUser && remainingSeconds > 0 && remainingSeconds <= WARNING_THRESHOLD_SECONDS
  );

  const showExpiryPopup = isWarningWindow && !dismissedWarning;

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
    window.addEventListener("storage", refreshSessionUser);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscapeKey);
      window.removeEventListener("storage", refreshSessionUser);
    };
  }, [isMobileMenuOpen, refreshSessionUser]);

  useEffect(() => {
    if (!sessionUser || !sessionExpiresAt) return undefined;

    const timer = window.setInterval(() => {
      const now = Date.now();
      setClockTick(now);
      if (sessionExpiresAt <= now) {
        handleLogout();
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [handleLogout, sessionExpiresAt, sessionUser]);

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
            Manufacturing
          </NavLink>
          <NavLink to="/sugar-news" className={navItemClass} onClick={closeMobileMenu}>
             News
          </NavLink>
          <NavLink to="/digital-twin" className={navItemClass} onClick={closeMobileMenu}>
            Digital Twin
          </NavLink>
          <NavLink to="/financial" className={navItemClass} onClick={closeMobileMenu}>
            Financial
          </NavLink>
          <NavLink to="/strategy" className={navItemClass} onClick={closeMobileMenu}>
            Strategy
          </NavLink>

          {sessionUser ? (
            <div className="ml-1 flex items-center gap-2">
              <span className="rounded-lg border border-brand-border/70 bg-brand-surface/60 px-3 py-2 text-sm font-semibold text-brand-text">
                {sessionUser.full_name || sessionUser.email}
              </span>
              <span className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                isWarningWindow
                  ? "border-amber-300/60 bg-amber-500/10 text-amber-200"
                  : "border-brand-border/70 bg-brand-surface/60 text-brand-muted"
              }`}>
                Session {formatRemainingTime(remainingSeconds)}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="ml-1 flex items-center gap-2">
              <NavLink to="/login" className={authButtonClass} onClick={closeMobileMenu}>
                Login
              </NavLink>
              <NavLink to="/signup" className={authButtonClass} onClick={closeMobileMenu}>
                Sign Up
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      <div
        className={`overflow-hidden border-t border-brand-border/40 bg-brand-bg/95 px-4 transition-all duration-300 ease-out lg:hidden ${
          isMobileMenuOpen
            ? "max-h-[calc(100vh-4rem)] py-3 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <div
          className={`max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 transition-transform duration-300 ${
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
              Manufacturing
            </NavLink>
            <NavLink to="/sugar-news" className={navItemClass} onClick={closeMobileMenu}>
              News
            </NavLink>
            <NavLink to="/digital-twin" className={navItemClass} onClick={closeMobileMenu}>
              Digital Twin
            </NavLink>
            <NavLink to="/financial" className={navItemClass} onClick={closeMobileMenu}>
              Financial
            </NavLink>
            <NavLink to="/strategy" className={navItemClass} onClick={closeMobileMenu}>
              Strategy
            </NavLink>

            {sessionUser ? (
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border border-brand-border/70 bg-brand-surface/60 px-3 py-2 text-sm font-semibold text-brand-text">
                  {sessionUser.full_name || sessionUser.email}
                </div>
                <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  isWarningWindow
                    ? "border-amber-300/60 bg-amber-500/10 text-amber-200"
                    : "border-brand-border/70 bg-brand-surface/60 text-brand-muted"
                }`}>
                  Session {formatRemainingTime(remainingSeconds)}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <NavLink to="/login" className={authButtonClass} onClick={closeMobileMenu}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={authButtonClass} onClick={closeMobileMenu}>
                  Sign Up
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      </div>

      {showExpiryPopup && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] max-w-sm">
          <div className="pointer-events-auto rounded-xl border border-amber-300/60 bg-[#2d2416]/95 p-4 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold text-amber-100">Session expiring soon</p>
            <p className="mt-1 text-xs leading-5 text-amber-200/90">
              You will be logged out automatically in {formatRemainingTime(remainingSeconds)}.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDismissedWarning(true)}
                className="rounded-md border border-amber-300/40 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-200"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-rose-300/50 bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:border-rose-200"
              >
                Logout now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}