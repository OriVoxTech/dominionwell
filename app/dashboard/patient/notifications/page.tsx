"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  typeClass: string;
  tag: string;
  unread: boolean;
};

const STORAGE_KEY = "dwPatientNotifications";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "Appointment Reminder",
    description: "Your consultation with Dr. Richardson is tomorrow at 09:30 AM.",
    time: "10 minutes ago",
    typeClass: "bg-[#16b46f]/15 text-[#16b46f]",
    tag: "Reminder",
    unread: true,
  },
  {
    id: "n-2",
    title: "Prescription Updated",
    description: "Dr. Emily Stone updated your dermatology prescription.",
    time: "2 hours ago",
    typeClass: "bg-[#0aa4b4]/15 text-[#0aa4b4]",
    tag: "Medical",
    unread: true,
  },
  {
    id: "n-3",
    title: "Subscription Notice",
    description: "You have 48 consultations left in your current billing cycle.",
    time: "Yesterday",
    typeClass: "bg-[#64748b]/15 text-[#64748b]",
    tag: "Billing",
    unread: false,
  },
  {
    id: "n-4",
    title: "Message from Support",
    description: "Your recent support request has been resolved.",
    time: "2 days ago",
    typeClass: "bg-[#64748b]/15 text-[#64748b]",
    tag: "Support",
    unread: false,
  },
];

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined") {
      return INITIAL_NOTIFICATIONS;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }

    try {
      const parsed = JSON.parse(stored) as NotificationItem[];
      return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("dw-notifications-updated"));
  }, [notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  const toggleReadState = (id: string) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              unread: !item.unread,
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="notifications" />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
        </div>

        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#16b46f]/40">
            <Image
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPurUR2thld9ARCgQv5h5zzRrmbx5VzEhRhGSj-4R3LQBMFeO5bA8OOCajuwGXXWPjtINjhw8-RqL2BIwlmrOkDz58EbqhMGjnRdrjEPNB6wMXEYirVhXLKHukNRiuOjWAxDoEcMTG9A2c2wKRcRRN4U7gxeFEPhJ7G7sLUQezeiulcTpl6y2fsYeeLmQHBuYLxYwyY3mOhVegyEsvP846S3aiHmWvjDLrjKsx9yBY9vkJssTPuipSUEY4d1WwN6dlulgSFUQpfRjW"
              alt="Alex Johnson"
              fill
              sizes="44px"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Alex Johnson</p>
            <p className="text-xs text-[#d8e2ff]">ID: DW-98231</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          <Link href="/dashboard/patient" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/patient/appointments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>Appointments</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b46f] bg-[#16b46f]/20 px-3 py-2 text-[#d7ffe9]">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span>Notifications</span>
          </div>
          <Link href="/dashboard/patient/doctors" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">medical_services</span>
            <span>Browse Doctors</span>
          </Link>
          <Link href="/dashboard/patient/settings" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </Link>
        </nav>

        <Link href="/dashboard/patient/doctors" className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-center text-sm font-semibold text-white">
          Book New Consult
        </Link>

        <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
          <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>Help Center</span>
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2 hover:bg-white/10" href="/">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
        <header className="mb-5 sm:mb-6">
          <div className="mb-3 flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/patient"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h2 className="text-xl font-semibold text-[#001b5e] sm:text-2xl">Notifications</h2>
          </div>
          <p className="text-xs text-[#475569] sm:text-[13px]">Stay updated with your appointments and account activity.</p>
        </header>

        <section className="mb-5 rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#001b5e] sm:text-[15px]">Recent Alerts</h3>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#16b46f]/15 px-2.5 py-1 text-[11px] font-semibold text-[#16b46f]">
                {unreadCount} unread
              </span>
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
              >
                Mark all read
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[#c6c6cf] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#001b5e] sm:text-[15px]">{item.title}</h4>
                  <p className="text-xs text-[#475569] sm:text-[12px] mt-2">{item.description}</p>
                </div>
                {item.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#16b46f]" aria-label="Unread notification" /> : null}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.typeClass}`}>{item.tag}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#64748b] sm:text-xs">{item.time}</span>
                  <button
                    type="button"
                    onClick={() => toggleReadState(item.id)}
                    className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
                  >
                    {item.unread ? "Mark read" : "Mark unread"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
