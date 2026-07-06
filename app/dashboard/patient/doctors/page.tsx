"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import { availabilityStyles, doctors, type Doctor } from "./data";

const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
const PATIENT_NAME = "Alex Johnson";

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
        if (consultationsRemaining > 0) {
            setSelectedDoctor(doctor);
            setIsConfirmingConsultation(false);
            return;
        }

        router.push("/dashboard/patient/subscription");
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
                <header className="mb-5 flex flex-col gap-2 sm:mb-6 sm:gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-[#001b5e] sm:text-2xl">Doctors</h2>
                        <p className="text-xs text-[#475569] sm:text-sm">View all doctors and find the right specialist quickly.</p>
                    </div>
                    <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-xs font-semibold text-[#0aa4b4] sm:text-sm">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </header>

                <section className="mb-5 rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
                    <h3 className="mb-3 text-sm font-semibold text-[#001b5e] sm:mb-4 sm:text-base">Search doctors</h3>
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
                                className="h-10 w-full rounded-xl border border-[#c6c6cf] bg-white pl-10 pr-4 text-xs outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-sm"
                            />
                        </label>

                        <div className="relative pt-5 md:pt-0">
                            <span className="pointer-events-none absolute left-0 top-0 text-[10px] font-semibold uppercase tracking-wide text-[#64748b] md:-top-5">
                                Filter by specialization
                            </span>
                            <select
                                className="h-10 w-full rounded-xl border border-[#c6c6cf] bg-white px-3 text-xs outline-none focus:border-[#0aa4b4] sm:h-11 sm:text-sm"
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
                    <h3 className="text-sm font-semibold text-[#001b5e] sm:text-base">View all doctors</h3>
                    <p className="text-xs text-[#475569] sm:text-sm">{filteredDoctors.length} results</p>
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
                                        <h4 className="text-sm font-semibold text-[#001b5e] sm:text-base">{doctor.name}</h4>
                                        <p className="text-xs text-[#475569] sm:text-sm">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${availabilityStyles[doctor.availability]}`}>
                                    {doctor.availability}
                                </span>
                            </div>

                            <p className="mb-4 text-xs text-[#475569] sm:text-sm">{doctor.bio}</p>

                            <div className="mb-4 flex flex-wrap gap-2 text-xs text-[#334155]">
                                <span className="rounded-md bg-[#f2f4f7] px-2 py-1">{doctor.experienceYears} years experience</span>
                                <span className="rounded-md bg-[#f2f4f7] px-2 py-1">{doctor.rating.toFixed(1)} rating</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                    type="button"
                                    disabled={doctor.availability === "Busy"}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${doctor.availability === "Busy" ? "cursor-not-allowed bg-[#94a3b8]" : "bg-[#16b46f] hover:bg-[#149660]"}`}
                                    onClick={() => handleSpeakToDoctor(doctor)}
                                >
                                    {doctor.availability === "Busy" ? "Doctor Busy" : "Speak to Doctor"}
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
