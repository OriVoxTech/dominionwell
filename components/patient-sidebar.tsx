"use client";

import Link from "next/link";
import PatientAvatar from "@/components/patient-avatar";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientProfileSummary from "@/components/patient-profile-summary";
import { usePatientProfile } from "@/lib/use-patient-profile";

export type PatientSidebarPage = "dashboard" | "appointments" | "doctors" | "subscription" | "payments" | "settings" | "notifications";

const navigation: Array<{ key: PatientSidebarPage; label: string; icon: string; href: string }> = [
  { key: "dashboard", label: "Overview", icon: "space_dashboard", href: "/dashboard/patient" },
  { key: "appointments", label: "Appointments", icon: "calendar_month", href: "/dashboard/patient/appointments" },
  { key: "doctors", label: "Browse doctors", icon: "medical_services", href: "/dashboard/patient/doctors" },
  { key: "subscription", label: "Subscription", icon: "card_membership", href: "/dashboard/patient/subscription" },
  { key: "payments", label: "Payments", icon: "receipt_long", href: "/dashboard/patient/payments" },
  { key: "settings", label: "Settings", icon: "settings", href: "/dashboard/patient/settings" },
];

export default function PatientSidebar({ active }: { active: PatientSidebarPage }) {
  const profile = usePatientProfile();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] overflow-hidden bg-[#001b5e] text-white lg:block">
      <div className="absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[#16b36c]/15 blur-3xl" />
      <div className="relative flex h-full flex-col px-4 py-6">
        <Link href="/dashboard/patient" className="mb-7 flex items-center gap-2.5 px-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#72efad]"><span className="material-symbols-outlined text-[21px]">health_and_safety</span></span><span className="text-lg font-extrabold tracking-[-0.035em]">DominionWell<span className="text-[#72efad]">+</span></span></Link>
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3"><PatientAvatar profile={profile} /><PatientProfileSummary /></div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea5d8]">Patient workspace</p>
        <nav className="flex-1 space-y-1.5 text-sm">
          {navigation.map((item) => {
            const isActive = item.key === active;
            return <Link key={item.key} href={item.href} aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${isActive ? "bg-white text-[#001b5e] shadow-lg shadow-black/10" : "text-[#cad7f4] hover:bg-white/10 hover:text-white"}`}><span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#16b36c]" : ""}`}>{item.icon}</span><span>{item.label}</span></Link>;
          })}
        </nav>
        <Link href="/dashboard/patient/doctors" className="mb-4 flex items-center justify-between rounded-2xl bg-[linear-gradient(145deg,#16a968,#0c8b55)] p-4 text-xs font-bold shadow-lg shadow-black/10"><span>Book a consultation</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
        <div className="space-y-1.5 border-t border-white/10 pt-4 text-sm">
          <Link href="/dashboard/patient/notifications" aria-current={active === "notifications" ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold ${active === "notifications" ? "bg-white text-[#001b5e]" : "text-[#cad7f4] hover:bg-white/10 hover:text-white"}`}><span className={`material-symbols-outlined text-[20px] ${active === "notifications" ? "text-[#16b36c]" : ""}`}>notifications</span>Notifications</Link>
          <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-[#cad7f4] hover:bg-white/10 hover:text-white"><span className="material-symbols-outlined text-[20px]">help</span>Help center</Link>
          <PatientLogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-[#cad7f4] hover:bg-white/10 hover:text-white disabled:opacity-60" />
        </div>
      </div>
    </aside>
  );
}
