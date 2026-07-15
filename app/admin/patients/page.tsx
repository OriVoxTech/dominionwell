"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_UPDATED_EVENT,
  readPaymentRecords,
  readSubscriptionPlans,
  type PaymentRecord,
  type SubscriptionPlan,
  type AdminPatient,
} from "@/lib/admin-portal";
import { APPOINTMENT_REQUESTS_UPDATED_EVENT, readAppointmentRequests } from "@/lib/appointments";
import { adminApiService, getApiErrorMessage, type AdminPatientUser } from "@/lib/api";

function mapApiUserToPatient(user: AdminPatientUser): AdminPatient {
  const fullName = [user.firstName.trim(), user.lastName.trim()]
    .filter(Boolean)
    .join(" ");

  return {
    id: user.patient?.id ?? user.id,
    userId: user.id,
    name: fullName || user.email,
    email: user.email,
    phone: user.phone ?? "Not provided",
    status: user.deletedAt || user.patient?.deletedAt ? "Blacklisted" : "Whitelisted",
    joinedAt: user.createdAt,
    isEmailVerified: user.isEmailVerified,
    consultationBalance: user.patient?.consultationBalance ?? 0,
  };
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>(readPaymentRecords());
  const [plans, setPlans] = useState<SubscriptionPlan[]>(readSubscriptionPlans());
  const [appointments, setAppointments] = useState(readAppointmentRequests());
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientTotal, setPatientTotal] = useState(0);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [directoryError, setDirectoryError] = useState("");
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState("");

  const loadPatients = useCallback(async () => {
    setDirectoryError("");
    setIsLoadingPatients(true);

    try {
      const response = await adminApiService.listPatients();
      const nextPatients = response.data.data.map(mapApiUserToPatient);
      setPatients(nextPatients);
      setPatientTotal(response.data.meta.total);
      setSelectedPatientId((current) =>
        nextPatients.some((patient) => patient.id === current)
          ? current
          : nextPatients[0]?.id ?? "",
      );
    } catch (error) {
      setDirectoryError(getApiErrorMessage(error));
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  const handlePatientStatusChange = async (patient: AdminPatient) => {
    if (!patient.userId || statusUpdatingUserId) return;

    setDirectoryError("");
    setStatusUpdatingUserId(patient.userId);

    try {
      if (patient.status === "Whitelisted") {
        await adminApiService.deactivateUser(patient.userId);
      } else {
        await adminApiService.restoreUser(patient.userId);
      }
      await loadPatients();
    } catch (error) {
      setDirectoryError(getApiErrorMessage(error));
    } finally {
      setStatusUpdatingUserId("");
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPatients();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPatients]);

  useEffect(() => {
    const sync = () => {
      setPayments(readPaymentRecords());
      setPlans(readSubscriptionPlans());
      setAppointments(readAppointmentRequests());
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

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null;

  useEffect(() => {
    const userId = selectedPatient?.userId;
    const patientId = selectedPatient?.id;
    if (!userId || !patientId) return;

    let isCancelled = false;

    void adminApiService.getUser(userId).then((response) => {
      if (isCancelled) return;

      setPatients((current) =>
        current.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                isEmailVerified: response.data.isEmailVerified,
                consultationBalance:
                  response.data.patient?.consultationBalance ?? 0,
              }
            : patient,
        ),
      );
    }).catch(() => {
      // The directory remains usable if optional profile details cannot load.
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedPatient?.id, selectedPatient?.userId]);

  const patientAppointments = useMemo(() => {
    if (!selectedPatient) {
      return [];
    }

    return appointments
      .filter((appointment) => appointment.patientId === selectedPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, selectedPatient]);

  const patientUpcomingAppointments = useMemo(() => {
    return patientAppointments.filter((item) => item.status === "Pending" || item.status === "Booked" || item.status === "Accepted");
  }, [patientAppointments]);

  const patientConsultationHistory = useMemo(() => {
    return patientAppointments.filter((item) => item.status === "Completed" || item.status === "Rejected");
  }, [patientAppointments]);

  const completedConsultations = patientConsultationHistory.filter((item) => item.status === "Completed").length;

  const patientPayments = useMemo(() => {
    if (!selectedPatient) {
      return [];
    }

    return payments
      .filter((payment) => payment.patientId === selectedPatient.id)
      .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [payments, selectedPatient]);

  const currentSubscription = useMemo(() => {
    const latestPaid = patientPayments.find((payment) => payment.status === "Paid") ?? patientPayments[0] ?? null;

    if (!latestPaid) {
      return null;
    }

    const linkedPlan = plans.find((plan) => plan.id === latestPaid.planId) ?? null;

    return {
      payment: latestPaid,
      plan: linkedPlan,
    };
  }, [patientPayments, plans]);

  const whitelistedPatientsCount = useMemo(() => {
    return patients.filter((patient) => patient.status === "Whitelisted").length;
  }, [patients]);

  const verifiedPatientsCount = useMemo(
    () => patients.filter((patient) => patient.isEmailVerified).length,
    [patients],
  );

  const totalConsultationBalance = useMemo(
    () => patients.reduce(
      (total, patient) => total + (patient.consultationBalance ?? 0),
      0,
    ),
    [patients],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Patients Management</h2>
        <p className="mt-1 text-sm text-[#475569]">Review patient accounts, appointments, consultations, and subscription activity in one workspace.</p>
      </div>

      {directoryError ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
          <span>{directoryError}</span>
          <button type="button" onClick={() => void loadPatients()} className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white">Try Again</button>
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Patients</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{isLoadingPatients ? "—" : patientTotal}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Whitelisted</p>
          <p className="mt-2 text-2xl font-semibold text-[#166534]">{whitelistedPatientsCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Email Verified</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{verifiedPatientsCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Consultation Balance</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{totalConsultationBalance}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#001b5e]">Patient Directory</h3>
            <span className="rounded-full bg-[#e2e8f0] px-2.5 py-1 text-xs font-semibold text-[#334155]">{isLoadingPatients ? "Loading…" : `${patientTotal} patients`}</span>
          </div>

          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {!isLoadingPatients && !directoryError && patients.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-center text-sm text-[#64748b]">No patients found.</p>
            ) : null}
            {patients.map((patient) => {
              const isActive = selectedPatientId === patient.id;

              return (
                <div
                  key={patient.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPatientId(patient.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPatientId(patient.id);
                    }
                  }}
                  className={`rounded-xl border p-3 transition ${
                    isActive ? "border-[#0b5fff] bg-[#eff6ff]" : "border-[#e2e8f0] bg-white hover:border-[#bfdbfe] hover:bg-[#f8fbff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#001b5e]">{patient.name}</p>
                      <p className="text-xs text-[#64748b]">{patient.id}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${patient.status === "Whitelisted" ? "bg-[#16b46f]/15 text-[#166534]" : "bg-[#ef4444]/12 text-[#b91c1c]"}`}>
                      {patient.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-[#475569]">
                    <p>{patient.email}</p>
                    <p>{patient.phone}</p>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={statusUpdatingUserId === patient.userId}
                      className={`rounded-lg px-2 py-1 text-[11px] font-semibold disabled:cursor-wait disabled:opacity-60 ${patient.status === "Whitelisted" ? "border border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]" : "border border-[#bbf7d0] text-[#166534] hover:bg-[#f0fdf4]"}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handlePatientStatusChange(patient);
                      }}
                    >
                      {statusUpdatingUserId === patient.userId
                        ? "Updating..."
                        : patient.status === "Whitelisted"
                          ? "Blacklist"
                          : "Whitelist"}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-[#001b5e]">Patient Profile Workspace</h3>
          {selectedPatient ? (
            <div className="mt-3 space-y-4 text-sm">
              <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-4">
                <p className="text-lg font-semibold text-[#001b5e]">{selectedPatient.name}</p>
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-[#64748b] sm:grid-cols-2">
                  <p>{selectedPatient.email}</p>
                  <p>{selectedPatient.phone}</p>
                  <p>Patient ID: {selectedPatient.id}</p>
                  <p>Joined: {new Date(selectedPatient.joinedAt).toLocaleDateString()}</p>
                  <p>Email: {selectedPatient.isEmailVerified ? "Verified" : "Not verified"}</p>
                  <p>Consultation balance: {selectedPatient.consultationBalance ?? 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Appointments</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{patientAppointments.length}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Completed</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{completedConsultations}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Upcoming</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{patientUpcomingAppointments.length}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Payments</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{patientPayments.length}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-3 text-xs">
                <p className="font-semibold uppercase tracking-wide text-[#64748b]">Subscription</p>
                {currentSubscription ? (
                  <div className="mt-2 space-y-1 text-[#334155]">
                    <p>Plan: <span className="font-semibold">{currentSubscription.plan?.name ?? currentSubscription.payment.planName}</span></p>
                    <p>Price: <span className="font-semibold">NGN {(currentSubscription.plan?.monthlyPrice ?? currentSubscription.payment.amount).toLocaleString()}</span></p>
                    <p>Status: <span className="font-semibold">{currentSubscription.payment.status}</span></p>
                    <p>Last payment: <span className="font-semibold">{new Date(currentSubscription.payment.paidAt).toLocaleString()}</span></p>
                    {currentSubscription.plan ? <p>Consultations/month: <span className="font-semibold">{currentSubscription.plan.consultationsPerMonth}</span></p> : null}
                  </div>
                ) : (
                  <p className="mt-2 text-[#64748b]">No subscription record available.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#64748b]">Select a patient to inspect profile and consultations.</p>
          )}
        </article>
      </section>

      {selectedPatient ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Upcoming Appointments ({patientUpcomingAppointments.length})</h3>
            {patientUpcomingAppointments.length === 0 ? (
              <p className="text-sm text-[#64748b]">No upcoming appointments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="px-3 py-2">Doctor</th>
                      <th className="px-3 py-2">Specialty</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Booked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientUpcomingAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">{appointment.doctorName}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.doctorSpecialization}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.dateLabel}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.timeSlot}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.status === "Accepted" ? "Booked" : appointment.status}</td>
                        <td className="px-3 py-2 text-[#334155]">{new Date(appointment.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Consultation History ({patientConsultationHistory.length})</h3>
            {patientConsultationHistory.length === 0 ? (
              <p className="text-sm text-[#64748b]">No consultation history yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="px-3 py-2">Doctor</th>
                      <th className="px-3 py-2">Specialty</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientConsultationHistory.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">{appointment.doctorName}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.doctorSpecialization}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.dateLabel}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.timeSlot}</td>
                        <td className="px-3 py-2 text-[#334155]">{appointment.status}</td>
                        <td className="px-3 py-2 text-[#334155]">{new Date(appointment.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      ) : null}

      {selectedPatient ? (
        <section className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Subscription Purchases ({patientPayments.length})</h3>
          {patientPayments.length === 0 ? (
            <p className="text-sm text-[#64748b]">No subscription purchases recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                    <th className="px-3 py-2">Plan</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {patientPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                      <td className="px-3 py-2 text-[#334155]">{payment.planName}</td>
                      <td className="px-3 py-2 text-[#334155]">NGN {payment.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[#334155]">{payment.status}</td>
                      <td className="px-3 py-2 text-[#334155]">{new Date(payment.paidAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
