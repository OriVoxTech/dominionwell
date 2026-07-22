"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientSidebar from "@/components/patient-sidebar";
import {
  doctorApplicationsApiService,
  getApiErrorMessage,
  patientApiService,
  patientDoctorsApiService,
  type AdminSpecialty,
  type DoctorAvailabilitySlot,
  type PublicDoctor,
  type PublicDoctorsResponse,
} from "@/lib/api";

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

function getPresenceStatusMeta(status: PublicDoctor["presenceStatus"]) {
  const normalized = typeof status === "string" ? status.toUpperCase() : "OFFLINE";

  if (normalized === "AVAILABLE") {
    return {
      label: "Available",
      className: "bg-[#16b36c]/15 text-[#15803d]",
      dotClassName: "bg-[#16b36c]",
    };
  }

  if (normalized === "BUSY") {
    return {
      label: "Busy",
      className: "bg-[#f59e0b]/15 text-[#b45309]",
      dotClassName: "bg-[#f59e0b]",
    };
  }

  return {
    label: "Offline",
    className: "bg-[#64748b]/15 text-[#475569]",
    dotClassName: "bg-[#64748b]",
  };
}

function isDoctorOffline(doctor: PublicDoctor) {
  return String(doctor.presenceStatus ?? "OFFLINE").toUpperCase() === "OFFLINE";
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
  const [specialties, setSpecialties] = useState<AdminSpecialty[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [specialtiesError, setSpecialtiesError] = useState("");
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

  const loadSpecialties = useCallback(async () => {
    setSpecialtiesError("");
    setIsLoadingSpecialties(true);

    try {
      const response = await doctorApplicationsApiService.listSpecialties();
      setSpecialties(
        response.data.filter((specialty) => specialty.isActive !== false),
      );
    } catch (error) {
      setSpecialtiesError(getApiErrorMessage(error));
      setSpecialties([]);
    } finally {
      setIsLoadingSpecialties(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSpecialties();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSpecialties]);

  const openBookingFlow = async (doctor: PublicDoctor) => {
    if (isDoctorOffline(doctor)) {
      setErrorMessage("This doctor is currently offline and cannot be booked.");
      return;
    }

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
  const hasActiveFilters = Boolean(query || specialization || selectedDoctorId);

  const clearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setSpecialization("");
    setSelectedDoctorId("");
    setPage(1);
    router.replace("/dashboard/patient/doctors");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <PatientMobileNav active="doctors" />
      <PatientSidebar active="doctors" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]"><div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
        <section className="relative mb-6 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(118deg,#001b5e_0%,#073978_58%,#08758a_100%)] px-5 pb-24 pt-6 text-white shadow-[0_18px_50px_rgba(0,27,94,0.18)] sm:px-7 sm:pb-24 sm:pt-8 lg:px-9">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#54e6ad]/15 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 right-[22%] h-32 w-32 rounded-full border border-white/10" />
          <div className="relative max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#9ff4ce]">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Verified care network
            </span>
            <h1 className="max-w-xl text-2xl font-bold leading-tight tracking-[-0.025em] sm:text-[30px]">
              Find a doctor who fits your care needs
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/75 sm:text-sm">
              Explore trusted specialists, review their experience, and book a convenient consultation from one place.
            </p>
          </div>

          <div className="absolute bottom-5 right-6 hidden items-center gap-6 text-white/85 lg:flex">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><span className="material-symbols-outlined text-[19px] text-[#6ee7b7]">shield_with_heart</span></span>
              <div><p className="text-xs font-semibold text-white">Verified specialists</p><p className="text-[10px] text-white/55">Care you can trust</p></div>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><span className="material-symbols-outlined text-[19px] text-[#6ee7b7]">calendar_month</span></span>
              <div><p className="text-xs font-semibold text-white">Simple booking</p><p className="text-[10px] text-white/55">Choose an open time</p></div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-[4.6rem] mb-7 rounded-[1.35rem] border border-white/80 bg-white/95 p-3 shadow-[0_14px_38px_rgba(15,35,70,0.13)] backdrop-blur sm:p-4">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_260px_auto]">
            <label className="relative block">
              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#64748b]">search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedDoctorId("");
                }}
                placeholder="Search by name, username, or specialization"
                className="h-12 w-full rounded-xl border border-[#d8e1eb] bg-[#f8fafc] pl-11 pr-4 text-[13px] text-[#17223b] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0aa4b4] focus:bg-white focus:ring-4 focus:ring-[#0aa4b4]/10"
              />
            </label>

            <label className="relative block">
              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-[#64748b]">stethoscope</span>
              <select
                className="h-12 w-full appearance-none rounded-xl border border-[#d8e1eb] bg-[#f8fafc] pl-11 pr-9 text-[13px] text-[#334155] outline-none transition focus:border-[#0aa4b4] focus:bg-white focus:ring-4 focus:ring-[#0aa4b4]/10"
                value={specialization}
                onChange={(event) => {
                  setSpecialization(event.target.value);
                  setSelectedDoctorId("");
                  setPage(1);
                }}
                aria-label="Filter by specialization"
                disabled={isLoadingSpecialties}
              >
                <option value="">All specializations</option>
                {isLoadingSpecialties ? <option value="">Loading specialties...</option> : null}
                {specialties.map((option) => (
                  <option key={option.id} value={option.name}>{option.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#64748b]">expand_more</span>
            </label>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="h-12 rounded-xl border border-[#d8e1eb] px-4 text-xs font-semibold text-[#475569] transition hover:border-[#b8c6d6] hover:bg-[#f8fafc] disabled:cursor-default disabled:opacity-40 md:min-w-[88px]"
            >
              Clear
            </button>
          </div>
          {specialtiesError ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
              <span>{specialtiesError}</span>
              <button
                type="button"
                onClick={() => void loadSpecialties()}
                className="font-semibold text-[#001b5e] underline"
              >
                Try again
              </button>
            </div>
          ) : null}
        </section>

        <section className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0a8f66]">Doctor directory</p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.015em] text-[#001b5e]">Meet your care team</h2>
          </div>
          <span className="rounded-full border border-[#dbe5ef] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#475569] shadow-sm">
            {directory.meta.total} doctor{directory.meta.total === 1 ? "" : "s"}
          </span>
        </section>

        {errorMessage ? (
          <section role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => void loadDoctors()} className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white">Try Again</button>
          </section>
        ) : null}

        {isLoading ? (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Loading doctors">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-[1.5rem] border border-[#e2e8f0] bg-white p-5">
                <div className="mb-5 flex gap-4"><div className="h-20 w-20 rounded-2xl bg-[#e2e8f0]" /><div className="flex-1 pt-2"><div className="mb-3 h-4 w-1/2 rounded bg-[#e2e8f0]" /><div className="h-3 w-1/3 rounded bg-[#f1f5f9]" /></div></div>
                <div className="mb-2 h-3 w-full rounded bg-[#f1f5f9]" />
                <div className="h-3 w-3/4 rounded bg-[#f1f5f9]" />
              </div>
            ))}
          </section>
        ) : null}

        {!isLoading && !errorMessage ? (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {directory.data.map((doctor) => {
              const doctorName = getDoctorName(doctor);
              const presenceStatus = getPresenceStatusMeta(doctor.presenceStatus);
              const isOffline = isDoctorOffline(doctor);

              return (
                <article key={doctor.id} className="group overflow-hidden rounded-[1.6rem] border border-[#dfe7f0] bg-white shadow-[0_10px_32px_rgba(20,43,77,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#bfd3e5] hover:shadow-[0_20px_42px_rgba(20,43,77,0.11)]">
                  <div className="relative border-b border-[#e8eef5] bg-[linear-gradient(135deg,#f6fbff_0%,#effaf6_100%)] p-4 sm:p-5">
                    <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/80 px-2.5 py-1 text-[10px] font-bold shadow-sm ${presenceStatus.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${presenceStatus.dotClassName}`} />
                        {presenceStatus.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 pr-20 sm:gap-4">
                      <div className="relative grid h-[74px] w-[74px] shrink-0 place-items-center rounded-[1.35rem] border-4 border-white bg-[linear-gradient(145deg,#dff8ef,#dceaff)] text-lg font-extrabold text-[#005b73] shadow-[0_8px_20px_rgba(0,79,105,0.12)] sm:h-20 sm:w-20">
                        {getDoctorInitials(doctor)}
                        <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#16b36c] text-white shadow-sm" title="Verified doctor">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0a8f66]">Verified specialist</p>
                        <h3 className="truncate text-[17px] font-bold tracking-[-0.015em] text-[#001b5e] sm:text-lg">{doctorName}</h3>
                        <p className="mt-1 truncate text-[11px] text-[#64748b]">@{doctor.user.username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-[174px] flex-col p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {doctor.specializations.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-2.5 py-1.5 text-[10px] font-bold text-[#244b91]">
                          <span className="material-symbols-outlined text-[14px]">medical_services</span>
                          {formatSpecialization(item)}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f8fa] px-2.5 py-1.5 text-[10px] font-semibold text-[#64748b]">
                        <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                        {(doctor.yearsOfExperience ?? 0) > 0
                          ? `${doctor.yearsOfExperience} ${doctor.yearsOfExperience === 1 ? "year" : "years"} experience`
                          : "Verified provider"}
                      </span>
                    </div>

                    <p className="line-clamp-2 text-[12px] leading-5 text-[#52627a] sm:text-[13px]">
                      {doctor.bio || "Committed to providing attentive, patient-focused care and helpful medical guidance."}
                    </p>

                    <div className="mt-auto grid grid-cols-1 gap-2 pt-5 sm:grid-cols-2">
                      <Link href={`/dashboard/patient/doctors/${doctor.id}`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#cdd9e6] bg-white px-3 text-xs font-bold text-[#001b5e] transition hover:border-[#8da9c4] hover:bg-[#f8fbff]" aria-label={`View profile for ${doctorName}`}>
                        View profile
                        <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => void openBookingFlow(doctor)}
                        disabled={isOffline}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#16b36c] px-3 text-xs font-bold text-white shadow-[0_7px_16px_rgba(22,179,108,0.2)] transition hover:bg-[#118d57] disabled:cursor-not-allowed disabled:bg-[#d9e0e8] disabled:text-[#718096] disabled:shadow-none"
                        title={isOffline ? "This doctor is currently offline" : "Book an appointment"}
                      >
                        <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                        {isOffline ? "Currently offline" : "Book appointment"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {!isLoading && !errorMessage && directory.data.length === 0 ? (
          <section className="mt-6 rounded-[1.5rem] border border-dashed border-[#b9cadb] bg-white px-5 py-10 text-center shadow-sm">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eef6fb] text-[#08758a]"><span className="material-symbols-outlined">person_search</span></span>
            <h4 className="mt-4 text-base font-bold text-[#001b5e]">No doctors match your search</h4>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-[#64748b]">Try a different name or choose another medical specialty.</p>
            <button type="button" onClick={clearFilters} className="mt-4 rounded-xl bg-[#001b5e] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#082d70]">Clear filters</button>
          </section>
        ) : null}

        {!isLoading && !errorMessage && directory.meta.totalPages > 1 ? (
          <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Doctor directory pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <span className="text-xs text-[#475569]">Page {directory.meta.page} of {directory.meta.totalPages}</span>
            <button type="button" disabled={page >= directory.meta.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </nav>
        ) : null}
      </div></main>

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
    <Suspense fallback={<div className="min-h-screen bg-[#f4f7fb]" />}>
      <BrowseDoctorsContent />
    </Suspense>
  );
}
