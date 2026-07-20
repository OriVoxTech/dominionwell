"use client";

import { useEffect, useState } from "react";
import {
  adminApiService,
  getApiErrorMessage,
  type AdminSubscriptionPayment,
} from "@/lib/api";

function getPatientName(payment: AdminSubscriptionPayment) {
  const user = payment.patient?.user;
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || user?.email || payment.patientId || "Unknown patient";
}

function getPlanName(payment: AdminSubscriptionPayment) {
  return (
    payment.subscription?.plan?.name ||
    payment.metadata?.planName ||
    "Subscription plan"
  );
}

function getPaymentAmount(payment: AdminSubscriptionPayment) {
  if (typeof payment.amount === "number") return payment.amount;
  if (typeof payment.amountCents === "number") return payment.amountCents / 100;
  return 0;
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "COMPLETED" || normalizedStatus === "PAID") {
    return "bg-[#16b46f]/15 text-[#166534]";
  }

  if (normalizedStatus === "PENDING") {
    return "bg-[#f59e0b]/15 text-[#b45309]";
  }

  return "bg-[#ef4444]/12 text-[#b91c1c]";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminSubscriptionPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void adminApiService
        .listSubscriptionPayments()
        .then((response) => {
          setPayments(response.data.data ?? []);
          setError("");
        })
        .catch((requestError) => {
          setError(getApiErrorMessage(requestError));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Payments</h2>
        <p className="mt-1 text-sm text-[#475569]">View all patient subscription payments.</p>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        {isLoading ? (
          <p className="text-sm text-[#64748b]">Loading payments...</p>
        ) : null}

        {!isLoading && payments.length === 0 ? (
          <p className="text-sm text-[#64748b]">No subscription payments yet.</p>
        ) : null}

        {!isLoading && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Reference</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const status = payment.status ?? "UNKNOWN";

                  return (
                    <tr key={payment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-[#001b5e]">{getPatientName(payment)}</p>
                        <p className="text-xs text-[#64748b]">{payment.patientId ?? payment.patient?.id ?? payment.id}</p>
                      </td>
                      <td className="px-3 py-3 text-[#475569]">{getPlanName(payment)}</td>
                      <td className="px-3 py-3 text-[#475569]">
                        {payment.currency ?? "NGN"} {getPaymentAmount(payment).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-[#475569]">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-3 text-[#475569]">{payment.providerRef ?? "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
