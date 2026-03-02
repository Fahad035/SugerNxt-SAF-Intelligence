import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

const LandingPage = lazy(() => import("./Pages/LandingPage"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const SugarProcess = lazy(() => import("./Pages/SugarProcess"));
const SugarNews = lazy(() => import("./Pages/SugarNews"));
const DigitalTwin = lazy(() => import("./Pages/DigitalTwin"));
const Financial = lazy(() => import("./Pages/FinancialPage"));

function AppShell() {
  const location = useLocation();
  const heroRoutes = ["/", "/sugar-process"];
  const transitionClass = heroRoutes.includes(location.pathname)
    ? "route-transition-hero"
    : "route-transition-data";

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-text">
      <Navbar />
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sugar-process" element={<SugarProcess />} />
              <Route path="/sugar-news" element={<SugarNews />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/financial" element={<Financial />} />
            </Routes>
          </div>
        </Suspense>
      </main>
      <Footer />
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