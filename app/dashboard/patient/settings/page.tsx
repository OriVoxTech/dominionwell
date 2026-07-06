"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";

export default function PatientSettingsPage() {
    const [fullName, setFullName] = useState("Alex Johnson");
    const [email] = useState("alex.johnson@example.com");
    const [phone, setPhone] = useState("+1 (202) 555-0190");
    const [profileImage, setProfileImage] = useState(
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPurUR2thld9ARCgQv5h5zzRrmbx5VzEhRhGSj-4R3LQBMFeO5bA8OOCajuwGXXWPjtINjhw8-RqL2BIwlmrOkDz58EbqhMGjnRdrjEPNB6wMXEYirVhXLKHukNRiuOjWAxDoEcMTG9A2c2wKRcRRN4U7gxeFEPhJ7G7sLUQezeiulcTpl6y2fsYeeLmQHBuYLxYwyY3mOhVegyEsvP846S3aiHmWvjDLrjKsx9yBY9vkJssTPuipSUEY4d1WwN6dlulgSFUQpfRjW"
    );
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [whatsappNotifications, setWhatsappNotifications] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");

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

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
            <aside className="fixed left-0 top-0 z-40 flex h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md">
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
                    <Link className="flex items-center gap-3 px-3 py-2 hover:bg-white/10" href="/">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>

            <main className="ml-[250px] min-h-screen p-6 md:p-8">
                <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-[#001b5e]">Settings</h2>
                        <p className="text-sm text-[#475569]">Manage your account, notifications, and security preferences.</p>
                    </div>
                    <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0aa4b4]">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm lg:col-span-2">
                        <h3 className="mb-4 text-lg font-semibold text-[#001b5e]">Profile Settings</h3>
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
                        <h3 className="mb-4 text-lg font-semibold text-[#001b5e]">Security</h3>
                        <div className="space-y-3 text-sm">
                            <button
                                type="button"
                                className="w-full rounded-lg border border-[#c6c6cf] px-3 py-2 text-left font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
                            >
                                Change Password
                            </button>
                            <button
                                type="button"
                                className="w-full rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-left font-semibold text-[#dc2626]"
                            >
                                Sign Out from All Devices
                            </button>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm lg:col-span-3">
                        <h3 className="mb-4 text-lg font-semibold text-[#001b5e]">Notification Preferences</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <label className="flex items-center justify-between rounded-lg border border-[#c6c6cf] p-3 text-sm">
                                <span>Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(event) => setEmailNotifications(event.target.checked)}
                                />
                            </label>
                            <label className="flex items-center justify-between rounded-lg border border-[#c6c6cf] p-3 text-sm">
                                <span>WhatsApp Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={whatsappNotifications}
                                    onChange={(event) => setWhatsappNotifications(event.target.checked)}
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
                </div>
            </main>
        </div>
    );
}
