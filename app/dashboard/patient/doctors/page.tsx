"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import { availabilityStyles, doctors, type Doctor } from "./data";

const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
const PATIENT_NAME = "Alex Johnson";

function isDoctorAvailable(availability: Doctor["availability"]) {
    return availability === "Available";
}

function getDoctorActionLabel(availability: Doctor["availability"]) {
    if (availability === "Available") {
        return "Contact Doctor";
    }

    if (availability === "Busy") {
        return "In Consultation";
    }

    return "Offline";
}

function WhatsAppIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 flex-none fill-current">
            <path d="M12 2a10 10 0 0 0-8.58 15.12L2.5 22l4.98-1.34A10 10 0 1 0 12 2Zm0 18a7.9 7.9 0 0 1-4.04-1.1l-.29-.17-2.95.79.79-2.88-.19-.3A8 8 0 1 1 12 20Zm4.35-5.7c-.24.68-1.2 1.25-1.66 1.34-.44.09-.99.13-1.6-.07-.37-.12-.84-.28-1.45-.54-2.55-1.1-4.2-3.67-4.32-3.84-.12-.17-1.04-1.38-1.04-2.63s.65-1.87.88-2.13c.23-.26.51-.32.68-.32h.49c.16 0 .39-.06.61.47.24.55.82 1.9.89 2.04.07.14.12.31.02.5-.1.2-.15.31-.29.48-.14.17-.3.37-.42.49-.14.14-.29.29-.12.58.17.29.78 1.31 1.68 2.12 1.16 1.03 2.12 1.35 2.42 1.5.29.14.46.12.63-.07.17-.2.71-.82.9-1.1.18-.29.37-.24.62-.14.25.1 1.6.75 1.88.89.28.14.47.21.54.33.06.12.06.68-.18 1.36Z" />
        </svg>
    );
}

