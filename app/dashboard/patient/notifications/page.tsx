"use client";

import { useEffect, useMemo, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientPageHeader from "@/components/patient-page-header";
import PatientSidebar from "@/components/patient-sidebar";
import {
  getApiErrorMessage,
  patientApiService,
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
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <PatientMobileNav active="notifications" />
      <PatientSidebar active="notifications" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]"><div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
        <PatientPageHeader title="Notifications" description="Stay updated with appointment reminders, care messages, and account activity." icon="notifications" />
        <section className="mb-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-5">
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
            <article key={item.id} className={`rounded-[1.5rem] border bg-white p-4 shadow-[0_8px_26px_rgba(30,52,83,0.04)] sm:p-5 ${item.unread ? "border-[#b9e8cd] ring-1 ring-[#e3f7eb]" : "border-[#e0e7ef]"}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#001b5e] sm:text-[15px]">{item.title}</h4>
                  <p className="text-xs text-[#475569] sm:text-[12px] mt-2">{item.description}</p>
                </div>
                {item.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#16b46f]" aria-label="Unread notification" /> : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#edf1f5] pt-3 sm:flex-row sm:items-center sm:justify-between">
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
      </div></main>
    </div>
  );
}
