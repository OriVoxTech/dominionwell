"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import {
  APPOINTMENT_REQUESTS_UPDATED_EVENT,
  readAppointmentRequests,
  type AppointmentRequest,
} from "@/lib/appointments";
import {
  getCurrentMonthKey,
  readDoctorAvailabilityForMonth,
  upsertDoctorAvailabilityForMonth,
  type DoctorDayAvailability,
} from "@/lib/doctor-availability";

type AvailabilityStatus = "Available" | "Busy" | "Offline";

const availabilityOptions: Array<{
  label: AvailabilityStatus;
  value: AvailabilityStatus;
  className: string;
}> = [
  { label: "Available", value: "Available", className: "bg-[#16b36c] text-white" },
  { label: "Busy", value: "Busy", className: "bg-[#f59e0b] text-white" },
  { label: "Offline", value: "Offline", className: "bg-[#475569] text-white" },
];

const CURRENT_DOCTOR_ID = "dr-richardson";

const slotOptions = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

function parseSlotToMinutes(slot: string) {
  const matched = slot.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (!matched) {
    return null;
  }

  const [, rawHour, rawMinute, period] = matched;
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  let hour24 = hour % 12;

  if (period === "PM") {
    hour24 += 12;
  }

  return hour24 * 60 + minute;
}

