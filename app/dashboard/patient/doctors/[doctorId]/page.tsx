"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import {
  APPOINTMENT_REQUESTS_UPDATED_EVENT,
  createAppointmentRequest,
  readAppointmentRequests,
  type AppointmentRequest,
} from "@/lib/appointments";
import { DOCTOR_AVAILABILITY_UPDATED_EVENT, resolveDoctorCalendar } from "@/lib/doctor-availability";
import { doctors, type Doctor } from "../data";

const PATIENT_NAME = "Alex Johnson";
const PATIENT_ID = "DW-98231";

function isDoctorAvailable(availability: Doctor["availability"]) {
  return availability === "Available";
}

function getDoctorAvailabilityActionLabel(availability: Doctor["availability"]) {
  if (availability === "Available") {
    return "Book Appointment";
  }

  return "Unavailable";
}

export default function DoctorProfilePage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = typeof params?.doctorId === "string" ? params.doctorId : "";
  const doctor = doctors.find((item) => item.id === doctorId);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [doctorCalendar, setDoctorCalendar] = useState<Doctor["calendar"]>([]);

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
    if (!doctor) {
      return;
    }

    const syncDoctorCalendar = () => {
      setDoctorCalendar(resolveDoctorCalendar(doctor));
    };

    syncDoctorCalendar();
    window.addEventListener("storage", syncDoctorCalendar);
    window.addEventListener(DOCTOR_AVAILABILITY_UPDATED_EVENT, syncDoctorCalendar);

    return () => {
      window.removeEventListener("storage", syncDoctorCalendar);
      window.removeEventListener(DOCTOR_AVAILABILITY_UPDATED_EVENT, syncDoctorCalendar);
    };
  }, [doctor]);

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

  const openBookingModal = () => {
    if (!doctor) {
      return;
    }

    if (!isDoctorAvailable(doctor.availability)) {
      return;
    }

    setIsBookingOpen(true);
    setSelectedDate((doctorCalendar.length > 0 ? doctorCalendar : doctor.calendar)[0]?.date ?? "");
    setSelectedTimeSlot("");
    setBookingError("");
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setBookingError("");
  };

  const resolvedCalendar = doctorCalendar.length > 0 ? doctorCalendar : doctor.calendar;

  const selectedCalendarDay = resolvedCalendar.find((day) => day.date === selectedDate) ?? null;

  const takenSlots = new Set(
    appointmentRequests
      .filter((request) => {
        return (
          request.doctorId === doctor.id &&
          request.date === selectedDate &&
          (request.status === "Booked" || request.status === "Accepted")
        );
      })
      .map((request) => request.timeSlot)
  );

  const handleBookNow = () => {
    if (!doctor) {
      return;
    }

    if (!selectedCalendarDay || !selectedTimeSlot) {
      setBookingError("Please select a date and time slot before booking.");
      return;
    }

    if (takenSlots.has(selectedTimeSlot)) {
      setBookingError("That slot is already taken. Please select another time.");
      return;
    }

    createAppointmentRequest({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      patientName: PATIENT_NAME,
      patientId: PATIENT_ID,
      date: selectedCalendarDay.date,
      dateLabel: selectedCalendarDay.label,
      timeSlot: selectedTimeSlot,
    });

    setBookingMessage(`Appointment request sent to ${doctor.name}.`);
    closeBookingModal();
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

          {bookingMessage ? (
            <section className="mb-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
              {bookingMessage}
            </section>
          ) : null}

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
                onClick={openBookingModal}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  isDoctorAvailable(doctor.availability) ? "bg-[#16b46f] hover:bg-[#149660]" : "cursor-not-allowed bg-[#94a3b8]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                {getDoctorAvailabilityActionLabel(doctor.availability)}
              </button>
            </div>
          </section>
        </div>
      </main>

      {isBookingOpen ? (
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
                <p className="text-sm text-[#475569]">Choose an available date and time with {doctor.name}.</p>
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
                {resolvedCalendar.map((day) => (
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
    </div>
  );
}
