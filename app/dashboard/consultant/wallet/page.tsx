"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorLogoutButton from "@/components/doctor-logout-button";
import {
  ADMIN_UPDATED_EVENT,
  getPendingDoctorWithdrawalRequest,
  readDoctorBankDetails,
  readAdminSettings,
  readDoctorWalletActivity,
  readDoctorWalletSummary,
  requestDoctorWithdrawal,
} from "@/lib/admin-portal";

const CURRENT_DOCTOR_ID = "dr-richardson";

export default function ConsultantWalletPage() {
  const [walletSummary, setWalletSummary] = useState(() => readDoctorWalletSummary(CURRENT_DOCTOR_ID));
  const [walletActivity, setWalletActivity] = useState(() => readDoctorWalletActivity(CURRENT_DOCTOR_ID));
  const [pointValue, setPointValue] = useState(() => readAdminSettings().pointValue);
  const [bankDetails, setBankDetails] = useState(() => readDoctorBankDetails(CURRENT_DOCTOR_ID));
  const [pendingRequest, setPendingRequest] = useState(() => getPendingDoctorWithdrawalRequest(CURRENT_DOCTOR_ID));
  const [withdrawAmount, setWithdrawAmount] = useState(() => String(readAdminSettings().pointValue));
  const [notice, setNotice] = useState("");

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

  const completedConsultations = useMemo(() => walletActivity.transactions.length, [walletActivity.transactions.length]);

  const handleRequestWithdrawal = () => {
    const amount = Math.max(0, Math.floor(Number(withdrawAmount) || 0));
    const result = requestDoctorWithdrawal(CURRENT_DOCTOR_ID, amount);

    if (!result.ok) {
      setNotice(result.reason);
      return;
    }

    setNotice(`Withdrawal request submitted for NGN ${result.request.amount.toLocaleString()}.`);
    setWithdrawAmount(String(pointValue));
    setWalletSummary(readDoctorWalletSummary(CURRENT_DOCTOR_ID));
    setWalletActivity(readDoctorWalletActivity(CURRENT_DOCTOR_ID));
    setPendingRequest(getPendingDoctorWithdrawalRequest(CURRENT_DOCTOR_ID));
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
      <DoctorMobileNav />

      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[280px] flex-col bg-[#0d1b3d] px-4 py-8 text-white shadow-md lg:flex">
        <div className="mb-8 px-2">
          <span className="text-1xl font-extrabold text-[#7784ac]">DominionWell+</span>
        </div>

        <div className="mb-8 flex items-center gap-4 px-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#16b36c] bg-[#e0e3e6]">
            <Image
              className="object-cover"
              alt="Dr. Richardson"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold text-[#7784ac]">Dr. Richardson</p>
            <p className="text-xs text-[#7784ac]/80">Senior Cardiologist</p>
          </div>
        </div>

        <div className="flex-grow space-y-2 text-sm">
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/consultations">
            <span className="material-symbols-outlined">medical_services</span>
            <span>Consultations</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/patients">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">wallet</span>
            <span>Wallet</span>
          </div>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/settings">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span>Notifications</span>
          </Link>
          <DoctorLogoutButton className="flex w-full items-center gap-3 p-3 text-left text-[#7784ac]/85 hover:bg-[#00020d]/10" />
        </div>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 md:p-10 lg:ml-[280px]">
        <header className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/doctor"
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Wallet</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">
            Each completed consultation adds 1 point and NGN {pointValue.toLocaleString()} to your wallet balance. Points stay cumulative even after withdrawals.
          </p>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3">
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Points</p>
            <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{walletSummary.points}</p>
          </article>
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Available Balance</p>
            <p className="mt-2 text-2xl font-semibold text-[#001b5e]">NGN {walletSummary.balance.toLocaleString()}</p>
          </article>
          <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Completed Consultations</p>
            <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{completedConsultations}</p>
          </article>
        </section>

        <section className="mb-5 rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <h2 className="text-base font-semibold text-[#001b5e]">Bank Details</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Bank</p>
              <p className="mt-1 font-semibold text-[#001b5e]">{bankDetails.bankName || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Account Name</p>
              <p className="mt-1 font-semibold text-[#001b5e]">{bankDetails.accountName || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Account Number</p>
              <p className="mt-1 font-semibold text-[#001b5e]">{bankDetails.accountNumber || "Not set"}</p>
            </div>
          </div>

          {!bankDetails.bankName || !bankDetails.accountName || !bankDetails.accountNumber ? (
            <p className="mt-2 text-xs text-[#475569]">
              Complete your payout account details in
              <Link href="/dashboard/doctor/settings" className="ml-1 font-semibold text-[#0aa4b4] hover:underline">
                Settings
              </Link>
              .
            </p>
          ) : null}
        </section>

        <section className="mb-5 rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <h2 className="text-base font-semibold text-[#001b5e]">Request Withdrawal</h2>
          <p className="mt-1 text-xs text-[#475569]">Withdrawals are requested in multiples of NGN {pointValue.toLocaleString()}.</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={pointValue}
              step={pointValue}
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className="h-10 w-44 rounded-lg border border-[#cbd5e1] bg-white px-3 text-sm"
              aria-label="Withdrawal amount"
            />
            <button
              type="button"
              className="h-10 rounded-lg bg-[#001b5e] px-4 text-sm font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
              disabled={walletSummary.balance < pointValue || Boolean(pendingRequest)}
              onClick={handleRequestWithdrawal}
            >
              Request Withdrawal
            </button>
          </div>

          {pendingRequest ? (
            <p className="mt-2 text-xs font-semibold text-[#b45309]">
              Pending request: NGN {pendingRequest.amount.toLocaleString()} ({pendingRequest.points} pts)
            </p>
          ) : null}
          {notice ? <p className="mt-2 text-xs text-[#334155]">{notice}</p> : null}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Consultation Earnings</h3>
            {walletActivity.transactions.length === 0 ? (
              <p className="text-sm text-[#64748b]">No completed consultation earnings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                      <th className="px-3 py-2">Consultation</th>
                      <th className="px-3 py-2">Points</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletActivity.transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">{transaction.consultationId}</td>
                        <td className="px-3 py-2 text-[#334155]">{transaction.points}</td>
                        <td className="px-3 py-2 text-[#334155]">NGN {transaction.amount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[#334155]">{new Date(transaction.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-[#dbe4f0] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Withdrawal History</h3>
            {walletActivity.withdrawals.length === 0 ? (
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
                    {walletActivity.withdrawals.slice(0, 10).map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="px-3 py-2 text-[#334155]">NGN {withdrawal.amount.toLocaleString()}</td>
                        <td className="px-3 py-2 text-[#334155]">{withdrawal.points}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                              withdrawal.status === "Approved"
                                ? "bg-[#16b46f]/15 text-[#166534]"
                                : withdrawal.status === "Rejected"
                                  ? "bg-[#ef4444]/12 text-[#b91c1c]"
                                  : "bg-[#f59e0b]/15 text-[#b45309]"
                            }`}
                          >
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#334155]">{new Date(withdrawal.requestedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
