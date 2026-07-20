import { doctors, type Doctor } from "@/app/dashboard/patient/doctors/data";

export const ADMIN_DOCTORS_KEY = "dwAdminDoctors";
export const ADMIN_PATIENTS_KEY = "dwAdminPatients";
export const ADMIN_PLANS_KEY = "dwAdminPlans";
export const ADMIN_PAYMENTS_KEY = "dwAdminPayments";
export const ADMIN_REPORTS_KEY = "dwAdminReports";
export const ADMIN_SETTINGS_KEY = "dwAdminSettings";
export const DOCTOR_WALLET_TRANSACTIONS_KEY = "dwDoctorWalletTransactions";
export const DOCTOR_WITHDRAWAL_REQUESTS_KEY = "dwDoctorWithdrawalRequests";
export const DOCTOR_BANK_DETAILS_KEY = "dwDoctorBankDetails";
export const DOCTOR_JOIN_REQUESTS_KEY = "dwDoctorJoinRequests";
export const ADMIN_UPDATED_EVENT = "dw-admin-updated";

export type AdminStatus = "Whitelisted" | "Blacklisted";

export type AdminDoctor = {
  id: string;
  userId?: string;
  name: string;
  specialization: string;
  rating: number;
  profileImage: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  status: AdminStatus;
  joinedAt: string;
  walletPoints: number;
  walletBalance: number;
  walletPointValue?: number;
  isEmailVerified?: boolean;
  verifiedAt?: string | null;
  bio?: string | null;
  sessionCount?: number;
};

export type AdminPatient = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  status: AdminStatus;
  joinedAt: string;
  isEmailVerified?: boolean;
  consultationBalance?: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  consultationsPerMonth: number;
  description: string;
  active: boolean;
};

export type PaymentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  planId: string;
  planName: string;
  amount: number;
  paidAt: string;
  status: "Paid" | "Pending" | "Refunded";
};

export type AdminReport = {
  id: string;
  title: string;
  type: "Operational" | "Clinical" | "Revenue";
  createdAt: string;
  status: "Open" | "Closed";
  summary: string;
};

export type AdminSettings = {
  pointValue: number;
};

type DoctorWalletTransaction = {
  id: string;
  doctorId: string;
  consultationId: string;
  points: number;
  amount: number;
  createdAt: string;
};

export type DoctorWithdrawalRequestStatus = "Pending" | "Approved" | "Rejected";

export type DoctorWithdrawalRequest = {
  id: string;
  doctorId: string;
  doctorName: string;
  points: number;
  amount: number;
  status: DoctorWithdrawalRequestStatus;
  requestedAt: string;
};

export type DoctorBankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export type DoctorJoinRequestStatus = "Pending" | "Accepted" | "Rejected";

export type DoctorJoinRequestFile = {
  name: string;
  size: number;
  type: string;
};

export type DoctorJoinRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  specialization: string;
  documents: DoctorJoinRequestFile[];
  status: DoctorJoinRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
};

function canUseDOM() {
  return typeof window !== "undefined";
}

function createDoctorUsername(doctorName: string) {
  return doctorName
    .toLowerCase()
    .replace(/dr\.?\s*/i, "")
    .trim()
    .replace(/\s+/g, ".");
}

function seedDoctors(): AdminDoctor[] {
  return doctors.map((doctor, index) => {
    const username = createDoctorUsername(doctor.name);
    return {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      rating: doctor.rating,
      profileImage: doctor.image,
      email: `${username}@dominionwell.com`,
      phone: doctor.phone,
      username,
      password: "Doctor@123",
      status: "Whitelisted",
      joinedAt: new Date(Date.now() - (index + 1) * 1000 * 60 * 60 * 24 * 40).toISOString(),
      walletPoints: 0,
      walletBalance: 0,
    };
  });
}

function normalizeAdminDoctor(doctor: AdminDoctor): AdminDoctor {
  const fallbackRating =
    doctors.find((sourceDoctor) => sourceDoctor.id === doctor.id)?.rating ?? 4.5;

  return {
    ...doctor,
    rating: Number.isFinite(doctor.rating) ? doctor.rating : fallbackRating,
  };
}

