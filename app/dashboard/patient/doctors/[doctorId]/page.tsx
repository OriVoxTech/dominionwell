"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import { doctors, type Doctor } from "../data";

const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
const PATIENT_NAME = "Alex Johnson";

function isDoctorAvailable(availability: Doctor["availability"]) {
  return availability === "Available";
}

function getDoctorAvailabilityActionLabel(availability: Doctor["availability"]) {
  if (availability === "Available") {
    return "Contact Doctor";
  }

  if (availability === "Busy") {
    return "In Consultation";
  }

  return "Offline";
}

function generateVerificationPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";

  for (let i = 0; i < 8; i += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return `DW-${password}`;
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 flex-none fill-current">
      <path d="M12 2a10 10 0 0 0-8.58 15.12L2.5 22l4.98-1.34A10 10 0 1 0 12 2Zm0 18a7.9 7.9 0 0 1-4.04-1.1l-.29-.17-2.95.79.79-2.88-.19-.3A8 8 0 1 1 12 20Zm4.35-5.7c-.24.68-1.2 1.25-1.66 1.34-.44.09-.99.13-1.6-.07-.37-.12-.84-.28-1.45-.54-2.55-1.1-4.2-3.67-4.32-3.84-.12-.17-1.04-1.38-1.04-2.63s.65-1.87.88-2.13c.23-.26.51-.32.68-.32h.49c.16 0 .39-.06.61.47.24.55.82 1.9.89 2.04.07.14.12.31.02.5-.1.2-.15.31-.29.48-.14.17-.3.37-.42.49-.14.14-.29.29-.12.58.17.29.78 1.31 1.68 2.12 1.16 1.03 2.12 1.35 2.42 1.5.29.14.46.12.63-.07.17-.2.71-.82.9-1.1.18-.29.37-.24.62-.14.25.1 1.6.75 1.88.89.28.14.47.21.54.33.06.12.06.68-.18 1.36Z" />
    </svg>
  );
}

export default function DoctorProfilePage() {
  const router = useRouter();
  const params = useParams<{ doctorId: string }>();
  const doctorId = typeof params?.doctorId === "string" ? params.doctorId : "";
  const doctor = doctors.find((item) => item.id === doctorId);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isConfirmingConsultation, setIsConfirmingConsultation] = useState(false);
  const [consultationsRemaining, setConsultationsRemaining] = useState(() => {
    if (typeof window === "undefined") {
      return 48;
    }

    const storedBalance = Number(window.localStorage.getItem(CONSULTATION_BALANCE_KEY));

    return Number.isFinite(storedBalance) ? Math.max(0, Math.floor(storedBalance)) : 48;
  });

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

  const openConsultationModal = () => {
    if (!isDoctorAvailable(doctor.availability)) {
      return;
    }

    if (consultationsRemaining <= 0) {
      router.push("/dashboard/patient/subscription");
      return;
    }

    setSelectedDoctor(doctor);
    setIsConfirmingConsultation(false);
  };

  const closeConsultationModal = () => {
    setSelectedDoctor(null);
    setIsConfirmingConsultation(false);
  };

  const confirmWhatsAppConsultation = () => {
    if (!selectedDoctor) {
      return;
    }

    const nextBalance = Math.max(consultationsRemaining - 1, 0);
    const verificationPassword = generateVerificationPassword();
    const whatsappMessage = [
      `Hello ${selectedDoctor.name},`,
      `This is ${PATIENT_NAME}.`,
      "I am proceeding with my consultation request.",
      `Consultation verification password: ${verificationPassword}`,
      "Please use this code to verify this consultation.",
    ].join("\n");
    const encodedMessage = encodeURIComponent(whatsappMessage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSULTATION_BALANCE_KEY, String(nextBalance));
      window.dispatchEvent(new Event("dw-subscription-updated"));
      window.open(`https://wa.me/${selectedDoctor.whatsappNumber}?text=${encodedMessage}`, "_blank", "noopener,noreferrer");
    }

    setConsultationsRemaining(nextBalance);
    closeConsultationModal();
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="doctors" />

      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6">
            <div className="mb-3 flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/patient/doctors"
                aria-label="Back"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <h1 className="text-xl font-semibold text-[#001b5e] sm:text-1xl">Doctor Profile</h1>
            </div>
            <p className="text-xs text-[#475569] sm:text-[13px]">Review doctor details before booking your consultation.</p>
          </header>

          <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#c6c6cf] bg-[#e2e8f0]">
                  <Image className="object-cover" src={doctor.image} alt={doctor.name} fill sizes="80px" unoptimized />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#001b5e] sm:text-l mb-2">{doctor.name}</h2>
                  <p className="text-[13px] text-[#475569]">{doctor.specialization}</p>
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
              {/* <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Phone</p>
                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{doctor.phone}</p>
              </div> */}
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
              <button
                type="button"
                disabled={!isDoctorAvailable(doctor.availability)}
                onClick={openConsultationModal}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  isDoctorAvailable(doctor.availability) ? "bg-[#16b46f] hover:bg-[#149660]" : "cursor-not-allowed bg-[#94a3b8]"
                }`}
              >
                <WhatsAppIcon />
                {getDoctorAvailabilityActionLabel(doctor.availability)}
              </button>
            </div>
          </section>
        </div>
      </main>

      {selectedDoctor ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0f172a]/45"
            aria-label="Close contact modal"
            onClick={closeConsultationModal}
          />

          <section className="relative z-10 w-full max-w-md rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-[#001b5e]">Speak to Doctor</h4>
                <p className="text-sm text-[#475569]">Contact {selectedDoctor.name} via WhatsApp.</p>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-[#64748b] hover:bg-[#f2f4f7]"
                aria-label="Close modal"
                onClick={closeConsultationModal}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {isConfirmingConsultation ? (
              <>
                <div className="mb-4 rounded-lg bg-[#f8fafc] p-3 text-sm text-[#334155]">
                  Once you proceed, one consultation will be deducted from your subscription. You will have{" "}
                  <span className="font-semibold text-[#001b5e]">{Math.max(consultationsRemaining - 1, 0)}</span> subscription(s) left.
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                    onClick={() => setIsConfirmingConsultation(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                    onClick={confirmWhatsAppConsultation}
                  >
                    Proceed
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                  onClick={closeConsultationModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                  onClick={() => setIsConfirmingConsultation(true)}
                >
                  <WhatsAppIcon />
                  Contact Doctor
                </button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
