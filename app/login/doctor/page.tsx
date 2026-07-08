"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DoctorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPasswordResetComplete = searchParams.get("reset") === "success";

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

          <form
            className="mt-5 grid gap-3 sm:mt-7 sm:gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              router.push("/dashboard/doctor");
            }}
          >
            <label className="grid gap-1.5 text-xs font-medium text-[#001b5e] sm:gap-2 sm:text-sm">
              Username
              <input
                type="text"
                required
                placeholder="doctor.username"
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
              <Link href="/login/doctor/forgot-password" className="font-medium text-[#0aa4b4]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="mt-1 h-10 rounded-xl bg-[#16b46f] text-xs font-semibold text-white hover:brightness-95 sm:mt-2 sm:h-11 sm:text-sm"
            >
              Login as Doctor
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
