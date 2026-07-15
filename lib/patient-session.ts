const PATIENT_AUTH_KEY = "dwPatientLoggedIn";
const PATIENT_ACCESS_TOKEN_KEY = "dwPatientAccessToken";
const PATIENT_REFRESH_TOKEN_KEY = "dwPatientRefreshToken";
const PATIENT_FAMILY_ID_KEY = "dwPatientFamilyId";
const PATIENT_USER_ID_KEY = "dwPatientUserId";
const PATIENT_SESSION_ID_KEY = "dwPatientSessionId";

type PatientSession = {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  userId: string;
  sessionId: string;
};

type RefreshedPatientTokens = Pick<
  PatientSession,
  "accessToken" | "refreshToken" | "familyId"
>;

const SESSION_KEYS = [
  PATIENT_AUTH_KEY,
  PATIENT_ACCESS_TOKEN_KEY,
  PATIENT_REFRESH_TOKEN_KEY,
  PATIENT_FAMILY_ID_KEY,
  PATIENT_USER_ID_KEY,
  PATIENT_SESSION_ID_KEY,
];

export function getPatientAccessToken() {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(PATIENT_ACCESS_TOKEN_KEY) ??
    window.sessionStorage.getItem(PATIENT_ACCESS_TOKEN_KEY)
  );
}

export function getPatientRefreshToken() {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(PATIENT_REFRESH_TOKEN_KEY) ??
    window.sessionStorage.getItem(PATIENT_REFRESH_TOKEN_KEY)
  );
}

export function updatePatientTokens(tokens: RefreshedPatientTokens) {
  if (typeof window === "undefined") return;

  const storage = window.localStorage.getItem(PATIENT_REFRESH_TOKEN_KEY)
    ? window.localStorage
    : window.sessionStorage;

  storage.setItem(PATIENT_AUTH_KEY, "true");
  storage.setItem(PATIENT_ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(PATIENT_REFRESH_TOKEN_KEY, tokens.refreshToken);
  storage.setItem(PATIENT_FAMILY_ID_KEY, tokens.familyId);
}

export function savePatientSession(session: PatientSession, remember: boolean) {
  if (typeof window === "undefined") return;

  clearPatientSession();
  const storage = remember ? window.localStorage : window.sessionStorage;

  storage.setItem(PATIENT_AUTH_KEY, "true");
  storage.setItem(PATIENT_ACCESS_TOKEN_KEY, session.accessToken);
  storage.setItem(PATIENT_REFRESH_TOKEN_KEY, session.refreshToken);
  storage.setItem(PATIENT_FAMILY_ID_KEY, session.familyId);
  storage.setItem(PATIENT_USER_ID_KEY, session.userId);
  storage.setItem(PATIENT_SESSION_ID_KEY, session.sessionId);
}

export function clearPatientSession() {
  if (typeof window === "undefined") return;

  for (const key of SESSION_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

export function isPatientSessionActive() {
  if (typeof window === "undefined") return false;

  return Boolean(getPatientAccessToken());
}
