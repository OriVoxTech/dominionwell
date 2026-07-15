const DOCTOR_SESSION_KEY = "dwDoctorSession";
const DOCTOR_ACCESS_TOKEN_KEY = "dwDoctorAccessToken";
const DOCTOR_REFRESH_TOKEN_KEY = "dwDoctorRefreshToken";
const DOCTOR_FAMILY_ID_KEY = "dwDoctorFamilyId";
const DOCTOR_USER_ID_KEY = "dwDoctorUserId";
const DOCTOR_API_SESSION_ID_KEY = "dwDoctorApiSessionId";

export type DoctorSession = {
  accessToken: string;
  refreshToken?: string;
  familyId?: string;
  userId?: string;
  sessionId?: string;
};

const SESSION_KEYS = [
  DOCTOR_SESSION_KEY,
  DOCTOR_ACCESS_TOKEN_KEY,
  DOCTOR_REFRESH_TOKEN_KEY,
  DOCTOR_FAMILY_ID_KEY,
  DOCTOR_USER_ID_KEY,
  DOCTOR_API_SESSION_ID_KEY,
];

export function getDoctorAccessToken() {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(DOCTOR_ACCESS_TOKEN_KEY) ??
    window.sessionStorage.getItem(DOCTOR_ACCESS_TOKEN_KEY)
  );
}

export function saveDoctorSession(session: DoctorSession, remember: boolean) {
  if (typeof window === "undefined") return;

  clearDoctorSession();
  const storage = remember ? window.localStorage : window.sessionStorage;

  storage.setItem(DOCTOR_ACCESS_TOKEN_KEY, session.accessToken);
  storage.setItem(
    DOCTOR_SESSION_KEY,
    JSON.stringify({
      userId: session.userId,
      sessionId: session.sessionId,
      loggedInAt: new Date().toISOString(),
    }),
  );

  if (session.refreshToken) storage.setItem(DOCTOR_REFRESH_TOKEN_KEY, session.refreshToken);
  if (session.familyId) storage.setItem(DOCTOR_FAMILY_ID_KEY, session.familyId);
  if (session.userId) storage.setItem(DOCTOR_USER_ID_KEY, session.userId);
  if (session.sessionId) storage.setItem(DOCTOR_API_SESSION_ID_KEY, session.sessionId);
}

export function clearDoctorSession() {
  if (typeof window === "undefined") return;

  for (const key of SESSION_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}
