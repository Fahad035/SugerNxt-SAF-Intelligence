import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AUTH_EXPIRES_AT_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../utils/authSession";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialLogin = {
  email: "",
  password: "",
};

const initialSignup = {
  fullName: "",
  company: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthPage({ initialMode = "login" }) {
  const [mode] = useState(initialMode === "signup" ? "signup" : "login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  const heroText = useMemo(
    () =>
      isLogin
        ? "Welcome back. Continue your SAF planning workspace."
        : "Create your account and start advanced scenario planning.",
    [isLogin]
  );

  const handleLoginChange = (field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignupChange = (field, value) => {
    setSignupForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (isLogin) {
      if (!validateEmail(loginForm.email)) {
        setMessage({ type: "error", text: "Please enter a valid email address." });
        return;
      }
      if (loginForm.password.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
        return;
      }
    }

    if (!signupForm.fullName.trim()) {
      setMessage({ type: "error", text: "Please enter your full name." });
      return;
    }
    if (!validateEmail(signupForm.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (signupForm.password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin
        ? {
            email: loginForm.email.trim(),
            password: loginForm.password,
          }
        : {
            full_name: signupForm.fullName.trim(),
            company: signupForm.company.trim(),
            email: signupForm.email.trim(),
            password: signupForm.password,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || "Authentication failed");
      }

      const expiresAt = Date.now() + Number(data.expires_in || 0) * 1000;
      localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));

      setMessage({
        type: "success",
        text: isLogin
          ? "Login successful. Redirecting to dashboard..."
          : "Account created successfully. Redirecting to dashboard...",
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Unable to connect to auth service.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(140deg,#f7f8fb_0%,#eef6ff_48%,#f6fbf4_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-14 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-8 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.95fr]">
        <section className="rounded-3xl border border-white/60 bg-white/35 p-6 shadow-xl backdrop-blur-2xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">SugarNxt Access</p>
          <h1 className="mt-2 bg-gradient-to-r from-slate-900 via-cyan-900 to-emerald-800 bg-clip-text text-3xl font-semibold text-transparent sm:text-4xl">
            {isLogin ? "Login" : "Create Account"}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-700">{heroText}</p>

          <div className="mt-6 rounded-2xl border border-white/70 bg-white/45 p-4">
            <p className="text-sm font-semibold text-slate-900">Platform benefits</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Scenario snapshots saved to your workflow.</li>
              <li>Faster collaboration for technical and strategy teams.</li>
              <li>Consistent reporting for investors and stakeholders.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/35 p-6 shadow-xl backdrop-blur-2xl sm:p-8">
          <div className="flex items-center justify-between rounded-xl border border-white/70 bg-white/45 px-3 py-2 text-sm">
            <span className="font-semibold text-slate-800">{isLogin ? "Login" : "Sign Up"} Form</span>
            {isLogin ? (
              <Link to="/signup" className="font-semibold text-cyan-700 transition hover:text-cyan-900">
                Need account? Sign Up
              </Link>
            ) : (
              <Link to="/login" className="font-semibold text-cyan-700 transition hover:text-cyan-900">
                Already registered? Login
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {!isLogin && (
              <>
                <label className="block text-sm text-slate-700">
                  Full Name
                  <input
                    type="text"
                    value={signupForm.fullName}
                    onChange={(e) => handleSignupChange("fullName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="block text-sm text-slate-700">
                  Company / Organization
                  <input
                    type="text"
                    value={signupForm.company}
                    onChange={(e) => handleSignupChange("company", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                    placeholder="Optional"
                  />
                </label>
              </>
            )}

            <label className="block text-sm text-slate-700">
              Email Address
              <input
                type="email"
                value={isLogin ? loginForm.email : signupForm.email}
                onChange={(e) =>
                  isLogin
                    ? handleLoginChange("email", e.target.value)
                    : handleSignupChange("email", e.target.value)
                }
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                placeholder="name@company.com"
              />
            </label>

            <label className="block text-sm text-slate-700">
              Password
              <input
                type="password"
                value={isLogin ? loginForm.password : signupForm.password}
                onChange={(e) =>
                  isLogin
                    ? handleLoginChange("password", e.target.value)
                    : handleSignupChange("password", e.target.value)
                }
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                placeholder={isLogin ? "Enter password" : "Min 8 characters"}
              />
            </label>

            {!isLogin && (
              <label className="block text-sm text-slate-700">
                Confirm Password
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => handleSignupChange("confirmPassword", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
                  placeholder="Repeat password"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-500 hover:via-sky-500 hover:to-emerald-500"
            >
              {isSubmitting
                ? "Please wait..."
                : isLogin
                  ? "Login to SugarNxt"
                  : "Create SugarNxt Account"}
            </button>

            {message.text && (
              <div
                className={`rounded-lg border px-3 py-2 text-sm ${
                  message.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-rose-300 bg-rose-50 text-rose-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <Link
              to="/"
              className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-800"
            >
              Back to Home
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
