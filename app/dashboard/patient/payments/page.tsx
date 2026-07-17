"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import { getApiErrorMessage, patientApiService, type SubscriptionPayment } from "@/lib/api";

const amountFormatter = new Intl.NumberFormat("en-NG");

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getStringValue(record: Record<string, unknown> | null, keys: string[], fallback = "-") {
  if (!record) return fallback;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return fallback;
}

function getPaymentStatusClass(status: string) {
  const normalizedStatus = status.trim().toUpperCase();

  if (normalizedStatus === "COMPLETED" || normalizedStatus === "SUCCESSFUL" || normalizedStatus === "SUCCESS") {
    return "bg-[#16b46f]/15 text-[#16b46f]";
  }

  if (normalizedStatus === "PENDING") {
    return "bg-[#f59e0b]/15 text-[#b45309]";
  }

  if (normalizedStatus === "FAILED" || normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
    return "bg-[#ef4444]/12 text-[#dc2626]";
  }

  return "bg-[#64748b]/15 text-[#475569]";
}

function formatPaymentAmount(record: Record<string, unknown> | null) {
  const currency = getStringValue(record, ["currency"], "NGN");
  const amountNaira = record?.amountNaira ?? record?.priceNaira;
  const amountCents = record?.amountCents;

  if (typeof amountNaira === "number") {
    return `${currency} ${amountFormatter.format(amountNaira)}`;
  }

  if (typeof amountCents === "number") {
    return `${currency} ${amountFormatter.format(amountCents / 100)}`;
  }

  return getStringValue(record, ["amount"], "-");
}

export default function PatientPaymentsPage() {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadPayments = async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await patientApiService.listSubscriptionPayments({ page: 1, limit: 20 });
        if (isCancelled) return;
        setPayments(response.data.data);
      } catch (requestError) {
        if (!isCancelled) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <PatientMobileNav active="payments" />

      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-10">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/patient"
                aria-label="Back to dashboard"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-white"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>
              <h1 className="text-2xl font-semibold text-[#001b5e]">Payment History</h1>
            </div>
            <p className="text-sm text-[#64748b]">
              View subscription checkout attempts, pending payments, and completed transactions.
            </p>
          </div>

          <Link
            href="/dashboard/patient/subscription?mode=buy"
            className="inline-flex items-center justify-center rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]"
          >
            Buy Subscription
          </Link>
        </header>

        {error ? (
          <section role="alert" className="mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
            <p className="text-sm font-semibold text-[#b91c1c]">{error}</p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#001b5e]">Transactions</h2>
            <p className="text-xs text-[#64748b]">
              {isLoading ? "Loading..." : `Records: ${payments.length}`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-xl bg-[#f1f5f9]" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
              No payments yet. Completed subscription payments will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                    <th className="rounded-l-lg px-3 py-3">Date</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="rounded-r-lg px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((record, index) => {
                    const recordData = asRecord(record);
                    const createdAt = getStringValue(recordData, ["createdAt", "paidAt"], "");
                    const reference = getStringValue(recordData, ["providerRef", "reference", "provider_ref"], "-");
                    const status = record.status ?? "PENDING";

                    return (
                      <tr key={record.id ?? reference ?? index} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-3 text-[#475569]">
                          {createdAt ? new Date(createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-3 text-[#475569]">{reference}</td>
                        <td className="px-3 py-3 text-[#475569]">{formatPaymentAmount(recordData)}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getPaymentStatusClass(status)}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
