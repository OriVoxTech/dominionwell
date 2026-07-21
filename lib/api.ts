import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearPatientSession,
  getPatientAccessToken,
  getPatientRefreshToken,
  updatePatientTokens,
} from "@/lib/patient-session";
import {
  clearDoctorSession,
  getDoctorAccessToken,
  type DoctorSession,
} from "@/lib/doctor-session";
import {
  clearAdminSession,
  getAdminAccessToken,
  type AdminSession,
} from "@/lib/admin-session";

const DEFAULT_API_BASE_URL =
  "https://8ce1-105-127-11-129.ngrok-free.app/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

const doctorApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

const doctorGatewayApi = axios.create({
  headers: {
    Accept: "application/json",
  },
  timeout: 15_000,
});

const publicGatewayApi = axios.create({
  headers: {
    Accept: "application/json",
  },
  timeout: 15_000,
});

const patientGatewayApi = axios.create({
  headers: {
    Accept: "application/json",
  },
  timeout: 15_000,
});

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

const adminUsersApi = axios.create({
  headers: {
    Accept: "application/json",
  },
  timeout: 15_000,
});

doctorApi.interceptors.request.use((config) => {
  const accessToken = getDoctorAccessToken();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

doctorGatewayApi.interceptors.request.use((config) => {
  const accessToken = getDoctorAccessToken();
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

adminApi.interceptors.request.use((config) => {
  const accessToken = getAdminAccessToken();
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

adminUsersApi.interceptors.request.use((config) => {
  const accessToken = getAdminAccessToken();
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

function handleExpiredAdminSession(error: AxiosError) {
  const isAdminLoginRequest = error.config?.url === "/admin/login";

  if (error.response?.status === 401 && !isAdminLoginRequest) {
    clearAdminSession();

    if (typeof window !== "undefined") {
      window.location.assign("/admin/login?session=expired");
    }
  }

  return Promise.reject(error);
}

adminApi.interceptors.response.use(
  (response) => response,
  handleExpiredAdminSession,
);

adminUsersApi.interceptors.response.use(
  (response) => response,
  handleExpiredAdminSession,
);

const PUBLIC_DOCTOR_AUTH_ENDPOINTS = new Set([
  "/doctors/auth/login",
  "/doctors/auth/forgot-password",
  "/doctors/auth/reset-password",
]);

function handleExpiredDoctorSession(error: AxiosError) {
  const requestPath = error.config?.url ?? "";

  if (
    error.response?.status === 401 &&
    !PUBLIC_DOCTOR_AUTH_ENDPOINTS.has(requestPath)
  ) {
    clearDoctorSession();

    if (typeof window !== "undefined") {
      window.location.assign("/login/doctor?session=expired");
    }
  }

  return Promise.reject(error);
}

doctorApi.interceptors.response.use(
  (response) => response,
  handleExpiredDoctorSession,
);

doctorGatewayApi.interceptors.response.use(
  (response) => response,
  handleExpiredDoctorSession,
);

api.interceptors.request.use((config) => {
  const accessToken = getPatientAccessToken();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

patientGatewayApi.interceptors.request.use((config) => {
  const accessToken = getPatientAccessToken();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  userId: string;
  sessionId: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  familyId: string;
}

export interface RegisterPatientPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: "PATIENT";
}

export interface VerifyPatientPayload {
  email: string;
  otp: string;
}

export interface ResendPatientOtpPayload {
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DoctorLoginPayload {
  username: string;
  password: string;
}

export interface DoctorForgotPasswordPayload {
  email: string;
}

export interface DoctorResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  bio: string | null;
  specializations: string[];
  presenceStatus?: "AVAILABLE" | "BUSY" | "OFFLINE";
  yearsOfExperience?: number | null;
  bankName?: string | null;
  bankCode?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  wallet?: {
    currentBalance: number;
    lifetimePoints: number;
    pointValue: number;
  } | null;
  appointmentStats?: {
    today: number;
    completed: number;
  } | null;
  satisfaction?: {
    averageRating: number | null;
    reviewCount: number;
  } | null;
  badges?: string[];
  verifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    phone: string | null;
    createdAt: string;
  };
}

export interface UpdateDoctorProfilePayload {
  bio: string;
  specializations: string[];
  firstName: string;
  lastName: string;
  phone: string;
  presenceStatus: "AVAILABLE" | "BUSY" | "OFFLINE";
  yearsOfExperience: number;
  bankName?: string;
  bankCode?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

export interface UpdateDoctorBankAccountPayload {
  bankName: string;
  bankCode: string;
  bankAccountName: string;
  bankAccountNumber: string;
}

export interface DoctorWallet {
  id: string;
  doctorId: string;
  currentBalance: number;
  lifetimePoints: number;
  pointValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface RequestDoctorWithdrawalPayload {
  doctorId: string;
  amount: number;
}

export interface DoctorWithdrawalResponse {
  id?: string;
  doctorId?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PatientProfile {
  id: string;
  userId: string;
  avatarFileId: string | null;
  consultationBalance: number;
  preferences: Record<string, unknown> | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    firstName: string;
    lastName: string;
    phone: string | null;
    createdAt: string;
  };
}

export interface UpdatePatientProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  preferences?: Record<string, unknown> | null;
}

export interface PatientDashboardResponse {
  profile: PatientProfile;
  appointmentStats: {
    upcoming: number;
    completed: number;
  };
  recentDoctors: PublicDoctor[];
  currentSubscription: Record<string, unknown> | null;
  badges: string[];
}

export interface DoctorReviewPayload {
  appointmentId: string;
  rating: number;
  comment: string;
}

export interface DoctorReview extends Record<string, unknown> {
  id: string;
  appointmentId?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  updatedAt?: string;
  patient?: {
    user?: {
      firstName?: string;
      lastName?: string;
      username?: string | null;
    };
  } | null;
}

export interface DoctorReviewsResponse {
  satisfaction: {
    averageRating: number | null;
    reviewCount: number;
  };
  data: DoctorReview[];
  meta: PaginationMeta;
}

export interface PatientNotification {
  id: string;
  title?: string;
  subject?: string;
  message?: string;
  body?: string;
  content?: string;
  type?: string;
  category?: string;
  isRead?: boolean;
  read?: boolean;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientNotificationsResponse {
  data?: PatientNotification[];
  meta?: PaginationMeta;
  [key: string]: unknown;
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}

export interface MarkNotificationsReadResponse {
  updatedCount: number;
}

export type DoctorAppointmentStatus =
  | "BOOKED"
  | "CANCELLED"
  | "COMPLETED"
  | "VERIFIED";

export interface DoctorAppointmentsQuery {
  status?: DoctorAppointmentStatus;
  page?: number;
  limit?: number;
}

export interface DoctorAppointment extends Record<string, unknown> {
  id: string;
  status: DoctorAppointmentStatus;
}

export interface DoctorAppointmentsResponse {
  data: DoctorAppointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PatientAppointmentsQuery {
  status?: DoctorAppointmentStatus;
  page?: number;
  limit?: number;
}

export interface PatientAppointment extends Record<string, unknown> {
  id: string;
  status?: string;
}

export interface BookPatientAppointmentPayload {
  doctorId: string;
  slotId: string;
}

export interface BookPatientAppointmentResponse extends Record<string, unknown> {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: string;
  cancellationReason: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  googleEventId: string | null;
  meetingUrl: string | null;
  meetingStatus: string | null;
  meetingCreationError: string | null;
  confirmationSentAt: string | null;
  dayReminderSentAt: string | null;
  hourReminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientAppointmentsResponse {
  data: PatientAppointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  consultationCredits: number;
  consultationMinutes: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  currency: string;
  priceNaira: number;
}

export interface PatientSubscriptionSummary {
  consultationBalance: number;
  currentSubscription: Record<string, unknown> | null;
  subscriptions: Array<Record<string, unknown>>;
}

export interface SubscriptionPayment extends Record<string, unknown> {
  id?: string;
  reference?: string;
  status?: string;
  createdAt?: string;
}

export interface SubscriptionPaymentsResponse {
  data: SubscriptionPayment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InitializeSubscriptionCheckoutPayload {
  planId: string;
}

export interface InitializeSubscriptionCheckoutResponse
  extends Record<string, unknown> {
  paymentId?: string;
  authorizationUrl?: string;
  authorization_url?: string;
  checkoutUrl?: string;
  checkout_url?: string;
  accessCode?: string;
  access_code?: string;
  amountCents?: number;
  currency?: string;
  plan?: SubscriptionPlan;
  url?: string;
  reference?: string;
}

export interface VerifySubscriptionPaymentResponse {
  payment: {
    id: string;
    patientId: string;
    provider: string;
    providerRef: string;
    amountCents: number;
    currency: string;
    status: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  subscription: {
    id: string;
    patientId: string;
    planId: string;
    paymentId: string;
    startsAt: string;
    expiresAt: string;
    createdAt: string;
    plan: SubscriptionPlan;
  };
}

export interface CreateDoctorAvailabilityPayload {
  date: string;
  startTimes: string[];
  slotDurationMinutes: number;
  timezoneOffsetMinutes: number;
}

export interface DoctorAvailabilitySlot {
  id: string;
  monthId: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  createdAt: string;
}

export interface DoctorAvailabilityCalendarResponse {
  year: number;
  month: number;
  days: Array<{
    date: string;
    slotCount: number;
    bookedCount: number;
    slots: DoctorAvailabilitySlot[];
  }>;
}

export interface CreateDoctorAvailabilityResponse {
  date: string;
  slotCount: number;
  slots: DoctorAvailabilitySlot[];
}

export interface PublicDoctor {
  id: string;
  bio: string | null;
  specializations: string[];
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    username: string;
    createdAt: string;
  };
}

export interface PublicDoctorsQuery {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
}

export interface PublicDoctorsResponse {
  data: PublicDoctor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface CreateDoctorPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  username: string;
}

export interface CreateDoctorResponse {
  id: string;
  userId: string;
  specializations: string[];
  createdAt: string;
  user: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface AdminUsersQuery {
  search?: string;
  role?: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface AdminDoctorUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  isEmailVerified: boolean;
  roles: string[];
  patient: null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    userId: string;
    bio: string | null;
    specializations: string[];
    verifiedAt: string | null;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface AdminPatientUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  isEmailVerified: boolean;
  roles: string[];
  patient: {
    id: string;
    userId: string;
    avatarFileId: string | null;
    consultationBalance: number;
    preferences: unknown;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  doctor: null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse<TUser> {
  data: TUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserDetail {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  isEmailVerified: boolean;
  roles: string[];
  patient: AdminPatientUser["patient"];
  doctor: (NonNullable<AdminDoctorUser["doctor"]> & {
    wallet: {
      id: string;
      doctorId: string;
      currentBalance: number;
      lifetimePoints: number;
      pointValue: number;
      createdAt: string;
      updatedAt: string;
    } | null;
  }) | null;
  sessions: unknown[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOverview {
  users: {
    total: number;
    active: number;
    deleted: number;
    patients: number;
    doctors: number;
  };
  doctors: {
    total: number;
    verified: number;
    unverified: number;
  };
  appointments: {
    booked: number;
  };
  withdrawals: {
    pending: number;
  };
  payments: {
    completedCount: number;
    completedAmountCents: number;
  };
}

export interface CreateAdminSubscriptionPlanPayload {
  name: string;
  monthlyPrice: number;
  consultationsPerMonth: number;
  description: string;
}

export interface CreateAdminSpecialtyPayload {
  name: string;
  description: string;
}

export interface AdminSpecialty {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionPlan extends Record<string, unknown> {
  id: string;
  name: string;
  monthlyPrice?: number;
  priceNaira?: number;
  priceCents?: number;
  consultationsPerMonth?: number;
  consultationCredits?: number;
  consultationMinutes?: number;
  durationDays?: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminDoctorPointValueResponse {
  pointValue: number;
}

export interface UpdateAdminDoctorPointValuePayload {
  pointValue: number;
}

export interface AdminSubscriptionPayment extends Record<string, unknown> {
  id: string;
  patientId?: string;
  provider?: string;
  providerRef?: string;
  amountCents?: number;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: {
    planName?: string;
    planId?: string;
    [key: string]: unknown;
  } | null;
  patient?: {
    id?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  } | null;
  subscription?: {
    plan?: {
      name?: string;
    } | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminSubscriptionPaymentsResponse {
  data: AdminSubscriptionPayment[];
  meta?: PaginationMeta;
}

export type AdminWithdrawalStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "APPROVED"
  | "REJECTED";

export interface AdminWithdrawal extends Record<string, unknown> {
  id: string;
  doctorId?: string;
  amount?: number;
  amountCents?: number;
  status?: AdminWithdrawalStatus | string;
  requestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  doctor?: {
    id?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string | null;
    } | null;
  } | null;
  bankAccount?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  } | null;
}

export interface AdminWithdrawalsQuery {
  status?: AdminWithdrawalStatus;
  page?: number;
  limit?: number;
}

export interface AdminWithdrawalsResponse {
  data: AdminWithdrawal[];
  meta: PaginationMeta;
}

export interface AdminReportsQuery {
  doctorId?: string;
  appointmentId?: string;
  page?: number;
  limit?: number;
}

export interface AdminConsultationReport extends Record<string, unknown> {
  id: string;
  doctorId?: string;
  appointmentId?: string;
  title?: string;
  summary?: string;
  content?: string;
  notes?: string;
  diagnosis?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  doctor?: {
    id?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string | null;
    } | null;
  } | null;
  appointment?: {
    id?: string;
    status?: string;
    scheduledAt?: string;
    startsAt?: string;
    patient?: {
      user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      } | null;
    } | null;
  } | null;
}

export interface AdminReportsResponse {
  data: AdminConsultationReport[];
  meta: PaginationMeta;
}

export type AdminDoctorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminDoctorApplication extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  specialtyId: string;
  documentFileIds: string[];
  status: AdminDoctorApplicationStatus | string;
  rejectionReason: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  specialty?: AdminSpecialty | null;
}

export interface AdminDoctorApplicationsQuery {
  status?: AdminDoctorApplicationStatus;
  page?: number;
  limit?: number;
}

export interface AdminDoctorApplicationsResponse {
  data: AdminDoctorApplication[];
  meta: PaginationMeta;
}

export interface SubmitDoctorApplicationPayload {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  specialtyId: string;
  documents: File[];
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: unknown;
  success?: boolean;
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const PUBLIC_AUTH_ENDPOINTS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/verify-patient",
  "/auth/resend-patient-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
]);

let refreshRequest: Promise<string> | null = null;

async function handlePatientApiError(error: AxiosError) {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestPath = originalRequest?.url ?? "";
    const refreshToken = getPatientRefreshToken();
    const isProtectedRequest = !PUBLIC_AUTH_ENDPOINTS.has(requestPath);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      isProtectedRequest &&
      !refreshToken
    ) {
      clearPatientSession();

      if (typeof window !== "undefined") {
        window.location.assign("/");
      }

      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      !isProtectedRequest ||
      !refreshToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = refreshApi
          .post<RefreshTokenResponse>("/auth/refresh", { refreshToken })
          .then((response) => {
            updatePatientTokens(response.data);
            return response.data.accessToken;
          })
          .finally(() => {
            refreshRequest = null;
          });
      }

      const accessToken = await refreshRequest;
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      const retryClient =
        originalRequest.baseURL === API_BASE_URL ? api : patientGatewayApi;
      return retryClient(originalRequest);
    } catch (refreshError) {
      clearPatientSession();

      if (typeof window !== "undefined") {
        window.location.assign("/");
      }

      return Promise.reject(refreshError);
    }
}

api.interceptors.response.use(
  (response) => response,
  handlePatientApiError,
);

patientGatewayApi.interceptors.response.use(
  (response) => response,
  handlePatientApiError,
);

export const patientAuthApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),
  refresh: (payload: RefreshTokenPayload) =>
    refreshApi.post<RefreshTokenResponse>("/auth/refresh", payload),
  register: (payload: RegisterPatientPayload) =>
    api.post<ApiResponse>("/auth/register", payload),
  verify: (payload: VerifyPatientPayload) =>
    api.post<ApiResponse>("/auth/verify-patient", payload),
  resendOtp: (payload: ResendPatientOtpPayload) =>
    api.post<ApiResponse>("/auth/resend-patient-otp", payload),
  changePassword: (payload: ChangePasswordPayload) =>
    api.post<ApiResponse>("/auth/change-password", payload),
  logout: () => api.post<ApiResponse>("/auth/logout"),
  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<ApiResponse>("/auth/forgot-password", payload),
  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<ApiResponse>("/auth/reset-password", payload),
};

export const patientApiService = {
  getProfile: () => patientGatewayApi.get<PatientProfile>("/api/patients/me"),
  updateProfile: (payload: UpdatePatientProfilePayload) =>
    patientGatewayApi.patch<PatientProfile>("/api/patients/me", payload),
  getDashboard: () =>
    patientGatewayApi.get<PatientDashboardResponse>(
      "/api/patients/me/dashboard",
    ),
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return patientGatewayApi.post<PatientProfile>(
      "/api/patients/me/profile-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
  listAppointments: (params: PatientAppointmentsQuery = {}) =>
    patientGatewayApi.get<PatientAppointmentsResponse>(
      "/api/appointments/patient",
      { params: { page: 1, limit: 20, ...params } },
    ),
  bookAppointment: (payload: BookPatientAppointmentPayload) =>
    patientGatewayApi.post<BookPatientAppointmentResponse>(
      "/api/appointments",
      payload,
    ),
  listDoctorAvailability: (doctorId: string) =>
    patientGatewayApi.get<DoctorAvailabilitySlot[]>(
      `/api/doctors/${encodeURIComponent(doctorId)}/availability`,
    ),
  listDoctorReviews: (doctorId: string) =>
    patientGatewayApi.get<DoctorReviewsResponse>(
      `/api/doctors/${encodeURIComponent(doctorId)}/reviews`,
    ),
  createDoctorReview: (doctorId: string, payload: DoctorReviewPayload) =>
    patientGatewayApi.post<DoctorReview>(
      `/api/doctors/${encodeURIComponent(doctorId)}/reviews`,
      payload,
    ),
  listSubscriptionPlans: () =>
    patientGatewayApi.get<SubscriptionPlan[]>("/api/subscriptions/plans"),
  getMySubscription: () =>
    patientGatewayApi.get<PatientSubscriptionSummary>("/api/subscriptions/me"),
  listSubscriptionPayments: (params: PatientAppointmentsQuery = {}) =>
    patientGatewayApi.get<SubscriptionPaymentsResponse>(
      "/api/subscriptions/payments",
      { params: { page: 1, limit: 20, ...params } },
    ),
  initializeSubscriptionCheckout: (
    payload: InitializeSubscriptionCheckoutPayload,
  ) =>
    patientGatewayApi.post<InitializeSubscriptionCheckoutResponse>(
      "/api/subscriptions/initialize",
      payload,
    ),
  verifySubscriptionPayment: (reference: string) =>
    patientGatewayApi.get<VerifySubscriptionPaymentResponse>(
      `/api/subscriptions/verify/${encodeURIComponent(reference)}`,
    ),
  listNotifications: () =>
    patientGatewayApi.get<PatientNotificationsResponse | PatientNotification[]>(
      "/api/notifications",
    ),
  getUnreadNotificationCount: () =>
    patientGatewayApi.get<NotificationUnreadCountResponse>(
      "/api/notifications/unread-count",
    ),
  markAllNotificationsAsRead: () =>
    patientGatewayApi.patch<MarkNotificationsReadResponse>(
      "/api/notifications/read-all",
    ),
  markNotificationAsRead: (notificationId: string) =>
    patientGatewayApi.patch<PatientNotification | MarkNotificationsReadResponse>(
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    ),
};

export const doctorAuthApi = {
  login: (payload: DoctorLoginPayload) =>
    doctorApi.post<DoctorSession>("/doctors/auth/login", payload),
  forgotPassword: (payload: DoctorForgotPasswordPayload) =>
    doctorApi.post<ApiResponse>("/doctors/auth/forgot-password", payload),
  resetPassword: (payload: DoctorResetPasswordPayload) =>
    doctorApi.post<ApiResponse>("/doctors/auth/reset-password", payload),
  changePassword: (payload: ChangePasswordPayload) =>
    doctorApi.post<ApiResponse>("/doctors/auth/change-password", payload),
};

export const doctorApiService = {
  getProfile: () => doctorGatewayApi.get<DoctorProfile>("/api/doctors/me"),
  updateProfile: (payload: UpdateDoctorProfilePayload) =>
    doctorGatewayApi.patch<DoctorProfile>("/api/doctors/me", payload),
  updateBankAccount: (payload: UpdateDoctorBankAccountPayload) =>
    doctorGatewayApi.put<ApiResponse>("/api/doctors/me/bank-account", payload),
  getWallet: (doctorId: string) =>
    doctorGatewayApi.get<DoctorWallet>(
      `/api/wallets/doctors/${encodeURIComponent(doctorId)}`,
    ),
  requestWithdrawal: (payload: RequestDoctorWithdrawalPayload) =>
    doctorGatewayApi.post<DoctorWithdrawalResponse>(
      "/api/withdrawals",
      payload,
    ),
  listAppointments: (params: DoctorAppointmentsQuery = {}) =>
    doctorGatewayApi.get<DoctorAppointmentsResponse>(
      "/api/appointments/doctor",
      { params: { page: 1, limit: 20, ...params } },
    ),
  cancelAppointment: (appointmentId: string) =>
    doctorGatewayApi.patch<DoctorAppointment>(
      `/api/appointments/${encodeURIComponent(appointmentId)}/cancel`,
    ),
  completeAppointment: (appointmentId: string) =>
    doctorGatewayApi.patch<DoctorAppointment>(
      `/api/appointments/${encodeURIComponent(appointmentId)}/complete`,
    ),
  createAvailability: (payload: CreateDoctorAvailabilityPayload) =>
    doctorGatewayApi.put<CreateDoctorAvailabilityResponse>(
      "/api/doctors/me/availability/day",
      payload,
    ),
  getAvailabilityCalendar: (year: number, month: number) =>
    doctorGatewayApi.get<DoctorAvailabilityCalendarResponse>(
      "/api/doctors/me/availability/calendar",
      { params: { year, month, timezoneOffsetMinutes: 0 } },
    ),
  deleteAvailabilitySlot: (slotId: string) =>
    doctorGatewayApi.delete<ApiResponse>(
      `/api/doctors/me/availability/${encodeURIComponent(slotId)}`,
    ),
  clearDayAvailability: (date: string) =>
    doctorGatewayApi.delete<ApiResponse>(
      `/api/doctors/me/availability/day/${encodeURIComponent(date)}`,
      { params: { timezoneOffsetMinutes: 0 } },
    ),
};

export const patientDoctorsApiService = {
  list: (params: PublicDoctorsQuery = {}) =>
    publicGatewayApi.get<PublicDoctorsResponse>("/api/doctors", {
      params: { page: 1, limit: 20, ...params },
    }),
  getById: (id: string) =>
    publicGatewayApi.get<PublicDoctor>(
      `/api/doctors/${encodeURIComponent(id)}`,
    ),
};

export const doctorApplicationsApiService = {
  listSpecialties: () =>
    publicGatewayApi.get<AdminSpecialty[]>(
      "/api/doctor-applications/specialties",
    ),
  submit: (payload: SubmitDoctorApplicationPayload) => {
    const formData = new FormData();
    formData.append("fullName", payload.fullName);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("username", payload.username);
    formData.append("specialtyId", payload.specialtyId);
    payload.documents.forEach((document) => {
      formData.append("documents", document);
    });

    return publicGatewayApi.post<AdminDoctorApplication>(
      "/api/doctor-applications",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
};

export const adminApiService = {
  login: (payload: AdminLoginPayload) =>
    adminApi.post<AdminSession>("/admin/login", payload),
  getOverview: () =>
    adminUsersApi.get<AdminOverview>("/api/admin/overview"),
  listSubscriptionPlans: () =>
    adminUsersApi.get<AdminSubscriptionPlan[]>("/api/admin/subscription-plans"),
  createSubscriptionPlan: (payload: CreateAdminSubscriptionPlanPayload) =>
    adminUsersApi.post<AdminSubscriptionPlan>(
      "/api/admin/subscription-plans",
      payload,
    ),
  getDoctorPointValue: () =>
    adminUsersApi.get<AdminDoctorPointValueResponse>(
      "/api/admin/doctor-point-value",
    ),
  updateDoctorPointValue: (payload: UpdateAdminDoctorPointValuePayload) =>
    adminUsersApi.patch<AdminDoctorPointValueResponse>(
      "/api/admin/doctor-point-value",
      payload,
    ),
  listSubscriptionPayments: () =>
    adminUsersApi.get<AdminSubscriptionPaymentsResponse>(
      "/api/admin/subscription-payments",
    ),
  listWithdrawals: (params: AdminWithdrawalsQuery = {}) =>
    adminUsersApi.get<AdminWithdrawalsResponse>("/api/admin/withdrawals", {
      params: { page: 1, limit: 20, ...params },
    }),
  markWithdrawalProcessing: (id: string) =>
    adminUsersApi.patch<AdminWithdrawal>(
      `/api/admin/withdrawals/${encodeURIComponent(id)}/processing`,
    ),
  markWithdrawalCompleted: (id: string) =>
    adminUsersApi.patch<AdminWithdrawal>(
      `/api/admin/withdrawals/${encodeURIComponent(id)}/completed`,
    ),
  listReports: (params: AdminReportsQuery = {}) =>
    adminUsersApi.get<AdminReportsResponse>("/api/admin/reports", {
      params: { page: 1, limit: 20, ...params },
    }),
  listDoctorApplications: (params: AdminDoctorApplicationsQuery = {}) =>
    adminUsersApi.get<AdminDoctorApplicationsResponse>(
      "/api/admin/doctor-applications",
      { params: { page: 1, limit: 20, ...params } },
    ),
  approveDoctorApplication: (id: string) =>
    adminUsersApi.patch<AdminDoctorApplication>(
      `/api/admin/doctor-applications/${encodeURIComponent(id)}/approve`,
    ),
  rejectDoctorApplication: (id: string) =>
    adminUsersApi.patch<AdminDoctorApplication>(
      `/api/admin/doctor-applications/${encodeURIComponent(id)}/reject`,
    ),
  getDoctorApplicationDocument: (documentId: string) =>
    adminUsersApi.get<Blob>(
      `/api/admin/doctor-applications/documents/${documentId}`,
      {
        responseType: "blob",
      },
    ),
  listSpecialties: () =>
    adminUsersApi.get<AdminSpecialty[]>("/api/admin/specialties"),
  createSpecialty: (payload: CreateAdminSpecialtyPayload) =>
    adminUsersApi.post<AdminSpecialty>("/api/admin/specialties", payload),
  createDoctor: (payload: CreateDoctorPayload) =>
    adminApi.post<CreateDoctorResponse>("/admin/doctors", payload),
  listDoctors: (search?: string) =>
    adminUsersApi.get<AdminUsersResponse<AdminDoctorUser>>(
      "/api/admin/users",
      { params: { role: "DOCTOR", search: search || undefined } },
    ),
  listPatients: (search?: string) =>
    adminUsersApi.get<AdminUsersResponse<AdminPatientUser>>(
      "/api/admin/users",
      { params: { role: "PATIENT", search: search || undefined } },
    ),
  getUser: (id: string) =>
    adminUsersApi.get<AdminUserDetail>(
      `/api/admin/users/${encodeURIComponent(id)}`,
    ),
  deactivateUser: (id: string) =>
    adminUsersApi.patch<ApiResponse>(
      `/api/admin/users/${encodeURIComponent(id)}/deactivate`,
    ),
  restoreUser: (id: string) =>
    adminUsersApi.patch<ApiResponse>(
      `/api/admin/users/${encodeURIComponent(id)}/restore`,
    ),
};

function extractApiMessage(value: unknown, depth = 0): string | undefined {
  if (depth > 5) return undefined;

  if (typeof value === "string") {
    const message = value.trim();
    return message || undefined;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => extractApiMessage(item, depth + 1))
      .filter((message): message is string => Boolean(message));

    return messages.length ? messages.join(" ") : undefined;
  }

  if (!value || typeof value !== "object") return undefined;

  const response = value as Record<string, unknown>;

  for (const key of ["message", "error", "detail", "errors"]) {
    const message = extractApiMessage(response[key], depth + 1);
    if (message) return message;
  }

  return undefined;
}

export function getApiResponseMessage(response: unknown, fallback: string) {
  return extractApiMessage(response) ?? fallback;
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return "Something went wrong. Please try again.";
  }

  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  const responseMessage = extractApiMessage(error.response?.data);
  if (responseMessage) return responseMessage;

  if (!error.response) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  return "The request failed. Please check your details and try again.";
}
