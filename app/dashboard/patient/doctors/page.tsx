"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import {
  getApiErrorMessage,
  patientDoctorsApiService,
  type PublicDoctor,
  type PublicDoctorsResponse,
} from "@/lib/api";

const PATIENT_NAME = "Alex Johnson";

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

const EMPTY_RESPONSE: PublicDoctorsResponse = {
  data: [],
  meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
};

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

function BrowseDoctorsContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(1);
  const [directory, setDirectory] =
    useState<PublicDoctorsResponse>(EMPTY_RESPONSE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const loadDoctors = useCallback(async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await patientDoctorsApiService.list({
        page,
        limit: 20,
        search: debouncedQuery || undefined,
        specialization: specialization || undefined,
      });
      setDirectory(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, page, specialization]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctors();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctors]);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="doctors" />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
        </div>

        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#16b46f]/40">
            <Image
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPurUR2thld9ARCgQv5h5zzRrmbx5VzEhRhGSj-4R3LQBMFeO5bA8OOCajuwGXXWPjtINjhw8-RqL2BIwlmrOkDz58EbqhMGjnRdrjEPNB6wMXEYirVhXLKHukNRiuOjWAxDoEcMTG9A2c2wKRcRRN4U7gxeFEPhJ7G7sLUQezeiulcTpl6y2fsYeeLmQHBuYLxYwyY3mOhVegyEsvP846S3aiHmWvjDLrjKsx9yBY9vkJssTPuipSUEY4d1WwN6dlulgSFUQpfRjW"
              alt={PATIENT_NAME}
              fill
              sizes="44px"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{PATIENT_NAME}</p>
            <p className="text-xs text-[#d8e2ff]">Patient account</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          <Link href="/dashboard/patient" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/patient/appointments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>Appointments</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b46f] bg-[#16b46f]/20 px-3 py-2 text-[#d7ffe9]">
            <span className="material-symbols-outlined text-[20px]">medical_services</span>
            <span>Browse Doctors</span>
          </div>
          <Link href="/dashboard/patient/settings" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
          <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>Help Center</span>
          </Link>
          <PatientLogoutButton className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
        <header className="mb-5 sm:mb-6">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <Link href="/dashboard/patient" aria-label="Back" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h2 className="text-2xl font-semibold text-[#001b5e] sm:text-1xl">Browse Doctors</h2>
          </div>
          <p className="text-xs text-[#475569] sm:text-[13px]">Browse active, verified doctors and find the right specialist.</p>
        </header>

        <section className="mb-5 rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-[#001b5e] sm:mb-4 sm:text-[15px]">Search doctors</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
            <label className="relative block">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, username, or specialization"
                className="h-11 w-full rounded-xl border border-[#c6c6cf] bg-white pl-10 pr-4 text-[13px] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <select
              className="h-11 w-full rounded-xl border border-[#c6c6cf] bg-white px-3 text-[13px] outline-none focus:border-[#0aa4b4]"
              value={specialization}
              onChange={(event) => {
                setSpecialization(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by specialization"
            >
              <option value="">All specializations</option>
              {SPECIALIZATION_OPTIONS.map((option) => (
                <option key={option} value={option}>{formatSpecialization(option)}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <h3 className="text-sm font-semibold text-[#001b5e] sm:text-[15px]">View all doctors</h3>
          <p className="text-xs text-[#475569] sm:text-[13px]">{directory.meta.total} result{directory.meta.total === 1 ? "" : "s"}</p>
        </section>

        {errorMessage ? (
          <section role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => void loadDoctors()} className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white">Try Again</button>
          </section>
        ) : null}

        {isLoading ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Loading doctors">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-52 animate-pulse rounded-2xl border border-[#e2e8f0] bg-white p-5">
                <div className="mb-5 h-14 w-14 rounded-full bg-[#e2e8f0]" />
                <div className="mb-3 h-4 w-1/2 rounded bg-[#e2e8f0]" />
                <div className="h-3 w-3/4 rounded bg-[#f1f5f9]" />
              </div>
            ))}
          </section>
        ) : null}

        {!isLoading && !errorMessage ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {directory.data.map((doctor) => {
              const doctorName = getDoctorName(doctor);

              return (
                <article key={doctor.id} className="flex flex-col rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-sm font-bold text-[#0369a1]">
                      {getDoctorInitials(doctor)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-[#001b5e] sm:text-[15px]">{doctorName}</h4>
                      <p className="mt-1 text-xs text-[#64748b]">@{doctor.user.username}</p>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full bg-[#dcfce7] px-2 py-1 text-[10px] font-semibold uppercase text-[#15803d]">Verified</span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {doctor.specializations.map((item) => (
                      <span key={item} className="rounded-md bg-[#eef2ff] px-2 py-1 text-[11px] font-medium text-[#3730a3]">{formatSpecialization(item)}</span>
                    ))}
                  </div>

                  <p className="mb-5 line-clamp-3 text-xs leading-5 text-[#475569] sm:text-[13px]">
                    {doctor.bio || "This doctor has not added a biography yet."}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e2e8f0] pt-4">
                    <span className="text-[11px] text-[#64748b]">Verified {new Date(doctor.verifiedAt).toLocaleDateString()}</span>
                    <Link href={`/dashboard/patient/doctors/${doctor.id}`} className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]" aria-label={`View profile for ${doctorName}`}>
                      View Profile
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {!isLoading && !errorMessage && directory.data.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-dashed border-[#c6c6cf] bg-white p-6 text-center">
            <h4 className="text-base font-semibold text-[#001b5e]">No doctors match your search</h4>
            <p className="mt-1 text-sm text-[#64748b]">Try another name, username, or specialization.</p>
          </section>
        ) : null}

        {!isLoading && !errorMessage && directory.meta.totalPages > 1 ? (
          <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Doctor directory pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <span className="text-xs text-[#475569]">Page {directory.meta.page} of {directory.meta.totalPages}</span>
            <button type="button" disabled={page >= directory.meta.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </nav>
        ) : null}
      </main>
    </div>
  );
}

export default function BrowseDoctorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9fafb]" />}>
      <BrowseDoctorsContent />
    </Suspense>
  );
}
