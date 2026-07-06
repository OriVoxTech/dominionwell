"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard/doctor" },
  { label: "Consultations", icon: "medical_services", href: "#" },
  { label: "Notifications", icon: "notifications", href: "/dashboard/doctor/notifications" },
  { label: "Patients", icon: "group", href: "#" },
  { label: "Schedule", icon: "calendar_month", href: "#" },
  { label: "Reports", icon: "analytics", href: "#" },
  { label: "Settings", icon: "settings", href: "#" },
];

export default function DoctorMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const refreshUnreadCount = () => {
      const stored = window.localStorage.getItem("dwDoctorNotifications");

      if (!stored) {
        setUnreadNotifications(0);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as Array<{ unread?: boolean }>;
        const unreadCount = Array.isArray(parsed) ? parsed.filter((item) => item.unread).length : 0;
        setUnreadNotifications(unreadCount);
      } catch {
        setUnreadNotifications(0);
      }
    };

    refreshUnreadCount();
    window.addEventListener("storage", refreshUnreadCount);
    window.addEventListener("dw-notifications-updated", refreshUnreadCount);

    return () => {
      window.removeEventListener("storage", refreshUnreadCount);
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
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#c6c6cf] text-[#0d1b3d]"
              aria-label="Open doctor dashboard navigation"
              onClick={() => setIsOpen(true)}
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <p className="text-base font-extrabold text-[#0d1b3d]">DominionWell+</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-[#16b36c] px-2.5 py-1.5 text-xs font-semibold text-white"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            New Consult
          </button>
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

            <nav className="space-y-1 text-sm">
              {menuItems.map((item, index) => {
                const isActive = index === 0;

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
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#d7dbeb]"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Logout</span>
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}