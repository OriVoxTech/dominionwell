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
  "https://f9ee-102-88-54-189.ngrok-free.app/api";
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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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
        window.location.assign("/login/patient?session=expired");
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
      return api(originalRequest);
    } catch (refreshError) {
      clearPatientSession();

      if (typeof window !== "undefined") {
        window.location.assign("/login/patient?session=expired");
      }

      return Promise.reject(refreshError);
    }
  },
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
  listAppointments: (params: DoctorAppointmentsQuery = {}) =>
    doctorGatewayApi.get<DoctorAppointmentsResponse>(
      "/api/appointments/doctor",
      { params: { page: 1, limit: 20, ...params } },
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

export const adminApiService = {
  login: (payload: AdminLoginPayload) =>
    adminApi.post<AdminSession>("/admin/login", payload),
  getOverview: () =>
    adminUsersApi.get<AdminOverview>("/api/admin/overview"),
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
