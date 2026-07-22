import Image from "next/image";
import Link from "next/link";
import SignInModal from "@/components/sign-in-modal";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dde5ef] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="DominionWell home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8fff2]">
            <Image src="/logo.png" alt="" width={25} height={25} className="h-6 w-auto" />
          </span>
          <span className="hidden text-base font-extrabold tracking-[-0.035em] text-[#001b5e] min-[410px]:inline">
            DominionWell<span className="text-[#16a968]">+</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <Link className="text-xs font-semibold text-[#526078] hover:text-[#001b5e]" href="/services">Services</Link>
          <Link className="text-xs font-semibold text-[#526078] hover:text-[#001b5e]" href="/about">About</Link>
          <Link className="text-xs font-semibold text-[#526078] hover:text-[#001b5e]" href="/contact">Contact</Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <SignInModal className="rounded-xl px-3 py-2 text-xs font-bold text-[#001b5e] hover:bg-[#f1f5f9] sm:px-4" />
          <Link href="/register" className="rounded-xl bg-[#001b5e] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#092b76] sm:px-4">Register</Link>
        </div>
      </div>
    </header>
  );
}

