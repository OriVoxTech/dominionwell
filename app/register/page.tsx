import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c6c6cf] bg-[#f7f9fc]/95 px-3 backdrop-blur sm:px-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Image alt="DominionWell Logo" className="h-7 w-auto sm:h-8" src="/logo.png" width={128} height={32} />
          <span className="text-lg font-bold text-[#001b5e] sm:text-1xl">DominionWell+</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/services">Services</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/contact">Contact</Link>
          <Link className="text-sm text-[#45464e] hover:text-[#16b46f]" href="/about">About</Link>
        </nav>
        <Link href="/" className="text-xs font-semibold text-[#0aa4b4] md:hidden">
          Home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-4 py-8 md:px-10 md:py-12">
        <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-5 sm:mb-6">
            <h1 className="mb-1.5 text-2xl font-bold text-[#001b5e] sm:mb-2 sm:text-3xl">Create Patient Account</h1>
            <p className="text-xs text-[#475569] sm:text-sm">Registration is currently available for patients only.</p>
          </div>

          <form className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <label className="block text-xs sm:text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Account Type</span>
              <input
                type="text"
                value="Patient"
                readOnly
                disabled
                className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 text-xs text-[#64748b] sm:text-sm"
              />
            </label>

            <label className="block text-xs sm:text-sm">
              <span className="mb-1 block font-medium text-[#334155]">First Name</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm" type="text" />
            </label>
            <label className="block text-xs sm:text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Last Name</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm" type="text" />
            </label>
            <label className="block text-xs sm:text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm" type="email" />
            </label>
            <label className="block text-xs sm:text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Phone Number</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm" type="text" />
            </label>
            <label className="block text-xs sm:text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Password</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm" type="password" />
            </label>
            <label className="block text-xs sm:text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Confirm Password</span>
              <input className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] sm:text-sm" type="password" />
            </label>

            <div className="mt-2 md:col-span-2">
              <button className="w-full rounded-lg bg-[#16b46f] py-2.5 text-xs font-semibold text-white hover:bg-[#149660] sm:text-sm" type="button">
                Register as Patient
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
