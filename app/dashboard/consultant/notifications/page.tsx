"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  typeClass: string;
  tag: string;
  unread: boolean;
};

const STORAGE_KEY = "dwDoctorNotifications";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "d-n-1",
    title: "New Consultation Request",
    description: "Arthur Morgan submitted a cardiology consultation request.",
    time: "5 minutes ago",
    typeClass: "bg-[#16b36c]/15 text-[#16b36c]",
    tag: "Request",
    unread: true,
  },
  {
    id: "d-n-2",
    title: "Lab Result Ready",
    description: "Quest Diagnostics uploaded results for patient #3302.",
    time: "1 hour ago",
    typeClass: "bg-[#67d6e7]/20 text-[#0093a2]",
    tag: "Lab",
    unread: true,
  },
  {
    id: "d-n-3",
    title: "Schedule Reminder",
    description: "Post-op review with Jim Halpert starts in 30 minutes.",
    time: "Today",
    typeClass: "bg-[#64748b]/15 text-[#64748b]",
    tag: "Schedule",
    unread: false,
  },
  {
    id: "d-n-4",
    title: "System Notice",
    description: "DominionWell platform maintenance is scheduled for Sunday.",
    time: "Yesterday",
    typeClass: "bg-[#64748b]/15 text-[#64748b]",
    tag: "System",
    unread: false,
  },
];

export default function ConsultantNotificationsPage() {
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
      <DoctorMobileNav />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] flex-col bg-[#0d1b3d] px-4 py-8 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <span className="text-1xl font-extrabold text-[#7784ac]">DominionWell+</span>
        </div>

        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#16b36c] bg-[#e0e3e6]">
            <Image
              className="object-cover"
              alt="Dr. Richardson"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-[#7784ac]">Dr. Richardson</p>
            <p className="text-xs text-[#7784ac]/80">Senior Cardiologist</p>
          </div>
        </div>

        <div className="flex-grow space-y-2 text-sm">
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </a>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">notifications</span>
            <span>Notifications</span>
          </div>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Schedule</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </a>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#16b36c] px-4 py-3 font-semibold text-white">
            <span className="material-symbols-outlined">add</span>
            <span>New Consultation</span>
          </button>
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">help</span>
            <span>Help Center</span>
          </a>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[280px]">
        <header className="mb-5 sm:mb-6">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/doctor"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#16b36c] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Notifications</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">Monitor requests, alerts, and reminders from your care workspace.</p>
        </header>

        <section className="mb-5 rounded-2xl border border-[#eaecf0] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#00020d] sm:text-base">Inbox</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#16b36c]/15 px-2.5 py-1 text-[11px] font-semibold text-[#16b36c]">
                {unreadCount} unread
              </span>
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#00020d] hover:bg-[#f8fafc]"
              >
                Mark all read
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[#eaecf0] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#00020d] sm:text-base">{item.title}</h3>
                  <p className="text-xs text-[#45464e] sm:text-sm">{item.description}</p>
                </div>
                {item.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#16b36c]" aria-label="Unread notification" /> : null}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.typeClass}`}>{item.tag}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#64748b] sm:text-xs">{item.time}</span>
                  <button
                    type="button"
                    onClick={() => toggleReadState(item.id)}
                    className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#00020d] hover:bg-[#f8fafc]"
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
