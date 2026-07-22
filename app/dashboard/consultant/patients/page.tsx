"use client";

import { useCallback, useEffect, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorPageHeader from "@/components/doctor-page-header";
import DoctorSidebar from "@/components/doctor-sidebar";
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
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <DoctorMobileNav />
      <DoctorSidebar active="patients" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
          <DoctorPageHeader
            title="Patients"
            description="A private directory of patients who have completed at least one consultation with you."
            icon="group"
            action={
              <button type="button" onClick={() => void loadPatients()} disabled={isLoadingPatients} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d9e2ec] bg-white px-4 text-xs font-bold text-[#001b5e] shadow-sm hover:bg-[#f8fafc] disabled:opacity-60">
                <span className="material-symbols-outlined text-[17px]">refresh</span>
                Refresh
              </button>
            }
          />

          <section className="mb-5 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(120deg,#001b5e,#073377_65%,#087964_135%)] p-5 text-white shadow-[0_18px_45px_rgba(0,27,94,0.15)] sm:p-6">
            <div className="flex items-center justify-between gap-5">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8df0bb]">Care relationships</p><h2 className="mt-2 text-xl font-bold">{isLoadingPatients ? "—" : patientTotal} patients</h2><p className="mt-2 max-w-xl text-xs leading-5 text-[#cbd8f4]">Every patient shown here has an established consultation history with your practice.</p></div>
              <span className="hidden h-16 w-16 place-items-center rounded-2xl bg-white/10 text-[#8df0bb] sm:grid"><span className="material-symbols-outlined text-[30px]">group</span></span>
            </div>
          </section>

          {patientsError ? (
            <div role="alert" className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between"><span>{patientsError}</span><button type="button" onClick={() => void loadPatients()} className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white">Try Again</button></div>
          ) : null}

          {isLoadingPatients ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl border border-[#e0e7ef] bg-white" />)}</div>
          ) : patients.length === 0 && !patientsError ? (
            <div className="grid min-h-64 place-items-center rounded-[1.5rem] border border-dashed border-[#cfd9e6] bg-white p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined">person_search</span></span><h2 className="mt-4 text-base font-bold text-[#001b5e]">No patient history yet</h2><p className="mt-2 text-xs text-[#718096]">Patients appear here after their first completed consultation.</p></div></div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Patient directory">
              {patients.map((patient) => {
                const name = getPatientName(patient);
                const rating = getPatientRating(patient);
                return (
                  <article key={getPatientId(patient)} className="group rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(30,52,83,0.09)]">
                    <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f4ff] text-sm font-extrabold text-[#155e9b]">{name.charAt(0).toUpperCase()}</span><span className="inline-flex items-center gap-1 rounded-full bg-[#fff6df] px-2.5 py-1 text-[10px] font-bold text-[#a45f08]"><span className="material-symbols-outlined text-[14px]">star</span>{rating.toFixed(1)}</span></div>
                    <h2 className="mt-4 truncate text-base font-bold text-[#001b5e]">{name}</h2>
                    <p className="mt-1 truncate text-[11px] text-[#8a96a8]">ID: {getPatientId(patient)}</p>
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f7f9fc] px-3 py-2.5"><span className="material-symbols-outlined text-[18px] text-[#0b9459]">medical_services</span><p className="text-xs text-[#526175]"><span className="font-bold text-[#001b5e]">{getConsultationCount(patient)}</span> completed consultation{getConsultationCount(patient) === 1 ? "" : "s"}</p></div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
