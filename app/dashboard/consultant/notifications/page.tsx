"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorPageHeader from "@/components/doctor-page-header";
import DoctorSidebar from "@/components/doctor-sidebar";
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
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <DoctorMobileNav />

      <DoctorSidebar active="notifications" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
        <DoctorPageHeader title="Notifications" description="Stay current with consultation reminders, account activity, and important care workspace updates." icon="notifications" />

        <section className="mb-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined text-[20px]">inbox</span></span><div><h2 className="text-sm font-bold text-[#001b5e] sm:text-base">Inbox</h2><p className="mt-0.5 text-[10px] text-[#8a96a8]">Your latest account activity</p></div></div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#16b36c]/15 px-2.5 py-1 text-[11px] font-semibold text-[#16b36c]">
                {unreadCount} unread
              </span>
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                disabled={isMarkingAll || unreadCount === 0}
                className="rounded-xl border border-[#d9e2ec] px-3 py-2 text-[11px] font-bold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-sm"><div className="flex animate-pulse gap-4"><div className="h-11 w-11 rounded-xl bg-[#edf1f5]" /><div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-[#edf1f5]" /><div className="h-3 w-2/3 rounded bg-[#edf1f5]" /></div></div>
            </div>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-[1.5rem] border border-dashed border-[#cfd9e6] bg-white p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined">notifications_none</span></span><h2 className="mt-4 text-base font-bold text-[#001b5e]">You&apos;re all caught up</h2><p className="mt-2 text-xs text-[#718096]">New reminders and account updates will appear here.</p></div></div>
          ) : null}

          {!isLoading ? notifications.map((item) => (
            <article key={item.id} className={`rounded-[1.5rem] border bg-white p-4 shadow-[0_8px_26px_rgba(30,52,83,0.04)] transition sm:p-5 ${item.unread ? "border-[#b9e8cd] ring-1 ring-[#e3f7eb]" : "border-[#e0e7ef]"}`}>
              <div className="mb-4 flex items-start gap-3 sm:gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.typeClass}`}><span className="material-symbols-outlined text-[20px]">{item.tag.toLowerCase().includes("appointment") || item.tag.toLowerCase().includes("consultation") ? "event" : item.tag.toLowerCase().includes("wallet") || item.tag.toLowerCase().includes("withdrawal") ? "account_balance_wallet" : "notifications"}</span></span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#001b5e] sm:text-base">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#64748b] sm:text-sm">{item.description}</p>
                </div>
                {item.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#16b36c]" aria-label="Unread notification" /> : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-[#edf1f5] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.typeClass}`}>{item.tag}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-[#64748b] sm:text-xs">{item.time}</span>
                  {item.unread ? (
                    <button
                      type="button"
                      onClick={() => void markAsRead(item.id)}
                      disabled={actionId === item.id}
                      className="rounded-lg border border-[#d9e2ec] px-2.5 py-1.5 text-[11px] font-bold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
                    >
                      {actionId === item.id ? "Saving..." : "Mark read"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          )) : null}
        </section>
        </div>
      </main>
    </div>
  );
}
