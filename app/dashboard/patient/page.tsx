"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientMobileNav from "@/components/patient-mobile-nav";
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

const TimeOfDayGreeting = dynamic(
  () => import("../../../components/time-of-day-greeting"),
  {
    ssr: false,
    loading: () => <span>Hello</span>,
  },
);

const navigationItems = [
  { href: "/dashboard/patient", label: "Overview", icon: "space_dashboard" },
  { href: "/dashboard/patient/appointments", label: "Appointments", icon: "calendar_month" },
  { href: "/dashboard/patient/doctors", label: "Browse Doctors", icon: "stethoscope" },
  { href: "/dashboard/patient/subscription", label: "Subscription", icon: "card_membership" },
  { href: "/dashboard/patient/payments", label: "Payments", icon: "receipt_long" },
  { href: "/dashboard/patient/settings", label: "Settings", icon: "settings" },
];

function getDoctorName(doctor: PublicDoctor) {
  const name = [doctor.user.firstName, doctor.user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return name ? `Dr. ${name}` : `Dr. ${doctor.user.username || "Doctor"}`;
}

function getDoctorInitials(doctor: PublicDoctor) {
  const initials = [doctor.user.firstName, doctor.user.lastName]
    .map((part) => part?.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("");

  return initials || doctor.user.username?.slice(0, 2).toUpperCase() || "DR";
}

function getDoctorSpecialty(doctor: PublicDoctor) {
  const specialty = doctor.specializations[0];

  if (!specialty) return "Medical specialist";

  return specialty
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDoctorConsultationCount(doctor: PublicDoctor | null | undefined) {
  if (!doctor) return "";

  const record = doctor as PublicDoctor & Record<string, unknown>;
  const value =
    record.consultationCount ??
    record.consultationsCount ??
    record.completedConsultations ??
    record.totalConsultations ??
    record.visitCount;

  return typeof value === "number" ? String(value) : "";
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
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function getActivePlanName(subscription: Record<string, unknown> | null | undefined) {
  const plan = getSubscriptionRecord(subscription?.plan);

  return (
    getSubscriptionValue(plan, ["name"]) ||
    getSubscriptionValue(subscription, ["planName", "name"]) ||
    (subscription ? "Active Plan" : "No Active Plan")
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function formatBadgeLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading dashboard">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-32 rounded-2xl border border-[#e4eaf1] bg-white" />
      ))}
    </div>
  );
}

export default function PatientDashboardPage() {
  const profile = usePatientProfile();
  const [dashboard, setDashboard] = useState<PatientDashboardResponse | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const dashboardProfile: PatientProfile | null = dashboard?.profile ?? profile;
  const remainingConsultations = dashboardProfile?.consultationBalance ?? 0;
  const upcomingAppointments = dashboard?.appointmentStats.upcoming ?? 0;
  const completedAppointments = dashboard?.appointmentStats.completed ?? 0;
  const subscriptionName = getActivePlanName(dashboard?.currentSubscription);
  const subscriptionStatus =
    getSubscriptionValue(dashboard?.currentSubscription, ["status"]) ||
    (dashboard?.currentSubscription ? "Active" : "No active plan");
  const subscriptionExpiry = getSubscriptionValue(dashboard?.currentSubscription, [
    "expiresAt",
    "endsAt",
  ]);
  const recentDoctors = dashboard?.recentDoctors ?? [];
  const mostVisitedDoctor = dashboard?.mostVisitedDoctor ?? null;
  const mostVisitedDoctorConsultationCount = getDoctorConsultationCount(mostVisitedDoctor);
  const badges = dashboard?.badges ?? [];

  const loadDashboard = useCallback(async () => {
    setIsLoadingDashboard(true);

    try {
      const response = await patientApiService.getDashboard();
      setDashboardError("");
      setDashboard(response.data);
      setCachedPatientProfile(response.data.profile);
    } catch (error) {
      setDashboardError(getApiErrorMessage(error));
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  useEffect(() => {
    const refreshDashboard = () => void loadDashboard();

    window.addEventListener("dw-subscription-updated", refreshDashboard);
    return () => window.removeEventListener("dw-subscription-updated", refreshDashboard);
  }, [loadDashboard]);

  useEffect(() => {
    const refreshUnreadCount = () => {
      void patientApiService
        .getUnreadNotificationCount()
        .then((response) => setUnreadNotifications(response.data.unreadCount))
        .catch(() => setUnreadNotifications(0));
    };

    refreshUnreadCount();
    window.addEventListener("dw-notifications-updated", refreshUnreadCount);
    return () => window.removeEventListener("dw-notifications-updated", refreshUnreadCount);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <PatientMobileNav active="dashboard" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-hidden bg-[#001b5e] text-white lg:flex">
        <div className="absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[#16b46f]/15 blur-3xl" />
        <div className="relative flex h-full flex-col px-4 py-6">
          <Link href="/dashboard/patient" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#72efad]">
              <span className="material-symbols-outlined text-[21px]">health_and_safety</span>
            </span>
            <span className="text-lg font-extrabold tracking-[-0.035em]">
              DominionWell<span className="text-[#72efad]">+</span>
            </span>
          </Link>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
            <PatientAvatar profile={dashboardProfile} className="h-10 w-10 text-xs" />
            <PatientProfileSummary />
          </div>

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea5d8]">Patient workspace</p>
          <nav className="flex-1 space-y-1.5 text-sm">
            {navigationItems.map((item) => {
              const isActive = item.href === "/dashboard/patient";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${
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

          <div className="mt-5 rounded-2xl bg-[linear-gradient(145deg,#16a968,#0c8b55)] p-4 shadow-lg shadow-black/10">
            <span className="material-symbols-outlined text-[22px] text-white">add_circle</span>
            <p className="mt-3 text-sm font-bold">Need to see a doctor?</p>
            <p className="mt-1 text-[11px] leading-5 text-white/80">Find a specialist and choose an available time.</p>
            <Link href="/dashboard/patient/doctors" className="mt-4 block rounded-xl bg-white px-3 py-2.5 text-center text-xs font-bold text-[#087b48]">
              Book consultation
            </Link>
          </div>

          <div className="mt-5 space-y-1 border-t border-white/10 pt-4 text-sm text-[#cad7f4]">
            <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/10 hover:text-white">
              <span className="material-symbols-outlined text-[19px]">help</span>
              <span>Help Center</span>
            </Link>
            <PatientLogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
          </div>
        </div>
      </aside>

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#7a879b]">Patient dashboard</p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-[-0.025em] text-[#001b5e] sm:text-2xl">
                <TimeOfDayGreeting />, {getPatientFirstName(dashboardProfile)}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/patient/doctors"
                className="hidden h-11 items-center gap-2 rounded-xl border border-[#d9e2ec] bg-white px-4 text-sm font-bold text-[#001b5e] shadow-sm transition hover:border-[#b8c6d6] sm:flex"
              >
                <span className="material-symbols-outlined text-[19px] text-[#16a968]">search</span>
                Find a doctor
              </Link>
              <Link
                href="/dashboard/patient/notifications"
                className="relative grid h-11 w-11 place-items-center rounded-xl border border-[#d9e2ec] bg-white text-[#001b5e] shadow-sm transition hover:border-[#b8c6d6]"
                aria-label={`${unreadNotifications} unread notifications`}
              >
                <span className="material-symbols-outlined text-[21px]">notifications</span>
                {unreadNotifications > 0 ? (
                  <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#16a968] px-1 text-[9px] font-bold text-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                ) : null}
              </Link>
            </div>
          </header>

          {dashboardError ? (
            <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm text-[#991b1b] sm:flex-row sm:items-center sm:justify-between">
              <span>{dashboardError}</span>
              <button type="button" onClick={() => void loadDashboard()} className="self-start rounded-lg bg-[#991b1b] px-3 py-2 text-xs font-bold text-white sm:self-auto">
                Try again
              </button>
            </div>
          ) : null}

          <section className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#001b5e_0%,#06347a_64%,#087d67_125%)] px-5 py-7 text-white shadow-[0_22px_55px_rgba(0,27,94,0.18)] sm:px-8 sm:py-8">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-white/[0.045]" />
            <div className="absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#38d88a]/10 blur-2xl" />
            <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#9cf5c6]">
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                  Your care, in one place
                </span>
                <h2 className="mt-4 text-xl font-bold tracking-[-0.03em] sm:text-2xl">How can we support your health today?</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#cbd8f4]">
                  Browse verified specialists, book an appointment, or review your ongoing care.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/dashboard/patient/doctors" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#16a968] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 hover:bg-[#118d57]">
                    Book a consultation
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                  <Link href="/dashboard/patient/appointments" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">
                    View appointments
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#8df0bb]">
                    <span className="material-symbols-outlined text-[19px]">event_upcoming</span>
                  </span>
                  <p className="mt-5 text-xl font-bold">{upcomingAppointments}</p>
                  <p className="mt-1 text-[11px] text-[#cbd8f4]">Upcoming</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#8df0bb]">
                    <span className="material-symbols-outlined text-[19px]">task_alt</span>
                  </span>
                  <p className="mt-5 text-xl font-bold">{completedAppointments}</p>
                  <p className="mt-1 text-[11px] text-[#cbd8f4]">Completed</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5">
            {isLoadingDashboard && !dashboard ? (
              <DashboardSkeleton />
            ) : (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Care summary">
                <article className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eafbf2] text-[#0b9459]">
                      <span className="material-symbols-outlined text-[22px]">forum</span>
                    </span>
                    <Link href="/dashboard/patient/subscription" className="text-[11px] font-bold text-[#0b9459]">Manage</Link>
                  </div>
                  <p className="mt-5 text-xl font-bold text-[#001b5e]">{remainingConsultations}</p>
                  <p className="mt-1 text-sm font-semibold text-[#44536a]">Consultation credits</p>
                  <p className="mt-1 text-xs text-[#8a96a8]">Available on your account</p>
                </article>

                <article className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eef4ff] text-[#315ead]">
                      <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                    </span>
                    <Link href="/dashboard/patient/appointments" className="text-[11px] font-bold text-[#315ead]">View all</Link>
                  </div>
                  <p className="mt-5 text-xl font-bold text-[#001b5e]">{upcomingAppointments}</p>
                  <p className="mt-1 text-sm font-semibold text-[#44536a]">Upcoming appointments</p>
                  <p className="mt-1 text-xs text-[#8a96a8]">Your scheduled consultations</p>
                </article>

                <article className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)] sm:col-span-2 xl:col-span-1">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff5e8] text-[#c66b12]">
                      <span className="material-symbols-outlined text-[22px]">clinical_notes</span>
                    </span>
                  </div>
                  <p className="mt-5 text-xl font-bold text-[#001b5e]">{completedAppointments}</p>
                  <p className="mt-1 text-sm font-semibold text-[#44536a]">Completed consultations</p>
                  <p className="mt-1 text-xs text-[#8a96a8]">Your completed care sessions</p>
                </article>
              </section>
            )}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
            <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#001b5e]">Recent doctors</h2>
                  <p className="mt-1 text-xs text-[#7a879b]">Continue care with doctors you have recently consulted.</p>
                </div>
                <Link href="/dashboard/patient/doctors" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#0b9459]">
                  Browse all
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {recentDoctors.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {recentDoctors.slice(0, 4).map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/dashboard/patient/doctors/${doctor.id}`}
                      className="group flex items-center gap-3 rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4 transition hover:-translate-y-0.5 hover:border-[#bfe5d1] hover:bg-[#f4fcf8]"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e7f4ff] text-xs font-extrabold text-[#155e9b]">
                        {getDoctorInitials(doctor)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#001b5e]">{getDoctorName(doctor)}</span>
                        <span className="mt-1 block truncate text-xs text-[#718096]">{getDoctorSpecialty(doctor)}</span>
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-[#9aa8ba] transition group-hover:text-[#0b9459]">arrow_forward</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[#d6dee8] bg-[#fafcff] px-5 py-9 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eafbf2] text-[#0b9459]">
                    <span className="material-symbols-outlined">stethoscope</span>
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-[#001b5e]">Your care team will appear here</h3>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-[#7a879b]">After your first consultation, you can quickly return to doctors you have seen.</p>
                  <Link href="/dashboard/patient/doctors" className="mt-4 text-xs font-bold text-[#0b9459]">Find your first doctor</Link>
                </div>
              )}
            </section>

            <div className="grid gap-5">
              <section className="overflow-hidden rounded-[1.5rem] border border-[#e0e7ef] bg-white shadow-[0_8px_28px_rgba(30,52,83,0.05)]">
                <div className="bg-[linear-gradient(135deg,#ecfbf3,#f8fffb)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0b9459] shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${dashboard?.currentSubscription ? "bg-[#d9f7e6] text-[#087b48]" : "bg-[#edf0f4] text-[#64748b]"}`}>
                      {subscriptionStatus}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold text-[#667a70]">Current subscription</p>
                  <h2 className="mt-1 text-xl font-bold text-[#001b5e]">{subscriptionName}</h2>
                  <p className="mt-2 text-xs text-[#718096]">
                    {subscriptionExpiry ? `Renews or expires ${formatDate(subscriptionExpiry)}` : "Choose a plan to access consultation credits."}
                  </p>
                </div>
                <div className="p-4">
                  <Link href="/dashboard/patient/subscription" className="flex items-center justify-between rounded-xl px-2 py-2 text-sm font-bold text-[#001b5e] hover:bg-[#f5f8fb]">
                    Manage subscription
                    <span className="material-symbols-outlined text-[18px] text-[#0b9459]">arrow_forward</span>
                  </Link>
                </div>
              </section>

              <section className="rounded-[1.5rem] bg-[#001b5e] p-5 text-white shadow-[0_16px_35px_rgba(0,27,94,0.15)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8df0bb]">Most consulted</p>
                    <h2 className="mt-1 text-base font-bold">Your familiar care</h2>
                  </div>
                  <span className="material-symbols-outlined text-[#8df0bb]">favorite</span>
                </div>

                {mostVisitedDoctor ? (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-xs font-bold">
                      {getDoctorInitials(mostVisitedDoctor)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{getDoctorName(mostVisitedDoctor)}</p>
                      <p className="mt-1 truncate text-[11px] text-[#cbd8f4]">
                        {mostVisitedDoctorConsultationCount
                          ? `${mostVisitedDoctorConsultationCount} completed consultation${mostVisitedDoctorConsultationCount === "1" ? "" : "s"}`
                          : getDoctorSpecialty(mostVisitedDoctor)}
                      </p>
                    </div>
                    <Link href={`/dashboard/patient/doctors/${mostVisitedDoctor.id}`} aria-label={`View ${getDoctorName(mostVisitedDoctor)}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#001b5e]">
                      <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-xs leading-5 text-[#cbd8f4]">Your most consulted doctor will appear here after you begin receiving care.</p>
                  </div>
                )}
              </section>
            </div>
          </div>

          <section className="mt-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#001b5e]">Your health milestones</h2>
                <p className="mt-1 text-xs text-[#7a879b]">Badges earned through your activity on DominionWell+.</p>
              </div>
              <span className="rounded-full bg-[#eafbf2] px-3 py-1.5 text-[10px] font-bold text-[#0b9459]">{badges.length} earned</span>
            </div>

            {badges.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-3 rounded-2xl border border-[#e2ece7] bg-[#f7fcf9] p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e0f8eb] text-[#0b9459]">
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#001b5e]">{formatBadgeLabel(badge)}</p>
                      <p className="mt-1 text-[11px] text-[#7a879b]">Health milestone achieved</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#d6dee8] bg-[#fafcff] p-5 text-sm text-[#7a879b]">
                Your health milestones will appear here as you use DominionWell+.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
