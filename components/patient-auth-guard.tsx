"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { usePatientSessionActive } from "@/components/use-patient-session-active";
import {
  getPendingSubscriptionReference,
  verifyPendingSubscriptionPayment,
} from "@/lib/subscription-payment";

type PatientAuthGuardProps = {
  children: ReactNode;
};

export default function PatientAuthGuard({ children }: PatientAuthGuardProps) {
  const router = useRouter();
  const hasPatientSession = usePatientSessionActive();
  const [isVerifyingSubscription, setIsVerifyingSubscription] = useState(() =>
    Boolean(getPendingSubscriptionReference()),
  );

  useEffect(() => {
    if (!hasPatientSession) {
      router.replace("/");
    }
  }, [hasPatientSession, router]);

  useEffect(() => {
    if (!hasPatientSession) return;

    let isCancelled = false;
    const reference = getPendingSubscriptionReference();

    if (!reference) return;

    void verifyPendingSubscriptionPayment(reference)
      .then(() => {
        if (!isCancelled && window.location.pathname !== "/dashboard/patient") {
          router.replace("/dashboard/patient?subscription=success");
        }
      })
      .catch(() => {
        // Subscription page surfaces verification errors when the patient lands there.
      })
      .finally(() => {
        if (!isCancelled) {
          setIsVerifyingSubscription(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [hasPatientSession, router]);

  if (!hasPatientSession || isVerifyingSubscription) {
    return <main className="min-h-screen bg-[#f7f9fc]" />;
  }

  return children;
}
