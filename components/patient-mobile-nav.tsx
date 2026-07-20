"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientProfileSummary from "@/components/patient-profile-summary";
import { patientApiService } from "@/lib/api";
import { usePatientProfile } from "@/lib/use-patient-profile";

type PatientNavKey =
  | "dashboard"
  | "appointments"
  | "notifications"
  | "doctors"
  | "subscription"
  | "payments"
  | "settings"
  | "help";

type PatientMobileNavProps = {
  active: PatientNavKey;
};

const items: Array<{ key: PatientNavKey; href: string; label: string; icon: string }> = [
  { key: "dashboard", href: "/dashboard/patient", label: "Dashboard", icon: "dashboard" },
  { key: "appointments", href: "/dashboard/patient/appointments", label: "Appointments", icon: "calendar_month" },
  { key: "notifications", href: "/dashboard/patient/notifications", label: "Notifications", icon: "notifications" },
  { key: "doctors", href: "/dashboard/patient/doctors", label: "Doctors", icon: "medical_services" },
  { key: "subscription", href: "/dashboard/patient/subscription", label: "Subscription", icon: "card_membership" },
  { key: "payments", href: "/dashboard/patient/payments", label: "Payments", icon: "receipt_long" },
  { key: "settings", href: "/dashboard/patient/settings", label: "Settings", icon: "settings" },
  { key: "help", href: "/dashboard/patient/help-center", label: "Help", icon: "help" },
];

export default function PatientMobileNav({ active }: PatientMobileNavProps) {
  const profile = usePatientProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const refreshUnreadCount = () => {
      void patientApiService
        .getUnreadNotificationCount()
        .then((response) => {
          setUnreadNotifications(response.data.unreadCount);
        })
        .catch(() => {
          setUnreadNotifications(0);
        });
    };

    refreshUnreadCount();
    window.addEventListener("dw-notifications-updated", refreshUnreadCount);

    return () => {
      window.removeEventListener("dw-notifications-updated", refreshUnreadCount);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#c6c6cf] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#c6c6cf] text-[#001b5e]"
              aria-label="Open navigation menu"
              onClick={() => setIsOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <p className="text-base font-extrabold tracking-tight text-[#001b5e]">DominionWell+</p>
          </div>

          <Link
            href="/dashboard/patient/doctors"
            className="rounded-lg bg-[#16b46f] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Book Consult
          </Link>
        </div>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0f172a]/45"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          />

          <aside className="relative z-10 h-full w-[82%] max-w-xs bg-[#001b5e] p-4 text-white shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg font-extrabold tracking-tight">DominionWell+</p>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md bg-white/10"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/10 p-3">
              <PatientAvatar profile={profile} />
              <PatientProfileSummary />
            </div>

            <nav className="space-y-1">
              {items.map((item) => {
                const isActive = item.key === active;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-[#16b46f]/20 text-[#d7ffe9]" : "text-[#d8e2ff]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.key === "notifications" && unreadNotifications > 0 ? (
                      <span className="ml-auto rounded-full bg-[#16b46f] px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadNotifications}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/15 pt-4">
              <PatientLogoutButton
                iconClassName="text-[18px]"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#d8e2ff] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
