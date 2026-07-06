"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import PatientMobileNav from "@/components/patient-mobile-nav";
import { doctors } from "../data";

export default function DoctorProfilePage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = typeof params?.doctorId === "string" ? params.doctorId : "";
  const doctor = doctors.find((item) => item.id === doctorId);

  if (!doctor) {
    return (
      <main className="min-h-screen bg-[#f9fafb] px-4 py-8 text-[#191c1e]">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#c6c6cf] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-[#001b5e]">Doctor Profile Not Found</h1>
          <p className="mt-2 text-sm text-[#475569]">The selected doctor profile could not be loaded.</p>
          <Link
            href="/dashboard/patient/doctors"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Doctors
          </Link>
        </div>
      </main>
    );
  }

  const whatsappMessage = encodeURIComponent(`Hello ${doctor.name}, I would like to discuss a consultation.`);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="doctors" />

      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-[#001b5e] sm:text-2xl">Doctor Profile</h1>
              <p className="text-xs text-[#475569] sm:text-sm">Review doctor details before booking your consultation.</p>
            </div>
            <Link href="/dashboard/patient/doctors" className="inline-flex items-center gap-2 text-xs font-semibold text-[#0aa4b4] sm:text-sm">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Doctors
            </Link>
          </header>

          <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#c6c6cf] bg-[#e2e8f0]">
                  <Image className="object-cover" src={doctor.image} alt={doctor.name} fill sizes="80px" unoptimized />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#001b5e] sm:text-xl">{doctor.name}</h2>
                  <p className="text-sm text-[#475569]">{doctor.specialization}</p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-[#16b46f]/15 px-3 py-1 text-xs font-semibold text-[#16b46f]">
                {doctor.rating.toFixed(1)} rating
              </span>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Experience</p>
                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{doctor.experienceYears} years</p>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Availability</p>
                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{doctor.availability}</p>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Phone</p>
                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{doctor.phone}</p>
              </div>
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Specialty</p>
                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{doctor.specialization}</p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <h3 className="text-sm font-semibold text-[#001b5e]">About</h3>
              <p className="mt-2 text-sm text-[#475569]">{doctor.bio}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/patient/doctors"
                className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
              >
                Back
              </Link>
              <a
                href={`https://wa.me/${doctor.whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#149660]"
              >
                Contact on WhatsApp
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
