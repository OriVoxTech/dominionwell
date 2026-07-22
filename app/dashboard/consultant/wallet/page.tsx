"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorPageHeader from "@/components/doctor-page-header";
import DoctorSidebar from "@/components/doctor-sidebar";
import {
  doctorApiService,
  getApiErrorMessage,
  type DoctorWallet,
  type DoctorWithdrawalResponse,
} from "@/lib/api";
import {
  ADMIN_UPDATED_EVENT,
  getPendingDoctorWithdrawalRequest,
  readDoctorBankDetails,
  readAdminSettings,
  readDoctorWalletActivity,
  readDoctorWalletSummary,
  type DoctorWithdrawalRequest,
} from "@/lib/admin-portal";
import { useDoctorProfile } from "@/lib/use-doctor-profile";

const CURRENT_DOCTOR_ID = "dr-richardson";

type WithdrawalHistoryItem = DoctorWithdrawalResponse | DoctorWithdrawalRequest;

function getWithdrawalAmount(withdrawal: WithdrawalHistoryItem) {
  if (typeof withdrawal.amount === "number") return withdrawal.amount;
  if ("amountCents" in withdrawal && typeof withdrawal.amountCents === "number") {
    return withdrawal.amountCents / 100;
  }

  return 0;
}

function getWithdrawalPoints(
  withdrawal: WithdrawalHistoryItem,
  pointValue: number,
) {
  if (typeof withdrawal.points === "number") return withdrawal.points;

  const amount = getWithdrawalAmount(withdrawal);
  return pointValue > 0 ? Math.floor(amount / pointValue) : 0;
}

function getWithdrawalStatus(withdrawal: WithdrawalHistoryItem) {
  return withdrawal.status ?? "PENDING";
}

function getWithdrawalStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getWithdrawalStatusClass(status: string) {
  const normalizedStatus = status.toUpperCase();

  if (["COMPLETED", "APPROVED"].includes(normalizedStatus)) {
    return "bg-[#16b46f]/15 text-[#166534]";
  }

  if (normalizedStatus === "REJECTED") {
    return "bg-[#ef4444]/12 text-[#b91c1c]";
  }

  if (normalizedStatus === "PROCESSING") {
    return "bg-[#0aa4b4]/15 text-[#036673]";
  }

  return "bg-[#f59e0b]/15 text-[#b45309]";
}

function getWithdrawalRequestedAt(withdrawal: WithdrawalHistoryItem) {
  if (withdrawal.requestedAt) return withdrawal.requestedAt;
  if ("createdAt" in withdrawal && withdrawal.createdAt) return withdrawal.createdAt;
  if ("updatedAt" in withdrawal && withdrawal.updatedAt) return withdrawal.updatedAt;
  return undefined;
}

