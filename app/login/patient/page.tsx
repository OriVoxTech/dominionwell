"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const PATIENT_AUTH_KEY = "dwPatientLoggedIn";

export default function PatientLoginPage() {
  const router = useRouter();

  const goToDashboard = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PATIENT_AUTH_KEY, "true");
    }

    router.push("/dashboard/patient");
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-3xl border border-[#c6c6cf] bg-white shadow-xl md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-6 md:p-10">
          <Link href="/" className="text-sm font-semibold text-[#0aa4b4]">
            Back to Home
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-[#001b5e]">
            Patient Login
          </h1>
          <p className="mt-2 text-sm text-[#475569]">
            Continue your care journey securely with DominionWell+.
          </p>

          <button
            type="button"
            onClick={goToDashboard}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[#c6c6cf] px-4 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#f8fafc]"
          >
            <span
              className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold"
              aria-hidden="true"
            >
              G
            </span>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-[#94a3b8]">
            <span className="h-px flex-1 bg-[#e2e8f0]" />
            <span>Or login with email</span>
            <span className="h-px flex-1 bg-[#e2e8f0]" />
          </div>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              goToDashboard();
            }}
          >
            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Email
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Password
              <input
                type="password"
                required
                placeholder="Enter your password"
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="inline-flex items-center gap-2 text-[#475569]">
                <input type="checkbox" className="h-4 w-4 accent-[#16b46f]" />
                Remember me
              </label>
              <a href="#" className="font-medium text-[#0aa4b4]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-1 h-11 rounded-xl bg-[#16b46f] text-sm font-semibold text-white hover:brightness-95"
            >
              Login as Patient
            </button>
          </form>

          <p className="mt-5 text-sm text-[#475569]">
            New to DominionWell+?{" "}
            <a href="#" className="font-semibold text-[#0aa4b4]">
              Create an account
            </a>
          </p>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white md:block">
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
