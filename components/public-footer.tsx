import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#e1e7ef] bg-white py-7">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 text-xs text-[#718096] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 DominionWell+. Thoughtful healthcare, made accessible.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/services" className="hover:text-[#001b5e]">Services</Link>
          <Link href="/join-doctor" className="hover:text-[#001b5e]">Join as a doctor</Link>
          <Link href="/contact" className="hover:text-[#001b5e]">Support</Link>
        </div>
      </div>
    </footer>
  );
}
