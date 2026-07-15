"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { adminApiService, getApiErrorMessage } from "@/lib/api";
import { clearAdminSession, saveAdminSession } from "@/lib/admin-session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const isFormValid = isEmailValid && password.length >= 8;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("session") !== "expired") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setError("Your session has expired. Please log in again.");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;

    setError("");
    setIsSubmitting(true);
    clearAdminSession();

    try {
      const response = await adminApiService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      saveAdminSession(response.data);
      router.replace("/admin/dashboard");
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f2f7ff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-3xl border border-[#dbe4f0] bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="p-6 sm:p-8 md:p-10">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">Admin Login</h1>
            <p className="mt-2 text-sm text-[#475569]">Sign in to manage doctors, patients, payments, subscriptions, and analytics.</p>
          </div>

          <form className="grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Email Address
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                aria-invalid={Boolean(email) && !isEmailValid}
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                placeholder="admin@dominionwell.com"
                required
              />
              {email && !isEmailValid ? <span className="text-xs font-normal text-[#b91c1c]">Enter a valid email address.</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Password
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-3 pr-11 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                  placeholder="Enter admin password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]">
                  <span className="material-symbols-outlined text-[19px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              <span className={`text-xs font-normal ${password && password.length < 8 ? "text-[#b91c1c]" : "text-[#64748b]"}`}>Password must be at least 8 characters.</span>
            </label>

            {error ? <p className="text-sm font-medium text-[#b91c1c]">{error}</p> : null}

            <button type="submit" disabled={!isFormValid || isSubmitting} className="h-11 rounded-xl bg-[#001b5e] text-sm font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]">
              {isSubmitting ? "Signing in..." : "Login to Admin Portal"}
            </button>
          </form>

          <div className="mt-6">
            <Link href="/" className="text-sm font-semibold text-[#0aa4b4] hover:underline">
              Back to Homepage
            </Link>
          </div>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white lg:block">
          <h2 className="text-2xl font-bold">DominionWell+ Control Center</h2>
          <p className="mt-3 text-sm leading-7 text-[#dbeafe]">
            Monitor platform health, govern account access, review consultations, and manage all operational workflows from one secure console.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Doctor and patient lifecycle governance</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Consultation and appointment oversight</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Subscription, payment, and analytics operations</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
