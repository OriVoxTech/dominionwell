"use client";

import { FormEvent, useEffect, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientPageHeader from "@/components/patient-page-header";
import PatientSidebar from "@/components/patient-sidebar";
import {
    getApiErrorMessage,
    patientApiService,
    type PatientAppointment,
} from "@/lib/api";

type AppointmentsTab = "upcoming" | "history";

function asRecord(value: unknown) {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getStringValue(record: Record<string, unknown> | null, keys: string[], fallback = "-") {
    if (!record) return fallback;

    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value;
        if (typeof value === "number") return String(value);
    }

    return fallback;
}

function getNestedStringValue(record: Record<string, unknown> | null, path: string[], fallback = "-") {
    let current: unknown = record;

    for (const key of path) {
        const currentRecord = asRecord(current);
        if (!currentRecord) return fallback;
        current = currentRecord[key];
    }

    return typeof current === "string" && current.trim() ? current : fallback;
}

function formatAppointmentDateTime(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatAppointmentDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
}

function getAppointmentStart(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const slot = asRecord(record?.slot);

    return (
        getStringValue(record, ["startsAt", "startTime", "appointmentAt", "scheduledAt"], "") ||
        getStringValue(slot, ["startsAt", "startTime"], "")
    );
}

function getAppointmentEnd(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const slot = asRecord(record?.slot);

    return (
        getStringValue(record, ["endsAt", "endTime"], "") ||
        getStringValue(slot, ["endsAt", "endTime"], "")
    );
}

function getAppointmentStartDate(appointment: PatientAppointment) {
    const startsAt = getAppointmentStart(appointment);
    if (!startsAt) return null;

    const date = new Date(startsAt);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getNormalizedAppointmentStatus(appointment: PatientAppointment) {
    return getServerAppointmentStatus(appointment).trim().toUpperCase();
}

function getAppointmentStatusClass(status: string) {
    const normalizedStatus = status.trim().toUpperCase();

    if (normalizedStatus === "BOOKED" || normalizedStatus === "VERIFIED") {
        return "bg-[#16b46f]/15 text-[#16b46f]";
    }

    if (normalizedStatus === "COMPLETED") {
        return "bg-[#0aa4b4]/15 text-[#0369a1]";
    }

    if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
        return "bg-[#ef4444]/12 text-[#dc2626]";
    }

    return "bg-[#64748b]/15 text-[#475569]";
}

function isUpcomingAppointment(appointment: PatientAppointment, now = new Date()) {
    const startsAt = getAppointmentStartDate(appointment);
    return getNormalizedAppointmentStatus(appointment) === "BOOKED" && Boolean(startsAt && startsAt > now);
}

function isHistoryAppointment(appointment: PatientAppointment, now = new Date()) {
    const status = getNormalizedAppointmentStatus(appointment);
    const startsAt = getAppointmentStartDate(appointment);

    return (
        status === "COMPLETED" ||
        status === "CANCELLED" ||
        status === "CANCELED" ||
        Boolean(startsAt && startsAt <= now)
    );
}

function getAppointmentHistoryNote(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const cancellationReason = getStringValue(record, ["cancellationReason"], "");
    const completedAt = getStringValue(record, ["completedAt"], "");
    const meetingStatus = getStringValue(record, ["meetingStatus"], "");

    if (cancellationReason) return cancellationReason;
    if (completedAt) return `Completed at ${formatAppointmentDateTime(completedAt)}`;
    if (meetingStatus && meetingStatus !== "-") return `Meeting status: ${meetingStatus}`;

    return "No notes available.";
}

function getPatientAppointmentDoctor(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const doctor = asRecord(record?.doctor);
    const doctorUser = asRecord(doctor?.user);
    const firstName = getStringValue(doctorUser, ["firstName"], "");
    const lastName = getStringValue(doctorUser, ["lastName"], "");
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return fullName
        ? `Dr. ${fullName}`
        : getNestedStringValue(record, ["doctor", "user", "username"], "Doctor");
}

function getPatientAppointmentDoctorId(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const doctor = asRecord(record?.doctor);

    return getStringValue(doctor, ["id"], "") || getStringValue(record, ["doctorId"], "");
}

function getPatientAppointmentSpecialty(appointment: PatientAppointment) {
    const doctor = asRecord(asRecord(appointment)?.doctor);
    const specializations = doctor?.specializations;

    if (Array.isArray(specializations) && typeof specializations[0] === "string") {
        return specializations[0].toLowerCase().replaceAll("_", " ");
    }

    return getStringValue(asRecord(appointment), ["specialization", "specialty"], "Medical specialist");
}

function getPatientAppointmentDate(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const startsAt = getAppointmentStart(appointment);

    return startsAt ? formatAppointmentDate(startsAt) : getStringValue(record, ["date"], "-");
}

function getPatientAppointmentTime(appointment: PatientAppointment) {
    const record = asRecord(appointment);
    const startsAt = getAppointmentStart(appointment);
    const endsAt = getAppointmentEnd(appointment);

    if (startsAt && endsAt) {
        return `${new Date(startsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} - ${new Date(endsAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    }

    return getStringValue(record, ["timeSlot", "time"], "-");
}

function getServerAppointmentStatus(appointment: PatientAppointment) {
    return appointment.status ?? getStringValue(asRecord(appointment), ["appointmentStatus"], "Booked");
}

export default function PatientAppointmentsPage() {
    const [activeTab, setActiveTab] = useState<AppointmentsTab>("upcoming");
    const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([]);
    const [appointmentsMeta, setAppointmentsMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
    const [isLoadingPatientAppointments, setIsLoadingPatientAppointments] = useState(true);
    const [appointmentsError, setAppointmentsError] = useState("");
    const [reviewAppointment, setReviewAppointment] = useState<PatientAppointment | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        const loadPatientAppointments = async () => {
            setAppointmentsError("");
            setIsLoadingPatientAppointments(true);

            try {
                const response = await patientApiService.listAppointments({ page: 1, limit: 20 });
                if (isCancelled) return;

                setPatientAppointments(response.data.data);
                setAppointmentsMeta(response.data.meta);
            } catch (error) {
                if (!isCancelled) {
                    setAppointmentsError(getApiErrorMessage(error));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingPatientAppointments(false);
                }
            }
        };

        void loadPatientAppointments();
        window.addEventListener("dw-appointments-updated", loadPatientAppointments);

        return () => {
            isCancelled = true;
            window.removeEventListener("dw-appointments-updated", loadPatientAppointments);
        };
    }, []);

    const now = new Date();
    const upcomingAppointments = patientAppointments
        .filter((appointment) => isUpcomingAppointment(appointment, now))
        .sort((first, second) =>
            (getAppointmentStartDate(first)?.getTime() ?? 0) -
            (getAppointmentStartDate(second)?.getTime() ?? 0),
        );
    const historyAppointments = patientAppointments
        .filter((appointment) => isHistoryAppointment(appointment, now))
        .sort((first, second) =>
            (getAppointmentStartDate(second)?.getTime() ?? 0) -
            (getAppointmentStartDate(first)?.getTime() ?? 0),
        );

    const openReviewModal = (appointment: PatientAppointment) => {
        setReviewAppointment(appointment);
        setReviewRating(0);
        setHoveredRating(0);
        setReviewComment("");
        setReviewMessage("");
    };

    const closeReviewModal = () => {
        if (isSubmittingReview) return;
        setReviewAppointment(null);
        setReviewMessage("");
    };

    const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!reviewAppointment) return;

        const doctorId = getPatientAppointmentDoctorId(reviewAppointment);

        if (!doctorId) {
            setReviewMessage("Doctor information is missing for this appointment.");
            return;
        }

        if (reviewRating < 1 || reviewRating > 5) {
            setReviewMessage("Please select a rating from 1 to 5 stars.");
            return;
        }

        if (!reviewComment.trim()) {
            setReviewMessage("Please add a short review comment.");
            return;
        }

        setReviewMessage("");
        setIsSubmittingReview(true);

        try {
            await patientApiService.createDoctorReview(doctorId, {
                appointmentId: reviewAppointment.id,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });

            setReviewMessage("Review submitted successfully.");
            window.setTimeout(() => {
                setReviewAppointment(null);
                setReviewMessage("");
            }, 700);
        } catch (error) {
            setReviewMessage(getApiErrorMessage(error));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
            <PatientMobileNav active="appointments" />
            <PatientSidebar active="appointments" />

            <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]"><div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
                <PatientPageHeader title="Appointments" description="Review upcoming consultations, completed sessions, and doctor notes." icon="calendar_month" />

                <section className="mb-5 rounded-2xl border border-[#e0e7ef] bg-white p-2 shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                activeTab === "upcoming"
                                    ? "bg-[#001b5e] text-white"
                                    : "bg-[#f8fafc] text-[#334155] hover:bg-[#eef2f7]"
                            }`}
                            onClick={() => setActiveTab("upcoming")}
                        >
                            Upcoming ({upcomingAppointments.length})
                        </button>
                        <button
                            type="button"
                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                activeTab === "history"
                                    ? "bg-[#001b5e] text-white"
                                    : "bg-[#f8fafc] text-[#334155] hover:bg-[#eef2f7]"
                            }`}
                            onClick={() => setActiveTab("history")}
                        >
                            History ({historyAppointments.length})
                        </button>
                    </div>
                </section>

                {activeTab === "upcoming" ? (
                    <section className="mb-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[#001b5e]">Upcoming Appointments</h3>
                            <p className="text-xs text-[#64748b]">
                                {isLoadingPatientAppointments ? "Loading..." : `${upcomingAppointments.length} appointment(s)`}
                            </p>
                        </div>

                        {appointmentsError ? (
                            <div role="alert" className="mb-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                                {appointmentsError}
                            </div>
                        ) : null}

                        {!isLoadingPatientAppointments && upcomingAppointments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                                You have no upcoming appointments yet. Book from the doctors page.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                                            <th className="rounded-l-lg px-3 py-3">Doctor</th>
                                            <th className="px-3 py-3">Specialty</th>
                                            <th className="px-3 py-3">Date</th>
                                            <th className="px-3 py-3">Time Slot</th>
                                            <th className="rounded-r-lg px-3 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcomingAppointments.map((appointment) => {
                                            const status = getServerAppointmentStatus(appointment);

                                            return (
                                            <tr key={`server-${appointment.id}`} className="border-b border-[#e2e8f0] last:border-b-0">
                                                <td className="px-3 py-3 font-medium text-[#001b5e]">{getPatientAppointmentDoctor(appointment)}</td>
                                                <td className="px-3 py-3 capitalize text-[#475569]">{getPatientAppointmentSpecialty(appointment)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[#475569]">{getPatientAppointmentDate(appointment)}</td>
                                                <td className="px-3 py-3 text-[#475569]">{getPatientAppointmentTime(appointment)}</td>
                                                <td className="px-3 py-3">
                                                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getAppointmentStatusClass(status)}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {appointmentsMeta.totalPages > 1 ? (
                                    <p className="mt-3 text-xs text-[#64748b]">
                                        Showing page {appointmentsMeta.page} of {appointmentsMeta.totalPages}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[#001b5e]">Consultation History</h3>
                            <p className="text-xs text-[#64748b]">{historyAppointments.length} records</p>
                        </div>

                        {historyAppointments.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                                No consultation history available yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                                            <th className="rounded-l-lg px-3 py-3">Doctor</th>
                                            <th className="px-3 py-3">Specialty</th>
                                            <th className="px-3 py-3">Status</th>
                                            <th className="px-3 py-3">Date</th>
                                            <th className="px-3 py-3">Notes</th>
                                            <th className="rounded-r-lg px-3 py-3">Review</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyAppointments.map((appointment) => {
                                            const status = getServerAppointmentStatus(appointment);

                                            return (
                                            <tr key={appointment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                                                <td className="px-3 py-3 font-medium text-[#001b5e]">{getPatientAppointmentDoctor(appointment)}</td>
                                                <td className="px-3 py-3 capitalize text-[#475569]">{getPatientAppointmentSpecialty(appointment)}</td>
                                                <td className="px-3 py-3">
                                                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getAppointmentStatusClass(status)}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3 text-[#475569]">
                                                    <div>{getPatientAppointmentDate(appointment)}</div>
                                                    <p className="mt-1 text-xs text-[#64748b]">{getPatientAppointmentTime(appointment)}</p>
                                                </td>
                                                <td className="min-w-[280px] px-3 py-3 text-[#475569]">{getAppointmentHistoryNote(appointment)}</td>
                                                <td className="px-3 py-3">
                                                    {getNormalizedAppointmentStatus(appointment) === "COMPLETED" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openReviewModal(appointment)}
                                                            className="rounded-lg border border-[#f59e0b]/40 px-3 py-1.5 text-xs font-semibold text-[#b45309] hover:bg-[#f59e0b]/10"
                                                        >
                                                            Rate Doctor
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-[#94a3b8]">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </div></main>

            {reviewAppointment ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 p-4">
                    <button
                        type="button"
                        aria-label="Close review form"
                        className="absolute inset-0"
                        onClick={closeReviewModal}
                    />
                    <form
                        onSubmit={handleSubmitReview}
                        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-[#001b5e]">Rate your consultation</h3>
                                <p className="mt-1 text-sm text-[#64748b]">
                                    Share your experience with {getPatientAppointmentDoctor(reviewAppointment)}.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                className="grid h-8 w-8 place-items-center rounded-full border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc]"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="mb-4 rounded-2xl border border-[#fde7b0] bg-[#fffbeb] p-4">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#8a5a09]">Your rating</p>
                                <span className="text-xs font-bold text-[#9a650b]">
                                    {reviewRating ? `${reviewRating} out of 5` : "Select a star"}
                                </span>
                            </div>
                            <div
                                className="flex items-center gap-1"
                                role="radiogroup"
                                aria-label="Doctor rating"
                                onMouseLeave={() => setHoveredRating(0)}
                            >
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        role="radio"
                                        aria-checked={reviewRating === rating}
                                        onClick={() => {
                                            setReviewRating(rating);
                                            setReviewMessage("");
                                        }}
                                        onMouseEnter={() => setHoveredRating(rating)}
                                        onFocus={() => setHoveredRating(rating)}
                                        onBlur={() => setHoveredRating(0)}
                                        className="grid h-11 w-11 place-items-center rounded-xl text-[#f59e0b] transition hover:scale-105 hover:bg-[#fef3c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:ring-offset-2"
                                        aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                                    >
                                        <span
                                            className="material-symbols-outlined pointer-events-none text-[32px] transition-transform"
                                            style={{
                                                fontVariationSettings: `'FILL' ${rating <= (hoveredRating || reviewRating) ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 32`,
                                            }}
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="block text-xs font-semibold uppercase tracking-wide text-[#64748b]" htmlFor="doctor-review-comment">
                            Review
                        </label>
                        <textarea
                            id="doctor-review-comment"
                            value={reviewComment}
                            onChange={(event) => setReviewComment(event.target.value)}
                            rows={4}
                            className="mt-2 w-full rounded-xl border border-[#cbd5e1] px-3 py-2 text-sm outline-none focus:border-[#0aa4b4]"
                            placeholder="Tell us how the consultation went..."
                            required
                        />

                        {reviewMessage ? (
                            <p className="mt-3 text-sm text-[#475569]">{reviewMessage}</p>
                        ) : null}

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingReview || reviewRating === 0 || !reviewComment.trim()}
                                className="rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                            >
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </div>
    );
}
