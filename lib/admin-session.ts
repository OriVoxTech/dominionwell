const ADMIN_SESSION_KEY = "dwAdminSession";
const ADMIN_ACCESS_TOKEN_KEY = "dwAdminAccessToken";
const ADMIN_REFRESH_TOKEN_KEY = "dwAdminRefreshToken";
const ADMIN_FAMILY_ID_KEY = "dwAdminFamilyId";
const ADMIN_USER_ID_KEY = "dwAdminUserId";
const ADMIN_API_SESSION_ID_KEY = "dwAdminApiSessionId";

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  userId: string;
  sessionId: string;
};

const SESSION_KEYS = [
  ADMIN_SESSION_KEY,
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  ADMIN_FAMILY_ID_KEY,
  ADMIN_USER_ID_KEY,
  ADMIN_API_SESSION_ID_KEY,
];

export function getAdminAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function saveAdminSession(session: AdminSession) {
  if (typeof window === "undefined") return;

  clearAdminSession();
  window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, session.refreshToken);
  window.localStorage.setItem(ADMIN_FAMILY_ID_KEY, session.familyId);
  window.localStorage.setItem(ADMIN_USER_ID_KEY, session.userId);
  window.localStorage.setItem(ADMIN_API_SESSION_ID_KEY, session.sessionId);
  window.localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ userId: session.userId, loggedInAt: new Date().toISOString() }),
  );
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) window.localStorage.removeItem(key);
}

export function isAdminSessionActive() {
  return Boolean(getAdminAccessToken());
}
