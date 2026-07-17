"use client";

import {
  patientApiService,
  type VerifySubscriptionPaymentResponse,
} from "@/lib/api";

export const PENDING_SUBSCRIPTION_REFERENCE_KEY =
  "dwPendingSubscriptionReference";
const PENDING_SUBSCRIPTION_REFERENCE_MAX_AGE_MS = 1000 * 60 * 60 * 24;

let activeVerification:
  | {
      reference: string;
      request: Promise<VerifySubscriptionPaymentResponse>;
    }
  | null = null;

function parseSavedReference(value: string | null) {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value) as {
      reference?: unknown;
      createdAt?: unknown;
    };

    if (typeof parsed.reference !== "string" || !parsed.reference.trim()) {
      return "";
    }

    if (
      typeof parsed.createdAt === "number" &&
      Date.now() - parsed.createdAt > PENDING_SUBSCRIPTION_REFERENCE_MAX_AGE_MS
    ) {
      clearPendingSubscriptionReference();
      return "";
    }

    return parsed.reference;
  } catch {
    clearPendingSubscriptionReference();
    return "";
  }
}

export function getPendingSubscriptionReference() {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  return (
    params.get("reference") ??
    params.get("trxref") ??
    parseSavedReference(
      window.localStorage.getItem(PENDING_SUBSCRIPTION_REFERENCE_KEY),
    ) ??
    ""
  );
}

export function savePendingSubscriptionReference(reference: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PENDING_SUBSCRIPTION_REFERENCE_KEY,
    JSON.stringify({ reference, createdAt: Date.now() }),
  );
}

export function clearPendingSubscriptionReference() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_SUBSCRIPTION_REFERENCE_KEY);
}

export async function verifyPendingSubscriptionPayment(reference: string) {
  if (!reference) return;

  if (activeVerification?.reference === reference) {
    return activeVerification.request;
  }

  const request = patientApiService
    .verifySubscriptionPayment(reference)
    .then((response) => {
      clearPendingSubscriptionReference();
      window.dispatchEvent(new Event("dw-subscription-updated"));
      return response.data;
    })
    .finally(() => {
      activeVerification = null;
    });

  activeVerification = { reference, request };

  return request;
}
