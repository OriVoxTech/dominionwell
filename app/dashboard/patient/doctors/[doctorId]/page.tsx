"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientSidebar from "@/components/patient-sidebar";
import {
  patientApiService,
  getApiErrorMessage,
  patientDoctorsApiService,
  type DoctorReview,
  type DoctorReviewsResponse,
  type PublicDoctor,
} from "@/lib/api";

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

function getReviewPatientName(review: DoctorReview) {
  const user = review.patient?.user;
  const name = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return name || user?.username || "Patient";
}

function formatReviewDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

function StarRating({ rating }: { rating: number }) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span className="inline-flex items-center gap-0.5 text-[#f59e0b]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="material-symbols-outlined text-[18px]">
          {star <= roundedRating ? "star" : "star_outline"}
        </span>
      ))}
    </span>
  );
}

export default function DoctorProfilePage() {
  const params = useParams<{ doctorId: string }>();
  const doctorId = typeof params.doctorId === "string" ? params.doctorId : "";
  const [doctor, setDoctor] = useState<PublicDoctor | null>(null);
  const [reviews, setReviews] = useState<DoctorReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewsError, setReviewsError] = useState("");

  const loadDoctor = useCallback(async () => {
    if (!doctorId) {
      setErrorMessage("A valid doctor profile was not selected.");
      setIsLoading(false);
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await patientDoctorsApiService.getById(doctorId);
      setDoctor(response.data);
    } catch (error) {
      setDoctor(null);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  const loadReviews = useCallback(async () => {
    if (!doctorId) return;

    setReviewsError("");
    setIsLoadingReviews(true);

    try {
      const response = await patientApiService.listDoctorReviews(doctorId);
      setReviews(response.data);
    } catch (error) {
      setReviews(null);
      setReviewsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingReviews(false);
    }
  }, [doctorId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctor();
      void loadReviews();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctor, loadReviews]);

  const doctorName = doctor ? getDoctorName(doctor) : "Doctor Profile";
  const presenceStatus = doctor ? getPresenceStatusMeta(doctor.presenceStatus) : null;
  const averageRating = reviews?.satisfaction.averageRating ?? null;
  const reviewCount = reviews?.satisfaction.reviewCount ?? 0;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <PatientMobileNav active="doctors" />
      <PatientSidebar active="doctors" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]"><div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
          <header className="mb-6">
            <div className="mb-3 flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard/patient/doctors" aria-label="Back to doctors" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-white">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b9459]">Consultation profile</p><h1 className="mt-1 text-xl font-bold text-[#001b5e] sm:text-2xl">Doctor profile</h1></div>
            </div>
            <p className="text-xs text-[#475569] sm:text-[13px]">Review this verified doctor’s professional profile.</p>
          </header>

          {isLoading ? (
            <section className="animate-pulse rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6" aria-label="Loading doctor profile">
              <div className="mb-5 h-20 w-20 rounded-full bg-[#e2e8f0]" />
              <div className="mb-3 h-5 w-1/3 rounded bg-[#e2e8f0]" />
              <div className="mb-6 h-4 w-1/4 rounded bg-[#f1f5f9]" />
              <div className="h-28 rounded-xl bg-[#f1f5f9]" />
            </section>
          ) : null}

          {!isLoading && errorMessage ? (
            <section role="alert" className="rounded-2xl border border-[#fecaca] bg-white p-6 text-center shadow-sm">
              <span className="material-symbols-outlined text-4xl text-[#dc2626]">error</span>
              <h2 className="mt-2 text-lg font-semibold text-[#001b5e]">Doctor profile unavailable</h2>
              <p className="mt-2 text-sm text-[#64748b]">{errorMessage}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/dashboard/patient/doctors" className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">Back to Doctors</Link>
                <button type="button" onClick={() => void loadDoctor()} className="rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]">Try Again</button>
              </div>
            </section>
          ) : null}

          {!isLoading && !errorMessage && doctor ? (
            <section className="rounded-[1.75rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_12px_36px_rgba(30,52,83,0.07)] sm:p-7">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#e7f4ff] text-xl font-bold text-[#155e9b] shadow-sm">
                    {getDoctorInitials(doctor)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[#001b5e] sm:text-xl">{doctorName}</h2>
                    <p className="mt-1 text-sm text-[#64748b]">@{doctor.user.username}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#15803d]">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Verified Doctor
                  </span>
                  {presenceStatus ? (
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${presenceStatus.className}`}>
                      <span className={`h-2 w-2 rounded-full ${presenceStatus.dotClassName}`} />
                      {presenceStatus.label}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Specializations</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {doctor.specializations.map((item) => (
                      <span key={item} className="rounded-md bg-[#eef2ff] px-2 py-1 text-xs font-medium text-[#3730a3]">{formatSpecialization(item)}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Patient Rating</p>
                  <div className="mt-3 flex items-center gap-2">
                    <StarRating rating={averageRating ?? 0} />
                    <span className="text-sm font-semibold text-[#001b5e]">
                      {averageRating ? averageRating.toFixed(1) : "No rating yet"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#64748b]">{reviewCount} review(s)</p>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-[#e7ecf2] bg-[#fafcff] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">Verification</p>
                <p className="mt-3 text-sm font-semibold text-[#001b5e]">
                  {doctor.verifiedAt ? `Verified ${new Date(doctor.verifiedAt).toLocaleDateString()}` : "Verification pending"}
                </p>
                <p className="mt-1 text-xs text-[#64748b]">Member since {new Date(doctor.user.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="mb-5 rounded-2xl border border-[#d7efe2] bg-[#f4fbf7] p-4">
                <h3 className="text-sm font-semibold text-[#001b5e]">About</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{doctor.bio || "This doctor has not added a biography yet."}</p>
              </div>

              <div className="mb-5 rounded-2xl border border-[#e7ecf2] bg-white p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#001b5e]">Patient Reviews</h3>
                    <p className="mt-1 text-xs text-[#64748b]">
                      {reviewCount} review(s) from completed consultations.
                    </p>
                  </div>
                  {averageRating ? <StarRating rating={averageRating} /> : null}
                </div>

                {isLoadingReviews ? (
                  <p className="text-sm text-[#64748b]">Loading reviews...</p>
                ) : null}

                {!isLoadingReviews && reviewsError ? (
                  <p role="alert" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                    {reviewsError}
                  </p>
                ) : null}

                {!isLoadingReviews && !reviewsError && reviews?.data.length === 0 ? (
                  <p className="text-sm text-[#64748b]">No reviews yet.</p>
                ) : null}

                {!isLoadingReviews && !reviewsError && reviews?.data.length ? (
                  <div className="space-y-3">
                    {reviews.data.map((review) => (
                      <article key={review.id} className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[#001b5e]">{getReviewPatientName(review)}</p>
                            {formatReviewDate(review.createdAt) ? (
                              <p className="text-xs text-[#64748b]">{formatReviewDate(review.createdAt)}</p>
                            ) : null}
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm leading-6 text-[#475569]">{review.comment || "No comment provided."}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end">
                <Link href="/dashboard/patient/doctors" className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">Back to Doctors</Link>
              </div>
            </section>
          ) : null}
      </div></main>
    </div>
  );
}
