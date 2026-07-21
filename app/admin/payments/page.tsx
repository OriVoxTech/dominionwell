"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApiService,
  getApiErrorMessage,
  type AdminSubscriptionPayment,
  type AdminWithdrawal,
  type AdminWithdrawalStatus,
} from "@/lib/api";

const withdrawalStatusOptions: Array<AdminWithdrawalStatus | ""> = [
  "",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "APPROVED",
  "REJECTED",
];

type PaymentsTab = "subscription-payments" | "withdrawal-requests";

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

function getDoctorName(withdrawal: AdminWithdrawal) {
  const user = withdrawal.doctor?.user;
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    user?.username ||
    user?.email ||
    withdrawal.doctorId ||
    "Unknown doctor"
  );
}

function getWithdrawalAmount(withdrawal: AdminWithdrawal) {
  if (typeof withdrawal.amount === "number") return withdrawal.amount;
  if (typeof withdrawal.amountCents === "number") {
    return withdrawal.amountCents / 100;
  }
  return 0;
}

function getWithdrawalDate(withdrawal: AdminWithdrawal) {
  const value = withdrawal.requestedAt ?? withdrawal.createdAt ?? withdrawal.updatedAt;
  return value ? new Date(value).toLocaleString() : "-";
}

function getBankDetails(withdrawal: AdminWithdrawal) {
  const bank = withdrawal.bankAccount;
  const details = [bank?.bankName, bank?.accountName, bank?.accountNumber]
    .map((part) => part?.trim())
    .filter(Boolean);

  return details.length ? details.join(" / ") : "-";
}

