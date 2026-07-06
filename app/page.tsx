"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SignInModal from "../components/sign-in-modal";

const PATIENT_AUTH_KEY = "dwPatientLoggedIn";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isPatientLoggedIn = () => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(PATIENT_AUTH_KEY) === "true";
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

  const handleBookConsultation = () => {
    requirePatientLogin(() => {
      router.push("/dashboard/patient/doctors");
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-4 backdrop-blur md:px-10">
        <div className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-8 w-auto" src="/logo.png" width={128} height={32} />
          <span className="text-1xl font-bold text-[#001b5e]">DominionWell+</span>
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

        <div className="flex items-center gap-3">
          <SignInModal className="text-sm text-[#45464e] hover:text-[#16b46f]" />
          <SignInModal open={showLoginModal} onOpenChange={setShowLoginModal} hideTrigger />
          <Link href="/register" className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white">
            Register
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-pattern relative flex min-h-[70vh] items-center overflow-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#16b46f] px-3 py-1 text-white">
                <span className="material-symbols-outlined text-[10px]">verified</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider">Trusted by 500+ Clinics</span>
              </div>

              <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#001b5e] md:text-5xl">
                Healthcare Without Boundaries
              </h1>
              <p className="mb-8 max-w-xl text-m leading-8 text-[#45464e]">
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
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#16b46f] px-8 py-3 text-sm font-semibold text-white"
                  type="button"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="text-sm text-[#45464e]">Popular:</span>
                <span className="cursor-pointer rounded-full border border-[#c6c6cf] bg-[#eceef1] px-4 py-1.5 text-xs font-semibold text-[#191c1e]">Cardiologist</span>
                <span className="cursor-pointer rounded-full border border-[#c6c6cf] bg-[#eceef1] px-4 py-1.5 text-xs font-semibold text-[#191c1e]">Pediatrician</span>
                <span className="cursor-pointer rounded-full border border-[#c6c6cf] bg-[#eceef1] px-4 py-1.5 text-xs font-semibold text-[#191c1e]">Dermatologist</span>
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

        <section className="bg-[#f2f4f7] py-12">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-[#001b5e]">How DominionWell+ Works</h2>
              <p className="text-base text-[#45464e]">
                We&apos;ve simplified the journey from feeling unwell to receiving expert care. Your health, managed in three simple steps.
              </p>
            </div>

            <div className="bento-grid">
              <div className="glass-card col-span-12 flex flex-col items-start gap-4 rounded-2xl border border-[#c6c6cf] p-8 md:col-span-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#001b5e]">
                  <span className="material-symbols-outlined text-[#16b46f]">search_check</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#001b5e]">Find a Provider</h3>
                <p className="text-base text-[#45464e]">
                  Browse our curated network of board-certified specialists. Filter by rating, language, or availability.
                </p>
                <div className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-[#16b46f]">
                  Browse Network <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>

              <div className="col-span-12 flex flex-col items-start gap-4 rounded-2xl bg-[#001b5e] p-8 shadow-xl md:col-span-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#16b46f]">
                  <span className="material-symbols-outlined text-white">calendar_month</span>
                </div>
                <h3 className="text-2xl font-semibold text-white">Instant Booking</h3>
                <p className="text-base text-[#b9c5f1]">
                  Secure your slot in seconds. No more waiting on hold, choose a time that works for your schedule.
                </p>
                <div className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-[#16b46f]">
                  View Availability <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>

              <div className="glass-card col-span-12 flex flex-col items-start gap-4 rounded-2xl border border-[#c6c6cf] p-8 md:col-span-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#002126]">
                  <span className="material-symbols-outlined text-[#0aa4b4]">medical_information</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#001b5e]">Receive Care</h3>
                <p className="text-base text-[#45464e]">
                  Consult via HD video or in-person. Access your digital records and prescriptions immediately after.
                </p>
                <div className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-[#16b46f]">
                  Learn More <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10">
            <div className="mb-12 flex items-end justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="mb-2 text-2xl font-semibold text-[#001b5e]">Featured Specialists</h2>
                <p className="text-base text-[#45464e]">
                  Meet our top-rated medical professionals who are setting new standards in clinical excellence and patient care.
                </p>
              </div>
              <button className="hidden items-center gap-2 rounded-lg border-2 border-[#16b46f] px-6 py-2 text-sm font-medium text-[#16b46f] md:flex" type="button">
                View All Doctors
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <article className="group overflow-hidden rounded-2xl border border-[#c6c6cf] bg-white transition-all duration-300 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <Image className="object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdVENcuEGku3lbM2PPqI4t1CqMjy5CB31TeEL_xUOLUl8ClPRkzQhs2oxl-Md3qLt72L0_lcWVsb4YIBvatXsZ_Osb-RR_KA_rKjvKAoTTghpVJPrhWLIpyc8NwD3K3d2EaDZnrL9pZQ_krsOryzAEyIQ5mO4Cwa5OqcRG3wOEJwTXEoh3Mep8Mtg5Kju7AWH2IQ1xZLkkb9wVwEJHoom_VDqlDoSEXZK5wRQuVDetFt3g6krqKFpWXf6MrBDjYLkgUqYNGO8o-97d" alt="Dr. Sarah Jenkins" fill sizes="(max-width: 1024px) 100vw, 25vw" unoptimized />
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#16b46f] px-3 py-1 text-xs font-semibold text-white">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    4.9
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="mb-1 text-1xl font-semibold text-[#001b5e]">Dr. Sarah Jenkins</h4>
                  <p className="mb-4 text-sm text-[#45464e]">Senior Cardiologist</p>
                  <button className="w-full rounded-lg bg-[#eceef1] py-3 text-sm font-medium text-[#001b5e]" type="button" onClick={handleBookConsultation}>
                    Book Consultation
                  </button>
                </div>
              </article>

              <article className="group overflow-hidden rounded-2xl border border-[#c6c6cf] bg-white transition-all duration-300 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <Image className="object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADFuaVYzu4xfvRjN6OI0agehpArk2-F5bPsvXCo4R4Pm2C_Y3jf0Ho0kB6LxjRWz0GX5ojZAYIzWMk4PWMHzQQ7N__YE8_WFOkiqalOC0fCy23IM7vi9xabG1l0apWq_pz7O74SqmT9ZXndePOUKl8HUpSn0uaKgTZFgUTX2OGmq8go75XZv-1u5e3wPcn727UGXslJIqJhEwO9S_ABNt0_6sn8tAXR2LMAqBb2nP4Myxnc8Ts-VsgA-YyJ5Yk6037hzQRsf5mP9_3" alt="Dr. Michael Chen" fill sizes="(max-width: 1024px) 100vw, 25vw" unoptimized />
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#16b46f] px-3 py-1 text-xs font-semibold text-white">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    5.0
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="mb-1 text-1xl font-semibold text-[#001b5e]">Dr. Michael Chen</h4>
                  <p className="mb-4 text-sm text-[#45464e]">Pediatric Specialist</p>
                  <button className="w-full rounded-lg bg-[#eceef1] py-3 text-sm font-medium text-[#001b5e]" type="button" onClick={handleBookConsultation}>
                    Book Consultation
                  </button>
                </div>
              </article>

              <article className="group overflow-hidden rounded-2xl border border-[#c6c6cf] bg-white transition-all duration-300 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <Image className="object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC25sw_gICQG5nUJgb_PzGHdVreboISlxs_vniy40Z1LHsTyFlhmXocw8eRdx5dMAzSNoheRbkowynsyyiBfyFkfy6bXDZ2HhIH8q_J5SXKy8XBHT5Z2VRn1NxS1RDzIt_R4zk6u64-5smighKYHASUGWyfSnGE8NvxEZZ6b65qaHxMwLpHUNRtCieMj1EfysHms-2cKiuCbXx5v3fu9IGtstLCSksFNFzLmAmyLWi8ghlUK06XdbEpUGIUSZn0O5z59i6g1GXA1Gqw" alt="Dr. Elena Rodriguez" fill sizes="(max-width: 1024px) 100vw, 25vw" unoptimized />
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#16b46f] px-3 py-1 text-xs font-semibold text-white">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    4.8
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="mb-1 text-1xl font-semibold text-[#001b5e]">Dr. Elena Rodriguez</h4>
                  <p className="mb-4 text-sm text-[#45464e]">Neurology &amp; Sleep</p>
                  <button className="w-full rounded-lg bg-[#eceef1] py-3 text-sm font-medium text-[#001b5e]" type="button" onClick={handleBookConsultation}>
                    Book Consultation
                  </button>
                </div>
              </article>

              <article className="group overflow-hidden rounded-2xl border border-[#c6c6cf] bg-white transition-all duration-300 hover:shadow-xl">
                <div className="relative h-64 overflow-hidden">
                  <Image className="object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYFUtMxwiPHOcqAbO8vdXbKTQAFa9DdY4yXLN0kUA-XI5QHiYVuBL8cTrfLl35_m0bWc6gCAvrKgM2g96nCm_jvowlbOJPaGlLEbSlTi1OnUYy85ft3ZEthpLktCziuH5rdT6ZhbthRNCQC7Y0XCwisCeuLHkyGi6mgzKExG9_YpJtoZKAvHXrsiWdkYpf5m6Pml0vBK1HeScObFbB3JDAkSkfTRomb15MJ1PcWdEYn0AamuPiEGs7eYe4b3Lb8gkXWl7ANaJ9RDkf" alt="Dr. James Wilson" fill sizes="(max-width: 1024px) 100vw, 25vw" unoptimized />
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#16b46f] px-3 py-1 text-xs font-semibold text-white">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    4.9
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="mb-1 text-1xl font-semibold text-[#001b5e]">Dr. James Wilson</h4>
                  <p className="mb-4 text-sm text-[#45464e]">Dermatology</p>
                  <button className="w-full rounded-lg bg-[#eceef1] py-3 text-sm font-medium text-[#001b5e]" type="button" onClick={handleBookConsultation}>
                    Book Consultation
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#001b5e] p-12 text-center md:p-20">
              <div className="relative z-10 mx-auto max-w-2xl">
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-4xl">Ready to prioritize your health?</h2>
                <p className="mb-10 text-lg text-[#7784ac]">
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

      <footer className="border-t border-[#c6c6cf] bg-[#f7f9fc] py-16">
        <div className="mx-auto max-w-[1440px] px-4 md:px-10">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Image alt="DominionWell Logo" className="h-6 w-auto" src="/logo.png" width={96} height={24} />
                <span className="text-m font-bold text-[#001b5e]">DominionWell+</span>
              </div>
              <p className="text-base text-[#45464e]">
                Redefining clinical precision and patient-centric healthcare for the modern world.
              </p>
            </div>
            <div>
              <h5 className="mb-6 text-sm font-bold text-[#001b5e]">Platform</h5>
              <ul className="space-y-4 text-[#45464e]">
                <li><a className="hover:text-[#16b46f]" href="#">Find Doctors</a></li>
                <li><a className="hover:text-[#16b46f]" href="#">Specialties</a></li>
                <li><a className="hover:text-[#16b46f]" href="#">Telehealth</a></li>
                <li><Link className="hover:text-[#16b46f]" href="/services">Services</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-6 text-sm font-bold text-[#001b5e]">Company</h5>
              <ul className="space-y-4 text-[#45464e]">
                <li><Link className="hover:text-[#16b46f]" href="/about">About Us</Link></li>
                <li><a className="hover:text-[#16b46f]" href="#">Careers</a></li>
                <li><Link className="hover:text-[#16b46f]" href="/contact">Contact</Link></li>
                <li><a className="hover:text-[#16b46f]" href="#">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-6 text-sm font-bold text-[#001b5e]">Newsletter</h5>
              <p className="mb-4 text-xs text-[#45464e]">Stay updated with our latest health tips and platform updates.</p>
              <div className="flex gap-2">
                <input className="flex-1 rounded-lg border border-[#c6c6cf] bg-[#eceef1] px-4 py-2 text-sm outline-none" placeholder="Your email" type="email" />
                <button className="rounded-lg bg-[#001b5e] px-4 py-2 text-xs font-semibold text-white" type="button">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#c6c6cf] pt-8 md:flex-row">
            <p className="text-xs text-[#45464e]">© 2024 DominionWell+. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="text-[#45464e] hover:text-[#16b46f]" href="#"><span className="material-symbols-outlined text-[20px]">public</span></a>
              <a className="text-[#45464e] hover:text-[#16b46f]" href="#"><span className="material-symbols-outlined text-[20px]">group</span></a>
              <a className="text-[#45464e] hover:text-[#16b46f]" href="#"><span className="material-symbols-outlined text-[20px]">campaign</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
