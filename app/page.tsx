"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignInModal from "../components/sign-in-modal";
import {
  getApiErrorMessage,
  patientDoctorsApiService,
  type PublicDoctor,
} from "@/lib/api";
import { isPatientSessionActive } from "@/lib/patient-session";
import { usePatientSessionActive } from "@/components/use-patient-session-active";

const FEATURED_DOCTOR_COUNT = 4;

function getDoctorName(doctor: PublicDoctor) {
  const name = [doctor.user.firstName, doctor.user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return name ? `Dr. ${name}` : `Dr. ${doctor.user.username}`;
}

function getDoctorSearchQuery(doctor: PublicDoctor) {
  const name = [doctor.user.firstName, doctor.user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return name || doctor.user.username;
}

function getDoctorInitials(doctor: PublicDoctor) {
  return (
    [doctor.user.firstName, doctor.user.lastName]
      .map((part) => part.trim().charAt(0).toUpperCase())
      .filter(Boolean)
      .join("") || "DR"
  );
}

function formatSpecialization(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function pickRandomDoctors(doctors: PublicDoctor[]) {
  const shuffledDoctors = [...doctors];

  for (let index = shuffledDoctors.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledDoctors[index], shuffledDoctors[randomIndex]] = [
      shuffledDoctors[randomIndex],
      shuffledDoctors[index],
    ];
  }

  return shuffledDoctors.slice(0, FEATURED_DOCTOR_COUNT);
}

export default function Home() {
  const router = useRouter();
  const hasPatientSession = usePatientSessionActive();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [featuredDoctors, setFeaturedDoctors] = useState<PublicDoctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState("");

  useEffect(() => {
    if (hasPatientSession) {
      router.replace("/dashboard/patient");
    }
  }, [hasPatientSession, router]);

  useEffect(() => {
    if (hasPatientSession) {
      return;
    }

    let shouldUpdate = true;

    const loadFeaturedDoctors = async () => {
      try {
        const response = await patientDoctorsApiService.list({
          page: 1,
          limit: 100,
        });

        if (shouldUpdate) {
          setFeaturedDoctors(pickRandomDoctors(response.data.data));
        }
      } catch (error) {
        if (shouldUpdate) {
          setDoctorsError(getApiErrorMessage(error));
        }
      } finally {
        if (shouldUpdate) {
          setIsLoadingDoctors(false);
        }
      }
    };

    void loadFeaturedDoctors();

    return () => {
      shouldUpdate = false;
    };
  }, [hasPatientSession]);

  const isPatientLoggedIn = () => {
    if (typeof window === "undefined") {
      return false;
    }

    return isPatientSessionActive();
  };

  const requirePatientLogin = (nextAction: () => void) => {
    if (isPatientLoggedIn()) {
      nextAction();
      return;
    }

    setShowLoginModal(true);
  };

  const handleSearch = () => {
    requirePatientLogin(() => {
      const query = searchQuery.trim();
      const route = query
        ? `/dashboard/patient/doctors?query=${encodeURIComponent(query)}`
        : "/dashboard/patient/doctors";
      router.push(route);
    });
  };

  const getFilteredDoctorRoute = (doctor: PublicDoctor) => {
    const params = new URLSearchParams({
      doctorId: doctor.id,
      query: getDoctorSearchQuery(doctor),
    });

    return `/dashboard/patient/doctors?${params.toString()}`;
  };

  const handleBookConsultation = (doctor: PublicDoctor) => {
    const doctorPath = getFilteredDoctorRoute(doctor);

    if (!isPatientLoggedIn()) {
      router.push(`/login/patient?next=${encodeURIComponent(doctorPath)}`);
      return;
    }

    router.push(doctorPath);
  };

  if (hasPatientSession) {
    return <div className="min-h-screen bg-[#f7f9fc]" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-3 backdrop-blur sm:px-4 md:px-10">
        <div className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-7 w-auto sm:h-8" src="/logo.png" width={128} height={32} />
          <span className="text-lg font-bold text-[#001b5e] sm:text-1xl">DominionWell+</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a className="border-b-2 border-[#16b46f] pb-1 text-sm font-bold text-[#16b46f]" href="#">
            Find Doctors
          </a>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/services">
            Services
          </Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/about">
            About
          </Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/contact">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignInModal className="text-xs text-[#45464e] hover:text-[#16b46f] sm:text-sm" />
          <SignInModal
            open={showLoginModal}
            onOpenChange={setShowLoginModal}
            hideTrigger
          />
          <Link href="/register" className="rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm">
            Register
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-pattern relative flex min-h-[64vh] items-center overflow-hidden sm:min-h-[70vh]">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#16b46f] px-3 py-1 text-white">
                <span className="material-symbols-outlined text-[10px]">verified</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider">Trusted by 500+ Clinics</span>
              </div>

              <h1 className="mb-3 text-2xl font-bold tracking-tight text-[#001b5e] sm:mb-4 sm:text-4xl md:text-5xl">
                Healthcare Without Boundaries
              </h1>
              <p className="mb-6 max-w-xl text-base leading-7 text-[#45464e] sm:mb-8 sm:text-lg sm:leading-8">
                Experience a new era of medical care. DominionWell+ connects you with world-class specialists through our secure,
                HIPAA-compliant SaaS platform designed for modern life.
              </p>

              <div className="glass-card flex max-w-2xl flex-col gap-2 rounded-xl p-2 shadow-lg md:flex-row">
                <div className="flex flex-1 items-center gap-3 px-2 py-2">
                  <span className="material-symbols-outlined text-[#76767f]">search</span>
                  <input
                    className="w-full border-none bg-transparent text-[#191c1e] placeholder:text-[#c6c6cf] focus:outline-none"
                    placeholder="Specialty or Doctor Name"
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <button
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#16b46f] px-6 py-3 text-sm font-semibold text-white sm:px-8"
                  type="button"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
                <span className="text-xs text-[#45464e] sm:text-sm">Popular:</span>
                <span className="cursor-pointer rounded-full border border-[#c6c6cf] bg-[#eceef1] px-4 py-1.5 text-xs font-semibold text-[#191c1e]">Gynecologist</span>
                <span className="cursor-pointer rounded-full border border-[#c6c6cf] bg-[#eceef1] px-4 py-1.5 text-xs font-semibold text-[#191c1e]">Pediatrician</span>
                <span className="cursor-pointer rounded-full border border-[#c6c6cf] bg-[#eceef1] px-4 py-1.5 text-xs font-semibold text-[#191c1e]">General Practitioner</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 right-10 hidden lg:block">
            <div className="glass-card max-w-xs rounded-xl p-4 shadow-md">
              <div className="mb-2 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16b46f]">
                  <span className="material-symbols-outlined text-[#001b5e]">video_call</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#001b5e]">Schedule Appointment</p>
                  <p className="text-xs text-[#45464e]">Instantly</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f2f4f7] py-10 sm:py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
              <h2 className="mb-3 text-2xl font-semibold text-[#001b5e] sm:mb-4 sm:text-3xl">How DominionWell+ Works</h2>
              <p className="text-sm text-[#45464e] sm:text-base">
                We&apos;ve simplified the journey from feeling unwell to receiving expert care. Your health, managed in three simple steps.
              </p>
            </div>

            <div className="bento-grid">
              <div className="glass-card col-span-12 flex flex-col items-start gap-3 rounded-2xl border border-[#c6c6cf] p-6 sm:gap-4 sm:p-8 md:col-span-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#001b5e]">
                  <span className="material-symbols-outlined text-[#16b46f]">search_check</span>
                </div>
                <h3 className="text-xl font-semibold text-[#001b5e] sm:text-2xl">Find a Provider</h3>
                <p className="text-sm text-[#45464e] sm:text-base">
                  Browse our curated network of board-certified specialists. Filter by rating, language, or availability.
                </p>
                <Link href="/login/patient" className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-[#16b46f]">
                  Browse Network <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              <div className="col-span-12 flex flex-col items-start gap-3 rounded-2xl bg-[#001b5e] p-6 shadow-xl sm:gap-4 sm:p-8 md:col-span-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#16b46f]">
                  <span className="material-symbols-outlined text-white">calendar_month</span>
                </div>
                <h3 className="text-xl font-semibold text-white sm:text-2xl">Instant Booking</h3>
                <p className="text-sm text-[#b9c5f1] sm:text-base">
                  Secure your slot in seconds. No more waiting on hold, choose a time that works for your schedule.
                </p>
                <Link href="/login/patient" className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-[#16b46f]">
                  View Availability <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              <div className="glass-card col-span-12 flex flex-col items-start gap-3 rounded-2xl border border-[#c6c6cf] p-6 sm:gap-4 sm:p-8 md:col-span-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#002126]">
                  <span className="material-symbols-outlined text-[#0aa4b4]">medical_information</span>
                </div>
                <h3 className="text-xl font-semibold text-[#001b5e] sm:text-2xl">Receive Care</h3>
                <p className="text-sm text-[#45464e] sm:text-base">
                  Consult via HD video or in-person. Access your digital records and prescriptions immediately after.
                </p>
                <Link href="/login/patient" className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-[#16b46f]">
                  Learn More <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
            <div className="mb-8 flex items-end justify-between gap-8 sm:mb-12">
              <div className="max-w-xl">
                <h2 className="mb-2 text-xl font-semibold text-[#001b5e] sm:text-2xl">Featured Specialists</h2>
                <p className="text-sm text-[#45464e] sm:text-base">
                  Meet our top-rated medical professionals who are setting new standards in clinical excellence and patient care.
                </p>
              </div>
              <Link href="/login/patient" className="hidden items-center gap-2 rounded-lg border-2 border-[#16b46f] px-6 py-2 text-sm font-medium text-[#16b46f] md:flex">
                View All Doctors
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {isLoadingDoctors
                ? Array.from({ length: FEATURED_DOCTOR_COUNT }, (_, index) => (
                    <div key={index} className="h-[390px] animate-pulse rounded-2xl border border-[#e2e8f0] bg-white">
                      <div className="h-64 bg-[#e2e8f0]" />
                      <div className="space-y-3 p-6">
                        <div className="h-5 w-2/3 rounded bg-[#e2e8f0]" />
                        <div className="h-4 w-1/2 rounded bg-[#f1f5f9]" />
                        <div className="h-11 rounded-lg bg-[#f1f5f9]" />
                      </div>
                    </div>
                  ))
                : featuredDoctors.map((doctor) => {
                    const doctorName = getDoctorName(doctor);
                    const specialization = doctor.specializations[0]
                      ? formatSpecialization(doctor.specializations[0])
                      : "Medical Specialist";

                    return (
                      <article key={doctor.id} className="group overflow-hidden rounded-2xl border border-[#c6c6cf] bg-white transition-all duration-300 hover:shadow-xl">
                        <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-[#001b5e] via-[#07327d] to-[#0aa4b4]">
                          <span className="text-6xl font-bold tracking-wide text-white/95 transition-transform duration-500 group-hover:scale-105">
                            {getDoctorInitials(doctor)}
                          </span>
                          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#16b46f] px-3 py-1 text-xs font-semibold text-white">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Verified
                          </div>
                        </div>
                        <div className="p-5 sm:p-6">
                          <h4 className="mb-1 truncate text-1xl font-semibold text-[#001b5e]">{doctorName}</h4>
                          <p className="mb-4 truncate text-sm text-[#45464e]">{specialization}</p>
                          <button
                            className="w-full rounded-lg bg-[#eceef1] py-3 text-sm font-medium text-[#001b5e]"
                            type="button"
                            onClick={() => handleBookConsultation(doctor)}
                          >
                            Book Consultation
                          </button>
                        </div>
                      </article>
                    );
                  })}
            </div>

            {!isLoadingDoctors && doctorsError ? (
              <p role="alert" className="mt-6 text-center text-sm text-[#b91c1c]">
                {doctorsError}
              </p>
            ) : null}

            {!isLoadingDoctors && !doctorsError && featuredDoctors.length === 0 ? (
              <p className="mt-6 text-center text-sm text-[#45464e]">No doctors are available right now.</p>
            ) : null}
          </div>
        </section>

        <section className="px-4 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1440px]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#001b5e] p-7 text-center sm:p-12 md:p-20">
              <div className="relative z-10 mx-auto max-w-2xl">
                <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:mb-6 sm:text-4xl md:text-4xl">Ready to prioritize your health?</h2>
                <p className="mb-8 text-sm text-[#7784ac] sm:mb-10 sm:text-lg">
                  Join thousands of patients who have already transformed their healthcare experience with DominionWell+.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/register" className="w-full rounded-xl bg-[#16b46f] px-10 py-4 text-center text-lg font-semibold text-white sm:w-auto">
                    Get Started for Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#c6c6cf] bg-[#001b5e] py-14 text-white sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 md:px-10">
          <div className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl sm:p-7 md:flex md:items-center md:justify-between md:gap-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#74fcad]">Care network</p>
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Patients need excellent doctors. Excellent doctors need better tools.</h3>
              <p className="mt-3 text-sm leading-6 text-[#d8e2ff]">
                Join DominionWell+ as a verified provider and offer secure virtual care to patients who need timely access.
              </p>
            </div>
            <Link
              href="/join-doctor"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16b46f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#149660] md:mt-0 md:w-auto"
            >
              Join as a Doctor
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-6 flex items-center gap-2">
                <Image alt="DominionWell Logo" className="h-6 w-auto" src="/logo.png" width={96} height={24} />
                <span className="text-m font-bold text-white">DominionWell+</span>
              </div>
              <p className="text-sm leading-6 text-[#d8e2ff]">
                Redefining clinical precision and patient-centered healthcare for patients, doctors, and care teams.
              </p>
              <div className="mt-5 flex gap-3">
                <a className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[#d8e2ff] hover:bg-[#16b46f] hover:text-white" href="#" aria-label="DominionWell web">
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </a>
                <a className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[#d8e2ff] hover:bg-[#16b46f] hover:text-white" href="#" aria-label="DominionWell community">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </a>
                <a className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[#d8e2ff] hover:bg-[#16b46f] hover:text-white" href="#" aria-label="DominionWell updates">
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                </a>
              </div>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-bold text-white">Platform</h5>
              <ul className="space-y-3 text-sm text-[#d8e2ff]">
                <li><a className="hover:text-[#74fcad]" href="#">Find Doctors</a></li>
                <li><Link className="hover:text-[#74fcad]" href="/services">Services</Link></li>
                <li><Link className="hover:text-[#74fcad]" href="/register">Patient Registration</Link></li>
                <li><Link className="hover:text-[#74fcad]" href="/login/patient">Patient Login</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-bold text-white">Company</h5>
              <ul className="space-y-3 text-sm text-[#d8e2ff]">
                <li><Link className="hover:text-[#74fcad]" href="/about">About Us</Link></li>
                <li><Link className="hover:text-[#74fcad]" href="/contact">Contact</Link></li>
                <li><Link className="hover:text-[#74fcad]" href="/join-doctor">Join as a Doctor</Link></li>
                <li><Link className="hover:text-[#74fcad]" href="/login/doctor">Doctor Login</Link></li>
                <li><Link className="hover:text-[#74fcad]" href="/admin/login">Admin Portal</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 text-sm font-bold text-white">Stay in the loop</h5>
              <p className="mb-4 text-sm leading-6 text-[#d8e2ff]">Get health tips, care updates, and product announcements.</p>
              <div className="flex gap-2 rounded-xl bg-white/10 p-1">
                <input className="min-w-0 flex-1 rounded-lg border border-transparent bg-white px-3 py-2 text-sm text-[#001b5e] outline-none placeholder:text-[#64748b]" placeholder="Your email" type="email" />
                <button className="rounded-lg bg-[#16b46f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#149660]" type="button">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <p className="text-xs text-[#b8c7ee]">© 2026 DominionWell+. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-[#b8c7ee]">
              <a className="hover:text-[#74fcad]" href="#">Privacy Policy</a>
              <a className="hover:text-[#74fcad]" href="#">Terms of Use</a>
              <a className="hover:text-[#74fcad]" href="#">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
