"use client";

import Link from "next/link";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import DoctorProfileSummary from "@/components/doctor-profile-summary";

export type DoctorSidebarPage =
  | "dashboard"
  | "consultations"
  | "patients"
  | "reports"
  | "wallet"
  | "settings"
  | "notifications";

const navigation: Array<{
  key: DoctorSidebarPage;
  label: string;
  icon: string;
  href: string;
}> = [
  { key: "dashboard", label: "Overview", icon: "space_dashboard", href: "/dashboard/doctor" },
  { key: "consultations", label: "Consultations", icon: "medical_services", href: "/dashboard/doctor/consultations" },
  { key: "patients", label: "Patients", icon: "group", href: "/dashboard/doctor/patients" },
  { key: "reports", label: "Reports", icon: "clinical_notes", href: "/dashboard/doctor/reports" },
  { key: "wallet", label: "Wallet", icon: "account_balance_wallet", href: "/dashboard/doctor/wallet" },
  { key: "settings", label: "Settings", icon: "settings", href: "/dashboard/doctor/settings" },
];

export default function DoctorSidebar({ active }: { active: DoctorSidebarPage }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] overflow-hidden bg-[#001b5e] text-white lg:block">
      <div className="absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[#16b36c]/15 blur-3xl" />
      <div className="relative flex h-full flex-col px-4 py-6">
        <Link href="/dashboard/doctor" className="mb-7 flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#72efad]">
            <span className="material-symbols-outlined text-[21px]">health_and_safety</span>
          </span>
          <span className="text-lg font-extrabold tracking-[-0.035em]">
            DominionWell<span className="text-[#72efad]">+</span>
          </span>
        </Link>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
          <DoctorProfileSummary />
        </div>

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea5d8]">
          Doctor workspace
        </p>
        <nav className="flex-1 space-y-1.5 text-sm">
          {navigation.map((item) => {
            const isActive = item.key === active;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${
                  isActive
                    ? "bg-white text-[#001b5e] shadow-lg shadow-black/10"
                    : "text-[#cad7f4] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#16b36c]" : ""}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm">
          <Link
            href="/dashboard/doctor/notifications"
            aria-current={active === "notifications" ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${
              active === "notifications"
                ? "bg-white text-[#001b5e] shadow-lg shadow-black/10"
                : "text-[#cad7f4] hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${active === "notifications" ? "text-[#16b36c]" : ""}`}>
              notifications
            </span>
            <span>Notifications</span>
          </Link>
          <DoctorLogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-[#cad7f4] hover:bg-white/10 hover:text-white disabled:opacity-60" />
        </div>
      </div>
    </aside>
  );
}
