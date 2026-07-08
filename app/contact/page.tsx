import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-4 backdrop-blur md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-8 w-auto" src="/logo.png" width={128} height={32} />
          <span className="text-1xl font-bold text-[#001b5e]">DominionWell+</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/services">Services</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/about">About</Link>
          <Link className="rounded-lg bg-[#16b46f] px-4 py-2 text-sm font-semibold text-white" href="/register">Register</Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-10">
        <section className="mb-10">
          <h1 className="mb-3 text-4xl font-bold text-[#001b5e]">Contact Us</h1>
          <p className="max-w-2xl text-base text-[#45464e]">
            Need support, have questions, or want to partner with DominionWell+? We are here to help.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-[#c6c6cf] bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-[#001b5e]">Support Channels</h2>
            <div className="space-y-3 text-sm text-[#45464e]">
              <p><span className="font-semibold text-[#001b5e]">Email:</span> support@dominionwell.com</p>
              <p><span className="font-semibold text-[#001b5e]">Phone:</span> +1 (202) 555-0117</p>
              <p><span className="font-semibold text-[#001b5e]">Hours:</span> Mon - Fri, 8:00 AM - 6:00 PM</p>
            </div>
          </article>

          <article className="rounded-2xl border border-[#c6c6cf] bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-[#001b5e]">Send a Message</h2>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Full Name</span>
                <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="text" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
                <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="email" />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-[#334155]">Message</span>
                <textarea className="h-32 w-full resize-none rounded-lg border border-[#c6c6cf] px-3 py-2 outline-none focus:border-[#0aa4b4]" />
              </label>
              <div className="md:col-span-2">
                <button className="rounded-lg bg-[#001b5e] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]" type="button">
                  Submit
                </button>
              </div>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
}
