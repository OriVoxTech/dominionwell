"use client";

import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorChangePasswordModal from "@/components/doctor-change-password-modal";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  readDoctorBankDetails,
  updateDoctorBankDetails,
  type DoctorBankDetails,
} from "@/lib/admin-portal";
import { setCachedDoctorProfile } from "@/lib/use-doctor-profile";
import {
  getCurrentMonthKey,
  type DoctorDayAvailability,
} from "@/lib/doctor-availability";
import {
  doctorApiService,
  doctorApplicationsApiService,
  getApiErrorMessage,
  type AdminSpecialty,
  type DoctorAvailabilityCalendarResponse,
  type UpdateDoctorProfilePayload,
} from "@/lib/api";

type AvailabilityStatus = "Available" | "Busy" | "Offline";
type PresenceStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

const availabilityOptions: Array<{
  label: AvailabilityStatus;
  value: AvailabilityStatus;
  presenceStatus: PresenceStatus;
  className: string;
}> = [
  { label: "Available", value: "Available", presenceStatus: "AVAILABLE", className: "bg-[#16b36c] text-white" },
  { label: "Busy", value: "Busy", presenceStatus: "BUSY", className: "bg-[#f59e0b] text-white" },
  { label: "Offline", value: "Offline", presenceStatus: "OFFLINE", className: "bg-[#475569] text-white" },
];

const CURRENT_DOCTOR_ID = "dr-richardson";

