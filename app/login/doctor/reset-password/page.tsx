"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DoctorResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your physician account";
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-7 sm:py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-3xl border border-[#c6c6cf] bg-white shadow-xl md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-5 sm:p-6 md:p-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login/doctor/forgot-password"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">Reset Password</h1>
          </div>
          <p className="mt-1.5 text-xs text-[#475569] sm:mt-2 sm:text-sm">
            Enter the verification code and choose a new password for <span className="font-semibold">{email}</span>.
          </p>

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-xs font-medium text-[#b91c1c] sm:text-sm">
              {errorMessage}
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (newPassword !== confirmPassword) {
                setErrorMessage("Passwords do not match.");
                return;
              }

              if (verificationCode.trim().length < 6) {
                setErrorMessage("Enter a valid verification code.");
                return;
              }

              setErrorMessage("");
              router.push("/login/doctor?reset=success");
            }}
          >
            <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
              Verification Code
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="Enter the 6-digit code"
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
              New Password
              <input
                type="password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Create a new password"
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
              Confirm Password
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#16b46f] text-sm font-semibold text-white hover:bg-[#149660]"
            >
              Reset Password
            </button>
          </form>

          <p className="mt-5 text-xs text-[#475569] sm:text-sm">
            Need another code?{" "}
            <Link href="/login/doctor/forgot-password" className="font-semibold text-[#0aa4b4]">
              Start over
            </Link>
          </p>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white lg:block">
          <h2 className="text-2xl font-bold">Return to your care workspace</h2>
          <p className="mt-3 text-sm leading-7 text-[#dbeafe]">
            Complete a secure password reset and get back to consultation requests, scheduling, and patient follow-up.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Code-based verification</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Protected credential update</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Fast physician account recovery</div>
          </div>
        </aside>
      </div>
    </main>
  );
}