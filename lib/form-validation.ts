export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function normalizeNigerianPhoneLocalNumber(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("234")) {
    digits = digits.slice(3);
  }

  digits = digits.replace(/^0+/, "");

  return digits.slice(0, 10);
}

export function formatNigerianPhone(localNumber: string) {
  return localNumber ? `+234${localNumber}` : "";
}

export function getNigerianPhoneLocalNumber(phone: string | null | undefined) {
  return normalizeNigerianPhoneLocalNumber(phone ?? "");
}

export function isValidNigerianPhoneLocalNumber(value: string) {
  return /^\d{10}$/.test(value);
}
