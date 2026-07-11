"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const PATIENT_AUTH_KEY = "dwPatientLoggedIn";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"create" | "verify">("create");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    setStep("verify");
  };

  const handleVerifyOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otpCode.trim().length !== 6) {
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PATIENT_AUTH_KEY, "true");
    }

    router.push("/dashboard/patient");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-3 backdrop-blur sm:px-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-7 w-auto sm:h-8" src="/logo.png" width={128} height={32} />
          <span className="text-lg font-bold text-[#001b5e] sm:text-1xl">DominionWell+</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/services">Services</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/contact">Contact</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/about">About</Link>
        </nav>
        <Link href="/" className="text-xs font-semibold text-[#0aa4b4] md:hidden">
          Home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-4 py-8 md:px-10 md:py-12">
        <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 sm:mb-6">
            <div className="mb-1.5 flex items-center gap-2 sm:gap-3 sm:mb-2">
              <Link
                href="/login/patient"
                aria-label="Back"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">
                {step === "create" ? "Create Patient Account" : "Verify OTP"}
              </h1>
            </div>
            <p className="text-xs text-[#475569] sm:text-sm">
              {step === "create"
                ? "Registration is currently available for patients only."
                : "Enter the 6-digit code sent to your email to complete your registration."}
            </p>
          </div>

          {step === "create" ? (
            <form className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2" onSubmit={handleCreateAccount}>
              <label className="block text-xs sm:text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Account Type</span>
                <input
                  type="text"
                  value="Patient"
                  readOnly
                  disabled
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 text-xs text-[#64748b] sm:text-sm"
                />
              </label>

              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">First Name</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Last Name</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label className="block text-xs sm:text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="block text-xs sm:text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Phone Number</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="text"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Password</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Confirm Password</span>
                <input
                  className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>

              {password && confirmPassword && password !== confirmPassword ? (
                <p className="md:col-span-2 text-xs text-[#b91c1c] sm:text-sm">Passwords do not match.</p>
              ) : null}

              <div className="mt-2 md:col-span-2">
                <button className="w-full rounded-lg bg-[#16b46f] py-2.5 text-xs font-semibold text-white hover:bg-[#149660] sm:text-sm" type="submit">
                  Register as Patient
                </button>
              </div>

              <p className="md:col-span-2 text-center text-xs text-[#475569] sm:text-sm">
                Already have an account?{" "}
                <Link href="/login/patient" className="font-semibold text-[#0aa4b4]">
                  Login
                </Link>
              </p>
            </form>
          ) : (
            <form className="grid grid-cols-1 gap-3 sm:gap-4" onSubmit={handleVerifyOtp}>
              <div className="rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 py-2.5 text-xs text-[#475569] sm:text-sm">
                Code sent to {email || "your email"}.
              </div>

              <label className="block text-xs sm:text-sm">
                <span className="mb-1 block font-medium text-[#334155]">OTP Code</span>
                <input
                  className="h-11 w-full rounded-lg border border-[#c6c6cf] px-3 text-center text-sm tracking-[0.35em] outline-none focus:border-[#0aa4b4] sm:text-base"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))}
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep("create")}
                  className="h-10 flex-1 rounded-lg border border-[#c6c6cf] text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] sm:text-sm"
                >
                  Back to Edit Details
                </button>
                <button
                  type="submit"
                  className="h-10 flex-1 rounded-lg bg-[#16b46f] text-xs font-semibold text-white hover:bg-[#149660] sm:text-sm"
                >
                  Verify OTP
                </button>
              </div>

              <button
                type="button"
                className="justify-self-center text-xs font-semibold text-[#0aa4b4] hover:underline sm:text-sm"
              >
                Resend OTP
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