export default function ConsultantWalletPage() {
  const doctorProfile = useDoctorProfile();
  const [serverWallet, setServerWallet] = useState<DoctorWallet | null>(null);
  const [serverWithdrawals, setServerWithdrawals] = useState<
    DoctorWithdrawalResponse[]
  >([]);
  const [walletError, setWalletError] = useState("");
  const [withdrawalsError, setWithdrawalsError] = useState("");
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [walletSummary, setWalletSummary] = useState(() => readDoctorWalletSummary(CURRENT_DOCTOR_ID));
  const [walletActivity, setWalletActivity] = useState(() => readDoctorWalletActivity(CURRENT_DOCTOR_ID));
  const [pointValue, setPointValue] = useState(() => readAdminSettings().pointValue);
  const [bankDetails, setBankDetails] = useState(() => readDoctorBankDetails(CURRENT_DOCTOR_ID));
  const [pendingRequest, setPendingRequest] = useState(() => getPendingDoctorWithdrawalRequest(CURRENT_DOCTOR_ID));
  const [withdrawAmount, setWithdrawAmount] = useState(() => String(readAdminSettings().pointValue));
  const [notice, setNotice] = useState("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);

  const loadWithdrawals = useCallback(async () => {
    setWithdrawalsError("");
    setIsLoadingWithdrawals(true);

    try {
      const response = await doctorApiService.listWithdrawals();
      setServerWithdrawals(response.data.data);
    } catch (error) {
      setWithdrawalsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingWithdrawals(false);
    }
  }, []);

  useEffect(() => {
    if (!doctorProfile?.id) return;

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      setWalletError("");
      void doctorApiService
        .getWallet(doctorProfile.id)
        .then((response) => {
          if (!isCancelled) {
            setServerWallet(response.data);
          }
        })
        .catch((error) => {
          if (!isCancelled) {
            setWalletError(getApiErrorMessage(error));
          }
        });
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [doctorProfile?.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWithdrawals();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadWithdrawals]);

  useEffect(() => {
    const syncWallet = () => {
      setWalletSummary(readDoctorWalletSummary(CURRENT_DOCTOR_ID));
      setWalletActivity(readDoctorWalletActivity(CURRENT_DOCTOR_ID));
      setPointValue(readAdminSettings().pointValue);
      setBankDetails(readDoctorBankDetails(CURRENT_DOCTOR_ID));
      setPendingRequest(getPendingDoctorWithdrawalRequest(CURRENT_DOCTOR_ID));
    };

    syncWallet();
    window.addEventListener("storage", syncWallet);
    window.addEventListener(ADMIN_UPDATED_EVENT, syncWallet);

    return () => {
      window.removeEventListener("storage", syncWallet);
      window.removeEventListener(ADMIN_UPDATED_EVENT, syncWallet);
    };
  }, []);

  const displayedWallet = {
    points: serverWallet?.lifetimePoints ?? doctorProfile?.wallet?.lifetimePoints ?? walletSummary.points,
    balance: serverWallet?.currentBalance ?? doctorProfile?.wallet?.currentBalance ?? walletSummary.balance,
    pointValue: serverWallet?.pointValue ?? doctorProfile?.wallet?.pointValue ?? pointValue,
  };
  const completedConsultations = useMemo(() => walletActivity.transactions.length, [walletActivity.transactions.length]);
  const backendPendingRequest = useMemo(
    () =>
      serverWithdrawals.find((withdrawal) =>
        ["PENDING", "PROCESSING"].includes(
          getWithdrawalStatus(withdrawal).toUpperCase(),
        ),
      ),
    [serverWithdrawals],
  );
  const activePendingRequest = backendPendingRequest ?? pendingRequest;
  const displayedBankDetails = {
    bankName: doctorProfile?.bankName || bankDetails.bankName,
    accountName: doctorProfile?.bankAccountName || bankDetails.accountName,
    accountNumber: doctorProfile?.bankAccountNumber || bankDetails.accountNumber,
  };
  const completedConsultationCount =
    doctorProfile?.appointmentStats?.completed ?? completedConsultations;

  const handleRequestWithdrawal = async () => {
    if (!doctorProfile?.id) {
      setNotice("Doctor profile is still loading. Please try again.");
      return;
    }

    const amount = Math.max(0, Math.floor(Number(withdrawAmount) || 0));

    if (amount <= 0) {
      setNotice("Enter a valid withdrawal amount.");
      return;
    }

    if (amount > displayedWallet.balance) {
      setNotice("Withdrawal amount cannot exceed your available balance.");
      return;
    }

    setNotice("");
    setIsRequestingWithdrawal(true);

    try {
      await doctorApiService.requestWithdrawal({
        doctorId: doctorProfile.id,
        amount,
      });

      setNotice(`Withdrawal request submitted for NGN ${amount.toLocaleString()}.`);
      setWithdrawAmount(String(displayedWallet.pointValue));

      const walletResponse = await doctorApiService.getWallet(doctorProfile.id);
      setServerWallet(walletResponse.data);
      await loadWithdrawals();
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    } finally {
      setIsRequestingWithdrawal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <DoctorMobileNav />

      <DoctorSidebar active="wallet" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
        <DoctorPageHeader title="Wallet" description={`Track professional earnings, manage payout details, and request withdrawals. Each completed consultation is worth NGN ${displayedWallet.pointValue.toLocaleString()}.`} icon="account_balance_wallet" />

        {walletError ? (
          <section role="alert" className="mb-5 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#b91c1c]">
            {walletError}
          </section>
        ) : null}

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-2xl bg-[#001b5e] p-5 text-white shadow-[0_16px_35px_rgba(0,27,94,0.15)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#8df0bb]"><span className="material-symbols-outlined text-[20px]">stars</span></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#aebee0]">Lifetime points</p>
            <p className="mt-1 text-xl font-bold">{displayedWallet.points}</p>
          </article>
          <article className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined text-[20px]">payments</span></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a96a8]">Available balance</p>
            <p className="mt-1 text-xl font-bold text-[#001b5e]">NGN {displayedWallet.balance.toLocaleString()}</p>
          </article>
          <article className="rounded-2xl border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_26px_rgba(30,52,83,0.05)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef4ff] text-[#315ead]"><span className="material-symbols-outlined text-[20px]">task_alt</span></span><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a96a8]">Completed consultations</p>
            <p className="mt-1 text-xl font-bold text-[#001b5e]">{completedConsultationCount}</p>
          </article>
        </section>

        <section className="mb-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
          <h2 className="text-base font-semibold text-[#001b5e]">Bank Details</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Bank</p>
              <p className="mt-1 font-semibold text-[#001b5e]">{displayedBankDetails.bankName || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Account Name</p>
              <p className="mt-1 font-semibold text-[#001b5e]">{displayedBankDetails.accountName || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Account Number</p>
              <p className="mt-1 font-semibold text-[#001b5e]">{displayedBankDetails.accountNumber || "Not set"}</p>
            </div>
          </div>

          {!displayedBankDetails.bankName || !displayedBankDetails.accountName || !displayedBankDetails.accountNumber ? (
            <p className="mt-2 text-xs text-[#475569]">
              Complete your payout account details in
              <Link href="/dashboard/doctor/settings" className="ml-1 font-semibold text-[#0aa4b4] hover:underline">
                Settings
              </Link>
              .
            </p>
          ) : null}
        </section>

        <section className="mb-5 rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
          <h2 className="text-base font-semibold text-[#001b5e]">Request Withdrawal</h2>
          <p className="mt-1 text-xs text-[#475569]">Withdrawals are requested in multiples of NGN {displayedWallet.pointValue.toLocaleString()}.</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="number"
              min={displayedWallet.pointValue}
              step={displayedWallet.pointValue}
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className="h-11 w-full rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#16b36c] sm:w-52"
              aria-label="Withdrawal amount"
            />
            <button
              type="button"
              className="h-11 rounded-xl bg-[#16b36c] px-5 text-sm font-bold text-white hover:bg-[#118d57] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
              disabled={
                isRequestingWithdrawal ||
                !doctorProfile?.id ||
                displayedWallet.balance < displayedWallet.pointValue ||
                Boolean(activePendingRequest)
              }
              onClick={handleRequestWithdrawal}
            >
              {isRequestingWithdrawal ? "Requesting..." : "Request Withdrawal"}
            </button>
          </div>

          {activePendingRequest ? (
            <p className="mt-2 text-xs font-semibold text-[#b45309]">
              Pending request: NGN{" "}
              {getWithdrawalAmount(activePendingRequest).toLocaleString()} (
              {getWithdrawalPoints(
                activePendingRequest,
                displayedWallet.pointValue,
              )}{" "}
              pts)
            </p>
          ) : null}
          {notice ? <p className="mt-2 text-xs text-[#334155]">{notice}</p> : null}
        </section>

        <section>
          <article className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Withdrawal History</h3>
            {withdrawalsError ? (
              <div role="alert" className="mb-4 flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
                <span>{withdrawalsError}</span>
                <button
                  type="button"
                  onClick={() => void loadWithdrawals()}
                  className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white"
                >
                  Try Again
                </button>
              </div>
            ) : null}
            {isLoadingWithdrawals ? (
              <p className="text-sm text-[#64748b]">Loading withdrawal history...</p>
            ) : serverWithdrawals.length === 0 ? (
              <p className="text-sm text-[#64748b]">No withdrawal requests yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Equivalent Points</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverWithdrawals.slice(0, 10).map((withdrawal) => {
                      const status = getWithdrawalStatus(withdrawal);
                      const requestedAt = getWithdrawalRequestedAt(withdrawal);

                      return (
                      <tr key={withdrawal.id ?? `${status}-${requestedAt}`} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">NGN {getWithdrawalAmount(withdrawal).toLocaleString()}</td>
                        <td className="px-3 py-2 text-[#334155]">{getWithdrawalPoints(withdrawal, displayedWallet.pointValue)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getWithdrawalStatusClass(status)}`}
                          >
                            {getWithdrawalStatusLabel(status)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#334155]">
                          {requestedAt
                            ? new Date(requestedAt).toLocaleString()
                            : "Not provided"}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
        </div>
      </main>
    </div>
  );
}
