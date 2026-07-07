"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";

const recentDoctors = [
    {
        name: "Dr. Sarah Weaver",
        specialty: "General Physician",
        status: "Available",
        statusClass: "bg-[#16b46f]/15 text-[#16b46f]",
        lastVisit: "Sept 12, 2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAJY-tBxmDI_cCDafVuF2NnfF8U6zT5YzQzv5Hv_Lb4-IqYGlCB50KfkGkrU9ZuRmzZR37a-8V3FmgIZqaa9s5nY47OrwfXqetdUfu8Pgvkd5iUKIo3Rv3yKeiBuGToBeX-3LVJjNL8nhI0nRnsWtKrA9elsvcy_-pjlXmfn00V9ypYkSr7TMM4OJGeS_OkxKCwmtq-hqr-V6UFa22plogSG4TwCviMqlTHI6G0wHkgcQ-j4lI2z_-lshE2SWYuHP0M-QHIM2IjDKtt",
    },
    {
        name: "Dr. Richardson",
        specialty: "Cardiologist",
        status: "In Consultation",
        statusClass: "bg-[#ef4444]/12 text-[#dc2626]",
        lastVisit: "Aug 28, 2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDM_6TzRlZyvWMUGLqyDv1_NZ6nD9NmyP3_B0yYtIdNozvzDisylezl9Z0qehAMIwlX49gdYJp10UDLPHaP3AGyK-WFlBzEPrMoArVKT825rmhezpRaCs3QykZG5MUGQWTRJmZDzPOOW3BQFB6lhtw26gvXWsc5pTY_v4sCBXFy33jj-nV4wF3hYb2INB-EhQ3VeuWSmjoIEhjdMGDg2N6avJ9Sp2OC6Jnij_tciHEWQnSxWISrv6OFhkMcVl3sKz0t0zYXB9kc0gpS",
    },
    {
        name: "Dr. Emily Stone",
        specialty: "Dermatologist",
        status: "Offline",
        statusClass: "bg-[#64748b]/15 text-[#64748b]",
        lastVisit: "July 15, 2023",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDz8rH_oEcTbUduUHKl2BOYi6oJi89VzeoqNXfyENzI8ywKPX4k7uinA2c-bP2UkHHRuoHlpILQL7x7KKAM1fG5dmK6y9ACkw9LWINQxMBB02FYS1Dldr0wOJtUC7SG8KUTK3tOpLMpVyFNVl3urdnjFueuoUYfjw_8tvHtiM9Y-f-EFahNsl1HrIx6LVlQoCupwJ5R5fLRNJihR5rmzzt_yjmRnc4nAKUGH6_-eQ1ZTb6ydrCZyMtqusej4KIVCj5fvXS9ox38bfPI",
    },
];

const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
const PATIENT_NOTIFICATIONS_KEY = "dwPatientNotifications";

