"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientProfileSummary from "@/components/patient-profile-summary";
import {
  getApiErrorMessage,
  patientApiService,
  type PatientNotification,
  type PatientNotificationsResponse,
} from "@/lib/api";
import { usePatientProfile } from "@/lib/use-patient-profile";

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

  if (normalized.includes("appointment") || normalized.includes("reminder")) {
    return "bg-[#16b46f]/15 text-[#16b46f]";
  }

  if (normalized.includes("subscription") || normalized.includes("payment")) {
    return "bg-[#0aa4b4]/15 text-[#0aa4b4]";
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

export default function PatientNotificationsPage() {
  const profile = usePatientProfile();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [notice, setNotice] = useState("");

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await patientApiService.listNotifications();
      setNotifications(getNotificationList(response.data).map(mapNotification));
      setNotice("");
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
    window.dispatchEvent(new Event("dw-notifications-updated"));
  }, [unreadCount]);

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    setNotice("");

    try {
      await patientApiService.markAllNotificationsAsRead();
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
      await patientApiService.markNotificationAsRead(id);
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
      <PatientMobileNav active="notifications" />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
        </div>

        <div className="mb-6 flex items-center gap-3 px-2">
          <PatientAvatar profile={profile} />
          <PatientProfileSummary />
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
          <Link href="/dashboard/patient/subscription" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">card_membership</span>
            <span>Subscription</span>
          </Link>
          <Link href="/dashboard/patient/payments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Payments</span>
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
          <PatientLogoutButton className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
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
                disabled={isMarkingAll || unreadCount === 0}
                className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMarkingAll ? "Marking..." : "Mark all read"}
              </button>
            </div>
          </div>
        </section>

        {notice ? (
          <p role="alert" className="mb-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
            {notice}
          </p>
        ) : null}

        <section className="space-y-3">
          {isLoading ? (
            <p className="rounded-2xl border border-[#c6c6cf] bg-white p-5 text-sm text-[#64748b] shadow-sm">
              Loading notifications...
            </p>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <p className="rounded-2xl border border-[#c6c6cf] bg-white p-5 text-sm text-[#64748b] shadow-sm">
              No notifications yet.
            </p>
          ) : null}

          {!isLoading ? notifications.map((item) => (
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
                    onClick={() => markAsRead(item.id)}
                    disabled={!item.unread || actionId === item.id}
                    className="rounded-lg border border-[#c6c6cf] px-2.5 py-1 text-[11px] font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionId === item.id ? "Marking..." : item.unread ? "Mark read" : "Read"}
                  </button>
                </div>
              </div>
            </article>
          )) : null}
        </section>
      </main>
    </div>
  );
}
