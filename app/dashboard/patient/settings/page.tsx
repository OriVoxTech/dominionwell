"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import PatientAvatar from "@/components/patient-avatar";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";
import PatientPageHeader from "@/components/patient-page-header";
import PatientSidebar from "@/components/patient-sidebar";
import {
    getApiErrorMessage,
    getApiResponseMessage,
    patientApiService,
    patientAuthApi,
    type PatientSubscriptionSummary,
} from "@/lib/api";
import {
    getPatientDisplayName,
    setCachedPatientProfile,
    usePatientProfile,
} from "@/lib/use-patient-profile";
import {
    formatNigerianPhone,
    getNigerianPhoneLocalNumber,
    isValidNigerianPhoneLocalNumber,
    normalizeNigerianPhoneLocalNumber,
} from "@/lib/form-validation";

type CurrentSubscription = {
    planName: string;
    price: number;
    currency: string;
    balance: number;
    status: "Active" | "No Active Plan";
    renewalLabel: string;
    featureSummary: string;
};

function splitFullName(fullName: string) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts.shift() ?? "";
    const lastName = parts.join(" ");

    return { firstName, lastName };
}

function asRecord(value: unknown) {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getStringValue(record: Record<string, unknown> | null | undefined, keys: string[], fallback = "") {
    if (!record) return fallback;

    for (const key of keys) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value;
        if (typeof value === "number") return String(value);
    }

    return fallback;
}

function getNumberValue(record: Record<string, unknown> | null | undefined, keys: string[], fallback = 0) {
    if (!record) return fallback;

    for (const key of keys) {
        const value = record[key];
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
            return Number(value);
        }
    }

    return fallback;
}

function getEmptySubscriptionSnapshot(): CurrentSubscription {
    return {
        planName: "No Active Plan",
        price: 0,
        currency: "NGN",
        balance: 0,
        status: "No Active Plan",
        renewalLabel: "No renewal date",
        featureSummary: "Choose a subscription plan to unlock consultations and priority care.",
    };
}

function getSubscriptionSnapshot(summary: PatientSubscriptionSummary | null): CurrentSubscription {
    if (!summary?.currentSubscription) {
        return {
            ...getEmptySubscriptionSnapshot(),
            balance: summary?.consultationBalance ?? 0,
        };
    }

    const subscription = summary.currentSubscription;
    const plan = asRecord(subscription.plan);
    const expiresAt = getStringValue(subscription, ["expiresAt"]);
    const priceNaira = getNumberValue(plan, ["priceNaira"], getNumberValue(plan, ["priceCents"]) / 100);
    const consultationCredits = getNumberValue(plan, ["consultationCredits"]);
    const consultationMinutes = getNumberValue(plan, ["consultationMinutes"]);
    const description = getStringValue(plan, ["description"]);

    return {
        planName: getStringValue(plan, ["name"], getStringValue(subscription, ["planName", "name"], "Active Plan")),
        price: priceNaira,
        currency: getStringValue(plan, ["currency"], "NGN"),
        balance: summary.consultationBalance,
        status: "Active",
        renewalLabel: expiresAt
            ? new Date(expiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
              })
            : "No renewal date",
        featureSummary:
            description ||
            `${consultationCredits} consultation credit${consultationCredits === 1 ? "" : "s"}${consultationMinutes ? `, ${consultationMinutes} minutes each` : ""}.`,
    };
}

function formatSubscriptionPrice(subscription: CurrentSubscription) {
    if (subscription.price <= 0) {
        return "-";
    }

    return `${subscription.currency} ${subscription.price.toLocaleString()}`;
}

function getSubscriptionSnapshotLegacy(): CurrentSubscription {
    return {
            planName: "No Active Plan",
            price: 0,
            currency: "NGN",
            balance: 0,
            status: "No Active Plan",
            renewalLabel: "No renewal date",
            featureSummary: "Choose a subscription plan to unlock consultations and priority care.",
    };
}

