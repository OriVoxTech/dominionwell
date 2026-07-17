"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientProfileSummary from "@/components/patient-profile-summary";
import {
    getApiErrorMessage,
    patientApiService,
    type PatientAppointment,
} from "@/lib/api";
import {
    APPOINTMENT_REQUESTS_UPDATED_EVENT,
    isConsultationInviteWindow,
    readAppointmentRequests,
    type AppointmentRequest,
} from "@/lib/appointments";
import { usePatientProfile } from "@/lib/use-patient-profile";

type AppointmentStatus = "Completed" | "Follow-up" | "Canceled";
type AppointmentsTab = "upcoming" | "history";

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

const appointmentRequestStyles: Record<AppointmentRequest["status"], string> = {
    Pending: "bg-[#f59e0b]/15 text-[#b45309]",
    Booked: "bg-[#16b46f]/15 text-[#16b46f]",
    Accepted: "bg-[#16b46f]/15 text-[#16b46f]",
    Completed: "bg-[#0aa4b4]/15 text-[#0369a1]",
    Rejected: "bg-[#ef4444]/12 text-[#dc2626]",
};

const PATIENT_ID = "DW-98231";

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

function asRecord(value: unknown) {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getStringValue(record: Record<string, unknown> | null, keys: string[], fallback = "-") {
    if (!record) return fallback;

    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value;
        if (typeof value === "number") return String(value);
    }

    return fallback;
}

function getNestedStringValue(record: Record<string, unknown> | null, path: string[], fallback = "-") {
    let current: unknown = record;

    for (const key of path) {
        const currentRecord = asRecord(current);
        if (!currentRecord) return fallback;
        current = currentRecord[key];
    }

    return typeof current === "string" && current.trim() ? current : fallback;
}

function formatAppointmentDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function getPatientAppointmentDoctor(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const doctor = asRecord(record?.doctor);
    const doctorUser = asRecord(doctor?.user);
    const firstName = getStringValue(doctorUser, ["firstName"], "");
    const lastName = getStringValue(doctorUser, ["lastName"], "");
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return fullName
        ? `Dr. ${fullName}`
        : getNestedStringValue(record, ["doctor", "user", "username"], "Doctor");
}

function getPatientAppointmentSpecialty(appointment: PatientAppointment) {
    const doctor = asRecord(asRecord(appointment)?.doctor);
    const specializations = doctor?.specializations;

    if (Array.isArray(specializations) && typeof specializations[0] === "string") {
        return specializations[0].toLowerCase().replaceAll("_", " ");
    }

    return getStringValue(asRecord(appointment), ["specialization", "specialty"], "Medical specialist");
}

function getPatientAppointmentDate(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const startsAt = getStringValue(record, ["startsAt", "startTime", "appointmentAt", "scheduledAt"], "");

    return startsAt ? formatAppointmentDate(startsAt) : getStringValue(record, ["date"], "-");
}

