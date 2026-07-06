import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "General Consultations",
    description: "Talk to licensed physicians for everyday health concerns and follow-up care.",
    icon: "stethoscope",
  },
  {
    title: "Specialist Care",
    description: "Connect with cardiology, dermatology, pediatrics, neurology, and more.",
    icon: "medical_services",
  },
  {
    title: "Digital Prescriptions",
    description: "Receive secure prescriptions and care instructions after each consultation.",
    icon: "description",
  },
  {
    title: "Care History",
    description: "Access your consultation history, notes, and treatment recommendations anytime.",
    icon: "history",
  },
  {
    title: "Secure Messaging",
    description: "Use verified WhatsApp handoff for doctor communication and consultation verification.",
    icon: "chat",
  },
  {
    title: "Subscription Plans",
    description: "Choose a consultation package that fits your healthcare needs and schedule.",
    icon: "workspace_premium",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-4 backdrop-blur md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-8 w-auto" src="/logo.png" width={128} height={32} />
          <span className="text-1xl font-bold text-[#001b5e]">DominionWell+</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/about">About</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/contact">Contact</Link>
          <Link className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white" href="/register">Register</Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-10">
        <section className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-[#001b5e]">Our Services</h1>
          <p className="max-w-3xl text-base text-[#45464e]">
            DominionWell+ provides modern, secure, and patient-centered healthcare services designed for convenience,
            continuity, and better outcomes.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="rounded-2xl border border-[#c6c6cf] bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#001b5e] text-[#16b46f]">
                <span className="material-symbols-outlined">{service.icon}</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#001b5e]">{service.title}</h2>
              <p className="text-sm leading-6 text-[#45464e]">{service.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
