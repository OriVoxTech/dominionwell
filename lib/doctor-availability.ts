export type DoctorDayAvailability = Record<string, string[]>;

type DoctorAvailabilityStore = Record<string, Record<string, DoctorDayAvailability>>;

type DoctorCalendarDay = {
  date: string;
  label: string;
  timeSlots: string[];
};

type DoctorLike = {
  id: string;
  calendar: DoctorCalendarDay[];
};

export const DOCTOR_AVAILABILITY_KEY = "dwDoctorAvailability";
export const DOCTOR_AVAILABILITY_UPDATED_EVENT = "dw-doctor-availability-updated";

function canUseDOM() {
  return typeof window !== "undefined";
}

function monthKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

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

function normalizeSlots(slots: string[]) {
  const normalizedUnique = Array.from(new Set(slots.map((slot) => slot.trim().toUpperCase()).filter(Boolean)));

  return normalizedUnique
    .filter((slot) => {
      const minutes = parseSlotToMinutes(slot);
      return minutes !== null && isWithinDoctorScheduleWindow(minutes);
    })
    .sort((slotA, slotB) => {
      const minutesA = parseSlotToMinutes(slotA) ?? 0;
      const minutesB = parseSlotToMinutes(slotB) ?? 0;
      return minutesA - minutesB;
    });
}

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function parseStore(value: string | null): DoctorAvailabilityStore {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as DoctorAvailabilityStore;

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

function writeStore(store: DoctorAvailabilityStore) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.setItem(DOCTOR_AVAILABILITY_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(DOCTOR_AVAILABILITY_UPDATED_EVENT));
}

export function readDoctorAvailabilityStore() {
  if (!canUseDOM()) {
    return {};
  }

  return parseStore(window.localStorage.getItem(DOCTOR_AVAILABILITY_KEY));
}

export function readDoctorAvailabilityForMonth(doctorId: string, monthKey: string) {
  const store = readDoctorAvailabilityStore();
  const doctorStore = store[doctorId] ?? {};
  return doctorStore[monthKey] ?? {};
}

export function upsertDoctorAvailabilityForMonth(doctorId: string, monthKey: string, dayAvailability: DoctorDayAvailability) {
  const store = readDoctorAvailabilityStore();
  const doctorStore = store[doctorId] ?? {};

  const cleaned: DoctorDayAvailability = {};

  Object.entries(dayAvailability).forEach(([date, slots]) => {
    const normalized = normalizeSlots(slots);

    if (normalized.length > 0) {
      cleaned[date] = normalized;
    }
  });

  const nextStore: DoctorAvailabilityStore = {
    ...store,
    [doctorId]: {
      ...doctorStore,
      [monthKey]: cleaned,
    },
  };

  writeStore(nextStore);
}

export function resolveDoctorCalendar(doctor: DoctorLike) {
  const store = readDoctorAvailabilityStore();
  const doctorStore = store[doctor.id];

  if (!doctorStore) {
    return doctor.calendar;
  }

  const mergedByDate: Record<string, string[]> = {};

  Object.values(doctorStore).forEach((monthAvailability) => {
    Object.entries(monthAvailability).forEach(([date, slots]) => {
      const normalized = normalizeSlots(slots);

      if (normalized.length > 0) {
        mergedByDate[date] = normalized;
      }
    });
  });

  const mergedDays = Object.entries(mergedByDate)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, timeSlots]) => ({
      date,
      label: formatDateLabel(date),
      timeSlots,
    }));

  return mergedDays.length > 0 ? mergedDays : doctor.calendar;
}

export function getCurrentMonthKey() {
  return monthKeyFromDate(new Date());
}
