"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PATIENT_AUTH_KEY = "dwPatientLoggedIn";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 flex-none">
      <path
        fill="#4285F4"
        d="M21.82 12.23c0-.72-.06-1.25-.19-1.8H12.2v3.56h5.53c-.11.89-.72 2.23-2.07 3.13l-.02.12 3.02 2.29.21.02c1.96-1.77 3.09-4.37 3.09-7.32Z"
      />
      <path
        fill="#34A853"
        d="M12.2 21.9c2.71 0 4.98-.87 6.64-2.35l-3.21-2.43c-.86.59-2.01 1-3.43 1-2.65 0-4.9-1.77-5.7-4.22l-.12.01-3.14 2.38-.04.11c1.66 3.22 5.07 5.5 9 5.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 13.9c-.21-.59-.34-1.23-.34-1.9s.13-1.31.33-1.9l-.01-.13-3.18-2.42-.1.04A9.72 9.72 0 0 0 2.2 12c0 1.54.37 3 1 4.31l3.3-2.41Z"
      />
      <path
        fill="#EA4335"
        d="M12.2 5.88c1.79 0 3 .75 3.69 1.38l2.7-2.57C17.17 3.38 14.91 2.1 12.2 2.1c-3.93 0-7.34 2.28-9 5.49l3.29 2.51c.81-2.45 3.06-4.22 5.71-4.22Z"
      />
    </svg>
  );
}

function PatientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPasswordResetComplete = searchParams.get("reset") === "success";

  const goToDashboard = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PATIENT_AUTH_KEY, "true");
    }

    router.push("/dashboard/patient");
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
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">
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

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#c6c6cf] px-4 py-2.5 text-xs font-semibold text-[#1f2937] hover:bg-[#f8fafc] sm:mt-6 sm:py-3 sm:text-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#94a3b8] sm:my-5 sm:gap-3 sm:text-xs">
            <span className="h-px flex-1 bg-[#e2e8f0]" />
            <span>Or login with email</span>
            <span className="h-px flex-1 bg-[#e2e8f0]" />
          </div>

          <form
            className="grid gap-3 sm:gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              goToDashboard();
            }}
          >
            <label className="grid gap-1.5 text-xs font-medium text-[#001b5e] sm:gap-2 sm:text-sm">
              Email
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="h-10 rounded-xl border border-[#cbd5e1] px-3 text-xs text-[#0f172a] outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-sm"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-medium text-[#001b5e] sm:gap-2 sm:text-sm">
              Password
              <input
                type="password"
                required
                placeholder="Enter your password"
                className="h-10 rounded-xl border border-[#cbd5e1] px-3 text-xs text-[#0f172a] outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-sm"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:gap-3 sm:text-sm">
              <label className="inline-flex items-center gap-2 text-[#475569]">
                <input type="checkbox" className="h-4 w-4 accent-[#16b46f]" />
                Remember me
              </label>
              <Link href="/login/patient/forgot-password" className="font-medium text-[#0aa4b4]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="mt-1 h-10 rounded-xl bg-[#16b46f] text-xs font-semibold text-white hover:brightness-95 sm:h-11 sm:text-sm"
            >
              Login as Patient
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
          <h2 className="text-2xl font-bold">Your health data, protected.</h2>
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
