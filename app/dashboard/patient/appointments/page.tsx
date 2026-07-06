"use client";

import Image from "next/image";
import Link from "next/link";
import PatientMobileNav from "@/components/patient-mobile-nav";

type AppointmentStatus = "Completed" | "Follow-up" | "Canceled";

type Appointment = {
    id: string;
    doctor: string;
    specialty: string;
    status: AppointmentStatus;
    date: string;
    notes: string;
};

const statusStyles: Record<AppointmentStatus, string> = {
    Completed: "bg-[#16b46f]/15 text-[#16b46f]",
    "Follow-up": "bg-[#0aa4b4]/15 text-[#0aa4b4]",
    Canceled: "bg-[#ef4444]/12 text-[#dc2626]",
};

const consultationHistory: Appointment[] = [
    {
        id: "hist-1",
        doctor: "Dr. Sarah Weaver",
        specialty: "General Physician",
        status: "Completed",
        date: "2026-06-28 10:30 AM",
        notes: "Discussed recurring fatigue. Advised blood test and hydration plan.",
    },
    {
        id: "hist-2",
        doctor: "Dr. Richardson",
        specialty: "Cardiology",
        status: "Completed",
        date: "2026-06-10 09:15 AM",
        notes: "Reviewed ECG. Continue current medication and monitor blood pressure.",
    },
    {
        id: "hist-3",
        doctor: "Dr. Emily Stone",
        specialty: "Dermatology",
        status: "Follow-up",
        date: "2026-05-22 02:00 PM",
        notes: "Skin improvement observed. Follow-up in 3 weeks for progress review.",
    },
    {
        id: "hist-4",
        doctor: "Dr. Anthony Cole",
        specialty: "Neurology",
        status: "Canceled",
        date: "2026-05-05 11:00 AM",
        notes: "Consultation canceled by patient due to travel.",
    },
];

export default function PatientAppointmentsPage() {
    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
            <PatientMobileNav active="appointments" />

            <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
                <div className="mb-8 px-2">
                    <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
                </div>

                <div className="mb-6 flex items-center gap-3 px-2">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#16b46f]/40">
                        <Image
                            className="object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPurUR2thld9ARCgQv5h5zzRrmbx5VzEhRhGSj-4R3LQBMFeO5bA8OOCajuwGXXWPjtINjhw8-RqL2BIwlmrOkDz58EbqhMGjnRdrjEPNB6wMXEYirVhXLKHukNRiuOjWAxDoEcMTG9A2c2wKRcRRN4U7gxeFEPhJ7G7sLUQezeiulcTpl6y2fsYeeLmQHBuYLxYwyY3mOhVegyEsvP846S3aiHmWvjDLrjKsx9yBY9vkJssTPuipSUEY4d1WwN6dlulgSFUQpfRjW"
                            alt="Alex Johnson"
                            fill
                            sizes="44px"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">Alex Johnson</p>
                        <p className="text-xs text-[#d8e2ff]">ID: DW-98231</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 text-sm">
                    <Link href="/dashboard/patient" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b46f] bg-[#16b46f]/20 px-3 py-2 text-[#d7ffe9]">
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        <span>Appointments</span>
                    </div>
                    <Link href="/dashboard/patient/doctors" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">medical_services</span>
                        <span>Browse Doctors</span>
                    </Link>
                    <Link href="/dashboard/patient/settings" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span>Settings</span>
                    </Link>
                </nav>

                <button className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-sm font-semibold text-white">Book New Consult</button>

                <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
                    <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span>Help Center</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2 hover:bg-white/10" href="/">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
                <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#001b5e]">Appointments</h2>
                        <p className="text-sm text-[#475569]">Review your consultation history and doctor notes.</p>
                    </div>
                    <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0aa4b4]">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </header>

                <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#001b5e]">Consultation History</h3>
                        <p className="text-xs text-[#64748b]">{consultationHistory.length} records</p>
                    </div>

                    {consultationHistory.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                            No consultation history available yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                                        <th className="rounded-l-lg px-3 py-3">Doctor</th>
                                        <th className="px-3 py-3">Specialty</th>
                                        <th className="px-3 py-3">Status</th>
                                        <th className="px-3 py-3">Date</th>
                                        <th className="rounded-r-lg px-3 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultationHistory.map((entry) => (
                                        <tr key={entry.id} className="border-b border-[#e2e8f0] last:border-b-0">
                                            <td className="px-3 py-3 font-medium text-[#001b5e]">{entry.doctor}</td>
                                            <td className="px-3 py-3 text-[#475569]">{entry.specialty}</td>
                                            <td className="px-3 py-3">
                                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusStyles[entry.status]}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-3 text-[#475569]">{entry.date}</td>
                                            <td className="min-w-[280px] px-3 py-3 text-[#475569]">{entry.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
