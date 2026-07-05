import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-[#191c1e]">
      <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc] px-4 md:px-10">
        <div className="flex items-center gap-4">
          <img alt="DominionWell Logo" className="h-8 w-auto" src="/logo.png" />
          <span className="text-1xl font-bold text-[#001b5e]">DominionWell+</span>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link className="text-sm text-[#45464e] transition-colors hover:text-[#16b46f]" href="/">
            Find Doctors
          </Link>
          <a className="text-sm text-[#45464e] transition-colors hover:text-[#16b46f]" href="#">
            Services
          </a>
          <Link className="border-b-2 border-[#16b46f] pb-1 text-sm font-bold text-[#16b46f]" href="/about">
            About
          </Link>
          <a className="text-sm text-[#45464e] transition-colors hover:text-[#16b46f]" href="#">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm text-[#16b46f]" type="button">
            Sign In
          </button>
          <button className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-medium text-white" type="button">
            Register
          </button>
        </div>
      </nav>

      <main className="w-full">
        <section className="hero-gradient relative overflow-hidden px-4 pb-8 pt-8 md:pb-10 md:pl-10 md:pr-0 md:pt-10">
          <div className="flex w-full max-w-none flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="relative z-10 w-full space-y-3 md:w-[52%]">
              <div className="inline-flex items-center rounded-full border border-[#16b46f]/30 bg-[#16b46f]/10 px-4 py-1 text-[#16b46f]">
                <span className="text-xs font-semibold uppercase tracking-wider">Our Vision</span>
              </div>
              <h1 className="max-w-xl text-3xl font-bold text-[#001b5e] md:text-4xl">Healthcare Without Boundaries.</h1>
              <p className="max-w-lg text-sm leading-6 text-[#45464e]">
                DominionWell+ is redefining the medical landscape through VitalCare, bridging the gap between world-class expertise and
                global accessibility.
              </p>
            </div>

            <div className="relative w-full md:ml-auto md:mr-0 md:w-[34%] md:shrink-0">
              <div className="aspect-[4/5] max-h-[360px] overflow-hidden rounded-2xl shadow-xl">
                <img
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAsUen5gbGcZABaV1l8cmeZKRVtXdPEt44mco83irrl-OL3pB2-uJ0JkMIeTNaVJxJvHKjirhsfrnralm5ZkVaTc3NDHlLF-k262QNI37RVI96iUmTTa8ql7ljI2cTEnnHzw4O_HvJe7ZR1JCJNhumUObGyqibj47bsS65FJz2r1rDRUYRNI0TXJBkN5NdsVTj4m7Z1SJQSPFDvTPHw807xGpSkaeoO1CQSxMjfoYkXV63pq7PB4qc4Ud7AMHcTyKAiH7rwHT1SgVV"
                  alt="Doctor portrait"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-[#c6c6cf] bg-white p-2 shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16b46f] text-white">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <div>
                  <p className="m-0 text-xl font-semibold text-[#001b5e]">150+</p>
                  <p className="m-0 text-xs text-[#45464e]">Countries Served</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 md:px-10 md:py-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold text-[#001b5e]">Driven by Purpose</h2>
              <p className="mx-auto mt-2 max-w-2xl text-base text-[#45464e]">
                We believe healthcare is a fundamental right. Our platform leverages technology to provide clinical precision with
                human empathy.
              </p>
            </div>

            <div className="bento-grid">
              <div className="col-span-12 flex flex-col items-center gap-6 rounded-2xl border border-[#c6c6cf] bg-[#f7f9fc] p-6 md:col-span-8 md:flex-row">
                <div className="w-full space-y-2 md:w-1/2">
                  <span className="material-symbols-outlined text-4xl text-[#16b46f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    medical_services
                  </span>
                  <h3 className="text-2xl font-semibold text-[#001b5e]">Clinical Precision</h3>
                  <p className="text-base text-[#45464e]">
                    Our diagnostic tools are powered by advanced AI and vetted by world-renowned specialists to ensure every patient
                    receives the most accurate care path possible.
                  </p>
                </div>
                <div className="h-52 w-full overflow-hidden rounded-xl md:w-1/2">
                  <img
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcXmxBMCmj6sPQSGONLywmBt6NSww3y5RuM2gLWmw6H2_JozxuPvyNDEYhGZ4gNTViRoihZDRmzGSCER_WeuPKo59kxVxpg_ghnc1v7HghauRg56o_mzC04AB4PDMGAZpGV4Wp9I7KH5c_yKWLwRE0vUIv9pxERam7Yfg5paEezxH3ocpkanYFWYol8fJudiXCp66g1Wgo9te-R6lQS7HL80F8rxJlqSozJGVCai4CN-ADX-UIsVegRtAZ7fwNgFeP4A-eIgnLG_34"
                    alt="Medical interface"
                  />
                </div>
              </div>

              <div className="col-span-12 flex flex-col justify-between rounded-2xl bg-[#001b5e] p-6 text-white md:col-span-4">
                <div className="space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#16b46f]">language</span>
                  <h3 className="text-2xl font-semibold">Global Scale</h3>
                  <p className="text-base text-[#d3defa]">
                    Connecting patients in remote regions to top-tier specialists across the globe via encrypted, low-latency
                    telemedicine.
                  </p>
                </div>
                <div className="mt-4 border-t border-white/20 pt-4">
                  <p className="text-sm text-[#0aa4b4]">Live Connectivity: Active</p>
                </div>
              </div>

              <div className="col-span-12 rounded-2xl border border-[#c6c6cf] bg-[#f7f9fc] p-6 md:col-span-4">
                <span className="material-symbols-outlined text-4xl text-[#16b46f]">diversity_3</span>
                <h3 className="mt-2 text-2xl font-semibold text-[#001b5e]">Patient-Centric</h3>
                <p className="mt-2 text-base text-[#45464e]">
                  We focus on the human behind the data. Compassion is integrated into every interaction, from intake to recovery.
                </p>
              </div>

              <div className="relative col-span-12 h-64 overflow-hidden rounded-2xl md:col-span-8">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMokBjkK9uMf4sjg4P-FP4HUkAdOHZZdrgLuWJFAY-3V_Mmi95eDyQrpqb8h8bF-TGfLQ_gkHnA6Obz2juXJ4NyPdtbOJ5MhpGohqW1KOOmDpzK5msPRCHwggAPNuj9Wx-EDhwfU96PYzMIIWccwWQ6tlPF1121KESv0QqvJo58Rp5onnApSrGtNsC2jqYMY_vemFq8siMaJDcaiAMa2h9l9XVCjdKYL_nqZgl3p_k_46jRcO2ONo-TlcMkOvyzCSEaaWTHr6HjERC')",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#001b5e]/80 to-transparent p-6 text-white">
                  <h3 className="text-2xl font-semibold">Integrated Recovery Centers</h3>
                  <p className="max-w-lg text-base text-[#d9e4ff]">Physical and digital touchpoints working in unison for seamless health management.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f9fc] px-4 py-14 md:px-10 md:py-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="mb-10 flex flex-col items-end justify-between gap-4 md:flex-row">
              <div className="max-w-xl">
                <h2 className="text-3xl font-semibold text-[#001b5e]">Leadership Excellence</h2>
                <p className="mt-2 text-base text-[#45464e]">
                  A multidisciplinary team of medical experts, technology visionaries, and advocates dedicated to universal health
                  standards.
                </p>
              </div>
              <button className="group flex items-center gap-2 text-sm font-medium text-[#16b46f]" type="button">
                See Board of Directors
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Dr. Sarah Jenkins",
                  role: "Chief Medical Officer",
                  bio: "Former Head of Cardiology at St. Jude's with 20+ years in health equity research.",
                  image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuC4h7eVulGW3k1IvaipgFyqexdt5Pxnz8jvb7uzV8Wv1lhFMSt_ghoewOLlxCHjTDgcntnbzaaG43jq1d8tmNwN5ruJRRTcfhHPBO1YzuUodj2ipE2epUK2RUU6QZwVZrOZ9CQqtPGPXjE13glZm3TD-tCOM42i3CB9NDW5eJJAIa8GX5F7pM-7pheG-EAoVS6ZnbHvDDMDB2UK37P9cD9qV132YjRqlYWYZDYgzzbv3LP2RtKSP1IdwWpuLn1ZYa1becHWHe3mCyfV",
                },
                {
                  name: "Marcus Vane",
                  role: "Chief Technology Officer",
                  bio: "Ex-Silicon Valley engineering lead focused on secure, ethical medical data exchange.",
                  image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBrpxUG2k2IHryXerQh3043OVCBO5UfZoS0E8yBGHUNafqu61rFdu1lTSvfYTIuPivMRng44SMK7Aw0l5oG0XeCSoNlIPLSGy0Z40XV47BKcLuCXpycmWUDCyO6tAPni9I3akdFo7Ql0upnaYWnTDKgzSLrrwmFGUhVwRdbNY2g-TtX0p5mY4NnvGmRB7hNkYCvgCb2131zgwOHppK9f4NUg8XmnKvCwFFeoHxwwkGTk1TPAtzDn8G_YhWDksMjTi_GjjDHbd5wqFP7",
                },
                {
                  name: "Elena Rodriguez",
                  role: "VP, Patient Advocacy",
                  bio: "Dedicated to ensuring patient voices shape our product development and service delivery.",
                  image:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBwZEMBVuPnZ4ue1TibAzpYv2ZAYlWpOYP1uwkikMsf7GkiEc8KSI2e6msBzwu96B-48eOleOF0g-BCkXFIglxQ26EwsjMMwxgeTuhn6vS04CG8ilRhpu8q5PDmIIkguHZ1oweL-luP5N6ne18kDlJ4lz_Vjq5s2R7aqbxZtKtkCCi1CMzJSrSZASR3U7ZjF2Eeq3xtL3iypZxb3ymS9CfLx2FQ5cJhi34ce28cd_x7yqILTPRENfmgoOyhSdcu-9V4bSF_2QSNdHx9",
                },
              ].map((leader) => (
                <div className="group flex flex-col" key={leader.name}>
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl">
                    <img className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" src={leader.image} alt={leader.name} />
                    <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#001b5e] shadow-lg hover:text-[#16b46f]" href="#">
                        <span className="material-symbols-outlined text-sm">link</span>
                      </a>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-[#001b5e]">{leader.name}</h4>
                  <p className="text-sm font-bold uppercase tracking-wide text-[#16b46f]">{leader.role}</p>
                  <p className="mt-1 text-base text-[#45464e]">{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#001b5e] px-4 py-16 text-white md:px-10 md:py-18">
          <div className="relative z-10 mx-auto w-full max-w-[1440px]">
            <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-4 md:text-left">
              {[
                ["4.2M", "Active Patients", "Managing their health daily through our ecosystem."],
                ["12k+", "Specialists", "Available 24/7 for consultations across 40+ medical fields."],
                ["98%", "Satisfaction", "Rating from our patient-centered clinical surveys."],
                ["85M", "Grants Issued", "Subsidizing care for underserved global communities."],
              ].map(([metric, title, text]) => (
                <div className="space-y-2" key={title}>
                  <h5 className="text-5xl font-bold leading-none text-[#16b46f]">{metric}</h5>
                  <p className="text-xl font-semibold">{title}</p>
                  <p className="text-base text-[#bfd2ff]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#eceef1] px-4 py-14 md:px-10 md:py-16">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 rounded-3xl border border-[#c6c6cf] bg-white p-6 shadow-sm md:flex-row md:p-14">
            <div className="w-full space-y-4 md:w-1/2">
              <h2 className="text-3xl font-semibold text-[#001b5e] md:text-2xl">Be Part of the Future of Health.</h2>
              <p className="text-lg text-[#45464e]">
                Whether you&apos;re a healthcare provider looking to join our network or a partner interested in global impact, we&apos;re
                ready to connect.
              </p>
              <div className="flex gap-4 pt-2">
                <button className="rounded-lg bg-[#16b46f] px-8 py-4 text-sm font-medium text-white" type="button">
                  Get in Touch
                </button>
                <button className="rounded-lg border border-[#76767f] px-8 py-4 text-sm font-medium text-[#001b5e]" type="button">
                  Partner with Us
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#c6c6cf] bg-[#f7f9fc] p-4">
                  <span className="material-symbols-outlined mb-1 text-[#16b46f]">mail</span>
                  <h6 className="text-sm font-medium text-[#001b5e]">Email Us</h6>
                  <p className="text-base text-[#45464e]">connect@dominionwell.com</p>
                </div>
                <div className="rounded-2xl border border-[#c6c6cf] bg-[#f7f9fc] p-4">
                  <span className="material-symbols-outlined mb-1 text-[#16b46f]">call</span>
                  <h6 className="text-sm font-medium text-[#001b5e]">Call Us</h6>
                  <p className="text-base text-[#45464e]">+1 (800) VITAL-CARE</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-[#c6c6cf] bg-[#f7f9fc] p-4">
                  <span className="material-symbols-outlined mb-1 text-[#16b46f]">location_on</span>
                  <h6 className="text-sm font-medium text-[#001b5e]">Headquarters</h6>
                  <p className="text-base text-[#45464e]">Medical District East, Suite 400, Chicago, IL</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#001b5e] px-4 py-16 text-white md:px-10 md:py-18">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 md:grid-cols-12">
          <div className="col-span-12 space-y-4 md:col-span-4">
            <span className="text-1xl font-extrabold">DominionWell+</span>
            <p className="max-w-xs text-base text-[#bfd2ff]">
              Pioneering accessible, high-precision healthcare solutions globally. A subsidiary of DominionWell+.
            </p>
            <div className="flex gap-4 pt-2">
              <a className="text-[#bfd2ff] transition-colors hover:text-white" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-[#bfd2ff] transition-colors hover:text-white" href="#">
                <span className="material-symbols-outlined">description</span>
              </a>
              <a className="text-[#bfd2ff] transition-colors hover:text-white" href="#">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>

          <div className="col-span-6 space-y-4 md:col-span-2">
            <h6 className="text-sm uppercase tracking-widest">Platform</h6>
            <ul className="space-y-2">
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Find Doctors</a></li>
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Telehealth</a></li>
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Services</a></li>
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Pricing</a></li>
            </ul>
          </div>

          <div className="col-span-6 space-y-4 md:col-span-2">
            <h6 className="text-sm uppercase tracking-widest">Company</h6>
            <ul className="space-y-2">
              <li>
                <Link className="text-base font-semibold text-white" href="/about">
                  About Us
                </Link>
              </li>
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Impact</a></li>
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Careers</a></li>
              <li><a className="text-base text-[#bfd2ff] transition-colors hover:text-[#16b46f]" href="#">Newsroom</a></li>
            </ul>
          </div>

          <div className="col-span-12 space-y-4 md:col-span-4">
            <h6 className="text-sm uppercase tracking-widest">Newsletter</h6>
            <p className="text-base text-[#bfd2ff]">Get the latest in healthcare innovation and impact reports.</p>
            <div className="flex">
              <input className="w-full rounded-l-lg border border-white/30 bg-[#0b2a7f] px-4 py-3 text-white outline-none" placeholder="Email address" type="email" />
              <button className="rounded-r-lg bg-[#16b46f] px-4 text-sm font-medium text-white" type="button">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 flex w-full max-w-[1440px] flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#bfd2ff] md:flex-row">
          <p>© 2024 DominionWell+ Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-white" href="#">Privacy Policy</a>
            <a className="hover:text-white" href="#">Terms of Service</a>
            <a className="hover:text-white" href="#">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