const nigerianBanks = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Microfinance Bank", code: "50211" },
  { name: "Lotus Bank", code: "303" },
  { name: "Moniepoint Microfinance Bank", code: "50515" },
  { name: "OPay Digital Services", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Parallex Bank", code: "104" },
  { name: "Polaris Bank", code: "076" },
  { name: "PremiumTrust Bank", code: "105" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "TAJ Bank", code: "302" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "566" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
] as const;

function formatSpecialization(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAvailabilityStatusFromPresenceStatus(status: unknown): AvailabilityStatus {
  if (status === "BUSY") return "Busy";
  if (status === "OFFLINE") return "Offline";
  return "Available";
}

function getPresenceStatusFromAvailability(status: AvailabilityStatus): PresenceStatus {
  return availabilityOptions.find((option) => option.value === status)?.presenceStatus ?? "AVAILABLE";
}

const slotOptions = [
  "09:00 AM",
  "10:15 AM",
  "11:30 AM",
  "12:45 PM",
  "02:00 PM",
  "03:15 PM",
  "04:30 PM",
  "05:45 PM",
  "07:00 PM",
  "08:15 PM",
];

const SLOT_DURATION_MINUTES = 60;
const SLOT_BREAK_MINUTES = 15;
const SLOT_START_INTERVAL_MINUTES =
  SLOT_DURATION_MINUTES + SLOT_BREAK_MINUTES;

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

function conflictsWithSlotBreak(candidate: string, existingSlots: string[]) {
  const candidateMinutes = parseSlotToMinutes(candidate);
  if (candidateMinutes === null) return true;

  return existingSlots.some((existingSlot) => {
    const existingMinutes = parseSlotToMinutes(existingSlot);
    return (
      existingMinutes !== null &&
      Math.abs(candidateMinutes - existingMinutes) < SLOT_START_INTERVAL_MINUTES
    );
  });
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

function isSlotStartInPast(dateKey: string, slot: string) {
  if (dateKey !== getTodayDateKey()) return false;

  const slotMinutes = parseSlotToMinutes(slot);
  if (slotMinutes === null) return true;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= currentMinutes;
}

function formatAvailabilityStartTime(slot: string) {
  const minutes = parseSlotToMinutes(slot);
  if (minutes === null) {
    return null;
  }

  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function formatAvailabilityTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
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
  const [bankDetails, setBankDetails] = useState<DoctorBankDetails>(() => readDoctorBankDetails(CURRENT_DOCTOR_ID));
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("Available");
  const [fullName, setFullName] = useState("Doctor");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("0");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [specialties, setSpecialties] = useState<AdminSpecialty[]>([]);
  const [specialtiesError, setSpecialtiesError] = useState("");
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [monthAvailability, setMonthAvailability] = useState<DoctorDayAvailability>({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const initialMonth = getCurrentMonthKey();
    return getInitialSelectableDate(initialMonth, {});
  });
  const [customSlot, setCustomSlot] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [availabilityToastMessage, setAvailabilityToastMessage] = useState("");
  const [slotErrorMessage, setSlotErrorMessage] = useState("");
  const [availabilityCalendar, setAvailabilityCalendar] =
    useState<DoctorAvailabilityCalendarResponse | null>(null);
  const [calendarError, setCalendarError] = useState("");
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);
  const [isClearingDay, setIsClearingDay] = useState(false);

  const loadDoctorProfile = useCallback(async () => {
    setProfileError("");
    setIsLoadingProfile(true);

    try {
      const response = await doctorApiService.getProfile();
      const profile = response.data;
      const name = [profile.user.firstName, profile.user.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");

      setFullName(name ? `Dr. ${name}` : profile.user.username);
      setFirstName(profile.user.firstName);
      setLastName(profile.user.lastName);
      setSpecialization(
        profile.specializations[0] || "",
      );
      setAvailabilityStatus(getAvailabilityStatusFromPresenceStatus(profile.presenceStatus));
      setYearsOfExperience(String(profile.yearsOfExperience ?? 0));
      setEmail(profile.user.email);
      setPhone(profile.user.phone ?? "");
      setUsername(profile.user.username);
      setBio(profile.bio);
      setVerifiedAt(profile.verifiedAt);
    } catch (error) {
      setProfileError(getApiErrorMessage(error));
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDoctorProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDoctorProfile]);

  const loadSpecialties = useCallback(async () => {
    setSpecialtiesError("");
    setIsLoadingSpecialties(true);

    try {
      const response = await doctorApplicationsApiService.listSpecialties();
      setSpecialties(
        response.data.filter((specialty) => specialty.isActive !== false),
      );
    } catch (error) {
      setSpecialtiesError(getApiErrorMessage(error));
      setSpecialties([]);
    } finally {
      setIsLoadingSpecialties(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSpecialties();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSpecialties]);

  const getProfilePayload = (
    nextAvailabilityStatus = availabilityStatus,
  ): { payload: UpdateDoctorProfilePayload; selectedBank?: (typeof nigerianBanks)[number] } | { error: string } => {
    const normalizedSpecialization = specialization.trim();
    const normalizedYearsOfExperience = Math.max(
      0,
      Math.floor(Number(yearsOfExperience) || 0),
    );

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !normalizedSpecialization ||
      (specialties.length > 0 &&
        !specialties.some(
          (specialty) => specialty.name === normalizedSpecialization,
        ))
    ) {
      return {
        error:
          "First name, last name, phone number, and specialization are required.",
      };
    }

    const selectedBank = nigerianBanks.find(
      (bank) => bank.name === bankDetails.bankName,
    );
    const hasAnyBankDetail = Boolean(
      bankDetails.bankName.trim() ||
        bankDetails.accountName.trim() ||
        bankDetails.accountNumber.trim(),
    );

    if (hasAnyBankDetail) {
      if (!selectedBank) {
        return { error: "Please select a bank from the dropdown." };
      }

      if (!bankDetails.accountName.trim()) {
        return { error: "Account name is required for bank details." };
      }

      if (!/^\d{10}$/.test(bankDetails.accountNumber)) {
        return { error: "Account number must be exactly 10 digits." };
      }
    }

    return {
      payload: {
        bio: bio?.trim() ?? "",
        specializations: [normalizedSpecialization],
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        presenceStatus: getPresenceStatusFromAvailability(nextAvailabilityStatus),
        yearsOfExperience: normalizedYearsOfExperience,
        ...(hasAnyBankDetail && selectedBank
          ? {
              bankName: selectedBank.name,
              bankCode: selectedBank.code,
              bankAccountName: bankDetails.accountName.trim(),
              bankAccountNumber: bankDetails.accountNumber.trim(),
            }
          : {}),
      },
      selectedBank,
    };
  };

  const applyProfileResponse = (
    profile: Awaited<ReturnType<typeof doctorApiService.updateProfile>>["data"],
    fallbackSpecialization = specialization.trim(),
    fallbackYearsOfExperience = Math.max(
      0,
      Math.floor(Number(yearsOfExperience) || 0),
    ),
  ) => {
    const name = [profile.user.firstName, profile.user.lastName]
      .filter(Boolean)
      .join(" ");

    setFullName(name ? `Dr. ${name}` : profile.user.username);
    setFirstName(profile.user.firstName);
    setLastName(profile.user.lastName);
    setPhone(profile.user.phone ?? "");
    setBio(profile.bio);
    setSpecialization(
      profile.specializations[0] || fallbackSpecialization,
    );
    setYearsOfExperience(String(profile.yearsOfExperience ?? fallbackYearsOfExperience));
    setAvailabilityStatus(getAvailabilityStatusFromPresenceStatus(profile.presenceStatus));
  };

  const handleProfileImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setProfileImagePreview(previewUrl);
    setProfileSaveError("");
    setSuccessMessage("");
    setIsUploadingProfileImage(true);

    try {
      const response = await doctorApiService.uploadProfileImage(selectedFile);
      setCachedDoctorProfile(response.data);
      applyProfileResponse(response.data);
      setSuccessMessage("Profile image uploaded successfully.");
    } catch (error) {
      setProfileSaveError(getApiErrorMessage(error));
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

  const saveProfile = async () => {
    const profilePayload = getProfilePayload();

    if ("error" in profilePayload) {
      setProfileSaveError(profilePayload.error);
      return;
    }

    setProfileSaveError("");
    setSuccessMessage("");
    setIsSavingProfile(true);

    try {
      const response = await doctorApiService.updateProfile(profilePayload.payload);
      applyProfileResponse(response.data);

      if (profilePayload.selectedBank) {
        updateDoctorBankDetails(CURRENT_DOCTOR_ID, {
          bankName: profilePayload.selectedBank.name,
          accountName: bankDetails.accountName.trim(),
          accountNumber: bankDetails.accountNumber.trim(),
        });
      }

      setSuccessMessage(
        profilePayload.selectedBank
          ? "Profile and bank details updated successfully."
          : "Profile updated successfully.",
      );
    } catch (error) {
      setProfileSaveError(getApiErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updatePresenceStatus = async (nextStatus: AvailabilityStatus) => {
    if (nextStatus === availabilityStatus || isLoadingProfile || isSavingProfile || isSavingStatus) {
      return;
    }

    const previousStatus = availabilityStatus;
    const profilePayload = getProfilePayload(nextStatus);

    if ("error" in profilePayload) {
      setProfileSaveError(profilePayload.error);
      return;
    }

    setProfileSaveError("");
    setSuccessMessage("");
    setAvailabilityStatus(nextStatus);
    setIsSavingStatus(true);

    try {
      const response = await doctorApiService.updateProfile(profilePayload.payload);
      applyProfileResponse(response.data);
      setSuccessMessage(`Status updated to ${nextStatus}.`);
    } catch (error) {
      setAvailabilityStatus(previousStatus);
      setProfileSaveError(getApiErrorMessage(error));
    } finally {
      setIsSavingStatus(false);
    }
  };

  const loadAvailabilityCalendar = useCallback(async (monthKey: string) => {
    const [year, month] = monthKey.split("-").map(Number);
    setCalendarError("");
    setIsLoadingCalendar(true);

    try {
      const response = await doctorApiService.getAvailabilityCalendar(
        year,
        month,
      );
      setAvailabilityCalendar(response.data);
    } catch (error) {
      setCalendarError(getApiErrorMessage(error));
    } finally {
      setIsLoadingCalendar(false);
    }
  }, []);

  const loadMonthAvailability = (monthKey: string) => {
    setMonthAvailability({});
    setSelectedDate(getInitialSelectableDate(monthKey, {}));
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAvailabilityCalendar(selectedMonth);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAvailabilityCalendar, selectedMonth]);

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

  const monthCells = useMemo(() => buildMonthCells(selectedMonth), [selectedMonth]);

  const selectedDateSlots = monthAvailability[selectedDate] ?? [];
  const isSelectedDatePast = Boolean(selectedDate) && selectedDate < getTodayDateKey();
  const calendarDaysByDate = useMemo(
    () => new Map(
      (availabilityCalendar?.days ?? []).map((day) => [day.date, day]),
    ),
    [availabilityCalendar],
  );
  const selectedCalendarDay = calendarDaysByDate.get(selectedDate);
  const selectedServerSlots = selectedCalendarDay?.slots ?? [];
  const selectedServerSlotTimes = selectedServerSlots.map((slot) =>
    formatAvailabilityTime(slot.startsAt),
  );

  const toggleSlot = (slot: string) => {
    if (
      isSelectedDatePast ||
      isSlotStartInPast(selectedDate, slot) ||
      selectedServerSlotTimes.includes(slot)
    ) {
      return;
    }

    const currentSlots = monthAvailability[selectedDate] ?? [];
    const hasSlot = currentSlots.includes(slot);

    if (
      !hasSlot &&
      conflictsWithSlotBreak(slot, [
        ...currentSlots,
        ...selectedServerSlotTimes,
      ])
    ) {
      setSlotErrorMessage(
        "Each one-hour slot must include a 15-minute break before the next slot.",
      );
      return;
    }

    setSlotErrorMessage("");
    setMonthAvailability((current) => {
      const slots = current[selectedDate] ?? [];
      const nextSlots = slots.includes(slot)
        ? slots.filter((item) => item !== slot)
        : [...slots, slot].sort();

      return {
        ...current,
        [selectedDate]: nextSlots,
      };
    });
  };

  const clearPendingSlots = () => {
    setMonthAvailability((current) => {
      const next = { ...current };
      delete next[selectedDate];
      return next;
    });
  };

  const deleteSavedSlot = async (slotId: string) => {
    const slot = selectedServerSlots.find((item) => item.id === slotId);

    if (!slot || slot.isBooked || deletingSlotId || isClearingDay) {
      return;
    }

    setSlotErrorMessage("");
    setDeletingSlotId(slotId);

    try {
      await doctorApiService.deleteAvailabilitySlot(slotId);
      await loadAvailabilityCalendar(selectedMonth);
      setAvailabilityToastMessage("Availability slot deleted successfully.");
    } catch (error) {
      setSlotErrorMessage(getApiErrorMessage(error));
    } finally {
      setDeletingSlotId(null);
    }
  };

  const clearSelectedDay = async () => {
    if (isSelectedDatePast || isClearingDay || deletingSlotId) return;

    const unbookedSlotCount = selectedServerSlots.filter(
      (slot) => !slot.isBooked,
    ).length;

    if (unbookedSlotCount === 0) {
      clearPendingSlots();
      return;
    }

    setSlotErrorMessage("");
    setIsClearingDay(true);

    try {
      await doctorApiService.clearDayAvailability(selectedDate);
      clearPendingSlots();
      await loadAvailabilityCalendar(selectedMonth);
      setAvailabilityToastMessage(
        `${unbookedSlotCount} unbooked slot${unbookedSlotCount === 1 ? "" : "s"} cleared for ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString()}.`,
      );
    } catch (error) {
      setSlotErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsClearingDay(false);
    }
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

    if (isSlotStartInPast(selectedDate, normalized)) {
      setSlotErrorMessage("Past times cannot be selected for today.");
      return;
    }

    if (!isWithinDoctorScheduleWindow(parsedMinutes)) {
      setSlotErrorMessage("Only slots between 09:00 AM and 09:00 PM are allowed.");
      return;
    }

    if (selectedServerSlotTimes.includes(normalized)) {
      setSlotErrorMessage("That slot has already been added and cannot be selected again.");
      return;
    }

    const existingSlots = [
      ...(monthAvailability[selectedDate] ?? []),
      ...selectedServerSlotTimes,
    ].filter((slot) => slot !== normalized);

    if (conflictsWithSlotBreak(normalized, existingSlots)) {
      setSlotErrorMessage(
        "Each one-hour slot must include a 15-minute break before the next slot.",
      );
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

  const saveMonthAvailability = async () => {
    if (isSelectedDatePast || isSavingAvailability) return;

    if (selectedDateSlots.some((slot) => isSlotStartInPast(selectedDate, slot))) {
      setSlotErrorMessage("The selected time has already passed. Choose a later slot.");
      return;
    }

    const startTimes = selectedDateSlots.map(formatAvailabilityStartTime);

    if (!startTimes.length || startTimes.some((slot) => slot === null)) {
      setSlotErrorMessage("Select at least one valid availability slot for this day.");
      return;
    }

    setSlotErrorMessage("");
    setIsSavingAvailability(true);

    try {
      await doctorApiService.createAvailability({
        date: selectedDate,
        startTimes: startTimes.filter((slot): slot is string => slot !== null),
        slotDurationMinutes: SLOT_DURATION_MINUTES,
        timezoneOffsetMinutes: 0,
      });
      setMonthAvailability((current) => {
        const next = { ...current };
        delete next[selectedDate];
        return next;
      });
      await loadAvailabilityCalendar(selectedMonth);
      setAvailabilityToastMessage(
        `${startTimes.length} slot${startTimes.length === 1 ? "" : "s"} saved for ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString()}.`,
      );
    } catch (error) {
      setSlotErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const doctorInitials =
    [firstName, lastName]
      .map((part) => part.trim().charAt(0).toUpperCase())
      .filter(Boolean)
      .join("") || "DR";

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <DoctorMobileNav />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] flex-col bg-[#0d1b3d] px-4 py-8 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <span className="text-1xl font-extrabold text-[#7784ac]">DominionWell+</span>
        </div>

        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#16b36c] bg-[#e0e3e6]">
            {profileImagePreview ? (
              <Image
                className="object-cover"
                alt={fullName}
                src={profileImagePreview}
                fill
                sizes="48px"
                unoptimized
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm font-bold text-[#001b5e]">
                {doctorInitials}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-[#7784ac]">{fullName}</p>
            <p className="text-xs text-[#7784ac]/80">
              {specialization ? formatSpecialization(specialization) : "Specialization not provided"}
            </p>
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
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/wallet">
            <span className="material-symbols-outlined">wallet</span>
            <span>Wallet</span>
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
          <DoctorLogoutButton className="flex w-full items-center gap-3 p-3 text-left text-[#7784ac]/85 hover:bg-[#00020d]/10" />
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
                const isUpdatingThisStatus = isSavingStatus && isActive;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => void updatePresenceStatus(option.value)}
                    disabled={isLoadingProfile || isSavingProfile || isSavingStatus}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isActive ? option.className : "bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]"
                    } disabled:cursor-wait disabled:opacity-70`}
                  >
                    <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                    {isUpdatingThisStatus ? "Updating..." : option.label}
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
              <p className="text-sm text-[#475569]">Select a month and day, then add one-hour slots with a 15-minute break between each slot.</p>
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
              {calendarError ? (
                <div role="alert" className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-2 text-xs text-[#b91c1c]">
                  <span>{calendarError}</span>
                  <button type="button" onClick={() => void loadAvailabilityCalendar(selectedMonth)} className="font-semibold underline">Try Again</button>
                </div>
              ) : null}
              {isLoadingCalendar ? <p className="mb-3 text-xs text-[#64748b]">Loading saved slots...</p> : null}
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

                  const calendarDay = calendarDaysByDate.get(cell.date);
                  const pendingSlots = monthAvailability[cell.date] ?? [];
                  const slotCount = calendarDay?.slotCount ?? 0;
                  const bookedCount = calendarDay?.bookedCount ?? 0;
                  const isFullyBooked = slotCount > 0 && bookedCount >= slotCount;
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
                          : bookedCount > 0
                            ? "border-[#60a5fa] bg-[#eff6ff]"
                            : slotCount > 0
                              ? "border-[#16b36c]/40 bg-[#f0fdf4]"
                              : pendingSlots.length > 0
                                ? "border-[#f59e0b]/40 bg-[#fffbeb]"
                                : "border-[#e2e8f0] bg-white hover:bg-[#f8fafc]"
                      } ${isSelected && !isPastDate ? "ring-2 ring-[#001b5e] ring-offset-1" : ""}`}
                    >
                      <div className="text-sm font-semibold text-[#0f172a]">{cell.day}</div>
                      <div className="mt-1 text-[11px] text-[#475569]">
                        {slotCount > 0
                          ? `${slotCount} saved slot${slotCount === 1 ? "" : "s"}`
                          : pendingSlots.length > 0
                            ? `${pendingSlots.length} selected`
                            : "No slots"}
                      </div>
                      {bookedCount > 0 ? (
                        <div className={`mt-1 text-[11px] font-semibold ${isFullyBooked ? "text-[#b91c1c]" : "text-[#b45309]"}`}>
                          {isFullyBooked ? "Fully booked" : `${bookedCount} booked`}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#e2e8f0] p-3">
              <h3 className="mb-1 text-sm font-semibold text-[#001b5e]">{selectedDate || "Pick a day"}</h3>
              <p className="mb-3 text-xs text-[#64748b]">Select all one-hour slots for this day, then save them together. Each slot includes a 15-minute break.</p>

              {isSelectedDatePast ? (
                <div className="mb-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-2 text-xs font-semibold text-[#64748b]">
                  Past dates are locked and cannot be edited.
                </div>
              ) : null}

              {selectedServerSlots.length > 0 ? (
                <div className="mb-3 rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-2">
                  <p className="mb-2 text-xs font-semibold text-[#334155]">Saved slots</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServerSlots.map((slot) => (
                      <span key={slot.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${slot.isBooked ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#dcfce7] text-[#15803d]"}`}>
                        {formatAvailabilityTime(slot.startsAt)} · {slot.isBooked ? "Booked" : "Available"}
                        {!slot.isBooked && !isSelectedDatePast ? (
                          <button
                            type="button"
                            onClick={() => void deleteSavedSlot(slot.id)}
                            disabled={Boolean(deletingSlotId) || isClearingDay}
                            aria-label={`Delete ${formatAvailabilityTime(slot.startsAt)} availability slot`}
                            className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[#166534] hover:bg-[#bbf7d0] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingSlotId === slot.id ? "…" : "×"}
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mb-3 grid grid-cols-2 gap-2">
                {slotOptions.map((slot) => {
                  const isSelected = selectedDateSlots.includes(slot);
                  const serverSlot = selectedServerSlots.find(
                    (item) => formatAvailabilityTime(item.startsAt) === slot,
                  );
                  const isTakenSlot = Boolean(serverSlot);
                  const isTooCloseToSavedSlot =
                    !serverSlot &&
                    conflictsWithSlotBreak(slot, selectedServerSlotTimes);
                  const isPastTime = isSlotStartInPast(selectedDate, slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={
                        isSelectedDatePast ||
                        isPastTime ||
                        isTakenSlot ||
                        isTooCloseToSavedSlot
                      }
                      onClick={() => toggleSlot(slot)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                        isTakenSlot
                          ? serverSlot?.isBooked
                            ? "cursor-not-allowed border-[#60a5fa] bg-[#dbeafe] text-[#1d4ed8]"
                            : "cursor-not-allowed border-[#4ade80] bg-[#dcfce7] text-[#15803d]"
                          : isSelectedDatePast || isPastTime || isTooCloseToSavedSlot
                          ? "cursor-not-allowed border-[#e2e8f0] bg-[#f1f5f9] text-[#94a3b8]"
                          : isSelected
                          ? "border-[#16b36c] bg-[#16b36c] text-white"
                          : "border-[#c6c6cf] bg-white text-[#334155] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {isTakenSlot
                        ? `${slot} (${serverSlot?.isBooked ? "Booked" : "Added"})`
                        : isPastTime
                          ? `${slot} (Past)`
                          : slot}
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
                  disabled={isSelectedDatePast}
                  className="h-9 w-full rounded-lg border border-[#c6c6cf] px-3 text-xs outline-none focus:border-[#0aa4b4] disabled:cursor-not-allowed disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]"
                />
                <button
                  type="button"
                  onClick={addCustomSlot}
                  disabled={isSelectedDatePast}
                  className="rounded-lg border border-[#001b5e] px-3 text-xs font-semibold text-[#001b5e] hover:bg-[#eef2ff] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]"
                >
                  Add
                </button>
              </div>

              {slotErrorMessage ? <p className="mb-3 text-xs text-[#b91c1c]">{slotErrorMessage}</p> : null}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => void clearSelectedDay()}
                  disabled={
                    isSelectedDatePast ||
                    isClearingDay ||
                    Boolean(deletingSlotId) ||
                    (selectedDateSlots.length === 0 &&
                      !selectedServerSlots.some((slot) => !slot.isBooked))
                  }
                  className="rounded-lg border border-[#ef4444]/40 px-3 py-2 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8]"
                >
                  {isClearingDay ? "Clearing..." : "Clear Unbooked Slots"}
                </button>
                <button
                  type="button"
                  onClick={() => void saveMonthAvailability()}
                  disabled={
                    isSelectedDatePast ||
                    isSavingAvailability ||
                    isClearingDay ||
                    Boolean(deletingSlotId) ||
                    selectedDateSlots.length === 0 ||
                    selectedDateSlots.some((slot) =>
                      isSlotStartInPast(selectedDate, slot),
                    )
                  }
                  className="rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                >
                  {isSavingAvailability ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#00020d]">Security</h2>
              <p className="mt-1 text-xs text-[#64748b] sm:text-sm">Update the password used to access your doctor account.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSecurityMessage("");
                setIsChangePasswordOpen(true);
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#c6c6cf] px-4 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
              Change Password
            </button>
          </div>
          {securityMessage ? <p role="status" className="mt-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#15803d]">{securityMessage}</p> : null}
        </section>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-4 text-base font-semibold text-[#00020d]">Update Profile</h2>

          {profileError ? (
            <div role="alert" className="mb-4 flex flex-col gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
              <span>{profileError}</span>
              <button type="button" onClick={() => void loadDoctorProfile()} className="rounded-md border border-[#fca5a5] px-2 py-1 text-xs font-semibold hover:bg-white">Try Again</button>
            </div>
          ) : null}

          {isLoadingProfile ? <p className="mb-4 text-sm text-[#64748b]">Loading doctor profile...</p> : null}

          {!isLoadingProfile && !profileError ? (
            <div className="mb-4 rounded-lg border border-[#dbe4f0] bg-[#f8fbff] px-3 py-2 text-xs text-[#475569]">
              <p>Username: <span className="font-semibold text-[#001b5e]">{username}</span></p>
              <p>Verification: <span className="font-semibold text-[#001b5e]">{verifiedAt ? `Verified ${new Date(verifiedAt).toLocaleDateString()}` : "Pending"}</span></p>
              <p className="mt-1">Bio: <span className="font-medium text-[#334155]">{bio || "No biography has been added."}</span></p>
            </div>
          ) : null}

          {!isLoadingProfile && !profileError ? (
            <div className="mb-4 flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 sm:flex-row sm:items-center">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#c6c6cf] bg-white">
                {profileImagePreview ? (
                  <Image
                    className="object-cover"
                    src={profileImagePreview}
                    alt={fullName}
                    fill
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xl font-bold text-[#001b5e]">
                    {doctorInitials}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#001b5e]">Profile Image</p>
                <p className="mt-1 text-xs text-[#64748b]">
                  Upload or replace the photo patients see on your doctor profile.
                </p>
                <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-[#c6c6cf] bg-white px-3 py-1.5 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc] has-disabled:cursor-wait has-disabled:opacity-60">
                  {isUploadingProfileImage ? "Uploading..." : "Update Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                    disabled={isUploadingProfileImage}
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">First Name</span>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={isLoadingProfile || isSavingProfile}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Last Name</span>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={isLoadingProfile || isSavingProfile}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Specialization</span>
              <select
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                disabled={isLoadingProfile || isSavingProfile || isLoadingSpecialties}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              >
                {specialization && !specialties.some((option) => option.name === specialization) ? (
                  <option value={specialization}>
                    {formatSpecialization(specialization)}
                  </option>
                ) : null}
                {isLoadingSpecialties ? (
                  <option value={specialization || ""}>Loading specialties...</option>
                ) : null}
                {!isLoadingSpecialties && specialties.length === 0 ? (
                  <option value={specialization || ""}>No specialties available</option>
                ) : null}
                {specialties.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
              {specialtiesError ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#b91c1c]">
                  <span>{specialtiesError}</span>
                  <button
                    type="button"
                    onClick={() => void loadSpecialties()}
                    className="font-semibold text-[#001b5e] underline"
                  >
                    Try again
                  </button>
                </div>
              ) : null}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Years of Experience</span>
              <input
                type="number"
                min={0}
                value={yearsOfExperience}
                onChange={(event) =>
                  setYearsOfExperience(event.target.value.replace(/[^\d]/g, ""))
                }
                disabled={isLoadingProfile || isSavingProfile}
                placeholder="12"
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Email</span>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f1f5f9] px-3 text-[#64748b]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Phone</span>
              <input
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isLoadingProfile || isSavingProfile}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Biography</span>
              <textarea
                value={bio ?? ""}
                onChange={(event) => setBio(event.target.value)}
                disabled={isLoadingProfile || isSavingProfile}
                maxLength={2000}
                rows={4}
                placeholder="Tell patients about your medical experience."
                className="w-full resize-y rounded-lg border border-[#c6c6cf] px-3 py-2 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-[#334155]">Bank Name</span>
              <select
                value={bankDetails.bankName}
                onChange={(event) => {
                  const selectedBank = nigerianBanks.find(
                    (bank) => bank.name === event.target.value,
                  );
                  setBankDetails((current) => ({
                    ...current,
                    bankName: selectedBank?.name ?? "",
                  }));
                }}
                disabled={isSavingProfile}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              >
                <option value="">Select bank</option>
                {nigerianBanks.map((bank) => (
                  <option key={bank.code} value={bank.name}>
                    {bank.name} ({bank.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Account Name</span>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={(event) => {
                  setBankDetails((current) => ({
                    ...current,
                    accountName: event.target.value,
                  }));
                }}
                placeholder="Enter account name"
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Account Number</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={bankDetails.accountNumber}
                onChange={(event) => {
                  setBankDetails((current) => ({
                    ...current,
                    accountNumber: event.target.value.replace(/\D/g, "").slice(0, 10),
                  }));
                }}
                placeholder="10-digit account number"
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <div className="mr-auto">
              {profileSaveError ? <p className="text-sm text-[#b91c1c]">{profileSaveError}</p> : null}
              {successMessage ? <p className="text-sm text-[#166534]">{successMessage}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => void saveProfile()}
              disabled={
                isLoadingProfile ||
                isSavingProfile ||
                !firstName.trim() ||
                !lastName.trim() ||
                !phone.trim() ||
                !specialization.trim()
              }
              className="rounded-lg bg-[#001b5e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
            >
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>
      </main>

      {isChangePasswordOpen ? (
        <DoctorChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={(message) => {
            setSecurityMessage(message);
            setIsChangePasswordOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
