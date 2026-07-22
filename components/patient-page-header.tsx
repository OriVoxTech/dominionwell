import Link from "next/link";
import type { ReactNode } from "react";

export default function PatientPageHeader({ title, description, icon, action }: { title: string; description: string; icon: string; action?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0"><div className="flex items-center gap-3"><Link href="/dashboard/patient" aria-label="Back to patient dashboard" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#d9e2ec] bg-white text-[#0b9459] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="material-symbols-outlined text-[19px]">arrow_back</span></Link><div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b9459]"><span className="material-symbols-outlined text-[14px]">{icon}</span>Patient workspace</p><h1 className="mt-1 text-xl font-bold tracking-[-0.025em] text-[#001b5e] sm:text-2xl">{title}</h1></div></div><p className="mt-3 max-w-2xl text-xs leading-5 text-[#718096] sm:ml-[52px] sm:text-sm">{description}</p></div>
      {action ? <div className="sm:shrink-0">{action}</div> : null}
    </header>
  );
}
