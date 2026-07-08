export type AppointmentRequestStatus = "Pending" | "Booked" | "Accepted" | "Rejected";

export type AppointmentRequest = {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  patientName: string;
  patientId: string;
  date: string;
  dateLabel: string;
  timeSlot: string;
  status: AppointmentRequestStatus;
  createdAt: string;
  deductedSubscription?: boolean;
};

type CreateAppointmentRequestInput = Omit<AppointmentRequest, "id" | "status" | "createdAt">;

export const APPOINTMENT_REQUESTS_KEY = "dwAppointmentRequests";
export const APPOINTMENT_REQUESTS_UPDATED_EVENT = "dw-appointments-updated";
export const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
export const SUBSCRIPTION_UPDATED_EVENT = "dw-subscription-updated";

function canUseDOM() {
  return typeof window !== "undefined";
}

function parseRequests(value: string | null): AppointmentRequest[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as AppointmentRequest[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function normalizeRequest(request: AppointmentRequest): AppointmentRequest {
  if (request.status === "Accepted") {
    return {
      ...request,
      status: "Booked",
    };
  }

  return request;
}

function deductPatientSubscriptionBalance() {
  if (!canUseDOM()) {
    return;
  }

  const currentBalance = Number(window.localStorage.getItem(CONSULTATION_BALANCE_KEY));
  const normalizedBalance = Number.isFinite(currentBalance) ? Math.max(0, Math.floor(currentBalance)) : 48;
  const nextBalance = Math.max(normalizedBalance - 1, 0);

  window.localStorage.setItem(CONSULTATION_BALANCE_KEY, String(nextBalance));
  window.dispatchEvent(new Event(SUBSCRIPTION_UPDATED_EVENT));
}

function writeRequests(requests: AppointmentRequest[]) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.setItem(APPOINTMENT_REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event(APPOINTMENT_REQUESTS_UPDATED_EVENT));
}

export function readAppointmentRequests() {
  if (!canUseDOM()) {
    return [];
  }

  return parseRequests(window.localStorage.getItem(APPOINTMENT_REQUESTS_KEY))
    .map(normalizeRequest)
    .sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function createAppointmentRequest(input: CreateAppointmentRequestInput) {
  const nextRequest: AppointmentRequest = {
    ...input,
    id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  const requests = readAppointmentRequests();
  writeRequests([nextRequest, ...requests]);

  return nextRequest;
}

export function updateAppointmentRequestStatus(appointmentId: string, status: AppointmentRequestStatus) {
  const requests = readAppointmentRequests();
  const nextRequests = requests.map((request) => {
    if (request.id !== appointmentId) {
      return request;
    }

    const nextStatus = status === "Accepted" ? "Booked" : status;
    const shouldDeductSubscription = nextStatus === "Booked" && !request.deductedSubscription;

    if (shouldDeductSubscription) {
      deductPatientSubscriptionBalance();
    }

    return {
      ...request,
      status: nextStatus,
      deductedSubscription: shouldDeductSubscription ? true : request.deductedSubscription,
    };
  });

  writeRequests(nextRequests);
}

function parseTimeSlotStart(date: string, timeSlot: string) {
  const matched = timeSlot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!matched) {
    return null;
  }

  const [, rawHours, rawMinutes, period] = matched;
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  let hour24 = hours % 12;

  if (period.toUpperCase() === "PM") {
    hour24 += 12;
  }

  return new Date(`${date}T${String(hour24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
}

export function isConsultationInviteWindow(request: AppointmentRequest, now: Date = new Date()) {
  if (request.status !== "Booked" && request.status !== "Accepted") {
    return false;
  }

  const start = parseTimeSlotStart(request.date, request.timeSlot);

  if (!start || Number.isNaN(start.getTime())) {
    return false;
  }

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}
