import Link from "next/link";
import PublicFooter from "@/components/public-footer";
import PublicHeader from "@/components/public-header";

const services = [
  { title: "General Consultations", description: "Talk to licensed physicians about everyday concerns, symptoms, and follow-up care.", icon: "stethoscope", tone: "bg-[#eafbf2] text-[#0b9459]" },
  { title: "Specialist Care", description: "Find experienced doctors across cardiology, pediatrics, family medicine, and more.", icon: "medical_services", tone: "bg-[#eef4ff] text-[#315ead]" },
  { title: "Digital Care Reports", description: "Receive clear consultation summaries and care guidance after completed sessions.", icon: "clinical_notes", tone: "bg-[#fff5e8] text-[#c66b12]" },
  { title: "Care History", description: "Keep appointments, consultation activity, and familiar doctors together in your account.", icon: "history", tone: "bg-[#f3edff] text-[#7543b5]" },
  { title: "Flexible Booking", description: "See doctor availability and choose a consultation time that works for your schedule.", icon: "calendar_month", tone: "bg-[#eaf8fb] text-[#087f8b]" },
  { title: "Subscription Plans", description: "Choose a consultation package that fits your healthcare needs and frequency.", icon: "workspace_premium", tone: "bg-[#fff2f4] text-[#b63853]" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#17223b]">
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden border-b border-[#e2e8f0] bg-[linear-gradient(135deg,#f7fbff,#ffffff_55%,#effcf6)] px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#72efad]/15 blur-3xl" />
          <div className="relative mx-auto max-w-[1280px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ccebd9] bg-white px-3 py-1.5 text-[11px] font-bold text-[#087b48]"><span className="material-symbols-outlined text-[16px]">health_and_safety</span>Connected care services</span>
            <h1 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.04em] text-[#001b5e] sm:text-[2.5rem]">Healthcare support for every step of your journey.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#607087] sm:text-base">From finding the right doctor to managing ongoing consultations, DominionWell+ keeps care simple, connected, and easier to access.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="rounded-xl bg-[#16a968] px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#118d57]">Create patient account</Link><Link href="/login/patient" className="rounded-xl border border-[#c9d4e3] bg-white px-5 py-3 text-center text-sm font-bold text-[#001b5e] hover:bg-[#f8fafc]">Sign in to get care</Link></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-[1.4rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)] sm:p-6">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${service.tone}`}><span className="material-symbols-outlined text-[22px]">{service.icon}</span></span>
                <h2 className="mt-6 text-lg font-bold text-[#001b5e]">{service.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#607087]">{service.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[1.5rem] bg-[#001b5e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div><h2 className="text-xl font-bold">Not sure where to begin?</h2><p className="mt-2 text-sm text-[#cbd8f4]">Create an account and browse verified doctors by specialty and availability.</p></div>
            <Link href="/register" className="w-full shrink-0 rounded-xl bg-[#16a968] px-5 py-3 text-center text-sm font-bold text-white sm:w-auto">Get started</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
