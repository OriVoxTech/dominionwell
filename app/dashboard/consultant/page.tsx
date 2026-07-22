"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  getDoctorDisplayName,
  useDoctorProfile,
} from "@/lib/use-doctor-profile";
import {
  doctorApiService,
  type DoctorAppointment,
} from "@/lib/api";

const CONSULTATION_PAST_GRACE_MINUTES = 10;
const DEFAULT_CONSULTATION_DURATION_MINUTES = 60;

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

function getAppointmentPatient(appointment: DoctorAppointment) {
  const record = asRecord(appointment);
  const patient = asRecord(record?.patient);
  const patientUser = asRecord(patient?.user);
  const firstName = getStringValue(patientUser, ["firstName"], "");
  const lastName = getStringValue(patientUser, ["lastName"], "");
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return fullName || getStringValue(record, ["patientName", "patientId"], "Patient");
}

function getAppointmentStart(appointment: DoctorAppointment) {
  const record = asRecord(appointment);
  const slot = asRecord(record?.slot);

  return (
    getStringValue(record, ["startsAt", "startTime", "appointmentAt", "scheduledAt"], "") ||
    getStringValue(slot, ["startsAt", "startTime"], "")
  );
}

function getAppointmentEnd(appointment: DoctorAppointment) {
  const record = asRecord(appointment);
  const slot = asRecord(record?.slot);

  return (
    getStringValue(record, ["endsAt", "endTime"], "") ||
    getStringValue(slot, ["endsAt", "endTime"], "")
  );
}

