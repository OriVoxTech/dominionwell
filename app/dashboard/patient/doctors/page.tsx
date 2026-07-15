"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import {
    APPOINTMENT_REQUESTS_UPDATED_EVENT,
    createAppointmentRequest,
    readAppointmentRequests,
    type AppointmentRequest,
} from "@/lib/appointments";
import { DOCTOR_AVAILABILITY_UPDATED_EVENT, resolveDoctorCalendar } from "@/lib/doctor-availability";
import { availabilityStyles, doctors, type Doctor } from "./data";

const PATIENT_NAME = "Alex Johnson";
const PATIENT_ID = "DW-98231";

function isDoctorAvailable(availability: Doctor["availability"]) {
    return availability === "Available";
}

function getDoctorActionLabel(availability: Doctor["availability"]) {
    if (availability === "Available") {
        return "Book Appointment";
    }

    return "Unavailable";
}

function BrowseDoctorsContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("query") ?? "";
    const [query, setQuery] = useState(initialQuery);
    const [specializationFilter, setSpecializationFilter] = useState("All");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
    const [bookingError, setBookingError] = useState("");
    const [bookingMessage, setBookingMessage] = useState("");
    const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
    const [doctorCalendars, setDoctorCalendars] = useState<Record<string, Doctor["calendar"]>>({});

    useEffect(() => {
        const syncRequests = () => {
            setAppointmentRequests(readAppointmentRequests());
        };

        syncRequests();
        window.addEventListener("storage", syncRequests);
        window.addEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncRequests);

        return () => {
            window.removeEventListener("storage", syncRequests);
            window.removeEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncRequests);
        };
    }, []);

    useEffect(() => {
        const syncDoctorCalendars = () => {
            const nextCalendars: Record<string, Doctor["calendar"]> = {};

            doctors.forEach((doctor) => {
                nextCalendars[doctor.id] = resolveDoctorCalendar(doctor);
            });

            setDoctorCalendars(nextCalendars);
        };

        syncDoctorCalendars();
        window.addEventListener("storage", syncDoctorCalendars);
        window.addEventListener(DOCTOR_AVAILABILITY_UPDATED_EVENT, syncDoctorCalendars);

        return () => {
            window.removeEventListener("storage", syncDoctorCalendars);
            window.removeEventListener(DOCTOR_AVAILABILITY_UPDATED_EVENT, syncDoctorCalendars);
        };
    }, []);

    const selectedDoctorCalendar = useMemo(() => {
        if (!selectedDoctor) {
            return [] as Doctor["calendar"];
        }

        return doctorCalendars[selectedDoctor.id] ?? selectedDoctor.calendar;
    }, [doctorCalendars, selectedDoctor]);

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

    const selectedCalendarDay = useMemo(() => {
        if (!selectedDoctor || !selectedDate) {
            return null;
        }

        return selectedDoctorCalendar.find((day) => day.date === selectedDate) ?? null;
    }, [selectedDate, selectedDoctor, selectedDoctorCalendar]);

    const takenSlots = useMemo(() => {
        if (!selectedDoctor || !selectedDate) {
            return new Set<string>();
        }

        const bookedSlots = appointmentRequests
            .filter((request) => {
                return (
                    request.doctorId === selectedDoctor.id &&
                    request.date === selectedDate &&
                    (request.status === "Booked" || request.status === "Accepted")
                );
            })
            .map((request) => request.timeSlot);

        return new Set(bookedSlots);
    }, [appointmentRequests, selectedDate, selectedDoctor]);

    const handleOpenBookingModal = (doctor: Doctor) => {
        if (!isDoctorAvailable(doctor.availability)) {
            return;
        }

        setSelectedDoctor(doctor);
        const nextCalendar = doctorCalendars[doctor.id] ?? doctor.calendar;
        setSelectedDate(nextCalendar[0]?.date ?? "");
        setSelectedTimeSlot("");
        setBookingError("");
    };

    const closeBookingModal = () => {
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTimeSlot("");
        setBookingError("");
    };

    const handleBookNow = () => {
        if (!selectedDoctor) {
            return;
        }

        const calendarDay = selectedDoctorCalendar.find((day) => day.date === selectedDate);

        if (!calendarDay || !selectedTimeSlot) {
            setBookingError("Please select a date and time slot before booking.");
            return;
        }

        if (takenSlots.has(selectedTimeSlot)) {
            setBookingError("That slot is already taken. Please select another time.");
            return;
        }

        createAppointmentRequest({
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            doctorSpecialization: selectedDoctor.specialization,
            patientName: PATIENT_NAME,
            patientId: PATIENT_ID,
            date: calendarDay.date,
            dateLabel: calendarDay.label,
            timeSlot: selectedTimeSlot,
        });

        setBookingMessage(`Appointment request sent to ${selectedDoctor.name}.`);
        closeBookingModal();
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
                    <PatientLogoutButton className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
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

                {bookingMessage ? (
                    <section className="mb-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                        {bookingMessage}
                    </section>
                ) : null}

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
                                    onClick={() => handleOpenBookingModal(doctor)}
                                >
                                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
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
                            aria-label="Close booking modal"
                            onClick={closeBookingModal}
                        />

                        <section className="relative z-10 w-full max-w-xl rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-xl">
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="text-lg font-semibold text-[#001b5e]">Book Appointment</h4>
                                    <p className="text-sm text-[#475569]">Choose an available date and time with {selectedDoctor.name}.</p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-md p-1 text-[#64748b] hover:bg-[#f2f4f7]"
                                    aria-label="Close modal"
                                    onClick={closeBookingModal}
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <div>
                                <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748b]">Select Date</h5>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {selectedDoctorCalendar.map((day) => (
                                        <button
                                            key={day.date}
                                            type="button"
                                            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selectedDate === day.date ? "border-[#001b5e] bg-[#001b5e] text-white" : "border-[#c6c6cf] bg-white text-[#334155] hover:bg-[#f8fafc]"}`}
                                            onClick={() => {
                                                setSelectedDate(day.date);
                                                setSelectedTimeSlot("");
                                                setBookingError("");
                                            }}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>

                                <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748b]">Select Time Slot</h5>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {selectedCalendarDay?.timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            disabled={takenSlots.has(slot)}
                                            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${takenSlots.has(slot) ? "cursor-not-allowed border-[#e2e8f0] bg-[#f1f5f9] text-[#94a3b8]" : selectedTimeSlot === slot ? "border-[#16b46f] bg-[#16b46f] text-white" : "border-[#c6c6cf] bg-white text-[#334155] hover:bg-[#f8fafc]"}`}
                                            onClick={() => {
                                                setSelectedTimeSlot(slot);
                                                setBookingError("");
                                            }}
                                        >
                                            {takenSlots.has(slot) ? `${slot} (Taken)` : slot}
                                        </button>
                                    ))}
                                </div>

                                {bookingError ? <p className="mb-3 text-sm text-[#dc2626]">{bookingError}</p> : null}

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                                        onClick={closeBookingModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                                        onClick={handleBookNow}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
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
