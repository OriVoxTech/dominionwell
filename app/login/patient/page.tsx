"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useEffect, useState } from "react";
import { getApiErrorMessage, patientAuthApi } from "@/lib/api";
import {
  clearPatientSession,
  savePatientSession,
} from "@/lib/patient-session";
import { usePatientSessionActive } from "@/components/use-patient-session-active";

const REMEMBERED_PATIENT_EMAIL_KEY = "dwRememberedPatientEmail";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PATIENT_DESTINATION = "/dashboard/patient";

function getSafePatientDestination(nextPath: string | null) {
  if (
    nextPath === DEFAULT_PATIENT_DESTINATION ||
    nextPath?.startsWith(`${DEFAULT_PATIENT_DESTINATION}/`) ||
    nextPath?.startsWith(`${DEFAULT_PATIENT_DESTINATION}?`)
  ) {
    return nextPath;
  }

  return DEFAULT_PATIENT_DESTINATION;
}

function getRememberedPatientEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REMEMBERED_PATIENT_EMAIL_KEY) ?? "";
}

function PatientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasPatientSession = usePatientSessionActive();
  const isPasswordResetComplete = searchParams.get("reset") === "success";
  const isPatientVerified = searchParams.get("verified") === "success";
  const isSessionExpired = searchParams.get("session") === "expired";
  const destinationAfterLogin = getSafePatientDestination(
    searchParams.get("next"),
  );
  const [email, setEmail] = useState(getRememberedPatientEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(() => Boolean(getRememberedPatientEmail()));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isLoginFormValid = isEmailValid && isPasswordValid;

  useEffect(() => {
    if (hasPatientSession) {
      router.replace(destinationAfterLogin);
    }
  }, [destinationAfterLogin, hasPatientSession, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoginFormValid) return;

    setErrorMessage("");
    setIsSubmitting(true);
    clearPatientSession();

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await patientAuthApi.login({
        email: normalizedEmail,
        password,
      });

      savePatientSession(response.data, true);

      if (rememberEmail) {
        window.localStorage.setItem(REMEMBERED_PATIENT_EMAIL_KEY, normalizedEmail);
      } else {
        window.localStorage.removeItem(REMEMBERED_PATIENT_EMAIL_KEY);
      }

      router.push(destinationAfterLogin);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasPatientSession) {
    return <main className="min-h-screen bg-[#f7f9fc]" />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbff,#ffffff_55%,#effcf6)] px-4 py-7 sm:py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1040px] overflow-hidden rounded-[1.75rem] border border-[#dbe4ee] bg-white shadow-[0_24px_65px_rgba(0,27,94,0.12)] md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-5 sm:p-6 md:p-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-xl font-bold text-[#001b5e] sm:text-2xl">
              Patient Login
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-[#475569] sm:mt-2 sm:text-sm">
            Continue your care journey securely with DominionWell+.
          </p>

          {isPasswordResetComplete ? (
            <div className="mt-4 rounded-xl border border-[#16b46f]/30 bg-[#16b46f]/10 px-4 py-3 text-xs font-medium text-[#166534] sm:text-sm">
              Your password has been reset. Sign in with your new password.
            </div>
          ) : null}

          {isPatientVerified ? (
            <div className="mt-4 rounded-xl border border-[#16b46f]/30 bg-[#16b46f]/10 px-4 py-3 text-xs font-medium text-[#166534] sm:text-sm">
              Your patient account has been verified. Sign in to continue.
            </div>
          ) : null}

          {isSessionExpired ? (
            <div className="mt-4 rounded-xl border border-[#fbbf24]/40 bg-[#fffbeb] px-4 py-3 text-xs font-medium text-[#92400e] sm:text-sm">
              Your session has expired. Please sign in again.
            </div>
          ) : null}

          <form
            className="mt-5 grid gap-3 sm:mt-6 sm:gap-4"
            onSubmit={handleLogin}
          >
            <label className="grid gap-1.5 text-xs font-medium text-[#001b5e] sm:gap-2 sm:text-sm">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
                aria-invalid={Boolean(email) && !isEmailValid}
                aria-describedby={email && !isEmailValid ? "login-email-error" : undefined}
                placeholder="you@example.com"
                className="h-10 rounded-xl border border-[#cbd5e1] px-3 text-xs text-[#0f172a] outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-sm"
              />
              {email && !isEmailValid ? (
                <span id="login-email-error" className="text-xs font-normal text-[#b91c1c]">Enter a valid email address.</span>
              ) : null}
            </label>

            <label className="grid gap-1.5 text-xs font-medium text-[#001b5e] sm:gap-2 sm:text-sm">
              Password
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  aria-invalid={Boolean(password) && !isPasswordValid}
                  aria-describedby="login-password-help"
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] px-3 pr-10 text-xs text-[#0f172a] outline-none focus:border-[#0aa4b4] sm:h-11 sm:pr-11 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-[#64748b] hover:text-[#001b5e] sm:h-11 sm:w-11"
                >
                  <span className="material-symbols-outlined text-[19px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              <span
                id="login-password-help"
                className={`text-xs font-normal ${password && !isPasswordValid ? "text-[#b91c1c]" : "text-[#64748b]"}`}
              >
                Password must be at least 8 characters.
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:gap-3 sm:text-sm">
              <label className="inline-flex items-center gap-2 text-[#475569]">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(event) => setRememberEmail(event.target.checked)}
                  className="h-4 w-4 accent-[#16b46f]"
                />
                Remember email
              </label>
              <Link href="/login/patient/forgot-password" className="font-medium text-[#0aa4b4]">
                Forgot password?
              </Link>
            </div>

            {errorMessage ? (
              <p role="alert" aria-live="polite" className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c] sm:text-sm">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!isLoginFormValid || isSubmitting}
              className="mt-1 h-10 rounded-xl bg-[#16b46f] text-xs font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:brightness-100 sm:h-11 sm:text-sm"
            >
              {isSubmitting ? "Signing in..." : "Login as Patient"}
            </button>
          </form>

          <p className="mt-4 text-xs text-[#475569] sm:mt-5 sm:text-sm">
            New to DominionWell+?{" "}
            <Link href="/register" className="font-semibold text-[#0aa4b4]">
              Create an account
            </Link>
          </p>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white lg:block">
          <h2 className="text-xl font-bold">Your health data, protected.</h2>
          <p className="mt-3 text-sm leading-7 text-[#dbeafe]">
            Login to access appointments, medical records, secure chats, and prescription updates in one place.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">
              Encrypted patient records
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">
              Instant specialist access
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">
              24/7 support and reminders
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function PatientLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f9fc]" />}>
      <PatientLoginContent />
    </Suspense>
  );
}
