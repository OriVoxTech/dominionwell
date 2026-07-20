"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  doctorApiService,
  getApiErrorMessage,
  type DoctorAppointment,
  type DoctorAppointmentStatus,
} from "@/lib/api";

type ConsultationTab = "upcoming" | "all";

const CONSULTATION_PAST_GRACE_MINUTES = 10;

const doctorAppointmentStatuses: DoctorAppointmentStatus[] = [
  "BOOKED",
  "VERIFIED",
  "COMPLETED",
  "CANCELLED",
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

  if (typeof current === "string" && current.trim()) return current;
  if (typeof current === "number") return String(current);

  return fallback;
}

function getAppointmentStatus(appointment: DoctorAppointment, overrides: Record<string, DoctorAppointmentStatus>) {
  return overrides[appointment.id] ?? appointment.status;
}

function getAppointmentStatusClass(status: string) {
  const normalizedStatus = status.trim().toUpperCase();

  if (normalizedStatus === "BOOKED" || normalizedStatus === "VERIFIED") {
    return "bg-[#16b36c]/15 text-[#16b36c]";
  }

  if (normalizedStatus === "COMPLETED") {
    return "bg-[#0ea5e9]/15 text-[#0369a1]";
  }

  if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
    return "bg-[#ef4444]/12 text-[#b91c1c]";
  }

  return "bg-[#64748b]/15 text-[#475569]";
}

function getAppointmentPatient(appointment: DoctorAppointment) {
  const record = asRecord(appointment);
  const patient = asRecord(record?.patient);
  const patientUser = asRecord(patient?.user);
  const firstName = getStringValue(patientUser, ["firstName"], "");
  const lastName = getStringValue(patientUser, ["lastName"], "");
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    fullName ||
    getNestedStringValue(record, ["patient", "user", "username"], "") ||
    getStringValue(record, ["patientName", "patientId"], "Patient")
  );
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

