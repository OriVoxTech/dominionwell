"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  getDoctorDisplayName,
  useDoctorProfile,
} from "@/lib/use-doctor-profile";
import { doctorApiService, type DoctorAppointment } from "@/lib/api";

const DOCTOR_NOTIFICATIONS_KEY = "dwDoctorNotifications";

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
          const now = new Date();
          const upcoming = response.data.data
            .filter((appointment) => {
              const startsAt = getAppointmentStartDate(appointment);
              return Boolean(startsAt && startsAt > now);
            })
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
      const stored = window.localStorage.getItem(DOCTOR_NOTIFICATIONS_KEY);

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
          .map(getAppointmentStartDate)
          .filter((date): date is Date => Boolean(date))
          .map(getDateKey),
      ),
    [upcomingAppointments],
  );

  const wallet = doctorProfile?.wallet;
  const appointmentStats = doctorProfile?.appointmentStats;
  const satisfaction = doctorProfile?.satisfaction;
  const totalPoints = wallet?.lifetimePoints ?? 0;
  const averageRating = satisfaction?.averageRating;
  const reviewCount = satisfaction?.reviewCount ?? 0;
  const ratingLabel = averageRating === null || averageRating === undefined ? "No ratings" : `${averageRating.toFixed(1)}/5`;
  const latestUpcomingAppointments = upcomingAppointments.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <DoctorMobileNav />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] flex-col bg-[#0d1b3d] px-4 py-8 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <span className="text-1xl font-extrabold text-[#7784ac]">DominionWell+</span>
        </div>

        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#16b36c] bg-[#e0e3e6]">
            <Image
              className="object-cover"
              alt="Doctor profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <DoctorProfileSummary />
        </div>

        <div className="flex-grow space-y-2 text-sm">
          <a className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/consultations">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/patients">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/wallet">
            <span className="material-symbols-outlined">wallet</span>
            <span>Wallet</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/settings">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">help</span>
            <span>Help Center</span>
          </a>
          <DoctorLogoutButton className="flex w-full items-center gap-3 p-3 text-left text-[#7784ac]/85 hover:bg-[#00020d]/10" />
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-10 lg:ml-[280px]">
        <header className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl mb-2">Physician Dashboard</h1>
            <p className="text-xs text-[#45464e] sm:text-[13px]">
              Welcome back, {getDoctorDisplayName(doctorProfile)}. You have {appointmentStats?.today ?? "—"} appointment(s) today.
            </p>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <div className="rounded-lg border border-[#c6c6cf] bg-[#f7f9fc] px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">Live Time</p>
              <div className="text-sm font-bold text-[#001b5e] sm:text-base">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>
            <Link href="/dashboard/doctor/notifications" className="flex items-center gap-2 rounded-lg border border-[#c6c6cf] bg-[#f7f9fc] p-2 hover:bg-[#eceef1]" aria-label="Notifications">
              <span className="material-symbols-outlined text-[#45464e]">notifications</span>
              {unreadNotifications > 0 ? <span className="h-2 w-2 rounded-full bg-[#ba1a1a]" /> : null}
            </Link>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#16b36c]/10 p-2">
                <span className="material-symbols-outlined text-[#16b36c]">event_available</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">Live</span>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Today&apos;s Appointments</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{appointmentStats?.today ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#67d6e7]/20 p-2">
                <span className="material-symbols-outlined text-[#0093a2]">pending_actions</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">Live</span>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Completed Consultations</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{appointmentStats?.completed ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#16b36c]/10 p-2">
                <span className="material-symbols-outlined text-[#16b36c]">monitoring</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">{reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Patient Satisfaction</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{ratingLabel}</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#0aa4b4]/10 p-2">
                <span className="material-symbols-outlined text-[#0aa4b4]">wallet</span>
              </div>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Total Points</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{totalPoints} pts</p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-1xl font-semibold text-[#00020d]">Upcoming Consultation Snapshot</h2>
                <Link href="/dashboard/doctor/consultations" className="text-xs font-semibold text-[#16b36c] hover:underline">
                  View consultations
                </Link>
              </div>

              {latestUpcomingAppointments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                  No upcoming consultations to show.
                </div>
              ) : (
                <div className="space-y-4">
                  {latestUpcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex flex-col justify-between gap-4 rounded-lg border border-[#c6c6cf] bg-[#f2f4f7] p-4 md:flex-row md:items-center">
                      <div>
                        <h4 className="font-semibold text-[#00020d] mb-2">{getAppointmentPatient(appointment)}</h4>
                        <p className="text-xs text-[#45464e]">{formatAppointmentDateTime(appointment)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#16b36c]/15 px-2 py-1 text-[10px] font-semibold uppercase text-[#16b36c]">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-1xl font-semibold text-[#00020d]">Ratings & Badges</h2>
                <span className="text-xs font-medium text-[#45464e]">{reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
              </div>

              <div className="grid gap-4">
                <article className="overflow-hidden rounded-xl border border-[#c6c6cf] bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#f0fdf4] to-[#ecfeff] px-4 py-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[#00020d] mb-1">Patient Satisfaction</h4>
                      <p className="text-[11px] text-[#45464e]">Average rating from completed reviews</p>
                    </div>
                    <span className="rounded-full border border-[#16b36c]/30 bg-white px-2 py-1 text-[10px] font-semibold text-[#0f766e]">
                      {ratingLabel}
                    </span>
                  </div>

                  <div className="px-4 py-4">
                    <p className="text-sm leading-6 text-[#334155]">
                      {averageRating === null || averageRating === undefined
                        ? "No ratings yet. Completed consultations with reviews will appear here."
                        : `You currently have an average patient rating of ${averageRating.toFixed(1)} from ${reviewCount} review${reviewCount === 1 ? "" : "s"}.`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(doctorProfile?.badges ?? []).length > 0 ? (
                        doctorProfile?.badges?.map((badge) => (
                          <span key={badge} className="rounded-full bg-[#16b36c]/15 px-2 py-1 text-[10px] font-semibold uppercase text-[#16b36c]">
                            {badge.replaceAll("_", " ")}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#64748b]">No badges yet.</span>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            </section>

      
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-4">
            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-[#00020d]">{monthLabel}</h3>
              </div>
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-[#45464e]">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
                {calendarDays.map((cell, index) => (
                  <div
                    key={`${cell.day}-${index}`}
                    className={`relative rounded-lg py-2 ${
                      cell.isToday
                        ? "bg-[#16b36c] font-bold text-white"
                        : cell.currentMonth && upcomingAppointmentDates.has(cell.dateKey)
                          ? "bg-[#dbeafe] font-bold text-[#001b5e] ring-1 ring-[#60a5fa]"
                          : cell.currentMonth
                            ? "cursor-pointer hover:bg-[#eceef1]"
                            : "text-[#45464e]/30"
                    }`}
                  >
                    {cell.day}
                    {cell.currentMonth && upcomingAppointmentDates.has(cell.dateKey) ? (
                      <span className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${cell.isToday ? "bg-white" : "bg-[#1d4ed8]"}`} />
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-xl bg-[#0d1b3d] p-6 text-[#7784ac] shadow-xl">
              <div className="relative z-10">
                <h3 className="mb-2 text-1xl font-semibold">DominionWell+ Premium</h3>
                <p className="mb-6 text-xs opacity-80">You have reached 92% of your monthly consultation target. Keep it up!</p>
                <div className="mb-4 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-[92%] rounded-full bg-[#16b36c] shadow-[0_0_10px_rgba(22,179,108,0.5)]" />
                </div>
                <Link href="/dashboard/doctor/consultations" className="block w-full rounded-lg border border-white/20 bg-white/10 py-2 text-center text-xs hover:bg-white/20">
                  View Analytics
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#16b36c]/10 blur-3xl" />
            </section>

      
          </div>
        </div>
      </main>
    </div>
  );
}
