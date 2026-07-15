"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearAdminSession, isAdminSessionActive } from "@/lib/admin-session";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/doctors", label: "Doctors Management" },
  { href: "/admin/patients", label: "Patients Management" },
  { href: "/admin/consultations", label: "Consultation Management" },
  { href: "/admin/subscriptions", label: "Subscription Plans" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoginRoute) {
      return;
    }

    if (!isAdminSessionActive()) {
      router.replace("/admin/login");
    }
  }, [isLoginRoute, router]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="dw-admin-root min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f7f9fc_35%,#f4f7fb_100%)] text-[#191c1e]">
      <header className="sticky top-0 z-50 border-b border-[#dbe4f0] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#001b5e] sm:text-xl">DominionWell+ Admin</h1>
            <p className="text-xs text-[#64748b]">Platform operations and governance center</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#c6c6cf] bg-white text-[#001b5e] hover:bg-[#f8fafc] md:hidden"
              aria-label="Toggle admin menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <span className="material-symbols-outlined text-[20px]">{isMobileMenuOpen ? "close" : "menu"}</span>
            </button>
            <Link
              href="/"
              className="hidden rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc] sm:inline-flex"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Back to Homepage
            </Link>
            <button
              type="button"
              className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
              onClick={() => {
                setIsMobileMenuOpen(false);
                clearAdminSession();
                router.replace("/admin/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          className={`mx-auto mt-3 w-full max-w-[1440px] overflow-hidden transition-all duration-200 md:hidden ${
            isMobileMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="rounded-2xl border border-[#dbe4f0] bg-white p-2 shadow-sm">
            {links.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mb-1 block rounded-lg px-3 py-2.5 text-sm font-semibold transition last:mb-0 ${
                    isActive
                      ? "bg-[#001b5e] text-white"
                      : "border border-transparent text-[#334155] hover:border-[#dbeafe] hover:bg-[#f8fbff]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e2e8f0] pt-2">
              <Link
                href="/"
                className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-center text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Homepage
              </Link>
              <button
                type="button"
                className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  clearAdminSession();
                  router.replace("/admin/login");
                }}
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6">
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

          <main className="dw-admin-content rounded-2xl border border-[#dbe4f0] bg-white/95 p-4 shadow-sm sm:p-6">{children}</main>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          .dw-admin-root {
            font-family: "Avenir Next", Avenir, "Segoe UI", system-ui, -apple-system, sans-serif;
          }

          .dw-admin-content h2 {
            font-size: 1.3rem;
            line-height: 1.25;
            letter-spacing: -0.01em;
          }

          .dw-admin-content h3 {
            font-size: 1rem;
            line-height: 1.35;
            letter-spacing: -0.01em;
          }

          .dw-admin-content p,
          .dw-admin-content li,
          .dw-admin-content label,
          .dw-admin-content input,
          .dw-admin-content select,
          .dw-admin-content button,
          .dw-admin-content textarea,
          .dw-admin-content td,
          .dw-admin-content th,
          .dw-admin-content span {
            font-size: 0.92rem;
            line-height: 1.45;
          }

          .dw-admin-content table {
            min-width: 640px;
          }

          .dw-admin-content .overflow-x-auto {
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            background: #ffffff;
          }

          .dw-admin-content input,
          .dw-admin-content select,
          .dw-admin-content button {
            min-height: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