function seedPatients(): AdminPatient[] {
  return [
    {
      id: "DW-98231",
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "+1 (202) 555-0179",
      status: "Whitelisted",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 130).toISOString(),
    },
    {
      id: "DW-10952",
      name: "Arthur Morgan",
      email: "arthur.morgan@email.com",
      phone: "+1 (202) 555-0119",
      status: "Whitelisted",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 210).toISOString(),
    },
    {
      id: "DW-88210",
      name: "Sarah Williams",
      email: "sarah.williams@email.com",
      phone: "+1 (202) 555-0108",
      status: "Whitelisted",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 160).toISOString(),
    },
    {
      id: "DW-44011",
      name: "Daniel Okafor",
      email: "daniel.okafor@email.com",
      phone: "+1 (202) 555-0198",
      status: "Whitelisted",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    },
  ];
}

function seedPlans(): SubscriptionPlan[] {
  return [
    {
      id: "plan-basic-care",
      name: "Basic Care",
      monthlyPrice: 19900,
      consultationsPerMonth: 6,
      description: "Suitable for routine monthly care and follow-up consultations.",
      active: true,
    },
    {
      id: "plan-premium-care",
      name: "Premium Care",
      monthlyPrice: 39900,
      consultationsPerMonth: 18,
      description: "Extended specialist access for individuals and families.",
      active: true,
    },
    {
      id: "plan-enterprise-care",
      name: "Enterprise Care",
      monthlyPrice: 99900,
      consultationsPerMonth: 60,
      description: "High-volume plan for organizations and employee care programs.",
      active: true,
    },
  ];
}

function seedPayments(): PaymentRecord[] {
  return [
    {
      id: "pay-1001",
      patientId: "DW-98231",
      patientName: "Alex Johnson",
      planId: "plan-premium-care",
      planName: "Premium Care",
      amount: 39900,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "Paid",
    },
    {
      id: "pay-1002",
      patientId: "DW-10952",
      patientName: "Arthur Morgan",
      planId: "plan-basic-care",
      planName: "Basic Care",
      amount: 19900,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      status: "Paid",
    },
    {
      id: "pay-1003",
      patientId: "DW-44011",
      patientName: "Daniel Okafor",
      planId: "plan-basic-care",
      planName: "Basic Care",
      amount: 19900,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: "Pending",
    },
  ];
}

function seedReports(): AdminReport[] {
  return [
    {
      id: "rep-5001",
      title: "July Weekly Appointment Quality Report",
      type: "Operational",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      status: "Open",
      summary: "Average booking-to-acceptance time improved by 18% week-over-week.",
    },
    {
      id: "rep-5002",
      title: "Doctor Completion Rate Overview",
      type: "Clinical",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      status: "Closed",
      summary: "Top quartile doctors maintained over 90% completion rates.",
    },
    {
      id: "rep-5003",
      title: "Subscription Revenue Movement",
      type: "Revenue",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      status: "Open",
      summary: "Premium Care subscriptions contributed 54% of total monthly revenue.",
    },
  ];
}

function seedSettings(): AdminSettings {
  return {
    pointValue: 10000,
  };
}

function seedDoctorJoinRequests(): DoctorJoinRequest[] {
  return [
    {
      id: "doctor-request-mock-001",
      name: "Dr. Ada Okafor",
      email: "ada.okafor@example.com",
      phone: "+2348012345678",
      username: "dradaokafor",
      specialization: "PEDIATRICS",
      documents: [
        {
          name: "medical-license-ada-okafor.pdf",
          size: 842_120,
          type: "application/pdf",
        },
        {
          name: "pediatric-board-certification.pdf",
          size: 618_430,
          type: "application/pdf",
        },
      ],
      status: "Pending",
      requestedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "doctor-request-mock-002",
      name: "Dr. Tunde Bello",
      email: "tunde.bello@example.com",
      phone: "+2348098765432",
      username: "drtundebello",
      specialization: "CARDIOLOGY",
      documents: [
        {
          name: "md-degree-certificate.jpg",
          size: 1_248_900,
          type: "image/jpeg",
        },
        {
          name: "cardiology-license.pdf",
          size: 730_112,
          type: "application/pdf",
        },
        {
          name: "identity-document.png",
          size: 402_640,
          type: "image/png",
        },
      ],
      status: "Pending",
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];
}

function parseList<T>(value: string | null, fallback: T[]): T[] {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function parseObject<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readStorageList<T>(key: string, fallback: T[]): T[] {
  if (!canUseDOM()) {
    return fallback;
  }

  const current = parseList<T>(window.localStorage.getItem(key), fallback);

  if (!window.localStorage.getItem(key)) {
    window.localStorage.setItem(key, JSON.stringify(current));
  }

  return current;
}

function writeStorageList<T>(key: string, value: T[]) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(ADMIN_UPDATED_EVENT));
}

