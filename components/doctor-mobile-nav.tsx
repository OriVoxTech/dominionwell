"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import { doctorApiService } from "@/lib/api";

const menuItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard/doctor" },
  { label: "Consultations", icon: "medical_services", href: "/dashboard/doctor/consultations" },
  { label: "Notifications", icon: "notifications", href: "/dashboard/doctor/notifications" },
  { label: "Patients", icon: "group", href: "/dashboard/doctor/patients" },
  { label: "Reports", icon: "analytics", href: "/dashboard/doctor/reports" },
  { label: "Wallet", icon: "wallet", href: "/dashboard/doctor/wallet" },
  { label: "Settings", icon: "settings", href: "/dashboard/doctor/settings" },
];

export default function DoctorMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const refreshUnreadCount = () => {
      void doctorApiService
        .getUnreadNotificationCount()
        .then((response) => {
          setUnreadNotifications(response.data.unreadCount);
        })
        .catch(() => setUnreadNotifications(0));
    };

    const handleNotificationsUpdated = (event: Event) => {
      const unreadCount = (event as CustomEvent<{ unreadCount?: number }>).detail
        ?.unreadCount;

      if (typeof unreadCount === "number") {
        setUnreadNotifications(unreadCount);
        return;
      }

      refreshUnreadCount();
    };

    refreshUnreadCount();
    window.addEventListener("dw-notifications-updated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("dw-notifications-updated", handleNotificationsUpdated);
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#c6c6cf] bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#c6c6cf] text-[#0d1b3d]"
              aria-label="Open doctor dashboard navigation"
              onClick={() => setIsOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <p className="text-base font-extrabold text-[#0d1b3d]">DominionWell+</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[#c6c6cf] bg-[#f7f9fc] px-2.5 py-1.5 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-[#64748b]">Time</p>
              <div className="text-[11px] font-bold text-[#001b5e]">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>

            <Link
              href="/dashboard/doctor/notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#c6c6cf] bg-[#f7f9fc] text-[#45464e]"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ba1a1a]" /> : null}
            </Link>
          </div>
        </div>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0f172a]/45"
            aria-label="Close doctor dashboard navigation"
            onClick={() => setIsOpen(false)}
          />

          <aside className="relative z-10 h-full w-[82%] max-w-xs bg-[#0d1b3d] p-4 text-white shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg font-extrabold text-[#7784ac]">DominionWell+</p>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-md bg-white/10"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-white/15 bg-white/5 px-3 py-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#d7dbeb]/70">Signed in as</p>
              <DoctorProfileSummary />
            </div>

            <nav className="space-y-1 text-sm">
              {menuItems.map((item) => {
                const isActive = item.href !== "#" && pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 font-semibold ${
                      isActive ? "bg-[#74fcad] text-[#007443]" : "text-[#d7dbeb]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.label === "Notifications" && unreadNotifications > 0 ? (
                      <span className="ml-auto rounded-full bg-[#16b36c] px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadNotifications}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/15 pt-4">
              <DoctorLogoutButton
                iconClassName="text-[18px]"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#d7dbeb]"
              />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