function getAppointmentStartDate(appointment: DoctorAppointment) {
  const startsAt = getAppointmentStart(appointment);
  if (!startsAt) return null;

  const date = new Date(startsAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getAppointmentEndDate(appointment: DoctorAppointment) {
  const endsAt = getAppointmentEnd(appointment);

  if (endsAt) {
    const date = new Date(endsAt);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const startsAt = getAppointmentStartDate(appointment);
  return startsAt
    ? new Date(startsAt.getTime() + DEFAULT_CONSULTATION_DURATION_MINUTES * 60 * 1000)
    : null;
}

function isWithinUpcomingWindow(appointment: DoctorAppointment, now: Date) {
  const endsAt = getAppointmentEndDate(appointment);
  return Boolean(
    endsAt &&
      now.getTime() < endsAt.getTime() + CONSULTATION_PAST_GRACE_MINUTES * 60 * 1000,
  );
}

function formatAppointmentDateTime(appointment: DoctorAppointment) {
  const startsAt = getAppointmentStart(appointment);
  const endsAt = getAppointmentEnd(appointment);

  if (!startsAt) return "-";

  const startDate = new Date(startsAt);
  const dateLabel = Number.isNaN(startDate.getTime())
    ? startsAt
    : startDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  const startTime = Number.isNaN(startDate.getTime())
    ? ""
    : startDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (!endsAt) return `${dateLabel}${startTime ? ` • ${startTime}` : ""}`;

  const endDate = new Date(endsAt);
  const endTime = Number.isNaN(endDate.getTime())
    ? ""
    : endDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return `${dateLabel} • ${startTime}${endTime ? ` - ${endTime}` : ""}`;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ConsultantDashboardPage() {
  const doctorProfile = useDoctorProfile();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState<DoctorAppointment[]>([]);
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(today),
    [today]
  );
  const calendarDays = useMemo(() => {
    const firstWeekDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();
    const cells: Array<{ day: number; currentMonth: boolean; isToday: boolean; dateKey: string }> = [];

    for (let index = 0; index < 42; index += 1) {
      const dayOffset = index - firstWeekDay + 1;

      if (dayOffset <= 0) {
        cells.push({
          day: daysInPreviousMonth + dayOffset,
          currentMonth: false,
          isToday: false,
          dateKey: "",
        });
        continue;
      }

      if (dayOffset > daysInCurrentMonth) {
        cells.push({
          day: dayOffset - daysInCurrentMonth,
          currentMonth: false,
          isToday: false,
          dateKey: "",
        });
        continue;
      }

      const isToday =
        dayOffset === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayOffset).padStart(2, "0")}`;

      cells.push({ day: dayOffset, currentMonth: true, isToday, dateKey });
    }

    return cells;
  }, [currentMonth, currentYear, today]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void doctorApiService
        .listAppointments({ status: "BOOKED", page: 1, limit: 20 })
        .then((response) => {
          const upcoming = response.data.data
            .sort(
              (first, second) =>
                (getAppointmentStartDate(first)?.getTime() ?? 0) -
                (getAppointmentStartDate(second)?.getTime() ?? 0),
            );

          setUpcomingAppointments(upcoming);
        })
        .catch(() => {
          setUpcomingAppointments([]);
        })
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const refreshUnreadCount = () => {
      void doctorApiService
        .getUnreadNotificationCount()
        .then((response) => {
          setUnreadNotifications(response.data.unreadCount);
        })
        .catch(() => setUnreadNotifications(0));
    };

    const handleNotificationsUpdated = (event: Event) => {
      const unreadCount = (event as CustomEvent<{ unreadCount?: number }>).detail
        ?.unreadCount;

      if (typeof unreadCount === "number") {
        setUnreadNotifications(unreadCount);
        return;
      }

      refreshUnreadCount();
    };

    refreshUnreadCount();
    window.addEventListener("dw-notifications-updated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("dw-notifications-updated", handleNotificationsUpdated);
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const upcomingAppointmentDates = useMemo(
    () =>
      new Set(
        upcomingAppointments
          .filter((appointment) => isWithinUpcomingWindow(appointment, currentTime))
          .map(getAppointmentStartDate)
          .filter((date): date is Date => Boolean(date))
          .map(getDateKey),
      ),
    [currentTime, upcomingAppointments],
  );

  const wallet = doctorProfile?.wallet;
  const appointmentStats = doctorProfile?.appointmentStats;
  const satisfaction = doctorProfile?.satisfaction;
  const totalPoints = wallet?.lifetimePoints ?? 0;
  const averageRating = satisfaction?.averageRating;
  const reviewCount = satisfaction?.reviewCount ?? 0;
  const ratingLabel = averageRating === null || averageRating === undefined ? "No ratings" : `${averageRating.toFixed(1)}/5`;
  const latestUpcomingAppointments = upcomingAppointments
    .filter((appointment) => isWithinUpcomingWindow(appointment, currentTime))
    .slice(0, 5);

  const doctorInitials = doctorProfile
    ? `${doctorProfile.user.firstName?.charAt(0) ?? ""}${doctorProfile.user.lastName?.charAt(0) ?? ""}` || "DR"
    : "DR";
  const presenceStatus = doctorProfile?.presenceStatus ?? "OFFLINE";

  const doctorNavItems = [
    { label: "Overview", icon: "space_dashboard", href: "/dashboard/doctor" },
    { label: "Consultations", icon: "medical_services", href: "/dashboard/doctor/consultations" },
    { label: "Patients", icon: "group", href: "/dashboard/doctor/patients" },
    { label: "Reports", icon: "clinical_notes", href: "/dashboard/doctor/reports" },
    { label: "Wallet", icon: "account_balance_wallet", href: "/dashboard/doctor/wallet" },
    { label: "Settings", icon: "settings", href: "/dashboard/doctor/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <DoctorMobileNav />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-hidden bg-[#001b5e] text-white lg:flex">
        <div className="absolute -right-24 -top-20 h-56 w-56 rounded-full bg-[#16b36c]/15 blur-3xl" />
        <div className="relative flex h-full flex-col px-4 py-6">
          <Link href="/dashboard/doctor" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#72efad]">
              <span className="material-symbols-outlined text-[21px]">health_and_safety</span>
            </span>
            <span className="text-lg font-extrabold tracking-[-0.035em]">DominionWell<span className="text-[#72efad]">+</span></span>
          </Link>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#72efad]/40 bg-[#16b36c]/20 text-xs font-bold text-[#d7ffe9]">{doctorInitials}</span>
            <DoctorProfileSummary />
          </div>

          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea5d8]">Doctor workspace</p>
          <nav className="flex-1 space-y-1.5 text-sm">
            {doctorNavItems.map((item) => {
              const isActive = item.href === "/dashboard/doctor";
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${isActive ? "bg-white text-[#001b5e] shadow-lg shadow-black/10" : "text-[#cad7f4] hover:bg-white/10 hover:text-white"}`}>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#16b36c]" : ""}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-2xl bg-[linear-gradient(145deg,#16a968,#0c8b55)] p-4 shadow-lg shadow-black/10">
            <span className="material-symbols-outlined text-[22px]">event_available</span>
            <p className="mt-3 text-sm font-bold">Manage your availability</p>
            <p className="mt-1 text-[11px] leading-5 text-white/80">Open consultation slots for patients to book.</p>
            <Link href="/dashboard/doctor/settings" className="mt-4 block rounded-xl bg-white px-3 py-2.5 text-center text-xs font-bold text-[#087b48]">Set availability</Link>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4 text-sm text-[#cad7f4]">
            <DoctorLogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/10 disabled:opacity-60" />
          </div>
        </div>
      </aside>

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#7a879b]">Doctor dashboard</p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-[-0.025em] text-[#001b5e] sm:text-2xl">Welcome, {getDoctorDisplayName(doctorProfile)}</h1>
            </div>
            <div className="hidden items-center gap-2.5 md:flex">
              <div className="rounded-xl border border-[#d9e2ec] bg-white px-4 py-2 text-right shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8a96a8]">Local time</p>
                <p className="mt-0.5 text-sm font-bold text-[#001b5e]">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <Link href="/dashboard/doctor/notifications" className="relative grid h-11 w-11 place-items-center rounded-xl border border-[#d9e2ec] bg-white text-[#001b5e] shadow-sm" aria-label={`${unreadNotifications} unread notifications`}>
                <span className="material-symbols-outlined text-[21px]">notifications</span>
                {unreadNotifications > 0 ? <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#16b36c] px-1 text-[9px] font-bold text-white">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span> : null}
              </Link>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#001b5e_0%,#073377_62%,#087964_125%)] px-5 py-7 text-white shadow-[0_22px_55px_rgba(0,27,94,0.18)] sm:px-8 sm:py-8">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-white/[0.045]" />
            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold ${presenceStatus === "AVAILABLE" ? "bg-[#16b36c]/20 text-[#9cf5c6]" : "bg-white/10 text-[#d2dcf4]"}`}>
                    <span className={`h-2 w-2 rounded-full ${presenceStatus === "AVAILABLE" ? "bg-[#72efad]" : "bg-[#aebbd6]"}`} />
                    {presenceStatus.replaceAll("_", " ")}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#cbd8f4]">{appointmentStats?.today ?? "—"} today</span>
                </div>
                <h2 className="mt-4 text-xl font-bold tracking-[-0.03em] sm:text-2xl">Your practice at a glance</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#cbd8f4]">Review upcoming consultations, keep your schedule current, and stay connected to your patients.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/doctor/consultations" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#16b36c] px-5 py-3 text-sm font-bold text-white hover:bg-[#118d57]">View consultations<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
                <Link href="/dashboard/doctor/settings" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15">Manage schedule</Link>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Practice summary">
            {[
              { label: "Today's appointments", value: appointmentStats?.today ?? "—", note: "Scheduled for today", icon: "event_upcoming", color: "bg-[#eafbf2] text-[#0b9459]" },
              { label: "Completed consultations", value: appointmentStats?.completed ?? "—", note: "All completed sessions", icon: "task_alt", color: "bg-[#eef4ff] text-[#315ead]" },
              { label: "Patient satisfaction", value: ratingLabel, note: `${reviewCount} review${reviewCount === 1 ? "" : "s"}`, icon: "star", color: "bg-[#fff6df] text-[#b56b08]" },
              { label: "Lifetime points", value: `${totalPoints} pts`, note: "Wallet activity", icon: "account_balance_wallet", color: "bg-[#f3edff] text-[#7543b5]" },
            ].map((metric) => (
              <article key={metric.label} className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${metric.color}`}><span className="material-symbols-outlined text-[22px]">{metric.icon}</span></span>
                <p className="mt-5 text-xl font-bold text-[#001b5e]">{metric.value}</p>
                <p className="mt-1 text-sm font-semibold text-[#44536a]">{metric.label}</p>
                <p className="mt-1 text-xs text-[#8a96a8]">{metric.note}</p>
              </article>
            ))}
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
            <div className="grid gap-5">
              <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="text-lg font-bold text-[#001b5e]">Upcoming consultations</h2><p className="mt-1 text-xs text-[#7a879b]">Your next scheduled patient sessions.</p></div>
                  <Link href="/dashboard/doctor/consultations" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#0b9459]">View all<span className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>
                </div>

                {latestUpcomingAppointments.length === 0 ? (
                  <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[#d6dee8] bg-[#fafcff] px-5 py-9 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined">event_available</span></span>
                    <h3 className="mt-4 text-sm font-bold text-[#001b5e]">Your schedule is clear</h3>
                    <p className="mt-2 text-xs text-[#7a879b]">New booked consultations will appear here.</p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {latestUpcomingAppointments.slice(0, 4).map((appointment) => {
                      const patientName = getAppointmentPatient(appointment);
                      return (
                        <article key={appointment.id} className="flex flex-col gap-4 rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4 sm:flex-row sm:items-center">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e7f4ff] text-xs font-extrabold text-[#155e9b]">{patientName.charAt(0).toUpperCase()}</span>
                          <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-[#001b5e]">{patientName}</h3><p className="mt-1 text-xs text-[#718096]">{formatAppointmentDateTime(appointment)}</p></div>
                          <span className="self-start rounded-full bg-[#eafbf2] px-2.5 py-1 text-[10px] font-bold uppercase text-[#0b9459] sm:self-auto">{appointment.status}</span>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
                <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-[#001b5e]">Reputation & recognition</h2><p className="mt-1 text-xs text-[#7a879b]">Patient feedback and professional milestones.</p></div><span className="rounded-full bg-[#fff6df] px-3 py-1.5 text-[10px] font-bold text-[#a45f08]">{ratingLabel}</span></div>
                <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-[linear-gradient(135deg,#f5fbf8,#f8fbff)] p-5 sm:flex-row sm:items-center">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[#e39a18] shadow-sm"><span className="material-symbols-outlined text-[28px]">star</span></span>
                  <div className="flex-1"><p className="text-sm leading-6 text-[#44536a]">{averageRating == null ? "Completed consultations with patient reviews will build your satisfaction score." : `Patients rate your care ${averageRating.toFixed(1)} out of 5 across ${reviewCount} review${reviewCount === 1 ? "" : "s"}.`}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{(doctorProfile?.badges ?? []).length > 0 ? doctorProfile?.badges?.map((badge) => <span key={badge} className="rounded-full border border-[#ccebd9] bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-[#0b9459]">{badge.replaceAll("_", " ")}</span>) : <span className="text-xs text-[#8a96a8]">No badges earned yet.</span>}</div>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid content-start gap-5">
              <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)]">
                <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b9459]">Schedule</p><h2 className="mt-1 text-lg font-bold text-[#001b5e]">{monthLabel}</h2></div><Link href="/dashboard/doctor/settings" className="grid h-9 w-9 place-items-center rounded-xl bg-[#eafbf2] text-[#0b9459]" aria-label="Manage availability"><span className="material-symbols-outlined text-[19px]">edit_calendar</span></Link></div>
                <div className="mt-5 grid grid-cols-7 text-center text-[10px] font-bold uppercase text-[#8a96a8]"><div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div></div>
                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
                  {calendarDays.map((cell, index) => (
                    <div key={`${cell.day}-${index}`} className={`relative grid aspect-square place-items-center rounded-lg ${cell.isToday ? "bg-[#16b36c] font-bold text-white shadow-sm" : cell.currentMonth && upcomingAppointmentDates.has(cell.dateKey) ? "bg-[#e7f0ff] font-bold text-[#2458aa]" : cell.currentMonth ? "text-[#44536a] hover:bg-[#f1f5f9]" : "text-[#c2cad5]"}`}>
                      {cell.day}{cell.currentMonth && upcomingAppointmentDates.has(cell.dateKey) ? <span className={`absolute bottom-1 h-1 w-1 rounded-full ${cell.isToday ? "bg-white" : "bg-[#315ead]"}`} /> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 border-t border-[#edf1f5] pt-4 text-[10px] text-[#7a879b]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#16b36c]" />Today</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#315ead]" />Consultation</span></div>
              </section>

              <section className="rounded-[1.5rem] bg-[#001b5e] p-5 text-white shadow-[0_16px_35px_rgba(0,27,94,0.15)]">
                <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8df0bb]">Wallet summary</p><h2 className="mt-1 text-base font-bold">Professional earnings</h2></div><span className="material-symbols-outlined text-[#8df0bb]">account_balance_wallet</span></div>
                <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/10 p-3"><p className="text-[10px] text-[#cbd8f4]">Current balance</p><p className="mt-1 text-lg font-bold">{wallet?.currentBalance ?? 0}</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-[10px] text-[#cbd8f4]">Lifetime points</p><p className="mt-1 text-lg font-bold">{totalPoints}</p></div></div>
                <Link href="/dashboard/doctor/wallet" className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold hover:bg-white/15">Open wallet<span className="material-symbols-outlined text-[17px]">arrow_forward</span></Link>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