function getStatusClass(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "COMPLETED" || normalizedStatus === "PAID") {
    return "bg-[#16b46f]/15 text-[#166534]";
  }

  if (normalizedStatus === "PENDING" || normalizedStatus === "PROCESSING") {
    return "bg-[#f59e0b]/15 text-[#b45309]";
  }

  if (normalizedStatus === "APPROVED") {
    return "bg-[#dbeafe] text-[#1d4ed8]";
  }

  return "bg-[#ef4444]/12 text-[#b91c1c]";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminSubscriptionPayment[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [activeTab, setActiveTab] = useState<PaymentsTab>("subscription-payments");
  const [withdrawalStatus, setWithdrawalStatus] = useState<AdminWithdrawalStatus | "">("");
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [withdrawalError, setWithdrawalError] = useState("");
  const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState("");

  const loadPayments = useCallback(async () => {
    setPaymentError("");
    setIsLoadingPayments(true);

    try {
      const response = await adminApiService.listSubscriptionPayments();
      setPayments(response.data.data ?? []);
    } catch (requestError) {
      setPaymentError(getApiErrorMessage(requestError));
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  const loadWithdrawals = useCallback(async () => {
    setWithdrawalError("");
    setIsLoadingWithdrawals(true);

    try {
      const response = await adminApiService.listWithdrawals({
        status: withdrawalStatus || undefined,
      });
      setWithdrawals(response.data.data ?? []);
    } catch (requestError) {
      setWithdrawalError(getApiErrorMessage(requestError));
    } finally {
      setIsLoadingWithdrawals(false);
    }
  }, [withdrawalStatus]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPayments();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadPayments]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWithdrawals();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadWithdrawals]);

  const withdrawalSummary = useMemo(() => {
    return withdrawals.reduce(
      (summary, withdrawal) => {
        const status = String(withdrawal.status ?? "UNKNOWN").toUpperCase();
        const amount = getWithdrawalAmount(withdrawal);

        summary.totalAmount += amount;
        if (status === "PENDING") summary.pending += 1;
        if (status === "PROCESSING") summary.processing += 1;
        if (status === "COMPLETED" || status === "APPROVED") {
          summary.completed += 1;
        }

        return summary;
      },
      { pending: 0, processing: 0, completed: 0, totalAmount: 0 },
    );
  }, [withdrawals]);

  const handleWithdrawalAction = async (
    withdrawal: AdminWithdrawal,
    action: "processing" | "completed",
  ) => {
    if (updatingWithdrawalId) return;

    setWithdrawalError("");
    setUpdatingWithdrawalId(withdrawal.id);

    try {
      if (action === "processing") {
        await adminApiService.markWithdrawalProcessing(withdrawal.id);
      } else {
        await adminApiService.markWithdrawalCompleted(withdrawal.id);
      }
      await loadWithdrawals();
    } catch (requestError) {
      setWithdrawalError(getApiErrorMessage(requestError));
    } finally {
      setUpdatingWithdrawalId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Payments</h2>
        <p className="mt-1 text-sm text-[#475569]">View patient subscription payments and process doctor withdrawal requests.</p>
      </div>

      <div className="rounded-xl bg-[#f8fafc] p-1">
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("subscription-payments")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activeTab === "subscription-payments"
                ? "bg-[#001b5e] text-white shadow-sm"
                : "text-[#475569] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Patient Subscription Payments
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeTab === "subscription-payments" ? "bg-white/15 text-white" : "bg-[#e2e8f0] text-[#334155]"}`}>
              {isLoadingPayments ? "-" : payments.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("withdrawal-requests")}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              activeTab === "withdrawal-requests"
                ? "bg-[#001b5e] text-white shadow-sm"
                : "text-[#475569] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            Doctor Withdrawal Requests
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${activeTab === "withdrawal-requests" ? "bg-white/15 text-white" : "bg-[#e2e8f0] text-[#334155]"}`}>
              {isLoadingWithdrawals ? "-" : withdrawals.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "subscription-payments" && paymentError ? (
        <p role="alert" className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
          {paymentError}
        </p>
      ) : null}

      {activeTab === "subscription-payments" ? (
      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-[#001b5e]">Subscription Payments</h3>
          <button
            type="button"
            onClick={() => void loadPayments()}
            disabled={isLoadingPayments}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-3 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            Refresh
          </button>
        </div>

        {isLoadingPayments ? (
          <p className="text-sm text-[#64748b]">Loading payments...</p>
        ) : null}

        {!isLoadingPayments && payments.length === 0 ? (
          <p className="text-sm text-[#64748b]">No subscription payments yet.</p>
        ) : null}

        {!isLoadingPayments && payments.length > 0 ? (
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
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-3 text-[#475569]">{payment.providerRef ?? "-"}</td>
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
      ) : null}

      {activeTab === "withdrawal-requests" ? (
      <section className="space-y-4 rounded-xl border border-[#e2e8f0] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#001b5e]">Doctor Withdrawal Requests</h3>
            <p className="mt-1 text-sm text-[#64748b]">Review withdrawal requests and move them through processing to completed.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={withdrawalStatus}
              onChange={(event) =>
                setWithdrawalStatus(event.target.value as AdminWithdrawalStatus | "")
              }
              className="h-9 rounded-lg border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#334155] outline-none focus:border-[#16b46f]"
              aria-label="Filter withdrawal status"
            >
              {withdrawalStatusOptions.map((status) => (
                <option key={status || "ALL"} value={status}>
                  {status || "ALL STATUSES"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadWithdrawals()}
              disabled={isLoadingWithdrawals}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-3 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[17px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {withdrawalError ? (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
            <span>{withdrawalError}</span>
            <button
              type="button"
              onClick={() => void loadWithdrawals()}
              className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white"
            >
              Try Again
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Requests</p>
            <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{isLoadingWithdrawals ? "-" : withdrawals.length}</p>
          </article>
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-[#b45309]">{isLoadingWithdrawals ? "-" : withdrawalSummary.pending}</p>
          </article>
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Processing</p>
            <p className="mt-2 text-2xl font-semibold text-[#b45309]">{isLoadingWithdrawals ? "-" : withdrawalSummary.processing}</p>
          </article>
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Amount</p>
            <p className="mt-2 text-2xl font-semibold text-[#001b5e]">NGN {isLoadingWithdrawals ? "-" : withdrawalSummary.totalAmount.toLocaleString()}</p>
          </article>
        </div>

        {isLoadingWithdrawals ? (
          <p className="text-sm text-[#64748b]">Loading withdrawal requests...</p>
        ) : null}

        {!isLoadingWithdrawals && withdrawals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-center text-sm text-[#64748b]">
            No withdrawal requests found.
          </p>
        ) : null}

        {!isLoadingWithdrawals && withdrawals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                  <th className="px-3 py-2">Doctor</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Bank</th>
                  <th className="px-3 py-2">Requested</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => {
                  const status = String(withdrawal.status ?? "UNKNOWN").toUpperCase();
                  const isUpdating = updatingWithdrawalId === withdrawal.id;

                  return (
                    <tr key={withdrawal.id} className="border-b border-[#e2e8f0] last:border-b-0">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-[#001b5e]">{getDoctorName(withdrawal)}</p>
                        <p className="text-xs text-[#64748b]">{withdrawal.doctorId ?? withdrawal.id}</p>
                      </td>
                      <td className="px-3 py-3 text-[#475569]">NGN {getWithdrawalAmount(withdrawal).toLocaleString()}</td>
                      <td className="px-3 py-3 text-[#475569]">{getBankDetails(withdrawal)}</td>
                      <td className="px-3 py-3 text-[#475569]">{getWithdrawalDate(withdrawal)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => void handleWithdrawalAction(withdrawal, "processing")}
                            disabled={isUpdating || status === "PROCESSING" || status === "COMPLETED"}
                            className="rounded-lg border border-[#f59e0b]/40 px-3 py-1.5 text-xs font-semibold text-[#92400e] hover:bg-[#fffbeb] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]"
                          >
                            {isUpdating ? "Updating..." : "Processing"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleWithdrawalAction(withdrawal, "completed")}
                            disabled={isUpdating || status === "COMPLETED"}
                            className="rounded-lg border border-[#16b46f]/40 px-3 py-1.5 text-xs font-semibold text-[#166534] hover:bg-[#f0fdf4] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:text-[#94a3b8]"
                          >
                            {isUpdating ? "Updating..." : "Completed"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      ) : null}
    </div>
  );
}
