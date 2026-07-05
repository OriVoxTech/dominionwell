"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SignInModalProps = {
  className?: string;
};

export default function SignInModal({ className }: SignInModalProps) {
  const [open, setOpen] = useState(false);
  const canUseDOM = typeof window !== "undefined";

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button className={className} type="button" onClick={() => setOpen(true)}>
        Sign In
      </button>

      {canUseDOM && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#001b5e]/45 px-4"
              role="dialog"
              aria-modal="true"
              aria-label="Login options"
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-[#c6c6cf] bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#0aa4b4]">
                      Sign In
                    </p>
                    <h2 className="mt-1 text-1xl font-bold text-[#001b5e]">
                      Choose account type
                    </h2>
                  </div>
                  <button
                    className="rounded-full px-2 py-1 text-xl leading-none text-[#64748b] hover:bg-[#f3f4f6]"
                    type="button"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    x
                  </button>
                </div>

                <div className="grid gap-3">
                  <Link
                    href="/login/patient"
                    className="rounded-xl border border-[#16b46f] bg-[#16b46f] px-4 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Login as Patient
                  </Link>
                  <Link
                    href="/login/doctor"
                    className="rounded-xl border border-[#001b5e] px-4 py-3 text-center text-sm font-semibold text-[#001b5e]"
                    onClick={() => setOpen(false)}
                  >
                    Login as Doctor
                  </Link>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
