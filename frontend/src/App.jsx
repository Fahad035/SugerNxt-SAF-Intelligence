import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { isAuthenticated } from "./utils/authSession";

const LandingPage = lazy(() => import("./Pages/LandingPage"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const SugarProcess = lazy(() => import("./Pages/SugarProcess"));
const SugarNews = lazy(() => import("./Pages/SugarNews"));
const DigitalTwin = lazy(() => import("./Pages/DigitalTwin"));
const Financial = lazy(() => import("./Pages/FinancialPage"));
const Strategy = lazy(() => import("./Pages/StrategyPage"));
const AuthPage = lazy(() => import("./Pages/AuthPage"));

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const heroRoutes = ["/", "/sugar-process"];
  const transitionClass = heroRoutes.includes(location.pathname)
    ? "route-transition-hero"
    : "route-transition-data";

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-text">
      {!isAuthRoute && <Navbar />}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="h-56 animate-pulse rounded-2xl border border-brand-border bg-brand-surface" />
            </div>
          }
        >
          <div key={location.pathname} className={`route-transition ${transitionClass}`}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sugar-process"
                element={
                  <ProtectedRoute>
                    <SugarProcess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sugar-news"
                element={
                  <ProtectedRoute>
                    <SugarNews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/digital-twin"
                element={
                  <ProtectedRoute>
                    <DigitalTwin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financial"
                element={
                  <ProtectedRoute>
                    <Financial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/strategy"
                element={
                  <ProtectedRoute>
                    <Strategy />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}