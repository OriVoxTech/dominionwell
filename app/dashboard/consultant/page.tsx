"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  ADMIN_UPDATED_EVENT,
  readDoctorWalletSummary,
} from "@/lib/admin-portal";
import {
  APPOINTMENT_REQUESTS_UPDATED_EVENT,
  isConsultationInviteWindow,
  readAppointmentRequests,
  updateAppointmentRequestStatus,
  type AppointmentRequest,
} from "@/lib/appointments";
import {
  getDoctorDisplayName,
  useDoctorProfile,
} from "@/lib/use-doctor-profile";
import { doctorApiService } from "@/lib/api";

const DOCTOR_NOTIFICATIONS_KEY = "dwDoctorNotifications";

const recentConsultations = [
  {
    id: "rc-1",
    patient: "Arthur Morgan",
    details: "Chest pain follow-up",
    dateTime: "Today, 9:30 AM",
    status: "Completed",
  },
  {
    id: "rc-2",
    patient: "Sarah Williams",
    details: "Post-op recovery check",
    dateTime: "Today, 8:15 AM",
    status: "Completed",
  },
  {
    id: "rc-3",
    patient: "Daniel Okafor",
    details: "Hypertension medication review",
    dateTime: "Yesterday, 4:40 PM",
    status: "Completed",
  },
  {
    id: "rc-4",
    patient: "Grace Bennett",
    details: "Cardiac screening consult",
    dateTime: "Yesterday, 2:10 PM",
    status: "Completed",
  },
  {
    id: "rc-5",
    patient: "Rita Adeyemi",
    details: "Routine wellness consultation",
    dateTime: "Jul 5, 11:00 AM",
    status: "Completed",
  },
];

