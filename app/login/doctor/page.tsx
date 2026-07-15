"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useState } from "react";
import { doctorAuthApi, getApiErrorMessage } from "@/lib/api";
import { clearDoctorSession, saveDoctorSession } from "@/lib/doctor-session";

const REMEMBERED_DOCTOR_USERNAME_KEY = "dwRememberedDoctorUsername";

function getRememberedDoctorUsername() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(REMEMBERED_DOCTOR_USERNAME_KEY) ?? "";
}

function DoctorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPasswordResetComplete = searchParams.get("reset") === "success";
  const isSessionExpired = searchParams.get("session") === "expired";
  const [username, setUsername] = useState(getRememberedDoctorUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedDoctorUsername()));
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoginValid = Boolean(username.trim()) && password.length >= 8;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoginValid) return;

    setLoginError("");
    setIsSubmitting(true);
    clearDoctorSession();

    try {
      const normalizedUsername = username.trim();
      const response = await doctorAuthApi.login({
        username: normalizedUsername,
        password,
      });

      if (!response.data.accessToken) {
        setLoginError("The login response did not include an access token.");
        return;
      }

      saveDoctorSession(response.data, rememberMe);

      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_DOCTOR_USERNAME_KEY, normalizedUsername);
      } else {
        window.localStorage.removeItem(REMEMBERED_DOCTOR_USERNAME_KEY);
      }

      router.push("/dashboard/doctor");
    } catch (error) {
      setLoginError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-7 sm:py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-3xl border border-[#c6c6cf] bg-white shadow-xl md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-5 sm:p-6 md:p-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">Doctor Login</h1>
          </div>
          <p className="mt-1.5 text-xs text-[#475569] sm:mt-2 sm:text-sm">
            Sign in with your username and password to access your dashboard.
          </p>

          {isPasswordResetComplete ? (
            <div className="mt-4 rounded-xl border border-[#16b46f]/30 bg-[#16b46f]/10 px-4 py-3 text-xs font-medium text-[#166534] sm:text-sm">
              Your password has been reset. Sign in with your new password.
            </div>
          ) : null}

          {isSessionExpired ? (
            <div className="mt-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs font-medium text-[#92400e] sm:text-sm">
              Your session has expired. Please sign in again.
            </div>
          ) : null}

          <form
            className="mt-5 grid gap-3 sm:mt-7 sm:gap-4"
            onSubmit={handleLogin}
          >
            <label className="grid gap-1.5 text-xs font-medium text-[#001b5e] sm:gap-2 sm:text-sm">
              Username
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                placeholder="doctor.username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setLoginError("");
                }}
                className="h-10 rounded-xl border border-[#cbd5e1] px-3 text-xs text-[#0f172a] outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-sm"
              />
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setLoginError("");
                  }}
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
              <span className={`text-xs font-normal ${password && password.length < 8 ? "text-[#b91c1c]" : "text-[#64748b]"}`}>
                Password must be at least 8 characters.
              </span>
            </label>

            {loginError ? <p className="text-xs font-medium text-[#b91c1c] sm:text-sm">{loginError}</p> : null}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:gap-3 sm:text-sm">
              <label className="inline-flex items-center gap-2 text-[#475569]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 accent-[#16b46f]"
                />
                Remember me
              </label>
              <Link href="/login/doctor/forgot-password" className="font-medium text-[#0aa4b4]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={!isLoginValid || isSubmitting}
              className="mt-1 h-10 rounded-xl bg-[#16b46f] text-xs font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:brightness-100 sm:mt-2 sm:h-11 sm:text-sm"
            >
              {isSubmitting ? "Signing in..." : "Login as Doctor"}
            </button>
          </form>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white lg:block">
          <h2 className="text-2xl font-bold">DominionWell Physician Access</h2>
          <p className="mt-3 text-sm leading-7 text-[#dbeafe]">
            Review consultation requests, monitor schedules, and manage patient care from one secure workspace.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Consultation approvals and triage</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Daily schedule and virtual sessions</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Patient notes and reporting tools</div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function DoctorLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f9fc]" />}>
      <DoctorLoginContent />
    </Suspense>
  );
}
