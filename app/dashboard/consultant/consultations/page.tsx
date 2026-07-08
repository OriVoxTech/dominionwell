"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";

type ConsultationStatus = "Completed" | "Pending" | "Cancelled" | "Ongoing";

type ConsultationItem = {
  id: string;
  patient: string;
  concern?: string;
  report?: string;
  doctorNotifiedAt: string;
  status: ConsultationStatus;
};

const initialConsultations: ConsultationItem[] = [
  {
    id: "CNS-1001",
    patient: "Arthur Morgan",
    concern: "Chest pain follow-up",
    status: "Completed",
  },
  {
    id: "CNS-1002",
    patient: "Sarah Williams",
    concern: "Post-op recovery check",
    status: "Ongoing",
  },
  {
    id: "CNS-1003",
    patient: "Daniel Okafor",
    concern: "Hypertension medication review",
    status: "Pending",
  },
  {
    id: "CNS-1004",
    patient: "Grace Bennett",
    concern: "Cardiac screening consult",
    status: "Cancelled",
  },
  {
    id: "CNS-1005",
    patient: "Rita Adeyemi",
    concern: "Routine wellness consultation",
    status: "Completed",
  },
];

const statusClassMap: Record<ConsultationStatus, string> = {
  Completed: "bg-[#16b36c]/15 text-[#16b36c]",
  Pending: "bg-[#f59e0b]/15 text-[#b45309]",
  Cancelled: "bg-[#ef4444]/12 text-[#b91c1c]",
  Ongoing: "bg-[#0ea5e9]/15 text-[#0369a1]",
};

const statusTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
  Pending: ["Pending", "Ongoing"],
  Ongoing: ["Ongoing", "Completed", "Cancelled"],
  Completed: ["Completed"],
  Cancelled: ["Cancelled"],
};

function isLockedStatus(status: ConsultationStatus) {
  return status === "Completed" || status === "Cancelled";
}

const statusDescription = {
  Completed:
    "The consultation has been successfully concluded. Both the doctor and the patient participated in the consultation within the allocated one-hour consultation window. One consultation credit is deducted from the patient's subscription upon completion.",
  Pending:
    "The consultation has been verified and is waiting to begin. The patient has not yet joined or responded, but the one-hour consultation window has not expired.",
  Cancelled:
    "The consultation could not be completed. This may occur if the consultation verification fails or if the patient does not respond or join within the one-hour consultation window after the doctor has notified the patient that the consultation is ready to begin.",
  Ongoing:
    "The consultation has been verified, and the doctor has confirmed that the consultation has started. The consultation is currently in progress.",
};

