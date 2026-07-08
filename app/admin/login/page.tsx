"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const ADMIN_SESSION_KEY = "dwAdminSession";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername !== "admin" || password !== "Admin@123") {
      setError("Invalid admin credentials.");
      return;
    }

    window.localStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        username: "admin",
        loggedInAt: new Date().toISOString(),
      })
    );

    setError("");
    router.replace("/admin/dashboard");
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f2f7ff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-3xl border border-[#dbe4f0] bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="p-6 sm:p-8 md:p-10">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#001b5e] sm:text-3xl">Admin Login</h1>
            <p className="mt-2 text-sm text-[#475569]">Sign in to manage doctors, patients, payments, subscriptions, and analytics.</p>
          </div>

          <form className="grid gap-4" onSubmit={handleLogin}>
            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                placeholder="admin"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#001b5e]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl border border-[#cbd5e1] px-3 text-sm text-[#0f172a] outline-none focus:border-[#0aa4b4]"
                placeholder="Enter admin password"
                required
              />
            </label>

            {error ? <p className="text-sm font-medium text-[#b91c1c]">{error}</p> : null}

            <button type="submit" className="h-11 rounded-xl bg-[#001b5e] text-sm font-semibold text-white hover:bg-[#0b2b75]">
              Login to Admin Portal
            </button>
          </form>

          <p className="mt-4 text-xs text-[#64748b]">
            Demo credentials: <span className="font-semibold">admin / Admin@123</span>
          </p>

          <div className="mt-6">
            <Link href="/" className="text-sm font-semibold text-[#0aa4b4] hover:underline">
              Back to Homepage
            </Link>
          </div>
        </section>

        <aside className="hidden bg-[#001b5e] p-10 text-white lg:block">
          <h2 className="text-2xl font-bold">DominionWell+ Control Center</h2>
          <p className="mt-3 text-sm leading-7 text-[#dbeafe]">
            Monitor platform health, govern account access, review consultations, and manage all operational workflows from one secure console.
          </p>

          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Doctor and patient lifecycle governance</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Consultation and appointment oversight</div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-3">Subscription, payment, and analytics operations</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
