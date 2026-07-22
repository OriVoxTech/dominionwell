"use client";

import Link from "next/link";
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

  const summaryCards = [
    {
      label: "Total users",
      value: displayValue(overview?.users.total),
      note: `${displayValue(overview?.users.active)} active accounts`,
      icon: "group",
      color: "bg-[#eafbf2] text-[#0b9459]",
      href: "/admin/patients",
    },
    {
      label: "Patients",
      value: displayValue(overview?.users.patients),
      note: "Registered patient accounts",
      icon: "personal_injury",
      color: "bg-[#eef4ff] text-[#315ead]",
      href: "/admin/patients",
    },
    {
      label: "Doctors",
      value: displayValue(overview?.doctors.total),
      note: `${displayValue(overview?.doctors.verified)} verified doctors`,
      icon: "stethoscope",
      color: "bg-[#f3edff] text-[#7543b5]",
      href: "/admin/doctors",
    },
    {
      label: "Completed payments",
      value: isLoading || !overview ? "—" : nairaFormatter.format(metrics.completedAmount),
      note: `${displayValue(overview?.payments.completedCount)} successful payments`,
      icon: "payments",
      color: "bg-[#fff5e8] text-[#c66b12]",
      href: "/admin/payments",
    },
  ];

  const quickActions = [
    { label: "Manage doctors", description: "Review accounts and applications", href: "/admin/doctors", icon: "stethoscope" },
    { label: "Manage patients", description: "Review patient activity", href: "/admin/patients", icon: "group" },
    { label: "Subscription plans", description: "Create and review care plans", href: "/admin/subscriptions", icon: "card_membership" },
    { label: "Medical specialties", description: "Maintain available specialties", href: "/admin/specialties", icon: "medical_information" },
  ];

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#7a879b]">Administration</p>
          <h1 className="mt-1 text-xl font-bold tracking-[-0.025em] text-[#001b5e] sm:text-2xl">Platform overview</h1>
        </div>
        <button type="button" onClick={() => void loadOverview()} disabled={isLoading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9e2ec] bg-white px-4 text-sm font-bold text-[#001b5e] shadow-sm transition hover:border-[#b8c6d6] disabled:cursor-wait disabled:opacity-60">
          <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>refresh</span>
          <span className="hidden sm:inline">Refresh data</span>
        </button>
      </header>

      {error ? (
        <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm text-[#991b1b] sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => void loadOverview()} className="self-start rounded-lg bg-[#991b1b] px-3 py-2 text-xs font-bold text-white sm:self-auto">Try again</button>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#001b5e_0%,#073377_65%,#096c66_125%)] px-5 py-7 text-white shadow-[0_22px_55px_rgba(0,27,94,0.18)] sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-white/[0.045]" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#9cf5c6]"><span className="material-symbols-outlined text-[16px]">monitoring</span>Live operational overview</span>
            <h2 className="mt-4 text-xl font-bold tracking-[-0.03em] sm:text-2xl">Keep the platform healthy and moving.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#cbd8f4]">Monitor users, clinical activity, payments, and outstanding operational tasks from one workspace.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-[10px] text-[#cbd8f4]">Active users</p><p className="mt-2 text-xl font-bold">{displayValue(overview?.users.active)}</p><p className="mt-1 text-[10px] text-[#9cf5c6]">{isLoading || !overview ? "—" : `${metrics.activeUsers}% of users`}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-[10px] text-[#cbd8f4]">Pending actions</p><p className="mt-2 text-xl font-bold">{displayValue(overview?.withdrawals.pending)}</p><p className="mt-1 text-[10px] text-[#fcd9a0]">Withdrawal requests</p></div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform summary">
        {summaryCards.map((card) => (
          <Link key={card.label} href={card.href} className="group rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)] transition hover:-translate-y-0.5 hover:border-[#c9d6e4]">
            <div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${card.color}`}><span className="material-symbols-outlined text-[22px]">{card.icon}</span></span><span className="material-symbols-outlined text-[17px] text-[#a4afbd] group-hover:text-[#0b9459]">arrow_forward</span></div>
            <p className="mt-5 text-xl font-bold text-[#001b5e]">{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#44536a]">{card.label}</p>
            <p className="mt-1 text-xs text-[#8a96a8]">{card.note}</p>
          </Link>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
          <div><h2 className="text-lg font-bold text-[#001b5e]">Operational activity</h2><p className="mt-1 text-xs text-[#7a879b]">A real-time snapshot of activity requiring visibility.</p></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Booked appointments", value: displayValue(overview?.appointments.booked), icon: "event_upcoming", color: "text-[#315ead] bg-[#eef4ff]", href: "/admin/consultations" },
              { label: "Pending withdrawals", value: displayValue(overview?.withdrawals.pending), icon: "pending_actions", color: "text-[#c66b12] bg-[#fff5e8]", href: "/admin/payments" },
              { label: "Doctor accounts", value: displayValue(overview?.users.doctors), icon: "medical_services", color: "text-[#7543b5] bg-[#f3edff]", href: "/admin/doctors" },
              { label: "Deactivated users", value: displayValue(overview?.users.deleted), icon: "person_off", color: "text-[#b42318] bg-[#fff0ef]", href: "/admin/patients" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-4 rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4 hover:border-[#ced9e5]">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.color}`}><span className="material-symbols-outlined text-[21px]">{item.icon}</span></span>
                <span className="min-w-0 flex-1"><span className="block text-xl font-bold text-[#001b5e]">{item.value}</span><span className="mt-1 block truncate text-xs text-[#718096]">{item.label}</span></span>
                <span className="material-symbols-outlined text-[17px] text-[#a4afbd]">chevron_right</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
          <div><h2 className="text-lg font-bold text-[#001b5e]">Platform health</h2><p className="mt-1 text-xs text-[#7a879b]">Account and verification distribution.</p></div>
          <div className="mt-6 space-y-5">
            {[
              { label: "Active user rate", value: metrics.activeUsers, color: "from-[#16a968] to-[#38c989]" },
              { label: "Doctor verification rate", value: metrics.verifiedDoctors, color: "from-[#315ead] to-[#5b86d7]" },
              { label: "Patient share of users", value: metrics.patientShare, color: "from-[#7543b5] to-[#a071dc]" },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-2 flex items-center justify-between gap-4"><p className="text-xs font-semibold text-[#526078]">{metric.label}</p><p className="text-xs font-bold text-[#001b5e]">{isLoading || !overview ? "—" : `${metric.value}%`}</p></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#edf1f5]"><div className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`} style={{ width: `${isLoading || !overview ? 0 : metric.value}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#edf1f5] pt-5"><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] text-[#7a879b]">Unverified doctors</p><p className="mt-1 text-lg font-bold text-[#001b5e]">{displayValue(overview?.doctors.unverified)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] text-[#7a879b]">Deleted users</p><p className="mt-1 text-lg font-bold text-[#001b5e]">{displayValue(overview?.users.deleted)}</p></div></div>
        </section>
      </div>

      <section className="mt-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
        <div><h2 className="text-lg font-bold text-[#001b5e]">Management shortcuts</h2><p className="mt-1 text-xs text-[#7a879b]">Jump directly to common administration workflows.</p></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4 transition hover:-translate-y-0.5 hover:border-[#bfe5d1] hover:bg-[#f5fcf8]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#0b9459] shadow-sm"><span className="material-symbols-outlined text-[20px]">{action.icon}</span></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#001b5e]">{action.label}</span><span className="mt-1 block text-[10px] leading-4 text-[#7a879b]">{action.description}</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