export default function PatientDashboardPage() {
    const consultationsBooked = 4;
    const nextBadgeTarget = 10;
    const progressPercent = Math.min((consultationsBooked / nextBadgeTarget) * 100, 100);
    const remainingConsultations = useMemo(() => {
        if (typeof window === "undefined") {
            return 48;
        }

        const storedBalance = Number(window.localStorage.getItem(CONSULTATION_BALANCE_KEY));

        return Number.isFinite(storedBalance) ? Math.max(0, Math.floor(storedBalance)) : 48;
    }, []);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const greeting = (() => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 17) {
            return "Good afternoon";
        }

        return "Good evening";
    })();

    useEffect(() => {
        const refreshUnreadCount = () => {
            const stored = window.localStorage.getItem(PATIENT_NOTIFICATIONS_KEY);

            if (!stored) {
                setUnreadNotifications(0);
                return;
            }

            try {
                const parsed = JSON.parse(stored) as Array<{ unread?: boolean }>;
                const unreadCount = Array.isArray(parsed) ? parsed.filter((item) => item.unread).length : 0;
                setUnreadNotifications(unreadCount);
            } catch {
                setUnreadNotifications(0);
            }
        };

        refreshUnreadCount();
        window.addEventListener("storage", refreshUnreadCount);
        window.addEventListener("dw-notifications-updated", refreshUnreadCount);

        return () => {
            window.removeEventListener("storage", refreshUnreadCount);
            window.removeEventListener("dw-notifications-updated", refreshUnreadCount);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
            <PatientMobileNav active="dashboard" />

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
                    <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b46f] bg-[#16b46f]/20 px-3 py-2 text-[#d7ffe9]">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span>Dashboard</span>
                    </div>
                    <Link href="/dashboard/patient/appointments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        <span>Appointments</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10" href="/dashboard/patient/doctors">
                        <span className="material-symbols-outlined text-[20px]">medical_services</span>
                        <span>Browse Doctors</span>
                    </Link>
                    <Link href="/dashboard/patient/settings" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span>Settings</span>
                    </Link>
                </nav>

                <Link href="/dashboard/patient/doctors" className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-center text-sm font-semibold text-white">
                    Book New Consult
                </Link>

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
                <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#001b5e]">{greeting}, Alex</h2>
                        <p className="mt-2 text-xs text-[#475569]">How are you feeling today?</p>
                    </div>

                    <div className="flex w-full max-w-xl items-center gap-3">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                search
                            </span>
                            <input
                                className="h-11 w-full rounded-xl border border-[#c6c6cf] bg-white pl-10 pr-10 text-sm outline-none focus:border-[#0aa4b4]"
                                placeholder="Find a Doctor or Service"
                                type="text"
                            />
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#94a3b8]">
                                tune
                            </span>
                        </div>

                        <Link
                            href="/dashboard/patient/notifications"
                            className="relative grid h-11 w-11 place-items-center rounded-xl border border-[#c6c6cf] bg-white text-[#001b5e]"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#16b46f]" /> : null}
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
                        <div className="rounded-xl border border-[#c6c6cf] bg-white p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="rounded-lg bg-[#16b46f]/15 p-2 text-[#16b46f]">
                                    <span className="material-symbols-outlined">event_available</span>
                                </div>
                            </div>
                            <p className="text-[12px] uppercase tracking-wider text-[#64748b] font-bold">Remaining Consultations</p>
                            <h3 className="mt-1 text-1xl font-semibold text-[#001b5e]">{remainingConsultations}</h3>
                            <p className="mt-1 text-[9px] text-[#475569]">for this billing cycle</p>
                        </div>

                        <div className="rounded-xl border border-[#c6c6cf] bg-white p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="rounded-lg bg-[#0aa4b4]/15 p-2 text-[#0aa4b4]">
                                    <span className="material-symbols-outlined">workspace_premium</span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#16b46f]">Active</span>
                            </div>
                            <p className="text-[12px] uppercase tracking-wider text-[#64748b] font-bold">Current Subscription</p>
                            <h3 className="mt-1 text-1xl font-semibold text-[#001b5e]">Premium Care</h3>
                            <p className="mt-1 text-[9px] text-[#475569]">Expires on Nov 24, 2026</p>
                        </div>
                    </div>

                    <div className="col-span-12 row-span-2 lg:col-span-4">
                        <div className="relative h-full overflow-hidden rounded-2xl bg-[#001b5e] p-5 text-white shadow-xl">
                            <h3 className="mb-5 text-md font-semibold">Most Consulted</h3>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                                    <h4 className="mb-2 text-sm font-semibold">Dr. Richardson</h4>
                                    <p className="mb-3 text-[11px] text-[#d8e2ff]">Routine Cardiovascular Review</p>
                                    <button className="w-full rounded-lg bg-white py-2 text-xs font-semibold text-[#001b5e]">
                                       Start Consultation
                                    </button>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-90">
                                    <h4 className="mb-2 text-sm font-semibold">Dr. Emily Stone</h4>
                                    <p className="mb-3 text-[11px] text-[#bfd2ff]">Dermatology Check-up</p>
                                     <button className="w-full rounded-lg bg-white py-2 text-xs font-semibold text-[#001b5e]">
                                       Start Consultation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-8">
                        <div className="overflow-hidden rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-md font-semibold text-[#001b5e]">Recently Visited Doctors</h3>
                                <Link href="/dashboard/patient/doctors" className="flex items-center gap-1 text-xs font-semibold text-[#16b46f]">
                                    View All
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                                            <th className="rounded-l-lg px-3 py-3">Doctor</th>
                                            <th className="px-3 py-3">Specialty</th>
                                            <th className="px-3 py-3">Status</th>
                                            <th className="px-3 py-3">Last Visit</th>
                                            <th className="rounded-r-lg px-3 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentDoctors.map((doctor) => (
                                            <tr key={doctor.name} className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc]">
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#e2e8f0]">
                                                            <Image className="object-cover" src={doctor.image} alt={doctor.name} fill sizes="36px" unoptimized />
                                                        </div>
                                                        <span className="font-medium text-[13px] text-[#001b5e]">{doctor.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-[13px] text-[#475569]">{doctor.specialty}</td>
                                                <td className="px-3 py-3">
                                                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${doctor.statusClass}`}>
                                                        {doctor.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-[#475569] text-[13px]">{doctor.lastVisit}</td>
                                                <td className="px-3 py-3">
                                                    <button className="text-[#16b46f]">
                                                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12">
                        <div className="rounded-2xl border border-[#c6c6cf] bg-white/80 p-6 backdrop-blur-sm">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-md font-semibold text-[#001b5e]">Earn a Badge</h3>
                                    <p className="text-sm mt-3 text-[#475569] text-[12px]">
                                        The more consultations you book, the faster you unlock your next badge.
                                    </p>
                                </div>
                                <div className="rounded-lg bg-[#16b46f]/15 px-3 py-2 text-xs font-semibold text-[#16b46f]">Consultation Streak</div>
                            </div>

                            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-[#001b5e]">Progress to Silver Care Badge</p>
                                    <p className="text-xs font-semibold text-[#0aa4b4]">
                                        {consultationsBooked}/{nextBadgeTarget} bookings
                                    </p>
                                </div>

                                <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
                                    <div className="h-full rounded-full bg-gradient-to-r from-[#16b46f] to-[#0aa4b4]" style={{ width: `${progressPercent}%` }} />
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                        <div className="mb-1 flex items-center gap-2 text-[#64748b]">
                                            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                                            <span className="text-[11px] font-semibold uppercase tracking-wide">Bronze</span>
                                        </div>
                                        <p className="text-xs text-[#475569]">3 consultations</p>
                                    </div>

                                    <div className="rounded-lg border border-[#0aa4b4]/30 bg-[#0aa4b4]/10 p-3">
                                        <div className="mb-1 flex items-center gap-2 text-[#0aa4b4]">
                                            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                                            <span className="text-[11px] font-semibold uppercase tracking-wide">Silver</span>
                                        </div>
                                        <p className="text-xs text-[#475569]">10 consultations</p>
                                    </div>

                                    <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                        <div className="mb-1 flex items-center gap-2 text-[#64748b]">
                                            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                                            <span className="text-[11px] font-semibold uppercase tracking-wide">Gold</span>
                                        </div>
                                        <p className="text-xs text-[#475569]">20 consultations</p>
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-[#475569]">
                                    Book {Math.max(nextBadgeTarget - consultationsBooked, 0)} more consultations to unlock your next badge.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
