"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import { getApiErrorMessage, getApiResponseMessage, patientAuthApi } from "@/lib/api";

type PaymentRecord = {
    planName?: string;
    createdAt?: string;
};

type CurrentSubscription = {
    planName: string;
    price: number;
    balance: number;
    status: "Active" | "No Active Plan";
    renewalLabel: string;
    featureSummary: string;
};

const PLAN_PRICE_MAP: Record<string, number> = {
    Starter: 39,
    Plus: 69,
    Premium: 249,
};

const PLAN_FEATURE_MAP: Record<string, string> = {
    Starter: "5 consultations for occasional check-ins and follow-up care.",
    Plus: "10 consultations with stronger support for ongoing treatment.",
    Premium: "50 consultations for family-level and high-frequency care.",
};

const CONSULTATION_BALANCE_KEY = "dwConsultationBalance";
const PAYMENT_RECORDS_KEY = "dwPaymentRecords";

function getSubscriptionSnapshot(): CurrentSubscription {
    if (typeof window === "undefined") {
        return {
            planName: "No Active Plan",
            price: 0,
            balance: 0,
            status: "No Active Plan",
            renewalLabel: "No renewal date",
            featureSummary: "Choose a subscription plan to unlock consultations and priority care.",
        };
    }

    const rawBalance = Number(window.localStorage.getItem(CONSULTATION_BALANCE_KEY));
    const balance = Number.isFinite(rawBalance) ? rawBalance : 0;

    const rawRecords = window.localStorage.getItem(PAYMENT_RECORDS_KEY);
    let records: PaymentRecord[] = [];

    if (rawRecords) {
        try {
            records = JSON.parse(rawRecords) as PaymentRecord[];
        } catch {
            records = [];
        }
    }
    const latestRecord = Array.isArray(records)
        ? records.reduce<PaymentRecord | null>((latest, current) => {
              const latestTime = latest?.createdAt ? new Date(latest.createdAt).getTime() : 0;
              const currentTime = current?.createdAt ? new Date(current.createdAt).getTime() : 0;
              return currentTime > latestTime ? current : latest;
          }, null)
        : null;

    const activePlanName = latestRecord?.planName && PLAN_PRICE_MAP[latestRecord.planName] ? latestRecord.planName : "";

    if (!activePlanName) {
        return {
            planName: "No Active Plan",
            price: 0,
            balance,
            status: "No Active Plan",
            renewalLabel: "No renewal date",
            featureSummary: "Choose a subscription plan to unlock consultations and priority care.",
        };
    }

    const startDate = latestRecord?.createdAt ? new Date(latestRecord.createdAt) : new Date();
    const renewalDate = new Date(startDate.getTime());
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    return {
        planName: activePlanName,
        price: PLAN_PRICE_MAP[activePlanName],
        balance,
        status: "Active",
        renewalLabel: renewalDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        featureSummary: PLAN_FEATURE_MAP[activePlanName],
    };
}

