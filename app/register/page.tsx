import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-4 backdrop-blur md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-8 w-auto" src="/logo.png" width={128} height={32} />
          <span className="text-1xl font-bold text-[#001b5e]">DominionWell+</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/services">Services</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/contact">Contact</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/about">About</Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-4 py-12 md:px-10">
        <section className="rounded-2xl border border-[#c6c6cf] bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-[#001b5e]">Create Patient Account</h1>
            <p className="text-sm text-[#475569]">Registration is currently available for patients only.</p>
          </div>

          <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Account Type</span>
              <input
                type="text"
                value="Patient"
                readOnly
                disabled
                className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 text-[#64748b]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">First Name</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="text" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Last Name</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="text" />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="email" />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Phone Number</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="text" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Password</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="password" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Confirm Password</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]" type="password" />
            </label>

            <div className="mt-2 md:col-span-2">
              <button className="w-full rounded-lg bg-[#16b46f] py-2.5 text-sm font-semibold text-white hover:bg-[#149660]" type="button">
                Register as Patient
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
