"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import {
  getApiErrorMessage,
  patientDoctorsApiService,
  type PublicDoctor,
} from "@/lib/api";

function formatSpecialization(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDoctorName(doctor: PublicDoctor) {
  const name = [doctor.user.firstName, doctor.user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return name ? `Dr. ${name}` : doctor.user.username;
}

function getDoctorInitials(doctor: PublicDoctor) {
  return [doctor.user.firstName, doctor.user.lastName]
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("") || "DR";
}

export default function DoctorProfilePage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = typeof params.doctorId === "string" ? params.doctorId : "";
  const [doctor, setDoctor] = useState<PublicDoctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDoctor = useCallback(async () => {
    if (!doctorId) {
      setErrorMessage("A valid doctor profile was not selected.");
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await patientDoctorsApiService.getById(doctorId);
      setDoctor(response.data);
    } catch (error) {
      setDoctor(null);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctor();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctor]);

  const doctorName = doctor ? getDoctorName(doctor) : "Doctor Profile";

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="doctors" />

      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6">
            <div className="mb-3 flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard/patient/doctors" aria-label="Back to doctors" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-white">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <h1 className="text-xl font-semibold text-[#001b5e] sm:text-2xl">Doctor Profile</h1>
            </div>
            <p className="text-xs text-[#475569] sm:text-[13px]">Review this verified doctor’s professional profile.</p>
          </header>

          {isLoading ? (
            <section className="animate-pulse rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6" aria-label="Loading doctor profile">
              <div className="mb-5 h-20 w-20 rounded-full bg-[#e2e8f0]" />
              <div className="mb-3 h-5 w-1/3 rounded bg-[#e2e8f0]" />
              <div className="mb-6 h-4 w-1/4 rounded bg-[#f1f5f9]" />
              <div className="h-28 rounded-xl bg-[#f1f5f9]" />
            </section>
          ) : null}

          {!isLoading && errorMessage ? (
            <section role="alert" className="rounded-2xl border border-[#fecaca] bg-white p-6 text-center shadow-sm">
              <span className="material-symbols-outlined text-4xl text-[#dc2626]">error</span>
              <h2 className="mt-2 text-lg font-semibold text-[#001b5e]">Doctor profile unavailable</h2>
              <p className="mt-2 text-sm text-[#64748b]">{errorMessage}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/dashboard/patient/doctors" className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">Back to Doctors</Link>
                <button type="button" onClick={() => void loadDoctor()} className="rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]">Try Again</button>
              </div>
            </section>
          ) : null}

          {!isLoading && !errorMessage && doctor ? (
            <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-xl font-bold text-[#0369a1]">
                    {getDoctorInitials(doctor)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[#001b5e] sm:text-xl">{doctorName}</h2>
                    <p className="mt-1 text-sm text-[#64748b]">@{doctor.user.username}</p>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#15803d]">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Verified Doctor
                </span>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Specializations</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {doctor.specializations.map((item) => (
                      <span key={item} className="rounded-md bg-[#eef2ff] px-2 py-1 text-xs font-medium text-[#3730a3]">{formatSpecialization(item)}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Verification</p>
                  <p className="mt-3 text-sm font-semibold text-[#001b5e]">Verified {new Date(doctor.verifiedAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-xs text-[#64748b]">Member since {new Date(doctor.user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <h3 className="text-sm font-semibold text-[#001b5e]">About</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{doctor.bio || "This doctor has not added a biography yet."}</p>
              </div>

              <div className="flex justify-end">
                <Link href="/dashboard/patient/doctors" className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">Back to Doctors</Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
