"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApiService,
  getApiErrorMessage,
  type AdminConsultationReport,
  type AdminDoctorUser,
} from "@/lib/api";

function getDoctorNameFromUser(user: AdminDoctorUser) {
  const fullName = [user.firstName, user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return fullName ? `Dr. ${fullName}` : user.username ?? user.email;
}

function getReportDoctorName(report: AdminConsultationReport) {
  const user = report.doctor?.user;
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName ? `Dr. ${fullName}` : user?.username ?? user?.email ?? report.doctorId ?? "Unknown doctor";
}

function getPatientName(report: AdminConsultationReport) {
  const user = report.appointment?.patient?.user;
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || user?.email || "Unknown patient";
}

function getReportSummary(report: AdminConsultationReport) {
  return (
    report.summary ||
    report.content ||
    report.notes ||
    report.diagnosis ||
    "No report summary available."
  );
}

function getReportDate(report: AdminConsultationReport) {
  const value = report.createdAt ?? report.updatedAt;
  return value ? new Date(value).toLocaleString() : "-";
}

function getAppointmentDate(report: AdminConsultationReport) {
  const appointment = report.appointment;
  const value = appointment?.scheduledAt ?? appointment?.startsAt;
  return value ? new Date(value).toLocaleString() : "-";
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "OPEN" || normalizedStatus === "PENDING") {
    return "bg-[#f59e0b]/15 text-[#b45309]";
  }

  if (normalizedStatus === "CLOSED" || normalizedStatus === "COMPLETED") {
    return "bg-[#16b46f]/15 text-[#166534]";
  }

  return "bg-[#dbeafe] text-[#1d4ed8]";
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminConsultationReport[]>([]);
  const [doctors, setDoctors] = useState<AdminDoctorUser[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [appliedAppointmentId, setAppliedAppointmentId] = useState("");
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [doctorsError, setDoctorsError] = useState("");
  const [totalReports, setTotalReports] = useState(0);

  const loadDoctors = useCallback(async () => {
    setDoctorsError("");
    setIsLoadingDoctors(true);

    try {
      const response = await adminApiService.listDoctors();
      setDoctors(response.data.data);
    } catch (error) {
      setDoctorsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingDoctors(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsError("");
    setIsLoadingReports(true);

    try {
      const response = await adminApiService.listReports({
        doctorId: selectedDoctorId || undefined,
        appointmentId: appliedAppointmentId || undefined,
      });
      setReports(response.data.data ?? []);
      setTotalReports(response.data.meta.total);
    } catch (error) {
      setReportsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingReports(false);
    }
  }, [appliedAppointmentId, selectedDoctorId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctors();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctors]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadReports();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadReports]);

  const statusCounts = useMemo(() => {
    return reports.reduce(
      (summary, report) => {
        const status = String(report.status ?? "UNKNOWN").toUpperCase();

        if (status === "OPEN" || status === "PENDING") summary.open += 1;
        if (status === "CLOSED" || status === "COMPLETED") summary.closed += 1;

        return summary;
      },
      { open: 0, closed: 0 },
    );
  }, [reports]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedAppointmentId(appointmentId.trim());
  };

  const clearFilters = () => {
    setSelectedDoctorId("");
    setAppointmentId("");
    setAppliedAppointmentId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#001b5e]">Reports</h2>
          <p className="mt-1 text-sm text-[#475569]">
            Review consultation reports with linked appointment and doctor details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadReports()}
          disabled={isLoadingReports}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-3 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      {reportsError ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
          <span>{reportsError}</span>
          <button
            type="button"
            onClick={() => void loadReports()}
            className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white"
          >
            Try Again
          </button>
        </div>
      ) : null}

      {doctorsError ? (
        <p role="alert" className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
          Doctor filter could not load: {doctorsError}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Reports</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{isLoadingReports ? "-" : totalReports}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Open</p>
          <p className="mt-2 text-2xl font-semibold text-[#b45309]">{isLoadingReports ? "-" : statusCounts.open}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Closed</p>
          <p className="mt-2 text-2xl font-semibold text-[#166534]">{isLoadingReports ? "-" : statusCounts.closed}</p>
        </article>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <h3 className="text-base font-semibold text-[#001b5e]">Filters</h3>
        <form className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]" onSubmit={applyFilters}>
          <select
            value={selectedDoctorId}
            onChange={(event) => setSelectedDoctorId(event.target.value)}
            className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#16b46f] focus:ring-2 focus:ring-[#16b46f]/15"
            aria-label="Filter by doctor"
          >
            <option value="">{isLoadingDoctors ? "Loading doctors..." : "All doctors"}</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctor?.id ?? doctor.id} value={doctor.doctor?.id ?? doctor.id}>
                {getDoctorNameFromUser(doctor)}
              </option>
            ))}
          </select>
          <input
            value={appointmentId}
            onChange={(event) => setAppointmentId(event.target.value)}
            className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f] focus:ring-2 focus:ring-[#16b46f]/15"
            placeholder="Appointment ID"
            aria-label="Filter by appointment ID"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#001b5e] px-4 text-sm font-semibold text-white hover:bg-[#0b2b75]"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-4 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
          >
            Clear
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-[#001b5e]">Consultation Reports</h3>
          <span className="w-fit rounded-full bg-[#e2e8f0] px-2.5 py-1 text-xs font-semibold text-[#334155]">
            {isLoadingReports ? "Loading..." : `${reports.length} shown`}
          </span>
        </div>

        {isLoadingReports ? (
          <p className="text-sm text-[#64748b]">Loading reports...</p>
        ) : null}

        {!isLoadingReports && reports.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-center text-sm text-[#64748b]">
            No reports found.
          </p>
        ) : null}

        {!isLoadingReports && reports.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {reports.map((report) => {
              const status = String(report.status ?? "UNKNOWN");
              const appointmentIdValue = report.appointmentId ?? report.appointment?.id ?? "-";

              return (
                <article key={report.id} className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                        {getReportDoctorName(report)}
                      </p>
                      <h4 className="mt-1 break-words text-base font-semibold text-[#001b5e]">
                        {report.title ?? `Report ${report.id}`}
                      </h4>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(status)}`}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#334155]">{getReportSummary(report)}</p>
                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-[#f8fafc] p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Patient</dt>
                      <dd className="mt-1 break-words text-[#334155]">{getPatientName(report)}</dd>
                    </div>
                    <div className="rounded-lg bg-[#f8fafc] p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Appointment</dt>
                      <dd className="mt-1 break-words text-[#334155]">{appointmentIdValue}</dd>
                    </div>
                    <div className="rounded-lg bg-[#f8fafc] p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Appointment Date</dt>
                      <dd className="mt-1 text-[#334155]">{getAppointmentDate(report)}</dd>
                    </div>
                    <div className="rounded-lg bg-[#f8fafc] p-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Generated</dt>
                      <dd className="mt-1 text-[#334155]">{getReportDate(report)}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