function readStorageObject<T>(key: string, fallback: T): T {
  if (!canUseDOM()) {
    return fallback;
  }

  const current = parseObject<T>(window.localStorage.getItem(key), fallback);

  if (!window.localStorage.getItem(key)) {
    window.localStorage.setItem(key, JSON.stringify(current));
  }

  return current;
}

function writeStorageObject<T>(key: string, value: T) {
  if (!canUseDOM()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(ADMIN_UPDATED_EVENT));
}

export function readAdminDoctors() {
  return readStorageList(ADMIN_DOCTORS_KEY, seedDoctors()).map(normalizeAdminDoctor);
}

export function readAdminPatients() {
  return readStorageList(ADMIN_PATIENTS_KEY, seedPatients());
}

export function readSubscriptionPlans() {
  return readStorageList(ADMIN_PLANS_KEY, seedPlans());
}

export function readPaymentRecords() {
  return readStorageList(ADMIN_PAYMENTS_KEY, seedPayments());
}

export function readAdminReports() {
  return readStorageList(ADMIN_REPORTS_KEY, seedReports());
}

export function readAdminSettings() {
  return readStorageObject(ADMIN_SETTINGS_KEY, seedSettings());
}

export function readDoctorJoinRequests() {
  return readStorageList<DoctorJoinRequest>(DOCTOR_JOIN_REQUESTS_KEY, seedDoctorJoinRequests());
}

export function addDoctorJoinRequest(input: Omit<DoctorJoinRequest, "id" | "status" | "requestedAt">) {
  const currentRequests = readDoctorJoinRequests();
  const nextRequest: DoctorJoinRequest = {
    ...input,
    id: `doctor-request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: "Pending",
    requestedAt: new Date().toISOString(),
  };

  writeStorageList(DOCTOR_JOIN_REQUESTS_KEY, [nextRequest, ...currentRequests]);
  return nextRequest;
}

export function updateDoctorJoinRequestStatus(
  requestId: string,
  status: DoctorJoinRequestStatus,
  reviewNote?: string,
) {
  const currentRequests = readDoctorJoinRequests();
  const nextRequests = currentRequests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status,
          reviewedAt: new Date().toISOString(),
          reviewNote,
        }
      : request,
  );

  writeStorageList(DOCTOR_JOIN_REQUESTS_KEY, nextRequests);
}

export function updateAdminSettings(nextSettings: Partial<AdminSettings>) {
  const current = readAdminSettings();
  const merged: AdminSettings = {
    ...current,
    ...nextSettings,
  };

  writeStorageObject(ADMIN_SETTINGS_KEY, merged);
  return merged;
}

export function addAdminDoctor(input: {
  name: string;
  specialization: string;
  email: string;
  phone: string;
  username: string;
  password: string;
}) {
  const currentDoctors = readAdminDoctors();

  const nextDoctor: AdminDoctor = {
    id: `dr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    specialization: input.specialization.trim(),
    rating: 4.5,
    profileImage:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
    email: input.email.trim(),
    phone: input.phone.trim(),
    username: input.username.trim().toLowerCase(),
    password: input.password,
    status: "Whitelisted",
    joinedAt: new Date().toISOString(),
    walletPoints: 0,
    walletBalance: 0,
  };

  writeStorageList(ADMIN_DOCTORS_KEY, [nextDoctor, ...currentDoctors]);
  return nextDoctor;
}

export function updateDoctorStatus(doctorId: string, status: AdminStatus) {
  const currentDoctors = readAdminDoctors();
  const nextDoctors = currentDoctors.map((doctor) => {
    if (doctor.id !== doctorId) {
      return doctor;
    }

    return {
      ...doctor,
      status,
    };
  });

  writeStorageList(ADMIN_DOCTORS_KEY, nextDoctors);
}