function isWithinDoctorScheduleWindow(minutes: number) {
  return minutes >= 9 * 60 && minutes <= 21 * 60;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);

  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function buildMonthCells(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const monthIndex = (month || 1) - 1;
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingEmptyCells = firstDay.getDay();
  const cells: Array<{ date: string; day: number; isInMonth: boolean }> = [];

  for (let i = 0; i < leadingEmptyCells; i += 1) {
    cells.push({ date: `empty-${i}`, day: 0, isInMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ date: dateKey, day, isInMonth: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: `empty-tail-${cells.length}`, day: 0, isInMonth: false });
  }

  return cells;
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialSelectableDate(monthKey: string, availability: DoctorDayAvailability) {
  const todayDateKey = getTodayDateKey();
  const allDatesInMonth = buildMonthCells(monthKey)
    .filter((cell) => cell.isInMonth)
    .map((cell) => cell.date)
    .sort();

  const availableDates = Object.keys(availability)
    .filter((dateKey) => dateKey >= todayDateKey)
    .sort();

  if (availableDates.length > 0) {
    return availableDates[0];
  }

  const firstNonPastDate = allDatesInMonth.find((dateKey) => dateKey >= todayDateKey);

  return firstNonPastDate ?? allDatesInMonth[0] ?? `${monthKey}-01`;
}

export default function ConsultantSettingsPage() {
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("Available");
  const [fullName, setFullName] = useState("Dr. Richardson");
  const [specialization, setSpecialization] = useState("Senior Cardiologist");
  const [email, setEmail] = useState("dr.richardson@dominionwell.com");
  const [phone, setPhone] = useState("+1 (202) 555-0188");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [monthAvailability, setMonthAvailability] = useState<DoctorDayAvailability>(() => {
    return readDoctorAvailabilityForMonth(CURRENT_DOCTOR_ID, getCurrentMonthKey());
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const initialMonth = getCurrentMonthKey();
    const initialAvailability = readDoctorAvailabilityForMonth(CURRENT_DOCTOR_ID, initialMonth);

    return getInitialSelectableDate(initialMonth, initialAvailability);
  });
  const [customSlot, setCustomSlot] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [availabilityToastMessage, setAvailabilityToastMessage] = useState("");
  const [slotErrorMessage, setSlotErrorMessage] = useState("");
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);

  const saveProfile = () => {
    setSuccessMessage("Profile updated successfully.");
  };

  const loadMonthAvailability = (monthKey: string) => {
    const stored = readDoctorAvailabilityForMonth(CURRENT_DOCTOR_ID, monthKey);
    setMonthAvailability(stored);
    setSelectedDate(getInitialSelectableDate(monthKey, stored));
  };

  useEffect(() => {
    if (!availabilityToastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAvailabilityToastMessage("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [availabilityToastMessage]);

  useEffect(() => {
    const syncRequests = () => {
      setAppointmentRequests(readAppointmentRequests());
    };

    syncRequests();
    window.addEventListener("storage", syncRequests);
    window.addEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncRequests);

    return () => {
      window.removeEventListener("storage", syncRequests);
      window.removeEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, syncRequests);
    };
  }, []);

  const monthCells = useMemo(() => buildMonthCells(selectedMonth), [selectedMonth]);

  const selectedDateSlots = monthAvailability[selectedDate] ?? [];
  const isSelectedDatePast = Boolean(selectedDate) && selectedDate < getTodayDateKey();

  const bookedSlotsByDate = useMemo(() => {
    const next: Record<string, string[]> = {};

    appointmentRequests.forEach((request) => {
      if (request.doctorId !== CURRENT_DOCTOR_ID) {
        return;
      }

      if (!request.date.startsWith(`${selectedMonth}-`)) {
        return;
      }

      if (request.status !== "Booked" && request.status !== "Accepted") {
        return;
      }

      const current = next[request.date] ?? [];

      if (!current.includes(request.timeSlot)) {
        next[request.date] = [...current, request.timeSlot].sort();
      }
    });

    return next;
  }, [appointmentRequests, selectedMonth]);

  const selectedDateBookedSlots = bookedSlotsByDate[selectedDate] ?? [];

  const toggleSlot = (slot: string) => {
    if (isSelectedDatePast || selectedDateBookedSlots.includes(slot)) {
      return;
    }

    setMonthAvailability((current) => {
      const currentSlots = current[selectedDate] ?? [];
      const hasSlot = currentSlots.includes(slot);
      const nextSlots = hasSlot
        ? currentSlots.filter((item) => item !== slot)
        : [...currentSlots, slot].sort();

      return {
        ...current,
        [selectedDate]: nextSlots,
      };
    });
  };

  const clearSelectedDay = () => {
    if (isSelectedDatePast) {
      return;
    }

    setMonthAvailability((current) => {
      const next = { ...current };
      delete next[selectedDate];
      return next;
    });
  };

  const addCustomSlot = () => {
    if (isSelectedDatePast) {
      setSlotErrorMessage("Past dates cannot be edited.");
      return;
    }

    const normalized = customSlot.trim().toUpperCase();

    if (!normalized) {
      return;
    }

    const parsedMinutes = parseSlotToMinutes(normalized);

    if (parsedMinutes === null) {
      setSlotErrorMessage("Use the format HH:MM AM/PM, e.g. 09:30 AM.");
      return;
    }

    if (!isWithinDoctorScheduleWindow(parsedMinutes)) {
      setSlotErrorMessage("Only slots between 09:00 AM and 09:00 PM are allowed.");
      return;
    }

    if (selectedDateBookedSlots.includes(normalized)) {
      setSlotErrorMessage("That slot is already taken/booked and cannot be edited.");
      return;
    }

    setMonthAvailability((current) => {
      const currentSlots = current[selectedDate] ?? [];

      if (currentSlots.includes(normalized)) {
        return current;
      }

      return {
        ...current,
        [selectedDate]: [...currentSlots, normalized].sort(),
      };
    });

    setSlotErrorMessage("");
    setCustomSlot("");
  };

  const saveMonthAvailability = () => {
    upsertDoctorAvailabilityForMonth(CURRENT_DOCTOR_ID, selectedMonth, monthAvailability);
    setAvailabilityToastMessage(`Availability saved for ${getMonthLabel(selectedMonth)}.`);
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
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/consultations">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/patients">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span>Notifications</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-10 lg:ml-[280px]">
        {availabilityToastMessage ? (
          <div className="fixed right-4 top-4 z-50 w-full max-w-sm rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 shadow-lg sm:right-6 sm:top-6 lg:right-8">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[#166534]">check_circle</span>
              <p className="text-sm font-semibold text-[#166534]">{availabilityToastMessage}</p>
            </div>
          </div>
        ) : null}

        <header className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/doctor"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Settings</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">Manage doctor availability and update profile details.</p>
        </header>

        <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#00020d]">Availability</h2>
              <p className="text-sm text-[#475569]">Switch your current consultation status between available, busy, and offline.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {availabilityOptions.map((option) => {
                const isActive = availabilityStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvailabilityStatus(option.value)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isActive ? option.className : "bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#00020d]">Monthly Availability Calendar</h2>
              <p className="text-sm text-[#475569]">Select a month, click a day, then set time slots for that date.</p>
            </div>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Month</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => {
                  const nextMonth = event.target.value;
                  setSelectedMonth(nextMonth);
                  loadMonthAvailability(nextMonth);
                }}
                className="h-10 rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-xl border border-[#e2e8f0] p-3">
              <h3 className="mb-3 text-sm font-semibold text-[#001b5e]">{getMonthLabel(selectedMonth)}</h3>
              <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthCells.map((cell) => {
                  if (!cell.isInMonth) {
                    return <div key={cell.date} className="h-[82px] rounded-lg bg-transparent" />;
                  }

                  const slots = monthAvailability[cell.date] ?? [];
                  const bookedSlots = bookedSlotsByDate[cell.date] ?? [];
                  const bookedCount = bookedSlots.length;
                  const isFullyBooked = slots.length > 0 && bookedCount >= slots.length;
                  const isPastDate = cell.date < getTodayDateKey();
                  const isSelected = selectedDate === cell.date;

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      disabled={isPastDate}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`h-[82px] rounded-lg border p-2 text-left transition ${
                        isPastDate
                          ? "cursor-not-allowed border-[#e2e8f0] bg-[#f8fafc] opacity-60"
                          : isSelected
                          ? "border-[#001b5e] bg-[#eff6ff]"
                          : slots.length > 0
                            ? "border-[#16b36c]/40 bg-[#f0fdf4]"
                            : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-[#0f172a]">{cell.day}</div>
                      <div className="mt-1 text-[11px] text-[#475569]">
                        {slots.length > 0 ? `${slots.length} slot(s)` : "No slots"}
                      </div>
                      {bookedCount > 0 ? (
                        <div className={`mt-1 text-[11px] font-semibold ${isFullyBooked ? "text-[#b91c1c]" : "text-[#b45309]"}`}>
                          {isFullyBooked ? "Fully booked" : `${bookedCount} timeslot booked`}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-3">
              <h3 className="mb-1 text-sm font-semibold text-[#001b5e]">{selectedDate || "Pick a day"}</h3>
              <p className="mb-3 text-xs text-[#64748b]">Set available time slots for this date (09:00 AM to 09:00 PM).</p>

              {isSelectedDatePast ? (
                <div className="mb-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2 text-xs font-semibold text-[#64748b]">
                  Past dates are locked and cannot be edited.
                </div>
              ) : null}

              {selectedDateBookedSlots.length > 0 ? (
                <div className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-2">
                  <p className="mb-2 text-xs font-semibold text-[#b91c1c]">Time slot taken</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDateBookedSlots.map((slot) => (
                      <span key={slot} className="rounded-full bg-[#fee2e2] px-2 py-1 text-[11px] font-semibold text-[#991b1b]">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-3 grid grid-cols-2 gap-2">
                {slotOptions.map((slot) => {
                  const isSelected = selectedDateSlots.includes(slot);
                  const isTakenSlot = selectedDateBookedSlots.includes(slot);

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isSelectedDatePast || isTakenSlot}
                      onClick={() => toggleSlot(slot)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                        isSelectedDatePast || isTakenSlot
                          ? "cursor-not-allowed border-[#e2e8f0] bg-[#f1f5f9] text-[#94a3b8]"
                          : isSelected
                          ? "border-[#16b36c] bg-[#16b36c] text-white"
                          : "border-[#c6c6cf] bg-white text-[#334155] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {isTakenSlot ? `${slot} (Taken)` : slot}
                    </button>
                  );
                })}
              </div>

              <div className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={customSlot}
                  onChange={(event) => setCustomSlot(event.target.value)}
                  placeholder="Custom slot e.g. 09:30 AM"
                  className="h-9 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4]"
                />
                <button
                  type="button"
                  onClick={addCustomSlot}
                  disabled={isSelectedDatePast}
                  className="rounded-lg border border-[#001b5e] px-3 text-xs font-semibold text-[#001b5e] hover:bg-[#eef2ff]"
                >
                  Add
                </button>
              </div>

              {slotErrorMessage ? <p className="mb-3 text-xs text-[#b91c1c]">{slotErrorMessage}</p> : null}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={clearSelectedDay}
                  disabled={isSelectedDatePast}
                  className="rounded-lg border border-[#ef4444]/40 px-3 py-2 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                >
                  Clear Day
                </button>
                <button
                  type="button"
                  onClick={saveMonthAvailability}
                  className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                >
                  Save Availability
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-4 text-base font-semibold text-[#00020d]">Update Profile</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Specialization</span>
              <input
                type="text"
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Phone</span>
              <input
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            {successMessage ? <p className="mr-auto text-sm text-[#166534]">{successMessage}</p> : null}
            <button
              type="button"
              onClick={saveProfile}
              className="rounded-lg bg-[#001b5e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
            >
              Save Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
