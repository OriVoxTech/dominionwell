"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_UPDATED_EVENT,
  readAdminDoctors,
  readAdminPatients,
  readAdminReports,
  readAdminSettings,
  readPaymentRecords,
  readSubscriptionPlans,
} from "@/lib/admin-portal";
import { APPOINTMENT_REQUESTS_UPDATED_EVENT, readAppointmentRequests } from "@/lib/appointments";

export default function AdminDashboardPage() {
  const [snapshot, setSnapshot] = useState({
    doctors: readAdminDoctors(),
    patients: readAdminPatients(),
    plans: readSubscriptionPlans(),
    payments: readPaymentRecords(),
    reports: readAdminReports(),
    settings: readAdminSettings(),
    appointments: readAppointmentRequests(),
  });

  useEffect(() => {
    const sync = () => {
      setSnapshot({
        doctors: readAdminDoctors(),
        patients: readAdminPatients(),
        plans: readSubscriptionPlans(),
        payments: readPaymentRecords(),
        reports: readAdminReports(),
        settings: readAdminSettings(),
        appointments: readAppointmentRequests(),
      });
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(ADMIN_UPDATED_EVENT, sync);
    window.addEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ADMIN_UPDATED_EVENT, sync);
      window.removeEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, sync);
    };
  }, []);

  const analytics = useMemo(() => {
    const totalRevenue = snapshot.payments
      .filter((payment) => payment.status === "Paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const completedConsultations = snapshot.appointments.filter((item) => item.status === "Completed").length;
    const pendingBookings = snapshot.appointments.filter((item) => item.status === "Pending").length;
    const blacklistedDoctors = snapshot.doctors.filter((item) => item.status === "Blacklisted").length;
    const blacklistedPatients = snapshot.patients.filter((item) => item.status === "Blacklisted").length;

    return {
      totalRevenue,
      completedConsultations,
      pendingBookings,
      blacklistedDoctors,
      blacklistedPatients,
    };
  }, [snapshot]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-[#475569]">Live governance overview, operational metrics, and key controls.</p>
      </div>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Doctors</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{snapshot.doctors.length}</p>
          <p className="text-xs text-[#475569]">{analytics.blacklistedDoctors} blacklisted</p>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Patients</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{snapshot.patients.length}</p>
          <p className="text-xs text-[#475569]">{analytics.blacklistedPatients} blacklisted</p>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Completed Consultations</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">{analytics.completedConsultations}</p>
          <p className="text-xs text-[#475569]">{analytics.pendingBookings} pending bookings</p>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Revenue (Paid)</p>
          <p className="mt-2 text-2xl font-bold text-[#001b5e]">NGN {analytics.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-[#475569]">{snapshot.payments.length} payment record(s)</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#e2e8f0] p-4">
          <h3 className="text-base font-semibold text-[#001b5e]">Platform Controls</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#334155]">
            <li>Wallet point value per completed consultation: <span className="font-semibold">NGN {snapshot.settings.pointValue.toLocaleString()}</span></li>
            <li>Subscription plans active: <span className="font-semibold">{snapshot.plans.filter((plan) => plan.active).length}</span></li>
            <li>Reports currently open: <span className="font-semibold">{snapshot.reports.filter((report) => report.status === "Open").length}</span></li>
          </ul>
        </article>

        <article className="rounded-xl border border-[#e2e8f0] p-4">
          <h3 className="text-base font-semibold text-[#001b5e]">Operational Analytics</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { label: "Booked / Completed", value: snapshot.appointments.length ? Math.round((analytics.completedConsultations / snapshot.appointments.length) * 100) : 0 },
              { label: "Payment Success Rate", value: snapshot.payments.length ? Math.round((snapshot.payments.filter((item) => item.status === "Paid").length / snapshot.payments.length) * 100) : 0 },
              { label: "Doctor Compliance Rate", value: snapshot.doctors.length ? Math.round(((snapshot.doctors.length - analytics.blacklistedDoctors) / snapshot.doctors.length) * 100) : 0 },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{metric.label}</p>
                  <p className="text-xs font-semibold text-[#001b5e]">{metric.value}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#16b46f] to-[#0aa4b4]" style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
