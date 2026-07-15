"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PatientMobileNav from "@/components/patient-mobile-nav";
import PatientLogoutButton from "@/components/patient-logout-button";

type FaqItem = {
    question: string;
    answer: string;
};

const faqItems: FaqItem[] = [
    {
        question: "How do I start a consultation with a doctor?",
        answer:
            "Go to Browse Doctors, select an available doctor, and click Speak to Doctor. After confirmation, one consultation is deducted and WhatsApp opens.",
    },
    {
        question: "What happens when my consultation balance is zero?",
        answer:
            "You will be redirected to the Subscription page to purchase a plan before starting a new consultation.",
    },
    {
        question: "Can I change my profile information?",
        answer:
            "Yes. Open Settings to update your name, phone number, profile image, and notification preferences.",
    },
    {
        question: "Where can I see my past consultations?",
        answer:
            "Your completed and canceled consultations are available in the Appointments page under Consultation History.",
    },
    {
        question: "How do I verify a consultation on WhatsApp?",
        answer:
            "When you proceed to WhatsApp, a generated verification password is included in your message for doctor-side verification.",
    },
];

export default function PatientHelpCenterPage() {
    const [openIndex, setOpenIndex] = useState<number>(0);

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#191c1e]">
            <PatientMobileNav active="help" />

            <aside className="fixed left-0 top-0 z-40 hidden h-full w-[250px] flex-col bg-[#001b5e] px-3 py-6 text-white shadow-md lg:flex">
                <div className="mb-8 px-2">
                    <h1 className="text-1xl font-extrabold tracking-tight">DominionWell+</h1>
                </div>

                <div className="mb-6 flex items-center gap-3 px-2">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[#16b46f]/40">
                        <Image
                            className="object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPurUR2thld9ARCgQv5h5zzRrmbx5VzEhRhGSj-4R3LQBMFeO5bA8OOCajuwGXXWPjtINjhw8-RqL2BIwlmrOkDz58EbqhMGjnRdrjEPNB6wMXEYirVhXLKHukNRiuOjWAxDoEcMTG9A2c2wKRcRRN4U7gxeFEPhJ7G7sLUQezeiulcTpl6y2fsYeeLmQHBuYLxYwyY3mOhVegyEsvP846S3aiHmWvjDLrjKsx9yBY9vkJssTPuipSUEY4d1WwN6dlulgSFUQpfRjW"
                            alt="Alex Johnson"
                            fill
                            sizes="44px"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">Alex Johnson</p>
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
                    <Link href="/dashboard/patient/settings" className="flex items-center gap-3 px-3 py-2 text-[#d8e2ff] hover:bg-white/10">
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span>Settings</span>
                    </Link>
                </nav>

                <Link href="/dashboard/patient/doctors" className="mb-6 mt-4 rounded-xl bg-[#16b46f] py-2.5 text-center text-sm font-semibold text-white">
                    Book New Consult
                </Link>

                <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-[#d8e2ff]">
                    <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b46f] bg-[#16b46f]/20 px-3 py-2 text-[#d7ffe9]">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span>Help Center</span>
                    </div>
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
                        <h2 className="text-[20px] font-semibold text-[#001b5e]">Help Center</h2>
                    </div>
                    <p className="text-[13px] text-[#475569]">Find quick answers and support for your patient dashboard.</p>
                </header>

                <section className="rounded-2xl border border-[#c6c6cf] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-m font-semibold text-[#001b5e]">Frequently Asked Questions</h3>
                        <p className="text-xs text-[#64748b]">{faqItems.length} FAQs</p>
                    </div>

                    <div className="space-y-3">
                        {faqItems.map((item, index) => {
                            const isOpen = openIndex === index;

                            return (
                                <article key={item.question} className="rounded-xl border border-[#e2e8f0]">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                    >
                                        <span className="text-sm font-semibold text-[#001b5e]">{item.question}</span>
                                        <span className="material-symbols-outlined text-[18px] text-[#64748b]">
                                            {isOpen ? "expand_less" : "expand_more"}
                                        </span>
                                    </button>
                                    {isOpen ? <p className="border-t border-[#e2e8f0] px-4 py-3 text-sm text-[#475569]">{item.answer}</p> : null}
                                </article>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}