export function updatePatientStatus(patientId: string, status: AdminStatus) {
  const currentPatients = readAdminPatients();
  const nextPatients = currentPatients.map((patient) => {
    if (patient.id !== patientId) {
      return patient;
    }

    return {
      ...patient,
      status,
    };
  });

  writeStorageList(ADMIN_PATIENTS_KEY, nextPatients);
}

export function addSubscriptionPlan(input: {
  id?: string;
  name: string;
  monthlyPrice: number;
  consultationsPerMonth: number;
  description: string;
  active?: boolean;
}) {
  const currentPlans = readSubscriptionPlans();

  const nextPlan: SubscriptionPlan = {
    id: input.id ?? `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    monthlyPrice: Math.max(0, Math.floor(input.monthlyPrice)),
    consultationsPerMonth: Math.max(1, Math.floor(input.consultationsPerMonth)),
    description: input.description.trim(),
    active: input.active ?? true,
  };

  writeStorageList(ADMIN_PLANS_KEY, [nextPlan, ...currentPlans]);
  return nextPlan;
}

export function updatePaymentStatus(paymentId: string, status: PaymentRecord["status"]) {
  const currentPayments = readPaymentRecords();
  const nextPayments = currentPayments.map((payment) => {
    if (payment.id !== paymentId) {
      return payment;
    }

    return {
      ...payment,
      status,
    };
  });

  writeStorageList(ADMIN_PAYMENTS_KEY, nextPayments);
}

export function getAdminDoctorByUsername(username: string) {
  const normalized = username.trim().toLowerCase();
  return readAdminDoctors().find((doctor) => doctor.username === normalized) ?? null;
}

function readDoctorWalletTransactions() {
  return readStorageList<DoctorWalletTransaction>(DOCTOR_WALLET_TRANSACTIONS_KEY, []);
}

function writeDoctorWalletTransactions(value: DoctorWalletTransaction[]) {
  writeStorageList(DOCTOR_WALLET_TRANSACTIONS_KEY, value);
}

export function readDoctorWithdrawalRequests() {
  return readStorageList<DoctorWithdrawalRequest>(DOCTOR_WITHDRAWAL_REQUESTS_KEY, []).sort((a, b) => {
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });
}

export function getPendingDoctorWithdrawalRequest(doctorId: string) {
  return readDoctorWithdrawalRequests().find((request) => request.doctorId === doctorId && request.status === "Pending") ?? null;
}

export function requestDoctorWithdrawal(doctorId: string, amount: number) {
  const normalizedAmount = Math.max(0, Math.floor(amount));
  const doctorsList = readAdminDoctors();
  const doctor = doctorsList.find((item) => item.id === doctorId);

  if (!doctor) {
    return { ok: false as const, reason: "Doctor not found." };
  }

  const existingPending = getPendingDoctorWithdrawalRequest(doctorId);

  if (existingPending) {
    return { ok: false as const, reason: "A pending withdrawal request already exists." };
  }

  const settings = readAdminSettings();

  if (normalizedAmount < settings.pointValue) {
    return { ok: false as const, reason: `Minimum withdrawal is NGN ${settings.pointValue.toLocaleString()}.` };
  }

  if (normalizedAmount % settings.pointValue !== 0) {
    return {
      ok: false as const,
      reason: `Withdrawal must be in multiples of NGN ${settings.pointValue.toLocaleString()}.`,
    };
  }

  if (doctor.walletBalance < normalizedAmount) {
    return { ok: false as const, reason: "Insufficient wallet balance." };
  }

  const equivalentPoints = Math.floor(normalizedAmount / settings.pointValue);

  const nextDoctors = doctorsList.map((item) => {
    if (item.id !== doctorId) {
      return item;
    }

    return {
      ...item,
      walletBalance: Math.max(0, item.walletBalance - normalizedAmount),
    };
  });

  const requests = readDoctorWithdrawalRequests();
  const nextRequest: DoctorWithdrawalRequest = {
    id: `wd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    doctorId,
    doctorName: doctor.name,
    points: equivalentPoints,
    amount: normalizedAmount,
    status: "Pending",
    requestedAt: new Date().toISOString(),
  };

  writeStorageList(ADMIN_DOCTORS_KEY, nextDoctors);
  writeStorageList(DOCTOR_WITHDRAWAL_REQUESTS_KEY, [nextRequest, ...requests]);

  return { ok: true as const, request: nextRequest };
}

