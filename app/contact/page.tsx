import PublicFooter from "@/components/public-footer";
import PublicHeader from "@/components/public-header";

const supportOptions = [
  { icon: "mail", title: "Email support", value: "support@dominionwell.com", note: "For account and care questions" },
  { icon: "call", title: "Phone support", value: "+1 (202) 555-0117", note: "Monday to Friday, 8 AM–6 PM" },
  { icon: "help", title: "Help center", value: "Patient support", note: "Guides for bookings and accounts" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#17223b]">
      <PublicHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ccebd9] bg-white px-3 py-1.5 text-[11px] font-bold text-[#087b48]"><span className="material-symbols-outlined text-[16px]">support_agent</span>We are here to help</span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-[#001b5e] sm:text-[2.5rem]">How can we help?</h1>
          <p className="mt-3 text-sm leading-7 text-[#607087] sm:text-base">Questions about your account, a consultation, or partnering with DominionWell+? Reach out and our team will guide you.</p>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {supportOptions.map((option) => (
            <article key={option.title} className="rounded-[1.4rem] border border-[#e0e7ef] bg-white p-5 text-center shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined text-[21px]">{option.icon}</span></span>
              <h2 className="mt-4 text-sm font-bold text-[#001b5e]">{option.title}</h2><p className="mt-2 text-sm font-semibold text-[#44536a]">{option.value}</p><p className="mt-1 text-[11px] text-[#8a96a8]">{option.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid overflow-hidden rounded-[1.75rem] border border-[#e0e7ef] bg-white shadow-[0_12px_38px_rgba(30,52,83,0.06)] lg:grid-cols-[.72fr_1.28fr]">
          <div className="bg-[#001b5e] p-6 text-white sm:p-8">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-[#8df0bb]"><span className="material-symbols-outlined">forum</span></span>
            <h2 className="mt-6 text-xl font-bold">Send us a message</h2>
            <p className="mt-3 text-sm leading-6 text-[#cbd8f4]">Share a few details and the appropriate support team can follow up with you.</p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs leading-5 text-[#dce5f8]">Please do not include urgent or sensitive medical information in this form. Contact local emergency services for emergencies.</div>
          </div>

          <form className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
            <label className="grid gap-1.5 text-xs font-bold text-[#33415c]">Full name<input className="h-11 rounded-xl border border-[#d6dee8] bg-[#fbfcfe] px-3 text-sm font-medium outline-none focus:border-[#16a968]" type="text" placeholder="Your full name" required /></label>
            <label className="grid gap-1.5 text-xs font-bold text-[#33415c]">Email address<input className="h-11 rounded-xl border border-[#d6dee8] bg-[#fbfcfe] px-3 text-sm font-medium outline-none focus:border-[#16a968]" type="email" placeholder="you@example.com" required /></label>
            <label className="grid gap-1.5 text-xs font-bold text-[#33415c] sm:col-span-2">How can we help?<textarea className="min-h-32 resize-y rounded-xl border border-[#d6dee8] bg-[#fbfcfe] px-3 py-3 text-sm font-medium outline-none focus:border-[#16a968]" placeholder="Tell us what you need help with" required /></label>
            <div className="sm:col-span-2"><button className="w-full rounded-xl bg-[#16a968] px-5 py-3 text-sm font-bold text-white hover:bg-[#118d57] sm:w-auto" type="submit">Send message</button></div>
          </form>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
