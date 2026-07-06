"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const plans = [
    {
        name: "Starter",
        consultations: 5,
        price: 39,
        description: "Good for occasional consultations and basic follow-ups.",
    },
    {
        name: "Plus",
        consultations: 10,
        price: 69,
        description: "Best for regular check-ins and ongoing care management.",
    },
    {
        name: "Premium",
        consultations: 50,
        price: 249,
        description: "For families and high-frequency care with maximum flexibility.",
    },
];

type SubscriptionPlan = (typeof plans)[number];

type PaymentRecord = {
    id: string;
    method: "bank_transfer" | "paystack";
    status: "successful";
    planName: string;
    consultationsAdded: number;
    amount: number;
    accountName?: string;
    reference?: string;
    email?: string;
    paystackReference?: string;
    createdAt: string;
};

const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
const PAYMENT_RECORDS_KEY = "dwPaymentRecords";

export default function SubscriptionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [accountName, setAccountName] = useState("");
    const [transferReference, setTransferReference] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        const existingRecords = window.localStorage.getItem(PAYMENT_RECORDS_KEY);

        return existingRecords ? (JSON.parse(existingRecords) as PaymentRecord[]) : [];
    });

    const closePaymentModal = () => {
        setSelectedPlan(null);
        setAccountName("");
        setTransferReference("");
        setError("");
    };

    const confirmBankTransfer = () => {
        if (!selectedPlan) {
            return;
        }

        if (accountName.trim().length < 3 || transferReference.trim().length < 3) {
            setError("Please provide account name and transfer reference.");
            return;
        }

        const currentBalance = Number(window.localStorage.getItem(CONSULTATION_BALANCE_KEY));
        const safeCurrentBalance = Number.isFinite(currentBalance) ? currentBalance : 0;
        const updatedBalance = safeCurrentBalance + selectedPlan.consultations;

        const existingRecords = window.localStorage.getItem(PAYMENT_RECORDS_KEY);
        const parsedRecords: PaymentRecord[] = existingRecords ? (JSON.parse(existingRecords) as PaymentRecord[]) : [];

        const newRecord: PaymentRecord = {
            id: `pay_${Date.now()}`,
            method: "bank_transfer",
            status: "successful",
            planName: selectedPlan.name,
            consultationsAdded: selectedPlan.consultations,
            amount: selectedPlan.price,
            accountName: accountName.trim(),
            reference: transferReference.trim(),
            createdAt: new Date().toISOString(),
        };

        const updatedRecords = [newRecord, ...parsedRecords];

        window.localStorage.setItem(CONSULTATION_BALANCE_KEY, String(updatedBalance));
        window.localStorage.setItem(PAYMENT_RECORDS_KEY, JSON.stringify(updatedRecords));
        window.dispatchEvent(new Event("dw-subscription-updated"));
        setPaymentHistory(updatedRecords);

        setSuccessMessage(
            `Payment successful. ${selectedPlan.consultations} consultations added. New balance: ${updatedBalance}.`
        );
        closePaymentModal();
    };

    const pageTitle =
        mode === "manage" ? "Manage Subscription" : mode === "change" ? "Change Subscription" : "Subscriptions";

    const pageSubtitle =
        mode === "manage"
            ? "Review your plan and keep your consultation balance active."
            : mode === "change"
              ? "Switch to another plan that fits your current care needs."
              : "Choose a plan to continue speaking with doctors.";

    const handleGoBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
        }

        router.push("/dashboard/patient");
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] px-6 py-8 text-[#191c1e] md:px-10">
            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-[#001b5e]">{pageTitle}</h1>
                        <p className="text-sm text-[#475569]">{pageSubtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="w-fit text-sm font-semibold text-[#0aa4b4]"
                    >
                        Go Back
                    </button>
                </header>

                {successMessage ? (
                    <section className="mb-6 rounded-xl border border-[#16b46f]/30 bg-[#16b46f]/10 p-4">
                        <p className="text-sm font-semibold text-[#166534]">{successMessage}</p>
                        <button
                            type="button"
                            className="mt-3 rounded-lg bg-[#001b5e] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                            onClick={() => router.push("/dashboard/patient")}
                        >
                            Go to Dashboard
                        </button>
                    </section>
                ) : null}

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {plans.map((plan) => (
                        <article key={plan.name} className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-[#001b5e]">{plan.name}</h2>
                            <p className="mt-1 text-sm text-[#64748b]">{plan.consultations} Consultations</p>
                            <p className="mt-4 text-3xl font-bold text-[#001b5e]">${plan.price}</p>
                            <p className="mt-2 min-h-12 text-sm text-[#475569]">{plan.description}</p>
                            <button
                                type="button"
                                className="mt-5 w-full rounded-lg bg-[#001b5e] py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]"
                                onClick={() => {
                                    setSelectedPlan(plan);
                                    setError("");
                                }}
                            >
                                Choose {plan.consultations} Consultations
                            </button>
                        </article>
                    ))}
                </section>

                {selectedPlan ? (
                    <div className="fixed inset-0 z-50 grid place-items-center p-4">
                        <button
                            type="button"
                            className="absolute inset-0 bg-[#0f172a]/45"
                            aria-label="Close payment modal"
                            onClick={closePaymentModal}
                        />

                        <section className="relative z-10 w-full max-w-lg rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-xl">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold text-[#001b5e]">Bank Transfer Payment</h3>
                                <button
                                    type="button"
                                    className="rounded-md p-1 text-[#64748b] hover:bg-[#f2f4f7]"
                                    aria-label="Close modal"
                                    onClick={closePaymentModal}
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <div className="mb-4 rounded-lg bg-[#f8fafc] p-3 text-sm text-[#334155]">
                                <p className="font-semibold text-[#001b5e]">Transfer Details</p>
                                <p className="mt-1">Bank: Dominion Health Bank</p>
                                <p>Account Number: 0293009487</p>
                                <p>Account Name: DominionWell Health Services</p>
                                <p className="mt-2 font-semibold">Amount: ${selectedPlan.price}</p>
                                <p>Plan: {selectedPlan.consultations} Consultations</p>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-[#334155]">Your Account Name</span>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(event) => setAccountName(event.target.value)}
                                        className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                                        placeholder="Enter sender account name"
                                    />
                                </label>

                                <label className="block text-sm">
                                    <span className="mb-1 block font-medium text-[#334155]">Transfer Reference</span>
                                    <input
                                        type="text"
                                        value={transferReference}
                                        onChange={(event) => setTransferReference(event.target.value)}
                                        className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                                        placeholder="Enter transaction/reference number"
                                    />
                                </label>
                            </div>

                            {error ? <p className="mt-3 text-sm text-[#dc2626]">{error}</p> : null}

                            <div className="mt-5 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg border border-[#c6c6cf] px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc]"
                                    onClick={closePaymentModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg bg-[#16b46f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#149660]"
                                    onClick={confirmBankTransfer}
                                >
                                    I Have Completed Transfer
                                </button>
                            </div>
                        </section>
                    </div>
                ) : null}

                <section className="mt-8 rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#001b5e]">Payment History</h3>
                        <p className="text-xs text-[#64748b]">Stored records: {paymentHistory.length}</p>
                    </div>

                    {paymentHistory.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
                            No payments yet. Completed subscription payments will appear here.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                                        <th className="rounded-l-lg px-3 py-3">Date</th>
                                        <th className="px-3 py-3">Method</th>
                                        <th className="px-3 py-3">Plan</th>
                                        <th className="px-3 py-3">Consultations</th>
                                        <th className="px-3 py-3">Amount</th>
                                        <th className="px-3 py-3">Reference</th>
                                        <th className="rounded-r-lg px-3 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((record) => (
                                        <tr key={record.id} className="border-b border-[#e2e8f0] last:border-b-0">
                                            <td className="px-3 py-3 text-[#475569]">
                                                {new Date(record.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-3 capitalize text-[#475569]">
                                                {record.method.replace("_", " ")}
                                            </td>
                                            <td className="px-3 py-3 text-[#001b5e]">{record.planName}</td>
                                            <td className="px-3 py-3 text-[#475569]">{record.consultationsAdded}</td>
                                            <td className="px-3 py-3 text-[#475569]">${record.amount}</td>
                                            <td className="px-3 py-3 text-[#475569]">
                                                {record.reference || record.paystackReference || "-"}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="rounded-full bg-[#16b46f]/15 px-2 py-1 text-[10px] font-semibold uppercase text-[#16b46f]">
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
