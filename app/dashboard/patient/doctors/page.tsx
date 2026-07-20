"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientProfileSummary from "@/components/patient-profile-summary";
import {
  getApiErrorMessage,
  patientApiService,
  patientDoctorsApiService,
  type DoctorAvailabilitySlot,
  type PublicDoctor,
  type PublicDoctorsResponse,
} from "@/lib/api";
import { usePatientProfile } from "@/lib/use-patient-profile";

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

function formatSlotDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatSlotTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function BrowseDoctorsContent() {
  const router = useRouter();
  const profile = usePatientProfile();
  const searchParams = useSearchParams();
  const initialDoctorId = searchParams.get("doctorId") ?? "";
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(1);
  const [directory, setDirectory] =
    useState<PublicDoctorsResponse>(EMPTY_RESPONSE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingDoctor, setBookingDoctor] = useState<PublicDoctor | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<DoctorAvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

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
      if (selectedDoctorId) {
        const response = await patientDoctorsApiService.getById(selectedDoctorId);
        setDirectory({
          data: [response.data],
          meta: { total: 1, page: 1, limit: 1, totalPages: 1 },
        });
        return;
      }

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
  }, [debouncedQuery, page, selectedDoctorId, specialization]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctors();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctors]);

  const openBookingFlow = async (doctor: PublicDoctor) => {
    setBookingDoctor(doctor);
    setAvailabilitySlots([]);
    setSelectedDate("");
    setSelectedSlotId("");
    setBookingError("");
    setBookingMessage("");
    setShowSubscriptionPrompt(false);
    setIsCheckingSubscription(true);

    try {
      const subscriptionResponse = await patientApiService.getMySubscription();
      const subscription = subscriptionResponse.data;
      const hasActiveSubscription = Boolean(subscription.currentSubscription);
      const hasConsultations = subscription.consultationBalance > 0;

      if (!hasActiveSubscription || !hasConsultations) {
        setShowSubscriptionPrompt(true);
        return;
      }

      setIsLoadingAvailability(true);
      const response = await patientApiService.listDoctorAvailability(doctor.id);
      const availableSlots = response.data
        .filter((slot) => !slot.isBooked)
        .sort(
          (first, second) =>
            new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
        );

      setAvailabilitySlots(availableSlots);
      setSelectedDate(availableSlots[0] ? getDateKey(availableSlots[0].startsAt) : "");
    } catch (error) {
      setBookingError(getApiErrorMessage(error));
    } finally {
      setIsCheckingSubscription(false);
      setIsLoadingAvailability(false);
    }
  };

  const closeBookingFlow = () => {
    setBookingDoctor(null);
    setAvailabilitySlots([]);
    setSelectedDate("");
    setSelectedSlotId("");
    setBookingError("");
    setBookingMessage("");
    setIsBookingAppointment(false);
    setShowSubscriptionPrompt(false);
  };

  const confirmBooking = async () => {
    if (!bookingDoctor) return;

    const selectedSlot = availabilitySlots.find((slot) => slot.id === selectedSlotId);

    if (!selectedSlot) {
      setBookingError("Select an available time slot to continue.");
      return;
    }

    const doctorName = getDoctorName(bookingDoctor);

    setBookingError("");
    setBookingMessage("");
    setIsBookingAppointment(true);

    try {
      await patientApiService.bookAppointment({
        doctorId: bookingDoctor.id,
        slotId: selectedSlot.id,
      });

      setAvailabilitySlots((current) =>
        current.filter((slot) => slot.id !== selectedSlot.id),
      );
      setSelectedSlotId("");
      window.dispatchEvent(new Event("dw-appointments-updated"));
      window.dispatchEvent(new Event("dw-subscription-updated"));
      setBookingMessage(`Appointment booked with ${doctorName}.`);
      window.setTimeout(() => {
        closeBookingFlow();
      }, 1400);
    } catch (error) {
      setBookingError(getApiErrorMessage(error));
    } finally {
      setIsBookingAppointment(false);
    }
  };

  const availabilityByDate = availabilitySlots.reduce<Record<string, DoctorAvailabilitySlot[]>>(
    (groups, slot) => {
      const dateKey = getDateKey(slot.startsAt);
      groups[dateKey] = [...(groups[dateKey] ?? []), slot];
      return groups;
    },
    {},
  );
  const availableDates = Object.keys(availabilityByDate);
  const selectedDateSlots = selectedDate ? availabilityByDate[selectedDate] ?? [] : [];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="doctors" />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
        </div>

        <div className="mb-6 flex items-center gap-3 px-2">
          <PatientAvatar profile={profile} />
          <PatientProfileSummary />
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
          <Link href="/dashboard/patient/subscription" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">card_membership</span>
            <span>Subscription</span>
          </Link>
          <Link href="/dashboard/patient/payments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Payments</span>
          </Link>
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
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedDoctorId("");
                }}
                placeholder="Search by name, username, or specialization"
                className="h-11 w-full rounded-xl border border-[#c6c6cf] bg-white pl-10 pr-4 text-[13px] outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <select
              className="h-11 w-full rounded-xl border border-[#c6c6cf] bg-white px-3 text-[13px] outline-none focus:border-[#0aa4b4]"
              value={specialization}
              onChange={(event) => {
                setSpecialization(event.target.value);
                setSelectedDoctorId("");
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
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/dashboard/patient/doctors/${doctor.id}`} className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]" aria-label={`View profile for ${doctorName}`}>
                        View Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => void openBookingFlow(doctor)}
                        className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                      >
                        Book Appointment
                      </button>
                    </div>
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

      {bookingDoctor ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Close appointment booking"
            className="absolute inset-0 bg-[#0f172a]/55 backdrop-blur-[2px]"
            onClick={closeBookingFlow}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-appointment-title"
            className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 id="book-appointment-title" className="text-lg font-semibold text-[#001b5e]">
                  Book appointment with {getDoctorName(bookingDoctor)}
                </h3>
                <p className="mt-1 text-sm text-[#64748b]">
                  Select an available date and time slot.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBookingFlow}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c6c6cf] text-[#475569] hover:bg-[#f8fafc]"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[19px]">close</span>
              </button>
            </div>

            {isCheckingSubscription ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                Checking your subscription...
              </div>
            ) : null}

            {showSubscriptionPrompt ? (
              <div className="rounded-xl border border-[#fbbf24]/40 bg-[#fffbeb] p-4">
                <h4 className="text-base font-semibold text-[#92400e]">No active subscription</h4>
                <p className="mt-1 text-sm text-[#92400e]">
                  You need an active subscription with available consultation credits before booking an appointment.
                </p>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeBookingFlow}
                    className="rounded-lg border border-[#f59e0b]/50 px-4 py-2 text-sm font-semibold text-[#92400e] hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/patient/subscription?mode=buy")}
                    className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
                  >
                    Buy Subscription
                  </button>
                </div>
              </div>
            ) : null}

            {isLoadingAvailability ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                Loading availability...
              </div>
            ) : null}

            {!isCheckingSubscription && !showSubscriptionPrompt && !isLoadingAvailability && availabilitySlots.length === 0 && !bookingError ? (
              <div className="rounded-xl border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                No available slots for this doctor right now.
              </div>
            ) : null}

            {availableDates.length > 0 ? (
              <div className="grid gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748b]">Date</p>
                  <div className="flex flex-wrap gap-2">
                    {availableDates.map((dateKey) => {
                      const firstSlot = availabilityByDate[dateKey][0];
                      const isSelected = dateKey === selectedDate;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dateKey);
                            setSelectedSlotId("");
                            setBookingError("");
                          }}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                            isSelected
                              ? "border-[#001b5e] bg-[#001b5e] text-white"
                              : "border-[#c6c6cf] text-[#334155] hover:bg-[#f8fafc]"
                          }`}
                        >
                          {formatSlotDate(firstSlot.startsAt)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748b]">Time slot</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedDateSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlotId(slot.id);
                            setBookingError("");
                          }}
                          className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
                            isSelected
                              ? "border-[#16b46f] bg-[#16b46f]/15 text-[#166534]"
                              : "border-[#c6c6cf] text-[#334155] hover:bg-[#f8fafc]"
                          }`}
                        >
                          {formatSlotTime(slot.startsAt)} - {formatSlotTime(slot.endsAt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {bookingError ? (
              <p role="alert" className="mt-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
                {bookingError}
              </p>
            ) : null}

            {bookingMessage ? (
              <p role="status" className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#15803d]">
                {bookingMessage}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeBookingFlow}
                className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBooking}
                disabled={!selectedSlotId || isBookingAppointment || Boolean(bookingMessage) || showSubscriptionPrompt}
                className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
              >
                {isBookingAppointment ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