export function updateDoctorWithdrawalRequestStatus(requestId: string, status: DoctorWithdrawalRequestStatus) {
  const requests = readDoctorWithdrawalRequests();
  const target = requests.find((request) => request.id === requestId);

  if (!target) {
    return;
  }

  const nextRequests = requests.map((request) => {
    if (request.id !== requestId) {
      return request;
    }

    return {
      ...request,
      status,
    };
  });

  if (target.status === "Pending" && status === "Rejected") {
    const doctorsList = readAdminDoctors();
    const nextDoctors = doctorsList.map((doctor) => {
      if (doctor.id !== target.doctorId) {
        return doctor;
      }

      return {
        ...doctor,
        walletBalance: doctor.walletBalance + target.amount,
      };
    });

    writeStorageList(ADMIN_DOCTORS_KEY, nextDoctors);
  }

  writeStorageList(DOCTOR_WITHDRAWAL_REQUESTS_KEY, nextRequests);
}

export function creditDoctorForCompletedConsultation(doctorId: string, consultationId: string) {
  const settings = readAdminSettings();
  const transactions = readDoctorWalletTransactions();

  const alreadyCredited = transactions.some((transaction) => transaction.consultationId === consultationId);

  if (alreadyCredited) {
    return false;
  }

  const doctorsList = readAdminDoctors();
  const doctor = doctorsList.find((item) => item.id === doctorId);

  if (!doctor) {
    return false;
  }

  const nextDoctors = doctorsList.map((item) => {
    if (item.id !== doctorId) {
      return item;
    }

    return {
      ...item,
      walletPoints: item.walletPoints + 1,
      walletBalance: item.walletBalance + settings.pointValue,
    };
  });

  const nextTransaction: DoctorWalletTransaction = {
    id: `wtx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    doctorId,
    consultationId,
    points: 1,
    amount: settings.pointValue,
    createdAt: new Date().toISOString(),
  };

  writeStorageList(ADMIN_DOCTORS_KEY, nextDoctors);
  writeDoctorWalletTransactions([nextTransaction, ...transactions]);

  return true;
}

export function readDoctorWalletSummary(doctorId: string) {
  const doctor = readAdminDoctors().find((item) => item.id === doctorId);

  if (!doctor) {
    return {
      points: 0,
      balance: 0,
    };
  }

  return {
    points: doctor.walletPoints,
    balance: doctor.walletBalance,
  };
}

export function readDoctorWalletActivity(doctorId: string) {
  const transactions = readDoctorWalletTransactions().filter((transaction) => transaction.doctorId === doctorId);
  const withdrawals = readDoctorWithdrawalRequests().filter((request) => request.doctorId === doctorId);

  return {
    transactions,
    withdrawals,
  };
}

export function readDoctorBankDetails(doctorId: string): DoctorBankDetails {
  const records = readStorageObject<Record<string, DoctorBankDetails>>(DOCTOR_BANK_DETAILS_KEY, {});

  return (
    records[doctorId] ?? {
      bankName: "",
      accountName: "",
      accountNumber: "",
    }
  );
}

export function updateDoctorBankDetails(doctorId: string, nextDetails: DoctorBankDetails) {
  const records = readStorageObject<Record<string, DoctorBankDetails>>(DOCTOR_BANK_DETAILS_KEY, {});

  const normalized: DoctorBankDetails = {
    bankName: nextDetails.bankName.trim(),
    accountName: nextDetails.accountName.trim(),
    accountNumber: nextDetails.accountNumber.replace(/\D/g, "").slice(0, 10),
  };

  writeStorageObject(DOCTOR_BANK_DETAILS_KEY, {
    ...records,
    [doctorId]: normalized,
  });

  return normalized;
}

export function doctorFromDirectory(doctor: Doctor): AdminDoctor | null {
  return readAdminDoctors().find((item) => item.id === doctor.id) ?? null;
}