function getPatientAppointmentTime(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const startsAt = getStringValue(record, ["startsAt", "startTime", "appointmentAt", "scheduledAt"], "");
    const endsAt = getStringValue(record, ["endsAt", "endTime"], "");

    if (startsAt && endsAt) {
        return `${new Date(startsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} - ${new Date(endsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    }

    return getStringValue(record, ["timeSlot", "time"], "-");
}

function getServerAppointmentStatus(appointment: PatientAppointment) {
    return appointment.status ?? getStringValue(asRecord(appointment), ["appointmentStatus"], "Booked");
}

export default function PatientAppointmentsPage() {
    const profile = usePatientProfile();
    const [activeTab, setActiveTab] = useState<AppointmentsTab>("upcoming");
    const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
    const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([]);
    const [appointmentsMeta, setAppointmentsMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
    const [isLoadingPatientAppointments, setIsLoadingPatientAppointments] = useState(true);
    const [appointmentsError, setAppointmentsError] = useState("");

    useEffect(() => {
        const syncRequests = () => {
            const requests = readAppointmentRequests().filter((request) => request.patientId === PATIENT_ID);
            setAppointmentRequests(requests);
        };

        syncRequests();
        window.addEventListener("storage", syncRequests);
        window.addEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncRequests);

        return () => {
            window.removeEventListener("storage", syncRequests);
            window.removeEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncRequests);
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const loadPatientAppointments = async () => {
            setAppointmentsError("");
            setIsLoadingPatientAppointments(true);

            try {
                const response = await patientApiService.listAppointments({ page: 1, limit: 20 });
                if (isCancelled) return;

                setPatientAppointments(response.data.data);
                setAppointmentsMeta(response.data.meta);
            } catch (error) {
                if (!isCancelled) {
                    setAppointmentsError(getApiErrorMessage(error));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingPatientAppointments(false);
                }
            }
        };

        void loadPatientAppointments();

        return () => {
            isCancelled = true;
        };
    }, []);

    const upcomingCount = appointmentRequests.length + patientAppointments.length;

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
            <PatientMobileNav active="appointments" />

            <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
                <div className="mb-8 px-2">
                    <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
                </div>

                <div className="mb-6 flex items-center gap-3 px-2">
                    <PatientAvatar profile={profile} />
                    <PatientProfileSummary />
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
                    <Link href="/dashboard/patient/subscription" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">card_membership</span>
                        <span>Subscription</span>
                    </Link>
                    <Link href="/dashboard/patient/payments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                        <span>Payments</span>
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
                    <PatientLogoutButton className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
                </div>
            </aside>

            <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
                <header className="mb-6">
                    <div className="mb-2 flex items-center gap-2">
                        <Link
                            href="/dashboard/patient"
                            aria-label="Back"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        </Link>
                        <h2 className="text-2xl font-semibold text-[#001b5e]">Appointments</h2>
                    </div>
                    <p className="text-sm text-[#475569]">Review your consultation history and doctor notes.</p>
                </header>

                <section className="mb-6 rounded-2xl border border-[#c6c6cf] bg-white p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                activeTab === "upcoming"
                                    ? "bg-[#001b5e] text-white"
                                    : "bg-[#f8fafc] text-[#334155] hover:bg-[#eef2f7]"
                            }`}
                            onClick={() => setActiveTab("upcoming")}
                        >
                            Upcoming ({upcomingCount})
                        </button>
                        <button
                            type="button"
                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                activeTab === "history"
                                    ? "bg-[#001b5e] text-white"
                                    : "bg-[#f8fafc] text-[#334155] hover:bg-[#eef2f7]"
                            }`}
                            onClick={() => setActiveTab("history")}
                        >
                            History ({consultationHistory.length})
                        </button>
                    </div>
                </section>

                {activeTab === "upcoming" ? (
                    <section className="mb-6 rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[#001b5e]">Upcoming Appointments</h3>
                            <p className="text-xs text-[#64748b]">
                                {isLoadingPatientAppointments ? "Loading..." : `${upcomingCount} appointment(s)`}
                            </p>
                        </div>

                        {appointmentsError ? (
                            <div role="alert" className="mb-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                                {appointmentsError}
                            </div>
                        ) : null}

                        {!isLoadingPatientAppointments && upcomingCount === 0 ? (
                            <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                                You have no upcoming appointments yet. Book from the doctors page.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                                            <th className="rounded-l-lg px-3 py-3">Doctor</th>
                                            <th className="px-3 py-3">Specialty</th>
                                            <th className="px-3 py-3">Date</th>
                                            <th className="px-3 py-3">Time Slot</th>
                                            <th className="rounded-r-lg px-3 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointmentRequests.map((request) => (
                                            <tr key={request.id} className="border-b border-[#e2e8f0] last:border-b-0">
                                                <td className="px-3 py-3 font-medium text-[#001b5e]">{request.doctorName}</td>
                                                <td className="px-3 py-3 text-[#475569]">{request.doctorSpecialization}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[#475569]">{request.dateLabel}</td>
                                                <td className="px-3 py-3 text-[#475569]">
                                                    <div>{request.timeSlot}</div>
                                                    {isConsultationInviteWindow(request) ? (
                                                        <p className="mt-1 text-[11px] font-semibold text-[#001b5e]">
                                                            Check mail for consultation invite
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${appointmentRequestStyles[request.status]}`}
                                                    >
                                                        {request.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {patientAppointments.map((appointment) => (
                                            <tr key={`server-${appointment.id}`} className="border-b border-[#e2e8f0] last:border-b-0">
                                                <td className="px-3 py-3 font-medium text-[#001b5e]">{getPatientAppointmentDoctor(appointment)}</td>
                                                <td className="px-3 py-3 capitalize text-[#475569]">{getPatientAppointmentSpecialty(appointment)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[#475569]">{getPatientAppointmentDate(appointment)}</td>
                                                <td className="px-3 py-3 text-[#475569]">{getPatientAppointmentTime(appointment)}</td>
                                                <td className="px-3 py-3">
                                                    <span className="rounded-full bg-[#16b46f]/15 px-2 py-1 text-[10px] font-semibold uppercase text-[#16b46f]">
                                                        {getServerAppointmentStatus(appointment)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {appointmentsMeta.totalPages > 1 ? (
                                    <p className="mt-3 text-xs text-[#64748b]">
                                        Showing page {appointmentsMeta.page} of {appointmentsMeta.totalPages}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </section>
                ) : (
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
                )}
            </main>
        </div>
    );
}
