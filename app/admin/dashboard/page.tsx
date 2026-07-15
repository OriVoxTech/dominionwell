"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApiService,
  getApiErrorMessage,
  type AdminOverview,
} from "@/lib/api";

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await adminApiService.getOverview();
      setOverview(response.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOverview();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOverview]);

  const metrics = useMemo(() => {
    if (!overview) {
      return {
        activeUsers: 0,
        verifiedDoctors: 0,
        patientShare: 0,
        completedAmount: 0,
      };
    }

    return {
      activeUsers: percentage(overview.users.active, overview.users.total),
      verifiedDoctors: percentage(
        overview.doctors.verified,
        overview.doctors.total,
      ),
      patientShare: percentage(overview.users.patients, overview.users.total),
      completedAmount: overview.payments.completedAmountCents / 100,
    };
  }, [overview]);

  const displayValue = (value: number | undefined) =>
    isLoading || !overview ? "—" : (value ?? 0).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#001b5e]">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-[#475569]">Live governance overview, operational metrics, and key controls.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadOverview()}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-3 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      {error ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => void loadOverview()} className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white">Try Again</button>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{displayValue(overview?.users.total)}</p>
          <p className="text-xs text-[#475569]">{displayValue(overview?.users.active)} active · {displayValue(overview?.users.deleted)} deleted</p>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Patients</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{displayValue(overview?.users.patients)}</p>
          <p className="text-xs text-[#475569]">Registered patient accounts</p>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Doctors</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{displayValue(overview?.doctors.total)}</p>
          <p className="text-xs text-[#475569]">{displayValue(overview?.doctors.verified)} verified · {displayValue(overview?.doctors.unverified)} unverified</p>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Completed Payments</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{isLoading || !overview ? "—" : nairaFormatter.format(metrics.completedAmount)}</p>
          <p className="text-xs text-[#475569]">{displayValue(overview?.payments.completedCount)} completed payment(s)</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#e2e8f0] p-4">
          <h3 className="text-base font-semibold text-[#001b5e]">Operations</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-[#f8fbff] p-3">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">Booked appointments</p>
              <p className="mt-1 text-xl font-semibold text-[#001b5e]">{displayValue(overview?.appointments.booked)}</p>
            </div>
            <div className="rounded-lg bg-[#f8fbff] p-3">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">Pending withdrawals</p>
              <p className="mt-1 text-xl font-semibold text-[#b45309]">{displayValue(overview?.withdrawals.pending)}</p>
            </div>
            <div className="rounded-lg bg-[#f8fbff] p-3">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">Doctor accounts</p>
              <p className="mt-1 text-xl font-semibold text-[#001b5e]">{displayValue(overview?.users.doctors)}</p>
            </div>
            <div className="rounded-lg bg-[#f8fbff] p-3">
              <p className="text-xs uppercase tracking-wide text-[#64748b]">Deleted users</p>
              <p className="mt-1 text-xl font-semibold text-[#b91c1c]">{displayValue(overview?.users.deleted)}</p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] p-4">
          <h3 className="text-base font-semibold text-[#001b5e]">Platform Analytics</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { label: "Active User Rate", value: metrics.activeUsers },
              { label: "Doctor Verification Rate", value: metrics.verifiedDoctors },
              { label: "Patient Share of Users", value: metrics.patientShare },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{metric.label}</p>
                  <p className="text-xs font-semibold text-[#001b5e]">{isLoading || !overview ? "—" : `${metric.value}%`}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#16b46f] to-[#0aa4b4]" style={{ width: `${isLoading || !overview ? 0 : metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
