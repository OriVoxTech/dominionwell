export const DEVELOPMENT_API_BASE_URL =
  "https://dominionwell-backend-1ksa.onrender.com/api";

export const PRODUCTION_API_BASE_URL =
  "https://dominionwell-backend.onrender.com/api";

export function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_API_BASE_URL
      : DEVELOPMENT_API_BASE_URL)
  );
}

export const API_BASE_URL = getApiBaseUrl();