export default function PatientSettingsPage() {
    const profile = usePatientProfile();
    const [fullName, setFullName] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [emailNotifications, setEmailNotifications] = useState<boolean | null>(null);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [subscription, setSubscription] = useState<CurrentSubscription>(() => getSubscriptionSnapshotLegacy());
    const [subscriptionError, setSubscriptionError] = useState("");
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

    const profilePreferences = profile?.preferences;
    const savedEmailNotifications =
        profilePreferences &&
        typeof profilePreferences.emailNotifications === "boolean"
            ? profilePreferences.emailNotifications
            : true;
    const fullNameValue = fullName ?? (profile ? getPatientDisplayName(profile) : "");
    const phoneValue = phone ?? getNigerianPhoneLocalNumber(profile?.user.phone);
    const emailValue = profile?.user.email ?? "";
    const emailNotificationsValue = emailNotifications ?? savedEmailNotifications;
    const displayName = fullNameValue.trim() || getPatientDisplayName(profile);

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        const previewUrl = URL.createObjectURL(selectedFile);
        setProfileImagePreview(previewUrl);
        setSaveMessage("");
        setSaveError("");
        setIsUploadingImage(true);

        try {
            const response = await patientApiService.uploadProfileImage(selectedFile);
            setCachedPatientProfile(response.data);
            setSaveMessage("Profile image uploaded successfully.");
        } catch (error) {
            setSaveError(getApiErrorMessage(error));
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSave = async () => {
        const { firstName, lastName } = splitFullName(fullNameValue);

        if (!firstName || !lastName) {
            setSaveError("Enter both first and last name.");
            setSaveMessage("");
            return;
        }

        if (!isValidNigerianPhoneLocalNumber(phoneValue)) {
            setSaveError("Enter a 10-digit Nigerian phone number.");
            setSaveMessage("");
            return;
        }

        setIsSavingProfile(true);
        setSaveMessage("");
        setSaveError("");

        try {
            const response = await patientApiService.updateProfile({
                firstName,
                lastName,
                phone: formatNigerianPhone(phoneValue),
                preferences: {
                    ...(profile?.preferences ?? {}),
                    emailNotifications: emailNotificationsValue,
                },
            });
            setCachedPatientProfile(response.data);
            setSaveMessage("Settings updated successfully.");
        } catch (error) {
            setSaveError(getApiErrorMessage(error));
        } finally {
            setIsSavingProfile(false);
        }
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
        let isCancelled = false;

        const loadSubscription = async () => {
            try {
                const response = await patientApiService.getMySubscription();
                if (isCancelled) return;

                setSubscription(getSubscriptionSnapshot(response.data));
                setSubscriptionError("");
            } catch (error) {
                if (!isCancelled) {
                    setSubscriptionError(getApiErrorMessage(error));
                }
            }
        };

        const syncSubscription = () => {
            void loadSubscription();
        };

        const timeoutId = window.setTimeout(() => {
            void loadSubscription();
        }, 0);

        window.addEventListener("storage", syncSubscription);
        window.addEventListener("dw-subscription-updated", syncSubscription);

        return () => {
            isCancelled = true;
            window.clearTimeout(timeoutId);
            window.removeEventListener("storage", syncSubscription);
            window.removeEventListener("dw-subscription-updated", syncSubscription);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
            <PatientMobileNav active="settings" />

            <PatientSidebar active="settings" />

            <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]"><div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
                <PatientPageHeader title="Settings" description="Manage your profile, security preferences, notifications, and current care plan." icon="settings" />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] lg:col-span-2">
                        <h3 className="mb-4 text-m font-semibold text-[#001b5e]">Profile Settings</h3>
                        <div className="mb-4 flex items-center gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#c6c6cf] bg-white">
                                {profileImagePreview ? (
                                    <Image className="object-cover" src={profileImagePreview} alt={displayName} fill sizes="64px" unoptimized />
                                ) : (
                                    <PatientAvatar profile={profile} className="h-full w-full border-0 text-lg text-[#001b5e]" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#001b5e]">Profile Image</p>
                                <p className="text-xs text-[#64748b]">Upload a clear photo for your account.</p>
                                <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-[#c6c6cf] bg-white px-3 py-1.5 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]">
                                    {isUploadingImage ? "Uploading..." : "Update Image"}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-[#334155]">Full Name</span>
                                <input
                                    type="text"
                                    value={fullNameValue}
                                    onChange={(event) => setFullName(event.target.value)}
                                    className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
                                />
                            </label>

                            <label className="block text-sm">
                                <span className="mb-1 block font-medium text-[#334155]">Email Address</span>
                                <input
                                    type="email"
                                    value={emailValue}
                                    readOnly
                                    disabled
                                    className="h-10 w-full cursor-not-allowed rounded-lg border border-[#c6c6cf] bg-[#f8fafc] px-3 text-[#64748b]"
                                />
                            </label>

                            <label className="block text-sm md:col-span-2">
                                <span className="mb-1 block font-medium text-[#334155]">Phone Number</span>
                                <div className="flex h-10 w-full overflow-hidden rounded-lg border border-[#c6c6cf] focus-within:border-[#0aa4b4]">
                                    <span className="flex items-center border-r border-[#c6c6cf] bg-[#f8fafc] px-3 text-sm font-semibold text-[#001b5e]">+234</span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={phoneValue}
                                        onChange={(event) => setPhone(normalizeNigerianPhoneLocalNumber(event.target.value))}
                                        className="h-full min-w-0 flex-1 px-3 outline-none"
                                        placeholder="8012345678"
                                    />
                                </div>
                            </label>
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)]">
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

                    <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] lg:col-span-3">
                        <h3 className="mb-4 text-m font-semibold text-[#001b5e]">Notification Preferences</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <label className="flex items-center justify-between rounded-lg border border-[#c6c6cf] p-3 text-sm">
                                <span>Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={emailNotificationsValue}
                                    onChange={(event) => setEmailNotifications(event.target.checked)}
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]"
                                onClick={() => {
                                    setSaveMessage("");
                                    setSaveError("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSavingProfile}
                                className="rounded-xl bg-[#16b36c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#118d57] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                                onClick={handleSave}
                            >
                                {isSavingProfile ? "Saving..." : "Save Settings"}
                            </button>
                        </div>

                        {saveMessage ? <p className="mt-3 text-sm font-semibold text-[#16b46f]">{saveMessage}</p> : null}
                        {saveError ? <p className="mt-3 text-sm font-semibold text-[#dc2626]">{saveError}</p> : null}
                    </section>

                    <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] lg:col-span-3">
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
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Price</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">
                                    {formatSubscriptionPrice(subscription)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Consultation Balance</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{subscription.balance}</p>
                            </div>
                            <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Expiry Date</p>
                                <p className="mt-1 text-sm font-semibold text-[#001b5e]">{subscription.renewalLabel}</p>
                            </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#475569]">
                            {subscription.featureSummary}
                        </div>

                        {subscriptionError ? (
                            <p role="alert" className="mt-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#b91c1c]">
                                {subscriptionError}
                            </p>
                        ) : null}

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
            </div></main>

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
