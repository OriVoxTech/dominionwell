"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DoctorLoginPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-3xl border border-[#c6c6cf] bg-white shadow-xl md:grid md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-6 md:p-10">
          <Link href="/" className="text-sm font-semibold text-[#0aa4b4]">
            Back to Home
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-[#001b5e]">Doctor Login</h1>
          <p className="mt-2 text-sm text-[#475569]">
            Sign in with your username and password to access your dashboard.
          </p>

          <form
            className="mt-7 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              router.push("/dashboard/doctor");
            }}
          >
            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Username
              <input
                type="text"
                required
                placeholder="doctor.username"
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
              className="mt-2 h-11 rounded-xl bg-[#16b46f] text-sm font-semibold text-white hover:brightness-95"
            >
              Login as Doctor
            </button>
          </form>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white md:block">
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