export default function PatientSettingsPage() {
    const [fullName, setFullName] = useState("Alex Johnson");
    const [email] = useState("alex.johnson@example.com");
    const [phone, setPhone] = useState("+1 (202) 555-0190");
    const [profileImage, setProfileImage] = useState(
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPurUR2thld9ARCgQv5h5zzRrmbx5VzEhRhGSj-4R3LQBMFeO5bA8OOCajuwGXXWPjtINjhw8-RqL2BIwlmrOkDz58EbqhMGjnRdrjEPNB6wMXEYirVhXLKHukNRiuOjWAxDoEcMTG9A2c2wKRcRRN4U7gxeFEPhJ7G7sLUQezeiulcTpl6y2fsYeeLmQHBuYLxYwyY3mOhVegyEsvP846S3aiHmWvjDLrjKsx9yBY9vkJssTPuipSUEY4d1WwN6dlulgSFUQpfRjW"
    );
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");
    const [subscription, setSubscription] = useState<CurrentSubscription>(() => getSubscriptionSnapshot());
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const isPasswordFormValid =
        Boolean(currentPassword) &&
        newPassword.length >= 8 &&
        confirmPassword === newPassword;

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const previewUrl = URL.createObjectURL(selectedFile);
        setProfileImage(previewUrl);
    };

    const handleSave = () => {
        setSaveMessage("Settings updated successfully.");
    };

    const closePasswordModal = () => {
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordError("");
    };

    const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordError("");
        setPasswordMessage("");

        if (!isPasswordFormValid) {
            setPasswordError("Complete all password fields, use at least 8 characters, and ensure the new passwords match.");
            return;
        }

        setIsPasswordSubmitting(true);

        try {
            const response = await patientAuthApi.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage(getApiResponseMessage(response.data, "Your password was changed successfully."));
            closePasswordModal();
        } catch (error) {
            setPasswordError(getApiErrorMessage(error));
        } finally {
            setIsPasswordSubmitting(false);
        }
    };

    useEffect(() => {
        const syncSubscription = () => {
            setSubscription(getSubscriptionSnapshot());
        };

        window.addEventListener("storage", syncSubscription);
        window.addEventListener("dw-subscription-updated", syncSubscription);

        return () => {
            window.removeEventListener("storage", syncSubscription);
            window.removeEventListener("dw-subscription-updated", syncSubscription);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
            <PatientMobileNav active="settings" />

            <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
                <div className="mb-8 px-2">
                    <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
                </div>

                <div className="mb-6 flex items-center gap-3 px-2">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#16b46f]/40">
                        <Image
                            className="object-cover"
                            src={profileImage}
                            alt={fullName}
                            fill
                            sizes="44px"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{fullName}</p>
                        <p className="text-xs text-[#d8e2ff]">ID: DW-98231</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 text-sm">
                    <Link href="/dashboard/patient" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/dashboard/patient/appointments" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                        <span>Appointments</span>
                    </Link>
                    <Link href="/dashboard/patient/doctors" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">medical_services</span>
                        <span>Browse Doctors</span>
                    </Link>
                    <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b46f] bg-[#16b46f]/20 px-3 py-2 text-[#d7ffe9]">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span>Settings</span>
                    </div>
                </nav>

                <Link href="/dashboard/patient/doctors" className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-center text-sm font-semibold text-white">Book New Consult</Link>

                <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
                    <Link href="/dashboard/patient/help-center" className="flex items-center gap-3 px-3 py-2 hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span>Help Center</span>
                    </Link>
                    <PatientLogoutButton className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" />
                </div>
            </aside>

            <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:ml-[250px]">
                <header className="mb-6">
                    <div className="mb-2 flex items-center gap-2">
                        <Link
                            href="/dashboard/patient"
                            aria-label="Back"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c6c6cf] text-[#0aa4b4] hover:bg-[#f8fafc]"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        </Link>
                        <h2 className="text-2xl font-semibold text-[#001b5e]">Settings</h2>
                    </div>
                    <p className="text-[13px] mt-2 text-[#475569]">Manage your account, notifications, and security preferences.</p>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm lg:col-span-2">
                        <h3 className="mb-4 text-m font-semibold text-[#001b5e]">Profile Settings</h3>
                        <div className="mb-4 flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#c6c6cf] bg-white">
                                <Image className="object-cover" src={profileImage} alt={fullName} fill sizes="64px" unoptimized />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#001b5e]">Profile Image</p>
                                <p className="text-xs text-[#64748b]">Upload a clear photo for your account.</p>
                                <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#c6c6cf] bg-white px-3 py-1.5 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]">
                                    Update Image
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-[#334155]">Full Name</span>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                                />
                            </label>

                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    disabled
                                    className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 text-[#64748b]"
                                />
                            </label>

                            <label className="block text-sm md:col-span-2">
                                <span className="mb-1 block font-medium text-[#334155]">Phone Number</span>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-m font-semibold text-[#001b5e]">Security</h3>
                        <div className="space-y-3 text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangingPassword(true);
                                    setPasswordError("");
                                    setPasswordMessage("");
                                }}
                                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#c6c6cf] px-3 py-2 text-left font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
                            >
                                <span>Change Password</span>
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                            <PatientLogoutButton
                                label="Sign Out"
                                iconClassName="text-[18px] leading-none"
                                className="flex w-full items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-left font-semibold text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {passwordMessage ? (
                            <p role="status" className="mt-3 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-xs text-[#15803d]">
                                {passwordMessage}
                            </p>
                        ) : null}

                    </section>

                    <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm lg:col-span-3">
                        <h3 className="mb-4 text-m font-semibold text-[#001b5e]">Notification Preferences</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <label className="flex items-center justify-between rounded-lg border border-[#c6c6cf] p-3 text-sm">
                                <span>Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(event) => setEmailNotifications(event.target.checked)}
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
                                onClick={() => setSaveMessage("")}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]"
                                onClick={handleSave}
                            >
                                Save Settings
                            </button>
                        </div>

                        {saveMessage ? <p className="mt-3 text-sm font-semibold text-[#16b46f]">{saveMessage}</p> : null}
                    </section>

                    <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm lg:col-span-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-[#001b5e]">Current Plan</h3>
                                <p className="text-xs mt-3 text-[#64748b]">Manage your current plan or switch to a new one.</p>
                            </div>
                            <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                    subscription.status === "Active"
                                        ? "bg-[#16b46f]/15 text-[#16b46f]"
                                        : "bg-[#64748b]/15 text-[#64748b]"
                                }`}
                            >
                                {subscription.status}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Plan</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{subscription.planName}</p>
                            </div>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Monthly Price</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">
                                    {subscription.price > 0 ? `$${subscription.price}` : "-"}
                                </p>
                            </div>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Consultation Balance</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{subscription.balance}</p>
                            </div>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Next Renewal</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{subscription.renewalLabel}</p>
                            </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#475569]">
                            {subscription.featureSummary}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                href="/dashboard/patient/subscription?mode=manage"
                                className="rounded-lg bg-[#001b5e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b2b75]"
                            >
                                Manage Subscription
                            </Link>
                            <Link
                                href="/dashboard/patient/subscription?mode=buy"
                                className="rounded-lg border border-[#16b46f] px-4 py-2 text-sm font-semibold text-[#16b46f] hover:bg-[#16b46f]/10"
                            >
                                Buy New Plan
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            {isChangingPassword ? (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
                    <button
                        type="button"
                        aria-label="Close change password dialog"
                        disabled={isPasswordSubmitting}
                        onClick={closePasswordModal}
                        className="absolute inset-0 bg-[#0f172a]/55 backdrop-blur-[2px] disabled:cursor-wait"
                    />
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="change-password-title"
                        className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[90vh] sm:p-6"
                    >
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h2 id="change-password-title" className="text-lg font-bold text-[#001b5e] sm:text-xl">Change Password</h2>
                                <p className="mt-1 text-xs text-[#64748b] sm:text-sm">Enter your current password and choose a new one.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closePasswordModal}
                                disabled={isPasswordSubmitting}
                                aria-label="Close change password dialog"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c6c6cf] text-[#475569] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[19px]">close</span>
                            </button>
                        </div>

                        <form className="grid gap-4" onSubmit={handleChangePassword}>
                            <label className="grid gap-1.5 text-xs font-medium text-[#334155] sm:text-sm">
                                Current Password
                                <div className="relative">
                                    <input
                                        autoFocus
                                        type={showCurrentPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={currentPassword}
                                        onChange={(event) => {
                                            setCurrentPassword(event.target.value);
                                            setPasswordError("");
                                        }}
                                        className="h-11 w-full rounded-lg border border-[#c6c6cf] px-3 pr-11 outline-none focus:border-[#0aa4b4]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((current) => !current)}
                                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                                        aria-pressed={showCurrentPassword}
                                        className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]"
                                    >
                                        <span className="material-symbols-outlined text-[19px]">{showCurrentPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </label>

                            <label className="grid gap-1.5 text-xs font-medium text-[#334155] sm:text-sm">
                                New Password
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        value={newPassword}
                                        onChange={(event) => {
                                            setNewPassword(event.target.value);
                                            setPasswordError("");
                                        }}
                                        className="h-11 w-full rounded-lg border border-[#c6c6cf] px-3 pr-11 outline-none focus:border-[#0aa4b4]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((current) => !current)}
                                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                                        aria-pressed={showNewPassword}
                                        className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]"
                                    >
                                        <span className="material-symbols-outlined text-[19px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                                <span className="font-normal text-[#64748b]">Use at least 8 characters.</span>
                            </label>

                            <label className="grid gap-1.5 text-xs font-medium text-[#334155] sm:text-sm">
                                Confirm New Password
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        value={confirmPassword}
                                        onChange={(event) => {
                                            setConfirmPassword(event.target.value);
                                            setPasswordError("");
                                        }}
                                        className="h-11 w-full rounded-lg border border-[#c6c6cf] px-3 pr-11 outline-none focus:border-[#0aa4b4]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((current) => !current)}
                                        aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                                        aria-pressed={showConfirmPassword}
                                        className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]"
                                    >
                                        <span className="material-symbols-outlined text-[19px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                            </label>

                            {passwordError ? (
                                <p role="alert" aria-live="polite" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c] sm:text-sm">
                                    {passwordError}
                                </p>
                            ) : null}

                            <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closePasswordModal}
                                    disabled={isPasswordSubmitting}
                                    className="h-11 rounded-lg border border-[#c6c6cf] px-4 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isPasswordFormValid || isPasswordSubmitting}
                                    className="h-11 rounded-lg bg-[#16b46f] px-4 text-sm font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:bg-[#94a3b8] sm:h-10"
                                >
                                    {isPasswordSubmitting ? "Changing password..." : "Save New Password"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            ) : null}
        </div>
    );
}