const patientReviews = [
  {
    id: "pr-1",
    patient: "Tina Cole",
    rating: "5.0",
    comment: "The doctor explained everything clearly and followed up promptly.",
  },
  {
    id: "pr-2",
    patient: "Samuel Wright",
    rating: "4.8",
    comment: "Very attentive during consultation and gave practical next steps.",
  },
  {
    id: "pr-3",
    patient: "Maya Johnson",
    rating: "5.0",
    comment: "Excellent experience. Felt heard and supported throughout.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ConsultantDashboardPage() {
  const doctorProfile = useDoctorProfile();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [appointmentTotals, setAppointmentTotals] = useState<{ all: number; completed: number } | null>(null);
  const [walletSummary, setWalletSummary] = useState(() => readDoctorWalletSummary("dr-richardson"));
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
    const cells: Array<{ day: number; currentMonth: boolean; isToday: boolean }> = [];

    for (let index = 0; index < 42; index += 1) {
      const dayOffset = index - firstWeekDay + 1;

      if (dayOffset <= 0) {
        cells.push({
          day: daysInPreviousMonth + dayOffset,
          currentMonth: false,
          isToday: false,
        });
        continue;
      }

      if (dayOffset > daysInCurrentMonth) {
        cells.push({
          day: dayOffset - daysInCurrentMonth,
          currentMonth: false,
          isToday: false,
        });
        continue;
      }

      const isToday =
        dayOffset === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      cells.push({ day: dayOffset, currentMonth: true, isToday });
    }

    return cells;
  }, [currentMonth, currentYear, today]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([
        doctorApiService.listAppointments({ page: 1, limit: 1 }),
        doctorApiService.listAppointments({ status: "COMPLETED", page: 1, limit: 1 }),
      ]).then(([allResponse, completedResponse]) => {
        setAppointmentTotals({
          all: allResponse.data.meta.total,
          completed: completedResponse.data.meta.total,
        });
      }).catch(() => {
        // The authenticated API client handles session errors and redirects.
      });
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
    const syncAppointmentRequests = () => {
      setAppointmentRequests(readAppointmentRequests());
    };

    syncAppointmentRequests();
    window.addEventListener("storage", syncAppointmentRequests);
    window.addEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncAppointmentRequests);

    return () => {
      window.removeEventListener("storage", syncAppointmentRequests);
      window.removeEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncAppointmentRequests);
    };
  }, []);

  useEffect(() => {
    const syncWallet = () => {
      setWalletSummary(readDoctorWalletSummary("dr-richardson"));
    };

    syncWallet();
    window.addEventListener("storage", syncWallet);
    window.addEventListener(ADMIN_UPDATED_EVENT, syncWallet);

    return () => {
      window.removeEventListener("storage", syncWallet);
      window.removeEventListener(ADMIN_UPDATED_EVENT, syncWallet);
    };
  }, []);

  const pendingAppointments = appointmentRequests.filter((request) => request.status === "Pending");

  const handleAppointmentAction = (appointmentId: string, action: "Booked" | "Rejected" | "Completed") => {
    updateAppointmentRequestStatus(appointmentId, action);
    setAppointmentRequests(readAppointmentRequests());
  };

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

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
            <p className="text-xs text-[#45464e] sm:text-[13px]">Welcome back, {getDoctorDisplayName(doctorProfile)}. You have {appointmentTotals?.all ?? "—"} total appointments.</p>
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

        <section className="mb-6 rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-4 shadow-sm sm:mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#001b5e] sm:text-base mb-2">Quick Link</h2>
              <p className="text-xs text-[#475569] sm:text-[12px]">Jump directly to consultation verification when a patient shares their credentials.</p>
            </div>
            <Link
              href="/dashboard/doctor/consultations#verify-consultation"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#001b5e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Verify Consultation</span>
            </Link>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-5">
          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#16b36c]/10 p-2">
                <span className="material-symbols-outlined text-[#16b36c]">event_available</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">Live</span>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">All Appointments</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{appointmentTotals?.all ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#67d6e7]/20 p-2">
                <span className="material-symbols-outlined text-[#0093a2]">pending_actions</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">Live</span>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Completed Consultations</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{appointmentTotals?.completed ?? "—"}</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#16b36c]/10 p-2">
                <span className="material-symbols-outlined text-[#16b36c]">monitoring</span>
              </div>
              <span className="text-xs font-bold text-[#16b36c]">98%</span>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Patient Satisfaction</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">4.9/5</p>
          </div>

          <div className="rounded-xl border border-[#eaecf0] bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className="rounded-lg bg-[#0aa4b4]/10 p-2">
                <span className="material-symbols-outlined text-[#0aa4b4]">wallet</span>
              </div>
            </div>
            <h3 className="text-xs text-[#45464e] sm:text-[13px] mb-2">Total Points</h3>
            <p className="text-xl font-semibold text-[#00020d] sm:text-1xl">{walletSummary.points} pts</p>
          </div>
        </div>
           <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#00020d]">New Appointment Requests</h2>
            <p className="text-xs text-[#64748b]">Pending: {pendingAppointments.length}</p>
          </div>

          {appointmentRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
              No appointment requests yet.
            </div>
          ) : (
            <div className="space-y-3">
              {appointmentRequests.slice(0, 5).map((request) => (
                <article key={request.id} className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#001b5e] mb-1">{request.patientName}</p>
                      <p className="text-xs text-[#475569]">
                        {request.doctorName} • {request.dateLabel} • {request.timeSlot}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                        request.status === "Pending"
                          ? "bg-[#f59e0b]/15 text-[#b45309]"
                          : request.status === "Completed"
                            ? "bg-[#0aa4b4]/15 text-[#0369a1]"
                          : request.status === "Booked" || request.status === "Accepted"
                            ? "bg-[#16b46f]/15 text-[#16b46f]"
                            : "bg-[#ef4444]/12 text-[#dc2626]"
                      }`}
                    >
                      {request.status === "Accepted" ? "Booked" : request.status}
                    </span>
                  </div>

                  {isConsultationInviteWindow(request) ? (
                    <p className="mb-2 text-[11px] font-semibold text-[#001b5e]">Check mail for consultation invite</p>
                  ) : null}

                  {request.status === "Pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#ef4444]/40 px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                        onClick={() => handleAppointmentAction(request.id, "Rejected")}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-[#16b46f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#149660]"
                        onClick={() => handleAppointmentAction(request.id, "Booked")}
                      >
                        Accept
                      </button>
                    </div>
                  ) : request.status === "Booked" || request.status === "Accepted" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#001b5e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                        onClick={() => handleAppointmentAction(request.id, "Completed")}
                      >
                        Mark Completed
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-1xl font-semibold text-[#00020d]">Recent Consultations</h2>
                <span className="text-xs font-medium text-[#45464e]">Last 5 records</span>
              </div>

              <div className="space-y-4">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex flex-col justify-between gap-4 rounded-lg border border-[#c6c6cf] bg-[#f2f4f7] p-4 md:flex-row md:items-center">
                    <div>
                      <h4 className="font-semibold text-[#00020d] mb-2">{consultation.patient}</h4>
                      <p className="text-xs text-[#45464e]">{consultation.details}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-[#45464e]">{consultation.dateTime}</p>
                      <span className="rounded-full bg-[#16b36c]/15 px-2 py-1 text-[10px] font-semibold uppercase text-[#16b36c]">
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-1xl font-semibold text-[#00020d]">Patient Reviews</h2>
                <span className="text-xs font-medium text-[#45464e]">Recent feedback</span>
              </div>

              <div className="grid gap-4">
                {patientReviews.map((review) => (
                  <article key={review.id} className="overflow-hidden rounded-xl border border-[#c6c6cf] bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#f0fdf4] to-[#ecfeff] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#16b36c] text-xs font-bold text-white">
                          {getInitials(review.patient)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#00020d] mb-1">{review.patient}</h4>
                          <p className="text-[11px] text-[#45464e]">Verified consultation review</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-[#16b36c]/30 bg-white px-2 py-1 text-[10px] font-semibold text-[#0f766e]">
                        {review.rating} / 5
                      </span>
                    </div>

                    <div className="px-4 py-4">
                      <p className="text-sm italic leading-6 text-[#334155]">&ldquo;{review.comment}&rdquo;</p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
                        <span className="font-bold tracking-wide text-[#f59e0b]">★★★★★</span>
                        <span className="text-[#64748b]">Reviewed recently</span>
                      </div>
                    </div>
                  </article>
                ))}
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
                    className={`rounded-lg py-2 ${
                      cell.isToday
                        ? "bg-[#16b36c] font-bold text-white"
                        : cell.currentMonth
                          ? "cursor-pointer hover:bg-[#eceef1]"
                          : "text-[#45464e]/30"
                    }`}
                  >
                    {cell.day}
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
                <button className="w-full rounded-lg border border-white/20 bg-white/10 py-2 text-xs hover:bg-white/20">
                  View Analytics
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#16b36c]/10 blur-3xl" />
            </section>

      
          </div>
        </div>
      </main>
    </div>
  );
}
