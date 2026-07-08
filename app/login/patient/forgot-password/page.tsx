"use client";

import Link from "next/link";
import { useState } from "react";

export default function PatientForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetLink = `/login/patient/reset-password?email=${encodeURIComponent(email)}`;

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-7 sm:py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-3xl border border-[#c6c6cf] bg-white shadow-xl md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-5 sm:p-6 md:p-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login/patient"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">Forgot Password</h1>
          </div>
          <p className="mt-1.5 text-xs text-[#475569] sm:mt-2 sm:text-sm">
            Enter the email linked to your patient account and we&apos;ll start your password reset.
          </p>

          {isSubmitted ? (
            <div className="mt-6 rounded-2xl border border-[#16b46f]/30 bg-[#16b46f]/10 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-[#166534] sm:text-base">Reset link prepared</h2>
              <p className="mt-2 text-xs text-[#166534] sm:text-sm">
                Password reset instructions have been prepared for <span className="font-semibold">{email}</span>.
              </p>
              <p className="mt-2 text-xs text-[#475569] sm:text-sm">
                Continue to the reset screen to set a new password for this demo flow.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={resetLink} className="rounded-xl bg-[#16b46f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#149660] sm:text-sm">
                  Continue to Reset Password
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="rounded-xl border border-[#c6c6cf] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] sm:text-sm"
                >
                  Use a Different Email
                </button>
              </div>
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setIsSubmitted(true);
              }}
            >
              <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
                Email Address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                />
              </label>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#16b46f] text-sm font-semibold text-white hover:bg-[#149660]"
              >
                Send Reset Instructions
              </button>
            </form>
          )}

          <p className="mt-5 text-xs text-[#475569] sm:text-sm">
            Remembered your password?{" "}
            <Link href="/login/patient" className="font-semibold text-[#0aa4b4]">
              Back to login
            </Link>
          </p>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white lg:block">
          <h2 className="text-2xl font-bold">Secure account recovery</h2>
          <p className="mt-3 text-sm leading-7 text-[#dbeafe]">
            DominionWell+ keeps recovery steps simple while protecting your patient profile and care history.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Email-based reset access</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Protected account verification</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Fast return to your care dashboard</div>
          </div>
        </aside>
      </div>
    </main>
  );
}