function formatAppointmentDate(appointment: DoctorAppointment) {
  const startsAt = getAppointmentStart(appointment);
  if (!startsAt) return "-";

  const date = new Date(startsAt);
  return Number.isNaN(date.getTime())
    ? startsAt
    : date.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function formatAppointmentTime(appointment: DoctorAppointment) {
  const startsAt = getAppointmentStart(appointment);
  const endsAt = getAppointmentEnd(appointment);

  if (!startsAt) return "-";

  const startDate = new Date(startsAt);
  const startLabel = Number.isNaN(startDate.getTime())
    ? startsAt
    : startDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (!endsAt) return startLabel;

  const endDate = new Date(endsAt);
  const endLabel = Number.isNaN(endDate.getTime())
    ? endsAt
    : endDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return `${startLabel} - ${endLabel}`;
}

function isUpcomingAppointment(
  appointment: DoctorAppointment,
  overrides: Record<string, DoctorAppointmentStatus>,
  now = new Date(),
) {
  const status = getAppointmentStatus(appointment, overrides);
  const startsAt = getAppointmentStartDate(appointment);

  if (status !== "BOOKED" || !startsAt) return false;

  const pastThreshold = new Date(
    startsAt.getTime() + CONSULTATION_PAST_GRACE_MINUTES * 60 * 1000,
  );

  return now < pastThreshold;
}

function canCompleteAppointment(appointment: DoctorAppointment, now = new Date()) {
  const startsAt = getAppointmentStartDate(appointment);
  if (!startsAt) return false;

  const completionThreshold = new Date(
    startsAt.getTime() + CONSULTATION_PAST_GRACE_MINUTES * 60 * 1000,
  );

  return now >= completionThreshold;
}

export default function ConsultantConsultationsPage() {
  const [activeConsultationTab, setActiveConsultationTab] = useState<ConsultationTab>("upcoming");
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointment[]>([]);
  const [appointmentStatus, setAppointmentStatus] = useState<DoctorAppointmentStatus | "">("");
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentMeta, setAppointmentMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [allConsultationsTotal, setAllConsultationsTotal] = useState<number | null>(null);
  const [isLoadingDoctorAppointments, setIsLoadingDoctorAppointments] = useState(true);
  const [doctorAppointmentsError, setDoctorAppointmentsError] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, DoctorAppointmentStatus>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actingAppointmentId, setActingAppointmentId] = useState("");

  const loadDoctorAppointments = useCallback(async () => {
    setDoctorAppointmentsError("");
    setIsLoadingDoctorAppointments(true);

    try {
      const response = await doctorApiService.listAppointments({
        status:
          activeConsultationTab === "all"
            ? appointmentStatus || undefined
            : "BOOKED",
        page: appointmentPage,
        limit: 20,
      });
      setDoctorAppointments(response.data.data);
      setAppointmentMeta(response.data.meta);
    } catch (error) {
      setDoctorAppointmentsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingDoctorAppointments(false);
    }
  }, [activeConsultationTab, appointmentPage, appointmentStatus]);

  const loadAllConsultationsTotal = useCallback(async () => {
    try {
      const response = await doctorApiService.listAppointments({ page: 1, limit: 1 });
      setAllConsultationsTotal(response.data.meta.total);
    } catch {
      setAllConsultationsTotal(null);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctorAppointments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctorAppointments]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAllConsultationsTotal();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAllConsultationsTotal]);

  const upcomingAppointments = useMemo(
    () =>
      doctorAppointments
        .filter((appointment) => isUpcomingAppointment(appointment, statusOverrides))
        .sort(
          (first, second) =>
            (getAppointmentStartDate(first)?.getTime() ?? 0) -
            (getAppointmentStartDate(second)?.getTime() ?? 0),
        ),
    [doctorAppointments, statusOverrides],
  );

  const visibleAppointments = activeConsultationTab === "upcoming" ? upcomingAppointments : doctorAppointments;

  const updateAppointmentStatus = async (appointmentId: string, status: "CANCELLED" | "COMPLETED") => {
    setActionMessage("");
    setActionError("");
    setActingAppointmentId(appointmentId);

    try {
      const response =
        status === "COMPLETED"
          ? await doctorApiService.completeAppointment(appointmentId)
          : await doctorApiService.cancelAppointment(appointmentId);
      const updatedAppointment = asRecord(response.data)
        ? (response.data as DoctorAppointment)
        : null;
      const updatedStatus = updatedAppointment?.status ?? status;

      setDoctorAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, ...(updatedAppointment ?? {}), status: updatedStatus }
            : appointment,
        ),
      );
      setStatusOverrides((current) => ({ ...current, [appointmentId]: updatedStatus }));
      setActionMessage(
        updatedStatus === "COMPLETED"
          ? "Consultation marked as completed."
          : "Consultation cancelled.",
      );
      void loadAllConsultationsTotal();
      window.dispatchEvent(new Event("dw-appointments-updated"));
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setActingAppointmentId("");
    }
  };

  const showPagination = activeConsultationTab === "all" && appointmentMeta.totalPages > 1;

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
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </div>
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
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span>Notifications</span>
          </Link>
          <DoctorLogoutButton className="flex w-full items-center gap-3 p-3 text-left text-[#7784ac]/85 hover:bg-[#00020d]/10" />
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-10 lg:ml-[280px]">
        <header className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/doctor"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Consultations</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">View upcoming and all doctor consultations.</p>
        </header>

        <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-2 shadow-sm backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveConsultationTab("upcoming");
                setAppointmentPage(1);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeConsultationTab === "upcoming"
                  ? "bg-[#001b5e] text-white"
                  : "bg-[#f8fafc] text-[#334155] hover:bg-[#eef2f7]"
              }`}
            >
              Upcoming Consultations ({upcomingAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveConsultationTab("all");
                setAppointmentPage(1);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeConsultationTab === "all"
                  ? "bg-[#001b5e] text-white"
                  : "bg-[#f8fafc] text-[#334155] hover:bg-[#eef2f7]"
              }`}
            >
              All Consultations ({allConsultationsTotal ?? "—"})
            </button>
          </div>
        </section>

        {actionMessage ? (
          <section className="mb-6 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm font-semibold text-[#166534]">
            {actionMessage}
          </section>
        ) : null}

        {actionError ? (
          <section role="alert" className="mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-semibold text-[#b91c1c]">
            {actionError}
          </section>
        ) : null}

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#00020d]">
                {activeConsultationTab === "upcoming" ? "Upcoming Consultations" : "All Consultations"}
              </h2>
              <p className="mt-1 text-xs text-[#64748b]">
                Total: {isLoadingDoctorAppointments ? "—" : activeConsultationTab === "upcoming" ? upcomingAppointments.length : appointmentMeta.total}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {activeConsultationTab === "all" ? (
                <select
                  value={appointmentStatus}
                  onChange={(event) => {
                    setAppointmentStatus(event.target.value as DoctorAppointmentStatus | "");
                    setAppointmentPage(1);
                  }}
                  className="h-10 rounded-lg border border-[#c6c6cf] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#0aa4b4]"
                  aria-label="Filter consultations by status"
                >
                  <option value="">All statuses</option>
                  {doctorAppointmentStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              ) : null}

              <button
                type="button"
                onClick={() => void loadDoctorAppointments()}
                disabled={isLoadingDoctorAppointments}
                className="h-10 rounded-lg border border-[#c6c6cf] px-3 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
          </div>

          {doctorAppointmentsError ? (
            <div role="alert" className="mb-4 flex flex-col gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
              <span>{doctorAppointmentsError}</span>
              <button type="button" onClick={() => void loadDoctorAppointments()} className="rounded-md border border-[#fca5a5] px-2 py-1 text-xs font-semibold hover:bg-white">Try Again</button>
            </div>
          ) : null}

          {isLoadingDoctorAppointments ? (
            <p className="rounded-lg bg-[#f8fafc] p-4 text-sm text-[#64748b]">Loading consultations...</p>
          ) : visibleAppointments.length === 0 && !doctorAppointmentsError ? (
            <p className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">No consultations found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                    <th className="rounded-l-lg px-3 py-3">Appointment ID</th>
                    <th className="px-3 py-3">Patient</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-lg px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAppointments.map((appointment) => {
                    const status = getAppointmentStatus(appointment, statusOverrides);
                    const canAct = activeConsultationTab === "upcoming" && status === "BOOKED";
                    const isActing = actingAppointmentId === appointment.id;
                    const canComplete = canCompleteAppointment(appointment);

                    return (
                      <tr key={appointment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-3 font-medium text-[#001b5e]">{appointment.id}</td>
                        <td className="px-3 py-3 text-[#475569]">{getAppointmentPatient(appointment)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#475569]">{formatAppointmentDate(appointment)}</td>
                        <td className="px-3 py-3 text-[#475569]">{formatAppointmentTime(appointment)}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getAppointmentStatusClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {canAct ? (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() => void updateAppointmentStatus(appointment.id, "CANCELLED")}
                                className="rounded-lg border border-[#ef4444]/40 px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                              >
                                {isActing ? "Saving..." : "Cancel"}
                              </button>
                              <button
                                type="button"
                                disabled={isActing || !canComplete}
                                onClick={() => void updateAppointmentStatus(appointment.id, "COMPLETED")}
                                className="rounded-lg bg-[#16b36c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#149660] disabled:cursor-wait disabled:bg-[#94a3b8]"
                                title={
                                  canComplete
                                    ? "Mark this consultation as completed"
                                    : "You can complete this consultation 10 minutes after its appointment time"
                                }
                              >
                                {isActing ? "Saving..." : "Mark as Completed"}
                              </button>
                              {!canComplete ? (
                                <p className="basis-full text-[11px] text-[#64748b]">
                                  Completion unlocks 10 minutes after appointment time.
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-[#64748b]">No action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {showPagination ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={appointmentPage <= 1 || isLoadingDoctorAppointments}
                onClick={() => setAppointmentPage((page) => Math.max(1, page - 1))}
                className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <p className="text-xs text-[#64748b]">Page {appointmentMeta.page} of {appointmentMeta.totalPages}</p>
              <button
                type="button"
                disabled={appointmentPage >= appointmentMeta.totalPages || isLoadingDoctorAppointments}
                onClick={() => setAppointmentPage((page) => page + 1)}
                className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
