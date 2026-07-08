"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/doctors", label: "Doctors Management" },
  { href: "/admin/patients", label: "Patients Management" },
  { href: "/admin/consultations", label: "Consultation Management" },
  { href: "/admin/subscriptions", label: "Subscription Plans" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
];

const ADMIN_SESSION_KEY = "dwAdminSession";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginRoute) {
      return;
    }

    const session = window.localStorage.getItem(ADMIN_SESSION_KEY);

    if (!session) {
      router.replace("/admin/login");
    }
  }, [isLoginRoute, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f7f9fc_35%,#f4f7fb_100%)] text-[#191c1e]">
      <header className="sticky top-0 z-40 border-b border-[#dbe4f0] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#001b5e] sm:text-xl">DominionWell+ Admin</h1>
            <p className="text-xs text-[#64748b]">Platform operations and governance center</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]">
              Back to Homepage
            </Link>
            <button
              type="button"
              className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
              onClick={() => {
                window.localStorage.removeItem(ADMIN_SESSION_KEY);
                router.replace("/admin/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6">
        <nav className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-[#dbe4f0] bg-white/80 p-2 shadow-sm md:hidden">
          {links.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#001b5e] text-white"
                    : "border border-transparent text-[#334155] hover:border-[#dbeafe] hover:bg-[#f8fbff]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
          <aside className="hidden rounded-2xl border border-[#dbe4f0] bg-white/90 p-3 shadow-sm md:block">
            <nav className="space-y-2">
              {links.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#001b5e] text-white"
                        : "border border-transparent text-[#334155] hover:border-[#dbeafe] hover:bg-[#f8fbff] hover:text-[#001b5e]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="rounded-2xl border border-[#dbe4f0] bg-white/95 p-4 shadow-sm sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
