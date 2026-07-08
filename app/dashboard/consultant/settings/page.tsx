"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";

type AvailabilityStatus = "Available" | "Busy" | "Offline";

const availabilityOptions: Array<{
  label: AvailabilityStatus;
  value: AvailabilityStatus;
  className: string;
}> = [
  { label: "Available", value: "Available", className: "bg-[#16b36c] text-white" },
  { label: "Busy", value: "Busy", className: "bg-[#f59e0b] text-white" },
  { label: "Offline", value: "Offline", className: "bg-[#475569] text-white" },
];

export default function ConsultantSettingsPage() {
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("Available");
  const [fullName, setFullName] = useState("Dr. Richardson");
  const [specialization, setSpecialization] = useState("Senior Cardiologist");
  const [email, setEmail] = useState("dr.richardson@dominionwell.com");
  const [phone, setPhone] = useState("+1 (202) 555-0188");
  const [successMessage, setSuccessMessage] = useState("");

  const saveProfile = () => {
    setSuccessMessage("Profile updated successfully.");
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
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-[#7784ac]/10 pt-6 text-sm">
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span>Notifications</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
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
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Settings</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">Manage doctor availability and update profile details.</p>
        </header>

        <section className="mb-6 rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#00020d]">Availability</h2>
              <p className="text-sm text-[#475569]">Switch your current consultation status between available, busy, and offline.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {availabilityOptions.map((option) => {
                const isActive = availabilityStatus === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvailabilityStatus(option.value)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isActive ? option.className : "bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="mb-4 text-base font-semibold text-[#00020d]">Update Profile</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              <span className="mb-1 block font-medium text-[#334155]">Specialization</span>
              <input
                type="text"
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[#334155]">Phone</span>
              <input
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-10 w-full rounded-lg border border-[#c6c6cf] px-3 outline-none focus:border-[#0aa4b4]"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            {successMessage ? <p className="mr-auto text-sm text-[#166534]">{successMessage}</p> : null}
            <button
              type="button"
              onClick={saveProfile}
              className="rounded-lg bg-[#001b5e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b2b75]"
            >
              Save Profile
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
