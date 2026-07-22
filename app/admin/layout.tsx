"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearAdminSession, isAdminSessionActive } from "@/lib/admin-session";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: "space_dashboard" },
  { href: "/admin/doctors", label: "Doctors", icon: "stethoscope" },
  { href: "/admin/patients", label: "Patients", icon: "group" },
  { href: "/admin/consultations", label: "Consultations", icon: "video_camera_front" },
  { href: "/admin/specialties", label: "Specialties", icon: "medical_information" },
  { href: "/admin/subscriptions", label: "Subscription Plans", icon: "card_membership" },
  { href: "/admin/payments", label: "Payments", icon: "payments" },
  { href: "/admin/reports", label: "Reports", icon: "clinical_notes" },
];

function AdminNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1.5">
      {links.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-[#001b5e] shadow-lg shadow-black/10"
                : "text-[#cad7f4] hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#16a968]" : ""}`}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoginRoute && !isAdminSessionActive()) {
      router.replace("/admin/login");
    }
  }, [isLoginRoute, router]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const logout = () => {
    setIsMobileMenuOpen(false);
    clearAdminSession();
    router.replace("/admin/login");
  };

  if (isLoginRoute) return <>{children}</>;

  return (
    <div className="dw-admin-root min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <header className="sticky top-0 z-40 border-b border-[#dde5ef] bg-white/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#d9e2ec] text-[#001b5e]" aria-label="Open admin menu">
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div>
              <p className="text-sm font-extrabold tracking-[-0.025em] text-[#001b5e]">DominionWell<span className="text-[#16a968]">+</span></p>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8a96a8]">Admin</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="rounded-xl bg-[#001b5e] px-3 py-2 text-xs font-bold text-white">Logout</button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#0b1735]/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close admin menu" />
          <aside className="relative h-full w-[84%] max-w-xs overflow-y-auto bg-[#001b5e] p-4 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#72efad]"><span className="material-symbols-outlined text-[20px]">admin_panel_settings</span></span>
                <div><p className="text-base font-extrabold">DominionWell+</p><p className="text-[10px] text-[#9fb2dc]">Administration</p></div>
              </div>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10" aria-label="Close menu"><span className="material-symbols-outlined text-[19px]">close</span></button>
            </div>
            <AdminNavigation pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
            <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#cad7f4]"><span className="material-symbols-outlined text-[19px]">home</span>Homepage</Link>
              <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#cad7f4]"><span className="material-symbols-outlined text-[19px]">logout</span>Logout</button>
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-hidden bg-[#001b5e] text-white lg:flex">
        <div className="absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[#16a968]/15 blur-3xl" />
        <div className="relative flex h-full flex-col px-4 py-6">
          <Link href="/admin/dashboard" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#72efad]"><span className="material-symbols-outlined text-[21px]">admin_panel_settings</span></span>
            <div><p className="text-lg font-extrabold tracking-[-0.035em]">DominionWell<span className="text-[#72efad]">+</span></p><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8ea5d8]">Administration</p></div>
          </Link>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#16a968]/20 text-[#9cf5c6]"><span className="material-symbols-outlined text-[20px]">shield_person</span></span><div><p className="text-sm font-bold">Platform Admin</p><p className="text-[10px] text-[#aebfe4]">Operations workspace</p></div></div>
          </div>

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea5d8]">Management</p>
          <div className="flex-1 overflow-y-auto pr-1"><AdminNavigation pathname={pathname} /></div>

          <div className="mt-5 space-y-1 border-t border-white/10 pt-4 text-sm text-[#cad7f4]">
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/10 hover:text-white"><span className="material-symbols-outlined text-[19px]">home</span>Homepage</Link>
            <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/10 hover:text-white"><span className="material-symbols-outlined text-[19px]">logout</span>Logout</button>
          </div>
        </div>
      </aside>

      <main className="dw-admin-content min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">{children}</div>
      </main>

      <style jsx global>{`
        @media (max-width: 767px) {
          .dw-admin-content table { min-width: 640px; }
          .dw-admin-content .overflow-x-auto { border-radius: 0.875rem; }
          .dw-admin-content input,
          .dw-admin-content select,
          .dw-admin-content button { min-height: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
