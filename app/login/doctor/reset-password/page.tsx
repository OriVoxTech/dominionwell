"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useState } from "react";
import { doctorAuthApi, getApiErrorMessage } from "@/lib/api";

function DoctorResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFormValid =
    Boolean(email) &&
    verificationCode.length === 6 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await doctorAuthApi.resetPassword({
        email,
        otp: verificationCode,
        newPassword,
        confirmPassword,
      });
      router.push("/login/doctor?reset=success");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
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
              href="/login/doctor/forgot-password"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">Reset Password</h1>
          </div>
          <p className="mt-1.5 text-xs text-[#475569] sm:mt-2 sm:text-sm">
            Enter the verification code and choose a new password for <span className="font-semibold">{email || "your physician account"}</span>.
          </p>

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-xs font-medium text-[#b91c1c] sm:text-sm">
              {errorMessage}
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4"
            onSubmit={handleSubmit}
          >
            <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
              Verification Code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(event) => {
                  setVerificationCode(event.target.value.replace(/\D/g, ""));
                  setErrorMessage("");
                }}
                placeholder="Enter the 6-digit code"
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
              New Password
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Create a new password"
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-3 pr-11 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]"
                >
                  <span className="material-symbols-outlined text-[19px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              <span className="text-xs font-normal text-[#64748b]">Use at least 8 characters.</span>
            </label>

            <label className="grid gap-2 text-xs font-medium text-[#001b5e] sm:text-sm">
              Confirm Password
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Re-enter your new password"
                  className="h-11 w-full rounded-xl border border-[#cbd5e1] px-3 pr-11 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                  className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]"
                >
                  <span className="material-symbols-outlined text-[19px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="h-11 rounded-xl bg-[#16b46f] text-sm font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:bg-[#94a3b8]"
            >
              {isSubmitting ? "Resetting password..." : "Reset Password"}
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

export default function DoctorResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f9fc]" />}>
      <DoctorResetPasswordContent />
    </Suspense>
  );
}
