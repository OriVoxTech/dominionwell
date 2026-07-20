"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_UPDATED_EVENT,
  readAdminPatients,
  readDoctorJoinRequests,
  readDoctorWithdrawalRequests,
  updateDoctorJoinRequestStatus,
  updateDoctorWithdrawalRequestStatus,
  type AdminPatient,
  type AdminDoctor,
  type DoctorJoinRequest,
  type DoctorWithdrawalRequest,
} from "@/lib/admin-portal";
import { APPOINTMENT_REQUESTS_UPDATED_EVENT, readAppointmentRequests } from "@/lib/appointments";
import { adminApiService, getApiErrorMessage, type AdminDoctorUser } from "@/lib/api";

type AddDoctorTab = "request" | "manual";

type NewDoctorForm = {
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phone: string;
  username: string;
};

const defaultForm: NewDoctorForm = {
  firstName: "",
  lastName: "",
  specialization: "GENERAL_PRACTICE",
  email: "",
  phone: "",
  username: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;
const SPECIALIZATION_PATTERN = /^[A-Z][A-Z_]*$/;
const SPECIALIZATION_OPTIONS = [
  "GENERAL_PRACTICE",
  "CARDIOLOGY",
  "DERMATOLOGY",
  "ENDOCRINOLOGY",
  "GASTROENTEROLOGY",
  "GYNECOLOGY",
  "NEUROLOGY",
  "ONCOLOGY",
  "OPHTHALMOLOGY",
  "ORTHOPEDICS",
  "PEDIATRICS",
  "PSYCHIATRY",
  "UROLOGY",
] as const;

function mapApiUserToDoctor(user: AdminDoctorUser): AdminDoctor {
  const rawSpecialization = user.doctor?.specializations[0] ?? "GENERAL_PRACTICE";
  const firstName = user.firstName.trim();
  const lastName = user.lastName.trim();
  const username = user.username?.trim() || user.email.split("@")[0];

  return {
    id: user.doctor?.id ?? user.id,
    userId: user.id,
    name: `Dr. ${[firstName, lastName].filter(Boolean).join(" ") || username}`,
    specialization: rawSpecialization.replaceAll("_", " "),
    rating: 0,
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16e?auto=format&fit=crop&w=300&q=80",
    email: user.email,
    phone: user.phone ?? "Not provided",
    username,
    password: "",
    status: user.deletedAt || user.doctor?.deletedAt ? "Blacklisted" : "Whitelisted",
    joinedAt: user.createdAt,
    walletPoints: 0,
    walletBalance: 0,
    walletPointValue: 0,
    isEmailVerified: user.isEmailVerified,
    verifiedAt: user.doctor?.verifiedAt ?? null,
    bio: user.doctor?.bio ?? null,
    sessionCount: 0,
  };
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [patients, setPatients] = useState<AdminPatient[]>(readAdminPatients());
  const [doctorJoinRequests, setDoctorJoinRequests] = useState<DoctorJoinRequest[]>(readDoctorJoinRequests());
  const [withdrawalRequests, setWithdrawalRequests] = useState<DoctorWithdrawalRequest[]>(readDoctorWithdrawalRequests());
  const [appointments, setAppointments] = useState(readAppointmentRequests());
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [addDoctorTab, setAddDoctorTab] = useState<AddDoctorTab>("request");
  const [form, setForm] = useState<NewDoctorForm>(defaultForm);
  const [createError, setCreateError] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [directoryError, setDirectoryError] = useState("");
  const [doctorTotal, setDoctorTotal] = useState(0);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState("");
  const [requestActionId, setRequestActionId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const isCreateDoctorValid =
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    EMAIL_PATTERN.test(form.email.trim()) &&
    PHONE_PATTERN.test(form.phone.trim()) &&
    SPECIALIZATION_PATTERN.test(form.specialization.trim()) &&
    Boolean(form.username.trim());

  const loadDoctors = useCallback(async () => {
    setDirectoryError("");
    setIsLoadingDoctors(true);

    try {
      const response = await adminApiService.listDoctors();
      const nextDoctors = response.data.data.map(mapApiUserToDoctor);
      setDoctors(nextDoctors);
      setDoctorTotal(response.data.meta.total);
      setSelectedDoctorId((current) => nextDoctors.some((doctor) => doctor.id === current) ? current : nextDoctors[0]?.id ?? "");
    } catch (error) {
      setDirectoryError(getApiErrorMessage(error));
    } finally {
      setIsLoadingDoctors(false);
    }
  }, []);

  const handleDoctorStatusChange = async (doctor: AdminDoctor) => {
    if (!doctor.userId || statusUpdatingUserId) return;

    setDirectoryError("");
    setStatusUpdatingUserId(doctor.userId);

    try {
      if (doctor.status === "Whitelisted") {
        await adminApiService.deactivateUser(doctor.userId);
      } else {
        await adminApiService.restoreUser(doctor.userId);
      }
      await loadDoctors();
    } catch (error) {
      setDirectoryError(getApiErrorMessage(error));
    } finally {
      setStatusUpdatingUserId("");
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctors();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctors]);

  useEffect(() => {
    const sync = () => {
      setPatients(readAdminPatients());
      setDoctorJoinRequests(readDoctorJoinRequests());
      setWithdrawalRequests(readDoctorWithdrawalRequests());
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

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null;

  useEffect(() => {
    const userId = selectedDoctor?.userId;
    const doctorId = selectedDoctor?.id;
    if (!userId || !doctorId) return;

    let isCancelled = false;

    void adminApiService.getUser(userId).then((response) => {
      const detail = response.data;
      const doctorDetail = detail.doctor;
      if (isCancelled || !doctorDetail) return;

      const wallet = doctorDetail.wallet;
      setDoctors((current) =>
        current.map((doctor) =>
          doctor.id === doctorId
            ? {
                ...doctor,
                bio: doctorDetail.bio ?? null,
                verifiedAt: doctorDetail.verifiedAt ?? null,
                isEmailVerified: detail.isEmailVerified,
                sessionCount: detail.sessions.length,
                walletPoints: wallet?.lifetimePoints ?? 0,
                walletBalance: wallet?.currentBalance ?? 0,
                walletPointValue: wallet?.pointValue ?? 0,
              }
            : doctor,
        ),
      );
    }).catch(() => {
      // The directory remains usable if optional profile details cannot load.
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedDoctor?.id, selectedDoctor?.userId]);

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

  const whitelistedDoctorsCount = useMemo(() => {
    return doctors.filter((doctor) => doctor.status === "Whitelisted").length;
  }, [doctors]);

  const verifiedDoctorsCount = useMemo(() => {
    return doctors.filter((doctor) => doctor.isEmailVerified).length;
  }, [doctors]);

  const specializationCount = useMemo(
    () => new Set(doctors.map((doctor) => doctor.specialization)).size,
    [doctors],
  );
  const pendingDoctorJoinRequests = useMemo(
    () => doctorJoinRequests.filter((request) => request.status === "Pending"),
    [doctorJoinRequests],
  );

  const reviewedDoctorJoinRequests = useMemo(
    () => doctorJoinRequests.filter((request) => request.status !== "Pending"),
    [doctorJoinRequests],
  );

  const buildDoctorPayloadFromRequest = (request: DoctorJoinRequest) => {
    const cleanedName = request.name.replace(/^dr\.?\s+/i, "").trim();
    const nameParts = cleanedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? request.username;
    const lastName = nameParts.slice(1).join(" ") || "Doctor";

    return {
      firstName,
      lastName,
      email: request.email.trim().toLowerCase(),
      phone: request.phone.trim(),
      specialization: request.specialization.trim().toUpperCase(),
      username: request.username.trim(),
    };
  };

  const handleAcceptJoinRequest = async (request: DoctorJoinRequest) => {
    if (requestActionId) return;

    setRequestMessage("");
    setRequestActionId(request.id);

    try {
      await adminApiService.createDoctor(buildDoctorPayloadFromRequest(request));
      updateDoctorJoinRequestStatus(
        request.id,
        "Accepted",
        "Accepted by admin. Existing create doctor API was called with the supplied application details.",
      );
      setDoctorJoinRequests(readDoctorJoinRequests());
      setRequestMessage(`${request.name} has been accepted and a doctor account was created.`);
      await loadDoctors();
    } catch (error) {
      setRequestMessage(getApiErrorMessage(error));
    } finally {
      setRequestActionId("");
    }
  };

  const handleRejectJoinRequest = (request: DoctorJoinRequest) => {
    if (requestActionId) return;

    setRequestMessage(
      `${request.name} was rejected. Backend email sending API is not ready yet, so this is marked locally for now.`,
    );
    updateDoctorJoinRequestStatus(
      request.id,
      "Rejected",
      "Rejected by admin. Future backend integration should send the rejection email to the applicant.",
    );
    setDoctorJoinRequests(readDoctorJoinRequests());
  };

  const handleAddDoctor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCreateDoctorValid) return;

    setCreateError("");
    setCreateMessage("");
    setIsCreatingDoctor(true);

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        specialization: form.specialization.trim().toUpperCase(),
        username: form.username.trim(),
      };
      const response = await adminApiService.createDoctor(payload);

      setCreateMessage(`Dr. ${response.data.user.firstName} ${response.data.user.lastName} was created successfully.`);
      setForm(defaultForm);
      await loadDoctors();
    } catch (error) {
      setCreateError(getApiErrorMessage(error));
    } finally {
      setIsCreatingDoctor(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Doctors Management</h2>
        <p className="mt-1 text-sm text-[#475569]">Manage doctor accounts, monitor consultations, and process wallet withdrawals.</p>
      </div>

      {directoryError ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
          <span>{directoryError}</span>
          <button type="button" onClick={() => void loadDoctors()} className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white">Try Again</button>
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Doctors</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{isLoadingDoctors ? "—" : doctorTotal}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Whitelisted</p>
          <p className="mt-2 text-2xl font-semibold text-[#166534]">{whitelistedDoctorsCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Email Verified</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{verifiedDoctorsCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Specializations</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{specializationCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Join Requests</p>
          <p className="mt-2 text-2xl font-semibold text-[#b45309]">{pendingDoctorJoinRequests.length}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 rounded-xl bg-[#f8fafc] p-1">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAddDoctorTab("request")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                addDoctorTab === "request"
                  ? "bg-[#001b5e] text-white shadow-sm"
                  : "text-[#475569] hover:bg-white"
              }`}
            >
              Review Applications
            </button>
            <button
              type="button"
              onClick={() => setAddDoctorTab("manual")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                addDoctorTab === "manual"
                  ? "bg-[#001b5e] text-white shadow-sm"
                  : "text-[#475569] hover:bg-white"
              }`}
            >
              Create Doctor Account
            </button>
          </div>
        </div>

        {addDoctorTab === "request" ? (
          <>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-[#001b5e]">Doctor Applications</h3>
            <p className="mt-1 text-sm text-[#64748b]">
              Review applications submitted from the public “Join as a Doctor” form. Accept calls the current create-doctor API; reject is ready for the future backend email API.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[#f59e0b]/15 px-3 py-1 text-xs font-semibold text-[#b45309]">
            {pendingDoctorJoinRequests.length} pending
          </span>
        </div>

        {requestMessage ? (
          <p className="mb-4 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
            {requestMessage}
          </p>
        ) : null}

        {pendingDoctorJoinRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No pending doctor application requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {pendingDoctorJoinRequests.map((request) => (
              <article key={request.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-base font-semibold text-[#001b5e]">{request.name}</p>
                    <p className="text-xs text-[#64748b]">@{request.username} · {request.specialization.replaceAll("_", " ")}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#f59e0b]/15 px-2 py-1 text-[11px] font-semibold text-[#b45309]">
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs text-[#475569] sm:grid-cols-2">
                  <p>Email: <span className="font-semibold">{request.email}</span></p>
                  <p>Phone: <span className="font-semibold">{request.phone}</span></p>
                  <p>Requested: <span className="font-semibold">{new Date(request.requestedAt).toLocaleString()}</span></p>
                </div>

                <div className="mt-3 rounded-lg border border-[#dbe4f0] bg-white p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Supporting documents and licenses</p>
                  {request.documents.length === 0 ? (
                    <p className="text-xs text-[#94a3b8]">No documents attached.</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-[#475569]">
                      {request.documents.map((document) => (
                        <li key={`${request.id}-${document.name}-${document.size}`} className="flex items-center justify-between gap-3">
                          <span className="truncate">{document.name}</span>
                          <span className="shrink-0 text-[#64748b]">{Math.ceil(document.size / 1024)} KB</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={requestActionId === request.id}
                    onClick={() => void handleAcceptJoinRequest(request)}
                    className="rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660] disabled:cursor-wait disabled:bg-[#94a3b8]"
                  >
                    {requestActionId === request.id ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(requestActionId)}
                    onClick={() => handleRejectJoinRequest(request)}
                    className="rounded-lg border border-[#ef4444]/40 px-3 py-2 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2] disabled:cursor-wait disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {reviewedDoctorJoinRequests.length > 0 ? (
          <details className="mt-4 rounded-xl border border-[#e2e8f0] bg-white p-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#001b5e]">
              Reviewed requests ({reviewedDoctorJoinRequests.length})
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] uppercase tracking-wide text-[#64748b]">
                    <th className="px-3 py-2">Doctor</th>
                    <th className="px-3 py-2">Specialty</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Reviewed</th>
                    <th className="px-3 py-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedDoctorJoinRequests.map((request) => (
                    <tr key={request.id} className="border-b border-[#e2e8f0] last:border-b-0">
                      <td className="px-3 py-2 text-[#334155]">{request.name}</td>
                      <td className="px-3 py-2 text-[#334155]">{request.specialization.replaceAll("_", " ")}</td>
                      <td className="px-3 py-2 text-[#334155]">{request.status}</td>
                      <td className="px-3 py-2 text-[#334155]">{request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "—"}</td>
                      <td className="px-3 py-2 text-[#334155]">{request.reviewNote ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ) : null}
          </>
        ) : (
          <div className="rounded-2xl border border-[#dbe4f0] bg-gradient-to-br from-white to-[#f8fbff] p-4 sm:p-5">
            <h3 className="text-base font-semibold text-[#001b5e]">Create Doctor Account</h3>
            <p className="mt-1 text-sm text-[#64748b]">
              Create a doctor account directly when there is no public application request.
            </p>
            <form className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleAddDoctor}>
              <input value={form.firstName} onChange={(e) => setForm((current) => ({ ...current, firstName: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0aa4b4]" placeholder="First name" autoComplete="given-name" required />
              <input value={form.lastName} onChange={(e) => setForm((current) => ({ ...current, lastName: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0aa4b4]" placeholder="Last name" autoComplete="family-name" required />
              <select
                value={form.specialization}
                onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))}
                className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0aa4b4]"
                required
              >
                {SPECIALIZATION_OPTIONS.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0aa4b4]" placeholder="Email" type="email" autoComplete="email" required />
              <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0aa4b4]" placeholder="Phone" type="tel" autoComplete="tel" required />
              <input value={form.username} onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0aa4b4]" placeholder="Login username" autoComplete="username" required />

              {createError ? <p role="alert" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] md:col-span-2 xl:col-span-3">{createError}</p> : null}
              {createMessage ? <p role="status" className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#15803d] md:col-span-2 xl:col-span-3">{createMessage}</p> : null}

              <button type="submit" disabled={!isCreateDoctorValid || isCreatingDoctor} className="h-10 rounded-lg bg-[#001b5e] px-4 text-sm font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8] md:col-span-2 xl:col-span-3">
                {isCreatingDoctor ? "Creating doctor..." : "Add Doctor"}
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.4fr]">
        <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-[#001b5e]">Doctor Directory</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void loadDoctors()} disabled={isLoadingDoctors} className="grid h-8 w-8 place-items-center rounded-lg border border-[#cbd5e1] text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-50" aria-label="Refresh doctor directory">
                <span className="material-symbols-outlined text-[17px]">refresh</span>
              </button>
              <span className="rounded-full bg-[#e2e8f0] px-2.5 py-1 text-xs font-semibold text-[#334155]">{doctorTotal} doctors</span>
            </div>
          </div>

          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {isLoadingDoctors ? (
              <div role="status" className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-[#64748b]">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-sm text-[#64748b]">No doctors were found.</div>
            ) : doctors.map((doctor) => {
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
                      disabled={statusUpdatingUserId === doctor.userId}
                      className={`rounded-lg px-2 py-1 text-[11px] font-semibold disabled:cursor-wait disabled:opacity-60 ${doctor.status === "Whitelisted" ? "border border-[#fecaca] text-[#b91c1c] hover:bg-[#fef2f2]" : "border border-[#bbf7d0] text-[#166534] hover:bg-[#f0fdf4]"}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDoctorStatusChange(doctor);
                      }}
                    >
                      {statusUpdatingUserId === doctor.userId
                        ? "Updating..."
                        : doctor.status === "Whitelisted"
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
                  <p>Email: {selectedDoctor.isEmailVerified ? "Verified" : "Not verified"}</p>
                  <p>Doctor verified: {selectedDoctor.verifiedAt ? new Date(selectedDoctor.verifiedAt).toLocaleDateString() : "Pending"}</p>
                </div>
                <p className="mt-3 text-xs text-[#475569]">{selectedDoctor.bio || "No biography has been added."}</p>
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

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Wallet balance</p>
                  <p className="mt-1 text-base font-semibold text-[#001b5e]">NGN {selectedDoctor.walletBalance.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Lifetime points</p>
                  <p className="mt-1 text-base font-semibold text-[#001b5e]">{selectedDoctor.walletPoints.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Point value / Sessions</p>
                  <p className="mt-1 text-base font-semibold text-[#001b5e]">NGN {(selectedDoctor.walletPointValue ?? 0).toLocaleString()} / {selectedDoctor.sessionCount ?? 0}</p>
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
