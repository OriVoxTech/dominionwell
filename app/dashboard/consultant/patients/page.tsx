"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  doctorApiService,
  getApiErrorMessage,
  type DoctorPatientSummary,
} from "@/lib/api";

function getPatientName(patient: DoctorPatientSummary) {
  const firstName =
    patient.patient?.user?.firstName ?? patient.user?.firstName ?? patient.firstName;
  const lastName =
    patient.patient?.user?.lastName ?? patient.user?.lastName ?? patient.lastName;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return patient.patientName ?? (fullName || "Unnamed patient");
}

function getPatientId(patient: DoctorPatientSummary) {
  return patient.patient?.id ?? patient.patientId ?? patient.id ?? "Not provided";
}

function getConsultationCount(patient: DoctorPatientSummary) {
  return (
    patient.consultationsWithDoctor ??
    patient.completedConsultations ??
    patient.consultationCount ??
    0
  );
}

function getPatientRating(patient: DoctorPatientSummary) {
  return patient.averageRating ?? patient.rating ?? 0;
}

export default function ConsultantPatientsPage() {
  const [patients, setPatients] = useState<DoctorPatientSummary[]>([]);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientsError, setPatientsError] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const loadPatients = useCallback(async () => {
    setIsLoadingPatients(true);
    setPatientsError("");

    try {
      const response = await doctorApiService.listPatients();
      setPatients(response.data.data);
      setPatientTotal(response.data.meta.total);
    } catch (error) {
      setPatientsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPatients();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPatients]);

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
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/consultations">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </div>
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
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Patients</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">
            Patients who have completed consultations with you, including consultation count and rating.
          </p>
        </header>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-1xl font-semibold text-[#00020d]">Patient Consultation History</h2>
            <p className="text-xs text-[#64748b]">Total: {patientTotal}</p>
          </div>

          {patientsError ? (
            <div role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
              <span>{patientsError}</span>
              <button
                type="button"
                onClick={() => void loadPatients()}
                className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white"
              >
                Try Again
              </button>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                  <th className="rounded-l-lg px-3 py-3">Patient Name</th>
                  <th className="px-3 py-3">Patient ID</th>
                  <th className="px-3 py-3">Consultations with Doctor</th>
                  <th className="rounded-r-lg px-3 py-3">Patient Rating</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPatients ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[#64748b]">
                      Loading patients...
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[#64748b]">
                      No patients have completed consultations with you yet.
                    </td>
                  </tr>
                ) : patients.map((patient) => (
                  <tr key={getPatientId(patient)} className="border-b border-[#e2e8f0] last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-[#001b5e]">{getPatientName(patient)}</td>
                    <td className="px-3 py-3 text-[#475569]">{getPatientId(patient)}</td>
                    <td className="px-3 py-3 text-[#475569]">{getConsultationCount(patient)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#16b36c]/15 px-2 py-1 text-[10px] font-semibold text-[#16b36c]">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {getPatientRating(patient).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