export default function BrowseDoctorsPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("All");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isConfirmingConsultation, setIsConfirmingConsultation] = useState(false);

    const [consultationsRemaining, setConsultationsRemaining] = useState(() => {
        const consultationsRemainingParam =
            typeof window !== "undefined"
                ? Number(new URLSearchParams(window.location.search).get("remaining"))
                : Number.NaN;

        if (typeof window === "undefined") {
            const fallback = Number.isFinite(consultationsRemainingParam) ? consultationsRemainingParam : 48;
            return Math.max(0, Math.floor(fallback));
        }

        const storedBalance = Number(window.localStorage.getItem(CONSULTATION_BALANCE_KEY));
        const resolvedBalance = Number.isFinite(storedBalance)
            ? storedBalance
            : Number.isFinite(consultationsRemainingParam)
              ? consultationsRemainingParam
              : 48;

        return Math.max(0, Math.floor(resolvedBalance));
    });

    const specializations = useMemo(() => {
        return ["All", ...new Set(doctors.map((doctor) => doctor.specialization))];
    }, []);

    const filteredDoctors = useMemo(() => {
        const trimmed = query.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const matchesQuery =
                trimmed.length === 0 ||
                doctor.name.toLowerCase().includes(trimmed) ||
                doctor.specialization.toLowerCase().includes(trimmed);
            const matchesSpecialization =
                specializationFilter === "All" || doctor.specialization === specializationFilter;

            return matchesQuery && matchesSpecialization;
        });
    }, [query, specializationFilter]);

    const handleSpeakToDoctor = (doctor: Doctor) => {
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

    const closeSpeakModal = () => {
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
            window.open(
                `https://wa.me/${selectedDoctor.whatsappNumber}?text=${encodedMessage}`,
                "_blank",
                "noopener,noreferrer"
            );
        }

        setConsultationsRemaining(nextBalance);
        closeSpeakModal();
    };

    const generateVerificationPassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let password = "";

        for (let i = 0; i < 8; i += 1) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }

        return `DW-${password}`;
    };

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
                            alt="Alex Johnson"
                            fill
                            sizes="44px"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{PATIENT_NAME}</p>
                        <p className="text-xs text-[#d8e2ff]">ID: DW-98231</p>
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

                <button className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-sm font-semibold text-white">Book New Consult</button>

                <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
                    <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span>Help Center</span>
                    </Link>
                    <Link className="flex items-center gap-3 px-3 py-2 hover:bg-white/10" href="/">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
                <header className="mb-5 sm:mb-6">
                    <div className="mb-2 flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/dashboard/patient"
                            aria-label="Back"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        </Link>
                        <h2 className="text-2xl font-semibold text-[#001b5e] sm:text-1xl">Browse Doctors</h2>
                    </div>
                    <p className="text-xs text-[#475569] sm:text-[13px]">View all doctors and find the right specialist quickly.</p>
                </header>

                <section className="mb-5 rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
                    <h3 className="mb-3 text-sm font-semibold text-[#001b5e] sm:mb-4 sm:text-[15px]">Search doctors</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                        <label className="relative block">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                                search
                            </span>
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by doctor name or specialization"
                                className="h-10 w-full rounded-xl border border-[#c6c6cf] bg-white pl-10 pr-4 text-xs outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-[13px]"
                            />
                        </label>

                        <div className="relative pt-5 md:pt-0">
                            <span className="pointer-events-none absolute left-0 top-0 text-[10px] font-semibold uppercase tracking-wide text-[#64748b] md:-top-5">
                                Filter by specialization
                            </span>
                            <select
                                className="h-10 w-full rounded-xl border border-[#c6c6cf] bg-white px-3 text-xs outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-[13px]"
                                value={specializationFilter}
                                onChange={(event) => setSpecializationFilter(event.target.value)}
                                aria-label="Filter by specialization"
                            >
                                {specializations.map((specialization) => (
                                    <option key={specialization} value={specialization}>
                                        {specialization}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="mb-3 flex items-center justify-between sm:mb-4">
                    <h3 className="text-sm font-semibold text-[#001b5e] sm:text-[15px]">View all doctors</h3>
                    <p className="text-xs text-[#475569] sm:text-[13px]">{filteredDoctors.length} results</p>
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {filteredDoctors.map((doctor) => (
                        <article key={doctor.id} className="rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#e2e8f0]">
                                        <Image className="object-cover" src={doctor.image} alt={doctor.name} fill sizes="56px" unoptimized />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-[#001b5e] sm:text-[15px] mb-2">{doctor.name}</h4>
                                        <p className="text-xs text-[#475569] xs:text-[13px]">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${availabilityStyles[doctor.availability]}`}>
                                    {doctor.availability}
                                </span>
                            </div>

                            <p className="mb-4 text-xs text-[#475569] sm:text-[13px]">{doctor.bio}</p>

                            <div className="mb-4 flex flex-wrap gap-2 text-[11px] text-[#334155]">
                                <span className="rounded-md bg-[#f2f4f7] px-2 py-1">{doctor.experienceYears} years experience</span>
                                <span className="rounded-md bg-[#f2f4f7] px-2 py-1">{doctor.rating.toFixed(1)} rating</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                    type="button"
                                    disabled={!isDoctorAvailable(doctor.availability)}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white ${isDoctorAvailable(doctor.availability) ? "bg-[#16b46f] hover:bg-[#149660]" : "cursor-not-allowed bg-[#94a3b8]"}`}
                                    onClick={() => handleSpeakToDoctor(doctor)}
                                >
                                    <WhatsAppIcon />
                                    {getDoctorActionLabel(doctor.availability)}
                                </button>
                                <Link
                                    href={`/dashboard/patient/doctors/${doctor.id}`}
                                    className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                                    aria-label={`Open profile for ${doctor.name}`}
                                >
                                    Doctor profile
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>

                {filteredDoctors.length === 0 ? (
                    <section className="mt-6 rounded-2xl border border-dashed border-[#c6c6cf] bg-white p-6 text-center">
                        <h4 className="text-base font-semibold text-[#001b5e]">No doctors match your filters</h4>
                        <p className="mt-1 text-sm text-[#64748b]">Try changing your search term or specialization filter.</p>
                    </section>
                ) : null}

                {selectedDoctor ? (
                    <div className="fixed inset-0 z-50 grid place-items-center p-4">
                        <button
                            type="button"
                            className="absolute inset-0 bg-[#0f172a]/45"
                            aria-label="Close contact modal"
                            onClick={closeSpeakModal}
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
                                    onClick={closeSpeakModal}
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            {isConfirmingConsultation ? (
                                <>
                                    <div className="mb-4 rounded-lg bg-[#f8fafc] p-3 text-sm text-[#334155]">
                                        Once you proceed, one consultation will be deducted from your subscription.
                                        You will have <span className="font-semibold text-[#001b5e]">{Math.max(consultationsRemaining - 1, 0)}</span> subscription(s) left.
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
                                        onClick={closeSpeakModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                                        onClick={() => setIsConfirmingConsultation(true)}
                                    >
                                        Doctor WhatsApp
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
