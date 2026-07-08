"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ADMIN_UPDATED_EVENT,
  addAdminDoctor,
  readAdminDoctors,
  readAdminPatients,
  readDoctorWithdrawalRequests,
  updateDoctorWithdrawalRequestStatus,
  updateDoctorStatus,
  type AdminPatient,
  type AdminDoctor,
  type DoctorWithdrawalRequest,
} from "@/lib/admin-portal";
import { APPOINTMENT_REQUESTS_UPDATED_EVENT, readAppointmentRequests } from "@/lib/appointments";

type NewDoctorForm = {
  name: string;
  specialization: string;
  email: string;
  phone: string;
  username: string;
  password: string;
};

const defaultForm: NewDoctorForm = {
  name: "",
  specialization: "",
  email: "",
  phone: "",
  username: "",
  password: "Doctor@123",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>(readAdminDoctors());
  const [patients, setPatients] = useState<AdminPatient[]>(readAdminPatients());
  const [withdrawalRequests, setWithdrawalRequests] = useState<DoctorWithdrawalRequest[]>(readDoctorWithdrawalRequests());
  const [appointments, setAppointments] = useState(readAppointmentRequests());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(readAdminDoctors()[0]?.id ?? "");
  const [form, setForm] = useState<NewDoctorForm>(defaultForm);

  useEffect(() => {
    const sync = () => {
      const nextDoctors = readAdminDoctors();
      setDoctors(nextDoctors);
      setPatients(readAdminPatients());
      setWithdrawalRequests(readDoctorWithdrawalRequests());
      setAppointments(readAppointmentRequests());
      if (!nextDoctors.some((doctor) => doctor.id === selectedDoctorId)) {
        setSelectedDoctorId(nextDoctors[0]?.id ?? "");
      }
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
  }, [selectedDoctorId]);

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null;
  const selectedDoctorPendingWithdrawal = useMemo(() => {
    if (!selectedDoctor) {
      return null;
    }

    return withdrawalRequests.find((request) => request.doctorId === selectedDoctor.id && request.status === "Pending") ?? null;
  }, [selectedDoctor, withdrawalRequests]);
  const selectedDoctorAppointments = useMemo(() => {
    if (!selectedDoctor) {
      return [];
    }

    return appointments
      .filter((appointment) => appointment.doctorId === selectedDoctor.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, selectedDoctor]);

  const selectedDoctorUpcomingAppointments = useMemo(() => {
    return selectedDoctorAppointments.filter((appointment) => {
      return appointment.status === "Pending" || appointment.status === "Booked" || appointment.status === "Accepted";
    });
  }, [selectedDoctorAppointments]);

  const selectedDoctorConsultationHistory = useMemo(() => {
    return selectedDoctorAppointments.filter((appointment) => {
      return appointment.status === "Completed" || appointment.status === "Rejected";
    });
  }, [selectedDoctorAppointments]);

  const selectedDoctorPatients = useMemo(() => {
    const patientMap = new Map<string, AdminPatient>();
    const completedConsultationPatients = selectedDoctorConsultationHistory.filter((appointment) => appointment.status === "Completed");

    completedConsultationPatients.forEach((appointment) => {
      const patientRecord = patients.find((patient) => patient.id === appointment.patientId);

      patientMap.set(appointment.patientId, {
        id: appointment.patientId,
        name: appointment.patientName,
        email: patientRecord?.email ?? "Not provided",
        phone: patientRecord?.phone ?? "Not provided",
        status: patientRecord?.status ?? "Whitelisted",
        joinedAt: patientRecord?.joinedAt ?? appointment.createdAt,
      });
    });

    return Array.from(patientMap.values());
  }, [patients, selectedDoctorConsultationHistory]);

  const pendingWithdrawalCount = useMemo(() => {
    return withdrawalRequests.filter((request) => request.status === "Pending").length;
  }, [withdrawalRequests]);

  const whitelistedDoctorsCount = useMemo(() => {
    return doctors.filter((doctor) => doctor.status === "Whitelisted").length;
  }, [doctors]);

  const averageDoctorRating = useMemo(() => {
    if (doctors.length === 0) {
      return 0;
    }

    return doctors.reduce((total, doctor) => total + doctor.rating, 0) / doctors.length;
  }, [doctors]);

  const handleAddDoctor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      return;
    }

    addAdminDoctor({
      name: form.name,
      specialization: form.specialization || "General Practice",
      email: form.email || `${form.username.trim().toLowerCase()}@dominionwell.com`,
      phone: form.phone || "+1 (202) 555-0100",
      username: form.username,
      password: form.password,
    });

    setForm(defaultForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Doctors Management</h2>
        <p className="mt-1 text-sm text-[#475569]">Manage doctor accounts, monitor consultations, and process wallet withdrawals.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Doctors</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{doctors.length}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Whitelisted</p>
          <p className="mt-2 text-2xl font-semibold text-[#166534]">{whitelistedDoctorsCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Pending Withdrawals</p>
          <p className="mt-2 text-2xl font-semibold text-[#b45309]">{pendingWithdrawalCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Average Rating</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{averageDoctorRating.toFixed(1)} / 5</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#dbe4f0] bg-gradient-to-br from-white to-[#f8fbff] p-4 shadow-sm sm:p-5">
        <h3 className="text-base font-semibold text-[#001b5e]">Add Doctor Login Account</h3>
        <form className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleAddDoctor}>
          <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm" placeholder="Doctor name" required />
          <input value={form.specialization} onChange={(e) => setForm((current) => ({ ...current, specialization: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm" placeholder="Specialization" />
          <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm" placeholder="Email" type="email" />
          <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm" placeholder="Phone" />
          <input value={form.username} onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm" placeholder="Login username" required />
          <input value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm" placeholder="Temporary password" required />
          <button type="submit" className="h-10 rounded-lg bg-[#001b5e] px-4 text-sm font-semibold text-white hover:bg-[#0b2b75] md:col-span-2 xl:col-span-3">
            Add Doctor
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#001b5e]">Doctor Directory</h3>
            <span className="rounded-full bg-[#e2e8f0] px-2.5 py-1 text-xs font-semibold text-[#334155]">{doctors.length} doctors</span>
          </div>

          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {doctors.map((doctor) => {
              const hasPendingWithdrawal = withdrawalRequests.some((request) => request.doctorId === doctor.id && request.status === "Pending");
              const isActive = selectedDoctorId === doctor.id;

              return (
                <div
                  key={doctor.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDoctorId(doctor.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDoctorId(doctor.id);
                    }
                  }}
                  className={`rounded-xl border p-3 transition ${
                    isActive ? "border-[#0b5fff] bg-[#eff6ff]" : "border-[#e2e8f0] bg-white hover:border-[#bfdbfe] hover:bg-[#f8fbff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#001b5e]">{doctor.name}</p>
                      <p className="text-xs text-[#64748b]">{doctor.specialization}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${doctor.status === "Whitelisted" ? "bg-[#16b46f]/15 text-[#166534]" : "bg-[#ef4444]/12 text-[#b91c1c]"}`}>
                      {doctor.status}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#475569]">
                    <p>Rating: <span className="font-semibold">{doctor.rating.toFixed(1)} / 5</span></p>
                    <p>Wallet: <span className="font-semibold">{doctor.walletPoints} pts</span></p>
                    <p className="col-span-2">Balance: <span className="font-semibold">NGN {doctor.walletBalance.toLocaleString()}</span></p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {hasPendingWithdrawal ? (
                      <span className="rounded-full bg-[#f59e0b]/15 px-2 py-1 text-[11px] font-semibold text-[#b45309]">Withdrawal pending</span>
                    ) : (
                      <span className="text-[11px] text-[#94a3b8]">No pending withdrawal</span>
                    )}
                    <button
                      type="button"
                      className="rounded-lg border border-[#cbd5e1] px-2 py-1 text-[11px] font-semibold text-[#334155] hover:bg-[#f8fafc]"
                      onClick={(event) => {
                        event.stopPropagation();
                        updateDoctorStatus(doctor.id, doctor.status === "Whitelisted" ? "Blacklisted" : "Whitelisted");
                      }}
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-base font-semibold text-[#001b5e]">Doctor Profile Workspace</h3>
          {selectedDoctor ? (
            <div className="mt-3 space-y-4 text-sm">
              <div className="rounded-xl border border-[#dbe4f0] bg-[#f8fbff] p-4">
                <p className="text-lg font-semibold text-[#001b5e]">{selectedDoctor.name}</p>
                <p className="text-sm text-[#475569]">{selectedDoctor.specialization}</p>
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-[#64748b] sm:grid-cols-2">
                  <p>{selectedDoctor.email}</p>
                  <p>{selectedDoctor.phone}</p>
                  <p>Username: {selectedDoctor.username}</p>
                  <p>Joined: {new Date(selectedDoctor.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Rating</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{selectedDoctor.rating.toFixed(1)}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Upcoming</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{selectedDoctorUpcomingAppointments.length}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">History</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{selectedDoctorConsultationHistory.length}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Patients</p>
                  <p className="mt-1 text-lg font-semibold text-[#001b5e]">{selectedDoctorPatients.length}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-4 text-xs">
                <p className="font-semibold uppercase tracking-wide text-[#92400e]">Withdrawal Request</p>
                {selectedDoctorPendingWithdrawal ? (
                  <div className="mt-2 space-y-1 text-[#78350f]">
                    <p>Amount: <span className="font-semibold">NGN {selectedDoctorPendingWithdrawal.amount.toLocaleString()}</span></p>
                    <p>Equivalent points: <span className="font-semibold">{selectedDoctorPendingWithdrawal.points} pts</span></p>
                    <p>Requested: <span className="font-semibold">{new Date(selectedDoctorPendingWithdrawal.requestedAt).toLocaleString()}</span></p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#16b46f] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#149660]"
                        onClick={() => updateDoctorWithdrawalRequestStatus(selectedDoctorPendingWithdrawal.id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-[#ef4444]/40 px-3 py-1.5 text-[11px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                        onClick={() => updateDoctorWithdrawalRequestStatus(selectedDoctorPendingWithdrawal.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-[#a16207]">No pending withdrawal request.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#64748b]">Select a doctor to view profile and activity.</p>
          )}
        </article>
      </section>

      {selectedDoctor ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Upcoming Appointments ({selectedDoctorUpcomingAppointments.length})</h3>
            {selectedDoctorUpcomingAppointments.length === 0 ? (
              <p className="text-sm text-[#64748b]">No upcoming appointments for this doctor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="px-3 py-2">Patient</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoctorUpcomingAppointments.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">{appointment.patientName} ({appointment.patientId})</td>
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
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Consultation History ({selectedDoctorConsultationHistory.length})</h3>
            {selectedDoctorConsultationHistory.length === 0 ? (
              <p className="text-sm text-[#64748b]">No consultation history available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="px-3 py-2">Patient</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDoctorConsultationHistory.map((appointment) => (
                      <tr key={appointment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">{appointment.patientName} ({appointment.patientId})</td>
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

      {selectedDoctor ? (
        <section className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Patients With Completed Consultations ({selectedDoctorPatients.length})</h3>
          {selectedDoctorPatients.length === 0 ? (
            <p className="text-sm text-[#64748b]">No completed consultation patients yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                    <th className="px-3 py-2">Patient ID</th>
                    <th className="px-3 py-2">Full Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDoctorPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-[#e2e8f0] last:border-b-0">
                      <td className="px-3 py-2 text-[#334155]">{patient.id}</td>
                      <td className="px-3 py-2 text-[#334155]">{patient.name}</td>
                      <td className="px-3 py-2 text-[#334155]">{patient.email}</td>
                      <td className="px-3 py-2 text-[#334155]">{patient.phone}</td>
                      <td className="px-3 py-2 text-[#334155]">{patient.status}</td>
                      <td className="px-3 py-2 text-[#334155]">{new Date(patient.joinedAt).toLocaleDateString()}</td>
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
