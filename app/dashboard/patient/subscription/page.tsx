"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import {
    getApiErrorMessage,
    patientApiService,
    type PatientSubscriptionSummary,
    type SubscriptionPlan,
} from "@/lib/api";
import {
    clearPendingSubscriptionReference,
    getPendingSubscriptionReference,
    savePendingSubscriptionReference,
    verifyPendingSubscriptionPayment,
} from "@/lib/subscription-payment";

const amountFormatter = new Intl.NumberFormat("en-NG");

function formatAmount(plan: SubscriptionPlan) {
    const amount = plan.priceNaira || plan.priceCents / 100;
    return `${plan.currency || "NGN"} ${amountFormatter.format(amount)}`;
}

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

function getPlanNameFromSubscription(subscription: Record<string, unknown> | null) {
    const plan = asRecord(subscription?.plan);
    return getStringValue(plan, ["name"], getStringValue(subscription, ["planName", "name"], "No Active Plan"));
}

function getCheckoutUrl(response: unknown): string {
    const visited = new Set<unknown>();
    const keys = ["authorizationUrl", "authorization_url", "checkoutUrl", "checkout_url", "paymentUrl", "payment_url", "url"];

    const findUrl = (value: unknown): string => {
        if (!value || visited.has(value)) return "";
        visited.add(value);

        if (typeof value === "string" && /^https?:\/\//i.test(value)) {
            return value;
        }

        const record = asRecord(value);
        if (!record) return "";

        for (const key of keys) {
            const candidate = record[key];
            if (typeof candidate === "string" && /^https?:\/\//i.test(candidate)) {
                return candidate;
            }
        }

        for (const candidate of Object.values(record)) {
            const nestedUrl = findUrl(candidate);
            if (nestedUrl) return nestedUrl;
        }

        return "";
    };

    return findUrl(response);
}

function getCheckoutReference(response: unknown): string {
    const record = asRecord(response);
    return getStringValue(record, ["reference", "providerRef", "provider_ref"], "");
}