export default function ConsultantConsultationsPage() {
  const [consultations, setConsultations] = useState<ConsultationItem[]>(initialConsultations);
  const [verificationPatientId, setVerificationPatientId] = useState("");
  const [verificationPassword, setVerificationPassword] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [completionConsultationId, setCompletionConsultationId] = useState<string | null>(null);
  const [completionConcern, setCompletionConcern] = useState("");
  const [completionReport, setCompletionReport] = useState("");
  const [completionStep, setCompletionStep] = useState<"concern" | "reportPrompt" | "reportInput">("concern");
  const [completionError, setCompletionError] = useState("");

  const activeCompletionConsultation = consultations.find((item) => item.id === completionConsultationId) ?? null;

  const closeCompletionModal = () => {
    setCompletionConsultationId(null);
    setCompletionConcern("");
    setCompletionReport("");
    setCompletionStep("concern");
    setCompletionError("");
  };

  const openCompletionModal = (consultationId: string) => {
    setCompletionConsultationId(consultationId);
    setCompletionConcern("");
    setCompletionReport("");
    setCompletionStep("concern");
    setCompletionError("");
  };

  const saveCompletedConcern = () => {
    if (!completionConsultationId) {
      return;
    }

    const normalizedConcern = completionConcern.trim();

    if (normalizedConcern.length < 3) {
      setCompletionError("Please add a valid concern before completing this consultation.");
      return;
    }

    setConsultations((current) =>
      current.map((consultation) => {
        if (consultation.id !== completionConsultationId) {
          return consultation;
        }

        return {
          ...consultation,
          status: "Completed",
          concern: normalizedConcern,
        };
      })
    );

    setCompletionError("");
    setCompletionStep("reportPrompt");
  };

  const saveCompletionReport = () => {
    if (!completionConsultationId) {
      return;
    }

    const normalizedReport = completionReport.trim();

    if (normalizedReport.length < 3) {
      setCompletionError("Please add a valid report or choose No to close.");
      return;
    }

    setConsultations((current) =>
      current.map((consultation) => {
        if (consultation.id !== completionConsultationId) {
          return consultation;
        }

        return {
          ...consultation,
          report: normalizedReport,
        };
      })
    );

    closeCompletionModal();
  };

  const updateConsultationStatus = (consultationId: string, nextStatus: ConsultationStatus) => {
    setConsultations((current) =>
      current.map((consultation) => {
        if (consultation.id !== consultationId) {
          return consultation;
        }

        const allowedStatuses = statusTransitions[consultation.status];

        if (!allowedStatuses.includes(nextStatus)) {
          return consultation;
        }

        if (consultation.status === "Ongoing" && nextStatus === "Completed") {
          openCompletionModal(consultationId);
          return consultation;
        }

        return {
          ...consultation,
          status: nextStatus,
        };
      })
    );
  };

  const handleVerifyConsultation = () => {
    const normalizedPatientId = verificationPatientId.trim();
    const normalizedPassword = verificationPassword.trim();

    if (normalizedPatientId.length < 3 || normalizedPassword.length < 3) {
      setVerificationSuccess(false);
      setVerificationMessage("Please provide both patient ID and verification password.");
      return;
    }

    if (!normalizedPassword.toUpperCase().startsWith("DW-")) {
      setVerificationSuccess(false);
      setVerificationMessage("Invalid verification password format. Expected format starts with DW-.");
      return;
    }

    setVerificationSuccess(true);
    setVerificationMessage(`Consultation verified for patient ID ${normalizedPatientId}.`);
  };

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
              alt="Dr. Richardson"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-[#7784ac]">Dr. Richardson</p>
            <p className="text-xs text-[#7784ac]/80">Senior Cardiologist</p>
          </div>
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
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
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
          <p className="text-xs text-[#45464e] sm:text-sm">View all consultations and their current status.</p>
        </header>

        <section id="verify-consultation" className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm scroll-mt-24">
          <h2 className="mb-3 text-base font-semibold text-[#00020d]">Verify Consultation</h2>
          <p className="mb-4 text-sm text-[#334155]">
            Enter the patient ID and verification password provided by the patient, then click verify.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Patient ID</span>
              <input
                type="text"
                value={verificationPatientId}
                onChange={(event) => setVerificationPatientId(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                placeholder="Enter patient ID"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Verification Password</span>
              <input
                type="text"
                value={verificationPassword}
                onChange={(event) => setVerificationPassword(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                placeholder="Enter password from patient"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="h-10 w-full rounded-lg bg-[#001b5e] px-3 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                onClick={handleVerifyConsultation}
              >
                Verify Consultation
              </button>
            </div>
          </div>

          {verificationMessage ? (
            <p
              className={`mt-3 text-sm ${verificationSuccess ? "text-[#166534]" : "text-[#b91c1c]"}`}
            >
              {verificationMessage}
            </p>
          ) : null}
        </section>

        <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-3 text-base font-semibold text-[#00020d]">Status Definitions</h2>
          <div className="space-y-3 text-sm text-[#334155]">
            <p>
              <span className="font-semibold text-[#b45309]">Pending:</span> {statusDescription.Pending}
            </p>
            <p>
              <span className="font-semibold text-[#0369a1]">Ongoing:</span> {statusDescription.Ongoing}
            </p>
            <p>
              <span className="font-semibold text-[#16b36c]">Completed:</span> {statusDescription.Completed}
            </p>
            <p>
              <span className="font-semibold text-[#b91c1c]">Cancelled:</span> {statusDescription.Cancelled}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-1xl font-semibold text-[#00020d]">All Consultations</h2>
            <p className="text-xs text-[#64748b]">Total: {consultations.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                  <th className="rounded-l-lg px-3 py-3">Consultation ID</th>
                  <th className="px-3 py-3">Patient</th>
                  <th className="px-3 py-3">Concern</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="rounded-r-lg px-3 py-3">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((consultation) => (
                  <tr key={consultation.id} className="border-b border-[#e2e8f0] last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-[#001b5e]">{consultation.id}</td>
                    <td className="px-3 py-3 text-[#475569]">{consultation.patient}</td>
                    <td className="px-3 py-3 text-[#475569]">
                      {consultation.status === "Completed" ? consultation.concern || "-" : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusClassMap[consultation.status]}`}
                      >
                        {consultation.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="h-9 w-full rounded-lg border border-[#c6c6cf] bg-white px-2 text-xs text-[#334155] outline-none focus:border-[#0aa4b4] disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#94a3b8]"
                        value={consultation.status}
                        onChange={(event) =>
                          updateConsultationStatus(
                            consultation.id,
                            event.target.value as ConsultationStatus
                          )
                        }
                        disabled={isLockedStatus(consultation.status)}
                        aria-label={`Update status for consultation ${consultation.id}`}
                      >
                        {statusTransitions[consultation.status].map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {completionConsultationId && activeCompletionConsultation ? (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-[#0f172a]/45"
              aria-label="Close completion modal"
              onClick={closeCompletionModal}
            />

            <section className="relative z-10 w-full max-w-lg rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#001b5e]">Complete Consultation {activeCompletionConsultation.id}</h3>
                <button
                  type="button"
                  className="rounded-md p-1 text-[#64748b] hover:bg-[#f2f4f7]"
                  aria-label="Close modal"
                  onClick={closeCompletionModal}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {completionStep === "concern" ? (
                <>
                  <p className="mb-3 text-sm text-[#334155]">
                    Add consultation concern before setting this consultation to completed.
                  </p>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#334155]">Concern</span>
                    <textarea
                      value={completionConcern}
                      onChange={(event) => setCompletionConcern(event.target.value)}
                      className="min-h-24 w-full rounded-lg border border-[#c6c6cf] px-3 py-2 outline-none focus:border-[#0aa4b4]"
                      placeholder="Enter concern summary"
                    />
                  </label>

                  {completionError ? <p className="mt-2 text-sm text-[#dc2626]">{completionError}</p> : null}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                      onClick={closeCompletionModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                      onClick={saveCompletedConcern}
                    >
                      Save Concern
                    </button>
                  </div>
                </>
              ) : null}

              {completionStep === "reportPrompt" ? (
                <>
                  <p className="text-sm text-[#334155]">Concern saved. Do you want to add a report now?</p>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                      onClick={closeCompletionModal}
                    >
                      No, Close
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                      onClick={() => {
                        setCompletionError("");
                        setCompletionStep("reportInput");
                      }}
                    >
                      Yes, Add Report
                    </button>
                  </div>
                </>
              ) : null}

              {completionStep === "reportInput" ? (
                <>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[#334155]">Report</span>
                    <textarea
                      value={completionReport}
                      onChange={(event) => setCompletionReport(event.target.value)}
                      className="min-h-24 w-full rounded-lg border border-[#c6c6cf] px-3 py-2 outline-none focus:border-[#0aa4b4]"
                      placeholder="Enter consultation report"
                    />
                  </label>

                  {completionError ? <p className="mt-2 text-sm text-[#dc2626]">{completionError}</p> : null}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                      onClick={closeCompletionModal}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                      onClick={saveCompletionReport}
                    >
                      Save Report
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}