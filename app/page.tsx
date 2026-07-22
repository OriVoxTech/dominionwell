"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignInModal from "@/components/sign-in-modal";
import { usePatientSessionActive } from "@/components/use-patient-session-active";

const careBenefits = [
  {
    icon: "verified_user",
    title: "Verified specialists",
    description:
      "Choose from qualified doctors across the specialties that matter to you.",
  },
  {
    icon: "calendar_month",
    title: "Appointments that fit",
    description:
      "See real availability and book a consultation without phone calls or queues.",
  },
  {
    icon: "medical_information",
    title: "Care that stays connected",
    description:
      "Keep appointments, consultation reports, and care activity in one secure place.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Set up your patient profile and choose the right care plan.",
  },
  {
    number: "02",
    title: "Find your doctor",
    description: "Browse verified doctors by specialty, profile, and live availability.",
  },
  {
    number: "03",
    title: "Book and receive care",
    description: "Choose a convenient time and manage your consultation from one dashboard.",
  },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="DominionWell home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8fff2]">
        <Image src="/logo.png" alt="" width={26} height={26} className="h-6 w-auto" priority />
      </span>
      <span className="hidden text-lg font-extrabold tracking-[-0.04em] text-[#001b5e] min-[420px]:inline sm:text-xl">
        DominionWell<span className="text-[#16a968]">+</span>
      </span>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const hasPatientSession = usePatientSessionActive();

  useEffect(() => {
    if (hasPatientSession) {
      router.replace("/dashboard/patient");
    }
  }, [hasPatientSession, router]);

  if (hasPatientSession) {
    return <div className="min-h-screen bg-[#f8fafc]" />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcfe] text-[#17223b]">
      <header className="sticky top-0 z-50 border-b border-[#dbe3ee]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            <a className="text-sm font-semibold text-[#526078] transition hover:text-[#001b5e]" href="#how-it-works">
              How it works
            </a>
            <Link className="text-sm font-semibold text-[#526078] transition hover:text-[#001b5e]" href="/services">
              Services
            </Link>
            <Link className="text-sm font-semibold text-[#526078] transition hover:text-[#001b5e]" href="/about">
              About us
            </Link>
            <Link className="text-sm font-semibold text-[#526078] transition hover:text-[#001b5e]" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <SignInModal className="rounded-xl px-3 py-2 text-sm font-bold text-[#001b5e] transition hover:bg-[#f0f4f8] sm:px-4" />
            <Link
              href="/register"
              className="rounded-xl bg-[#001b5e] px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#092b76] sm:px-5"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden pb-14 pt-10 sm:pb-18 sm:pt-14 lg:pb-20 lg:pt-16">
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_47%,#effcf6_100%)]" />
          <div className="absolute -right-32 -top-32 -z-10 h-[32rem] w-[32rem] rounded-full bg-[#77e8af]/20 blur-3xl" />
          <div className="absolute -bottom-48 -left-36 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#4b76d1]/10 blur-3xl" />

          <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.03fr_.97fr] lg:gap-14 lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bfead2] bg-white/90 px-3.5 py-2 text-[11px] font-bold text-[#087b48] shadow-sm sm:text-xs">
                <span className="material-symbols-outlined text-[17px]">health_and_safety</span>
                Healthcare designed around your life
              </div>

              <h1 className="max-w-2xl text-[2rem] font-extrabold leading-[1.1] tracking-[-0.045em] text-[#001b5e] sm:text-[2.65rem] lg:text-[3.1rem]">
                Better care begins with the right connection.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#536178] sm:text-base">
                Meet trusted doctors, book a time that works, and manage your care from one simple, secure platform.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#16a968] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(22,169,104,0.24)] transition hover:-translate-y-0.5 hover:bg-[#118d57]"
                >
                  Create patient account
                  <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                </Link>
                <Link
                  href="/login/patient?next=%2Fdashboard%2Fpatient%2Fdoctors"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c9d4e3] bg-white px-6 py-3 text-sm font-bold text-[#001b5e] shadow-sm transition hover:border-[#9babbe] hover:bg-[#f7f9fc]"
                >
                  <span className="material-symbols-outlined text-[19px]">stethoscope</span>
                  Sign in to find a doctor
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-semibold text-[#526078] sm:text-sm">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-[#16a968]">check_circle</span>
                  Verified providers
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-[#16a968]">check_circle</span>
                  Simple online booking
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[19px] text-[#16a968]">check_circle</span>
                  Private patient dashboard
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] lg:mx-0 lg:ml-auto">
              <div className="absolute -left-5 top-14 h-24 w-24 rounded-[2rem] bg-[#16a968]/15 blur-sm" />
              <div className="absolute -right-5 bottom-12 h-32 w-32 rounded-full bg-[#164b9d]/15 blur-sm" />

              <div className="relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3.5 shadow-[0_30px_70px_rgba(0,27,94,0.14)] backdrop-blur-xl sm:p-5">
                <div className="rounded-[1.35rem] bg-[#001b5e] p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#74ecad]">Your care dashboard</p>
                      <h2 className="mt-2 text-xl font-bold sm:text-2xl">Healthcare, made clearer.</h2>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10">
                      <span className="material-symbols-outlined text-[#74ecad]">favorite</span>
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <span className="material-symbols-outlined text-[22px] text-[#74ecad]">calendar_today</span>
                      <p className="mt-4 text-xs text-[#c6d2f1]">Appointments</p>
                      <p className="mt-1 text-base font-bold">Easy to manage</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <span className="material-symbols-outlined text-[22px] text-[#74ecad]">clinical_notes</span>
                      <p className="mt-4 text-xs text-[#c6d2f1]">Care history</p>
                      <p className="mt-1 text-base font-bold">Always together</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#dce5ef] bg-[#f8fbff] p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e8fff2] text-[#0b8d55]">
                      <span className="material-symbols-outlined">video_camera_front</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#7a879b]">Next step</p>
                      <p className="text-sm font-bold leading-5 text-[#001b5e]">Choose a doctor and a convenient time</p>
                    </div>
                    <span className="material-symbols-outlined text-[#16a968]">arrow_forward</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#cfeedd] bg-[#effcf5] p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#0b8d55] shadow-sm">
                    <span className="material-symbols-outlined text-[21px]">verified</span>
                  </span>
                  <div>
                    <p className="text-xs text-[#5e7a6d]">Quality care</p>
                    <p className="text-sm font-bold text-[#001b5e]">Connect with verified specialists</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#e2e8f0] bg-white">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-px bg-[#e2e8f0] px-0 sm:grid-cols-4">
            {[
              ["person_search", "Find the right doctor"],
              ["schedule", "Choose a suitable time"],
              ["videocam", "Consult from anywhere"],
              ["shield_lock", "Manage care securely"],
            ].map(([icon, label]) => (
              <div key={label} className="flex min-h-24 items-center justify-center gap-3 bg-white px-4 py-5 text-center sm:text-left">
                <span className="material-symbols-outlined text-[23px] text-[#16a968]">{icon}</span>
                <span className="max-w-36 text-sm font-bold leading-5 text-[#33415c]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-[#f7f9fc] py-14 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0c945a]">Simple from the start</p>
              <h2 className="mt-3 text-xl font-extrabold tracking-[-0.035em] text-[#001b5e] sm:text-2xl">Care in three straightforward steps</h2>
              <p className="mt-4 text-base leading-7 text-[#607087]">
                Spend less time navigating healthcare and more time getting the support you need.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.number} className="relative rounded-[1.5rem] border border-[#dfe7f0] bg-white p-6 shadow-[0_12px_35px_rgba(0,27,94,0.05)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#16a968]">STEP {step.number}</span>
                    {index < steps.length - 1 ? (
                      <span className="material-symbols-outlined hidden text-[#b5c0cf] md:block">arrow_forward</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#16a968]">check_circle</span>
                    )}
                  </div>
                  <h3 className="mt-8 text-xl font-bold text-[#001b5e]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#607087]">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-[.88fr_1.12fr] lg:items-center lg:gap-20 lg:px-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0c945a]">Built for better care</p>
              <h2 className="mt-3 text-xl font-extrabold tracking-[-0.035em] text-[#001b5e] sm:text-2xl">
                Everything you need to feel confident about your next consultation.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#607087]">
                DominionWell+ brings discovery, scheduling, and ongoing care into a calm, easy-to-use experience.
              </p>
              <Link href="/services" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#087b48] hover:text-[#065f38]">
                Explore our services
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {careBenefits.map((benefit, index) => (
                <article
                  key={benefit.title}
                  className={`rounded-[1.5rem] border p-6 ${
                    index === 0
                      ? "border-[#cceedd] bg-[#effcf5] sm:col-span-2"
                      : "border-[#dfe7f0] bg-[#f9fbfd]"
                  }`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0c945a] shadow-sm">
                    <span className="material-symbols-outlined text-[23px]">{benefit.icon}</span>
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-[#001b5e]">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#607087]">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f9fc] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[#001b5e] px-6 py-12 text-center shadow-[0_30px_70px_rgba(0,27,94,0.18)] sm:px-12 sm:py-16">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.04]" />
            <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-[#16a968]/20 blur-2xl" />
            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#74ecad]">
                <span className="material-symbols-outlined">favorite</span>
              </span>
              <h2 className="mt-6 text-xl font-extrabold tracking-[-0.035em] text-white sm:text-2xl">Ready for a simpler care experience?</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#c7d4f2] sm:text-base">
                Create your patient account today, or sign in to browse verified doctors and book your next consultation.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register" className="rounded-xl bg-[#16a968] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#118d57]">
                  Create an account
                </Link>
                <Link href="/login/patient?next=%2Fdashboard%2Fpatient%2Fdoctors" className="rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/15">
                  Sign in to browse doctors
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e2e8f0] bg-white py-12">
          <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c945a]">For healthcare professionals</p>
              <h2 className="mt-2 text-2xl font-bold text-[#001b5e]">Bring your expertise to DominionWell+</h2>
              <p className="mt-2 text-sm text-[#607087]">Apply to join our network or sign in to your doctor workspace.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/join-doctor" className="rounded-xl border border-[#c9d4e3] px-5 py-3 text-center text-sm font-bold text-[#001b5e] hover:bg-[#f7f9fc]">
                Apply as a doctor
              </Link>
              <Link href="/login/doctor" className="rounded-xl bg-[#001b5e] px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#092b76]">
                Doctor sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#00143f] py-12 text-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="max-w-sm">
              <div className="inline-flex rounded-xl bg-white p-2">
                <Brand />
              </div>
              <p className="mt-5 text-sm leading-6 text-[#b8c7e8]">
                Connecting patients and doctors through thoughtful, accessible digital healthcare.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">For patients</h3>
              <div className="mt-4 grid gap-3 text-sm text-[#b8c7e8]">
                <Link className="hover:text-white" href="/register">Create an account</Link>
                <Link className="hover:text-white" href="/login/patient">Patient sign in</Link>
                <Link className="hover:text-white" href="/services">Our services</Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">DominionWell+</h3>
              <div className="mt-4 grid gap-3 text-sm text-[#b8c7e8]">
                <Link className="hover:text-white" href="/about">About us</Link>
                <Link className="hover:text-white" href="/contact">Contact</Link>
                <Link className="hover:text-white" href="/join-doctor">Join as a doctor</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs text-[#91a4cf] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 DominionWell+. All rights reserved.</p>
            <Link className="hover:text-white" href="/admin/login">Admin portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
