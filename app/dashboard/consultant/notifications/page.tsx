"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  doctorApiService,
  getApiErrorMessage,
  type PatientNotification,
  type PatientNotificationsResponse,
} from "@/lib/api";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  typeClass: string;
  tag: string;
  unread: boolean;
};

function getNotificationList(
  response: PatientNotificationsResponse | PatientNotification[],
) {
  return Array.isArray(response) ? response : (response.data ?? []);
}

function getStringValue(
  notification: PatientNotification,
  keys: Array<keyof PatientNotification>,
) {
  for (const key of keys) {
    const value = notification[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function getNotificationUnreadState(notification: PatientNotification) {
  if (typeof notification.isRead === "boolean") return !notification.isRead;
  if (typeof notification.read === "boolean") return !notification.read;
  if (typeof notification.unread === "boolean") return notification.unread;
  return !notification.readAt;
}

function formatNotificationTime(value?: string) {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString();
}

function formatNotificationTag(value: string) {
  if (!value) return "Notification";

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getTypeClass(tag: string) {
  const normalized = tag.toLowerCase();

  if (
    normalized.includes("appointment") ||
    normalized.includes("consultation") ||
    normalized.includes("reminder")
  ) {
    return "bg-[#16b36c]/15 text-[#16b36c]";
  }

  if (
    normalized.includes("wallet") ||
    normalized.includes("withdrawal") ||
    normalized.includes("payment")
  ) {
    return "bg-[#67d6e7]/20 text-[#0093a2]";
  }

  return "bg-[#64748b]/15 text-[#64748b]";
}

function mapNotification(notification: PatientNotification): NotificationItem {
  const tag = formatNotificationTag(
    getStringValue(notification, ["type", "category"]),
  );

  return {
    id: notification.id,
    title:
      getStringValue(notification, ["title", "subject"]) || "Notification",
    description:
      getStringValue(notification, ["message", "body", "content"]) ||
      "You have a new update from DominionWell+.",
    time: formatNotificationTime(notification.createdAt ?? notification.updatedAt),
    typeClass: getTypeClass(tag),
    tag,
    unread: getNotificationUnreadState(notification),
  };
}

export default function ConsultantNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const loadNotifications = async () => {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await doctorApiService.listNotifications();
      setNotifications(getNotificationList(response.data).map(mapNotification));
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("dw-notifications-updated", {
        detail: { unreadCount },
      }),
    );
  }, [unreadCount]);

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    setNotice("");

    try {
      await doctorApiService.markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, unread: false })),
      );
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const markAsRead = async (id: string) => {
    setActionId(id);
    setNotice("");

    try {
      await doctorApiService.markNotificationAsRead(id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, unread: false } : item,
        ),
      );
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    } finally {
      setActionId(null);
    }
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
              alt="Doctor profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <DoctorProfileSummary />
        </div>

        <div className="flex-grow space-y-2 text-sm">
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/consultations">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">notifications</span>
            <span>Notifications</span>
          </div>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/patients">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/wallet">
            <span className="material-symbols-outlined">wallet</span>
            <span>Wallet</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/settings">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <a className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="#">
            <span className="material-symbols-outlined">help</span>
            <span>Help Center</span>
          </a>
          <DoctorLogoutButton className="flex w-full items-center gap-3 p-3 text-left text-[#7784ac]/85 hover:bg-[#00020d]/10" />
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
                onClick={() => void markAllAsRead()}
                disabled={isMarkingAll || unreadCount === 0}
                className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#00020d] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMarkingAll ? "Saving..." : "Mark all read"}
              </button>
            </div>
          </div>
          {notice ? (
            <div role="alert" className="mt-3 flex flex-col gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => void loadNotifications()}
                className="rounded-md border border-[#fca5a5] px-2 py-1 text-xs font-semibold hover:bg-white"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-[#eaecf0] bg-white p-5 text-sm text-[#64748b] shadow-sm">
              Loading notifications...
            </div>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <div className="rounded-2xl border border-[#eaecf0] bg-white p-5 text-sm text-[#64748b] shadow-sm">
              No notifications yet.
            </div>
          ) : null}

          {!isLoading ? notifications.map((item) => (
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
                  {item.unread ? (
                    <button
                      type="button"
                      onClick={() => void markAsRead(item.id)}
                      disabled={actionId === item.id}
                      className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#00020d] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
                    >
                      {actionId === item.id ? "Saving..." : "Mark read"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          )) : null}
        </section>
      </main>
    </div>
  );
}
