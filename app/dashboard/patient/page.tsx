"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientProfileSummary from "@/components/patient-profile-summary";
import {
    getApiErrorMessage,
    patientApiService,
    type PatientDashboardResponse,
    type PatientProfile,
    type PublicDoctor,
} from "@/lib/api";
import {
    getPatientFirstName,
    setCachedPatientProfile,
    usePatientProfile,
} from "@/lib/use-patient-profile";

const TimeOfDayGreeting = dynamic(() => import("../../../components/time-of-day-greeting"), {
    ssr: false,
    loading: () => <span>Hello</span>,
});

const PATIENT_NOTIFICATIONS_KEY = "dwPatientNotifications";

function getDoctorName(doctor: PublicDoctor) {
    const name = [doctor.user.firstName, doctor.user.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");

    return name ? `Dr. ${name}` : `Dr. ${doctor.user.username}`;
}

function getDoctorSpecialty(doctor: PublicDoctor) {
    return doctor.specializations[0]
        ? doctor.specializations[0].toLowerCase().replaceAll("_", " ")
        : "Medical specialist";
}

function getDoctorVerifiedDate(doctor: PublicDoctor) {
    return doctor.verifiedAt
        ? new Date(doctor.verifiedAt).toLocaleDateString()
        : "Verified";
}

function getSubscriptionValue(
    subscription: Record<string, unknown> | null | undefined,
    keys: string[],
) {
    for (const key of keys) {
        const value = subscription?.[key];
        if (typeof value === "string" || typeof value === "number") {
            return String(value);
        }
    }

    return "";
}

function getSubscriptionRecord(value: unknown) {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getActivePlanName(subscription: Record<string, unknown> | null | undefined) {
    const plan = getSubscriptionRecord(subscription?.plan);

    return (
        getSubscriptionValue(plan, ["name"]) ||
        getSubscriptionValue(subscription, ["planName", "name"]) ||
        (subscription ? "Active Plan" : "No Active Plan")
    );
}

function formatBadgeLabel(value: string) {
    return value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PatientDashboardPage() {
    const profile = usePatientProfile();
    const [dashboard, setDashboard] = useState<PatientDashboardResponse | null>(null);
    const [dashboardError, setDashboardError] = useState("");
    const dashboardProfile: PatientProfile | null = dashboard?.profile ?? profile;
    const remainingConsultations = dashboardProfile?.consultationBalance ?? 0;
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const subscriptionName = getActivePlanName(dashboard?.currentSubscription);
    const subscriptionStatus =
        getSubscriptionValue(dashboard?.currentSubscription, ["status"]) ||
        (dashboard?.currentSubscription ? "Active" : "No Active Plan");
    const subscriptionExpiry = getSubscriptionValue(dashboard?.currentSubscription, [
        "expiresAt",
        "endsAt",
    ]);
    const recentDoctors = dashboard?.recentDoctors ?? [];
    const badges = dashboard?.badges ?? [];

    const loadDashboard = useCallback(async () => {
        try {
            const response = await patientApiService.getDashboard();
            setDashboardError("");
            setDashboard(response.data);
            setCachedPatientProfile(response.data.profile);
        } catch (error) {
            setDashboardError(getApiErrorMessage(error));
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadDashboard();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadDashboard]);

    useEffect(() => {
        const refreshDashboard = () => {
            void loadDashboard();
        };

        window.addEventListener("dw-subscription-updated", refreshDashboard);

        return () => {
            window.removeEventListener("dw-subscription-updated", refreshDashboard);
        };
    }, [loadDashboard]);

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
                    <PatientAvatar profile={dashboardProfile} />
                    <PatientProfileSummary />
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

                <Link href="/dashboard/patient/doctors" className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-center text-sm font-semibold text-white">
                    Book New Consult
                </Link>

                <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
                    <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span>Help Center</span>
                    </Link>
                    <PatientLogoutButton className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
                </div>
            </aside>

            <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
                <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#001b5e]"><TimeOfDayGreeting />, {getPatientFirstName(dashboardProfile)}</h2>
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

                {dashboardError ? (
                    <p role="alert" className="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
                        {dashboardError}
                    </p>
                ) : null}

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
                            <p className="mt-1 text-[9px] text-[#475569]">available on your account</p>
                        </div>

                        <div className="rounded-xl border border-[#c6c6cf] bg-white p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="rounded-lg bg-[#0aa4b4]/15 p-2 text-[#0aa4b4]">
                                    <span className="material-symbols-outlined">workspace_premium</span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#16b46f]">Active</span>
                            </div>
                            <p className="text-[12px] uppercase tracking-wider text-[#64748b] font-bold">Current Subscription</p>
                            <h3 className="mt-1 text-1xl font-semibold text-[#001b5e]">{subscriptionName}</h3>
                            <p className="mt-1 text-[9px] uppercase tracking-wide text-[#64748b]">Expiry Date</p>
                            <p className="mt-1 text-xs font-semibold text-[#475569]">
                                {subscriptionExpiry ? new Date(subscriptionExpiry).toLocaleDateString() : subscriptionStatus}
                            </p>
                        </div>
                    </div>

                    <div className="col-span-12 row-span-2 lg:col-span-4">
                        <div className="relative h-full overflow-hidden rounded-2xl bg-[#001b5e] p-5 text-white shadow-xl">
                            <h3 className="mb-5 text-md font-semibold">Most Consulted</h3>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                                    <h4 className="mb-2 text-sm font-semibold">Dr. Richardson</h4>
                                    <p className="mb-3 text-[11px] text-[#d8e2ff]">Routine Cardiovascular Review</p>
                                    <Link
                                        href={`/dashboard/patient/doctors?query=${encodeURIComponent("Dr. Richardson")}`}
                                        className="block w-full rounded-lg bg-white py-2 text-center text-xs font-semibold text-[#001b5e]"
                                    >
                                        Start Consultation
                                    </Link>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-90">
                                    <h4 className="mb-2 text-sm font-semibold">Dr. Emily Stone</h4>
                                    <p className="mb-3 text-[11px] text-[#bfd2ff]">Dermatology Check-up</p>
                                    <Link
                                        href={`/dashboard/patient/doctors?query=${encodeURIComponent("Dr. Emily Stone")}`}
                                        className="block w-full rounded-lg bg-white py-2 text-center text-xs font-semibold text-[#001b5e]"
                                    >
                                        Start Consultation
                                    </Link>
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
                                            <tr key={doctor.id} className="border-b border-[#e2e8f0] last:border-b-0 hover:bg-[#f8fafc]">
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0f2fe] text-xs font-bold text-[#0369a1]">
                                                            {doctor.user.firstName?.charAt(0) || doctor.user.username.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-[13px] text-[#001b5e]">{getDoctorName(doctor)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-[13px] capitalize text-[#475569]">{getDoctorSpecialty(doctor)}</td>
                                                <td className="px-3 py-3">
                                                    <span className="rounded-full bg-[#16b46f]/15 px-2 py-1 text-[10px] font-semibold uppercase text-[#16b46f]">
                                                        Verified
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-[#475569] text-[13px]">{getDoctorVerifiedDate(doctor)}</td>
                                                <td className="px-3 py-3">
                                                    <Link href={`/dashboard/patient/doctors/${doctor.id}`} className="text-[#16b46f]">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {recentDoctors.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-[#64748b]">No recently visited doctors yet.</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12">
                        <div className="rounded-2xl border border-[#c6c6cf] bg-white/80 p-6 backdrop-blur-sm">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-md font-semibold text-[#001b5e]">Badges</h3>
                                    <p className="text-sm mt-3 text-[#475569] text-[12px]">
                                        Your active account achievements from DominionWell+.
                                    </p>
                                </div>
                                <div className="rounded-lg bg-[#16b46f]/15 px-3 py-2 text-xs font-semibold text-[#16b46f]">
                                    {badges.length} earned
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
                                {badges.length === 0 ? (
                                    <p className="text-sm text-[#64748b]">No badges yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        {badges.map((badge) => (
                                            <div key={badge} className="rounded-lg border border-[#16b46f]/25 bg-[#16b46f]/10 p-3">
                                                <div className="mb-1 flex items-center gap-2 text-[#16b46f]">
                                                    <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                                                    <span className="text-[11px] font-semibold uppercase tracking-wide">{formatBadgeLabel(badge)}</span>
                                                </div>
                                                <p className="text-xs text-[#475569]">Earned from your account activity.</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