export default function SubscriptionPage() {
    const router = useRouter();
    const [mode] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return new URLSearchParams(window.location.search).get("mode");
    });
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [subscription, setSubscription] = useState<PatientSubscriptionSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStartingCheckout, setIsStartingCheckout] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const applyVerifiedSubscription = useCallback((response: Awaited<ReturnType<typeof patientApiService.verifySubscriptionPayment>>["data"]) => {
        setSubscription((current) => ({
            consultationBalance:
                current?.consultationBalance ??
                response.subscription.plan.consultationCredits,
            currentSubscription: response.subscription,
            subscriptions: [
                response.subscription,
                ...(current?.subscriptions ?? []),
            ],
        }));
        setSuccessMessage("Payment verified successfully. Redirecting to your dashboard...");
        window.dispatchEvent(new Event("dw-subscription-updated"));
        window.setTimeout(() => {
            router.replace("/dashboard/patient?subscription=success");
        }, 900);
    }, [router]);

    useEffect(() => {
        let isCancelled = false;

        const loadSubscriptionData = async () => {
            setError("");
            setIsLoading(true);

            try {
                const [plansResponse, subscriptionResponse] = await Promise.all([
                    patientApiService.listSubscriptionPlans(),
                    patientApiService.getMySubscription(),
                ]);

                if (isCancelled) return;

                setPlans(plansResponse.data.filter((plan) => plan.isActive));
                setSubscription(subscriptionResponse.data);
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

        void loadSubscriptionData();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const reference = getPendingSubscriptionReference();

        if (!reference) return;

        let isCancelled = false;

        const verifyPayment = async () => {
            setError("");

            try {
                const response = await verifyPendingSubscriptionPayment(reference);
                if (isCancelled) return;

                clearPendingSubscriptionReference();
                if (response) {
                    applyVerifiedSubscription(response);
                }
            } catch (requestError) {
                if (!isCancelled) {
                    setError(getApiErrorMessage(requestError));
                }
            }
        };

        void verifyPayment();

        return () => {
            isCancelled = true;
        };
    }, [applyVerifiedSubscription]);

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

    const handleChoosePlan = async (plan: SubscriptionPlan) => {
        setError("");
        setSuccessMessage("");
        setIsStartingCheckout(plan.id);

        try {
            const response = await patientApiService.initializeSubscriptionCheckout({ planId: plan.id });
            const reference = getCheckoutReference(response.data);
            const checkoutUrl = getCheckoutUrl(response.data);

            if (!checkoutUrl) {
                setSuccessMessage("Checkout was initialized, but no Paystack payment URL was returned.");
                return;
            }

            if (reference) {
                savePendingSubscriptionReference(reference);
            }

            window.location.assign(checkoutUrl);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setIsStartingCheckout("");
        }
    };

    const activePlanName = getPlanNameFromSubscription(subscription?.currentSubscription ?? null);
    const balance = subscription?.consultationBalance ?? 0;

    return (
        <div className="min-h-screen bg-[#f9fafb] px-6 py-8 text-[#191c1e] md:px-10">
            <PatientMobileNav active="subscription" />
            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                aria-label="Back"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            </button>
                            <h1 className="text-2xl font-semibold text-[#001b5e]">{pageTitle}</h1>
                        </div>
                        <p className="text-[13px] mt-2 text-[#475569]">{pageSubtitle}</p>
                    </div>

                    <Link
                        href="/dashboard/patient/payments"
                        className="inline-flex items-center justify-center rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#001b5e] hover:bg-white"
                    >
                        View Payment History
                    </Link>
                </header>

                <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-[#c6c6cf] bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-[#64748b]">Current plan</p>
                        <p className="mt-1 text-sm font-semibold text-[#001b5e]">{activePlanName}</p>
                    </div>
                    <div className="rounded-xl border border-[#c6c6cf] bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-[#64748b]">Consultation balance</p>
                        <p className="mt-1 text-sm font-semibold text-[#001b5e]">{balance}</p>
                    </div>
                    <div className="rounded-xl border border-[#c6c6cf] bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-[#64748b]">Subscription records</p>
                        <p className="mt-1 text-sm font-semibold text-[#001b5e]">{subscription?.subscriptions.length ?? 0}</p>
                    </div>
                </section>

                <section className="mb-6 rounded-xl border border-[#c6c6cf] bg-white p-4">
                    <p className="text-sm font-semibold text-[#001b5e]">Consultation Duration Policy</p>
                    <p className="mt-1 text-sm text-[#475569]">
                        Each consultation lasts for a maximum of 1 hour. To extend a consultation, you need to book again.
                    </p>
                </section>

                {error ? (
                    <section role="alert" className="mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
                        <p className="text-sm font-semibold text-[#b91c1c]">{error}</p>
                    </section>
                ) : null}

                {successMessage ? (
                    <section className="mb-6 rounded-xl border border-[#16b46f]/30 bg-[#16b46f]/10 p-4">
                        <p className="text-sm font-semibold text-[#166534]">{successMessage}</p>
                    </section>
                ) : null}

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {isLoading ? (
                        [0, 1, 2, 3].map((item) => (
                            <div key={item} className="h-60 animate-pulse rounded-2xl border border-[#e2e8f0] bg-white p-5">
                                <div className="mb-4 h-5 w-1/2 rounded bg-[#e2e8f0]" />
                                <div className="mb-3 h-4 w-1/3 rounded bg-[#f1f5f9]" />
                                <div className="mt-8 h-8 w-2/3 rounded bg-[#e2e8f0]" />
                            </div>
                        ))
                    ) : plans.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#c6c6cf] bg-white p-5 text-sm text-[#64748b] md:col-span-2 lg:col-span-4">
                            No active subscription plans are available right now.
                        </div>
                    ) : (
                        plans.map((plan) => (
                            <article key={plan.id} className="flex flex-col rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                                <h2 className="text-lg font-semibold text-[#001b5e]">{plan.name}</h2>
                                <p className="mt-1 text-sm text-[#64748b]">{plan.consultationCredits} consultation{plan.consultationCredits === 1 ? "" : "s"}</p>
                                <p className="mt-1 text-xs text-[#64748b]">Max {plan.consultationMinutes} minutes per consultation</p>
                                <p className="mt-4 text-2xl font-bold text-[#001b5e]">{formatAmount(plan)}</p>
                                <p className="mt-2 min-h-12 flex-1 text-sm text-[#475569]">{plan.description}</p>
                                <button
                                    type="button"
                                    disabled={Boolean(isStartingCheckout)}
                                    className="mt-5 w-full rounded-lg bg-[#001b5e] py-2 text-sm font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                                    onClick={() => void handleChoosePlan(plan)}
                                >
                                    {isStartingCheckout === plan.id ? "Opening checkout..." : `Choose ${plan.name}`}
                                </button>
                            </article>
                        ))
                    )}
                </section>

            </div>
        </div>
    );
}
