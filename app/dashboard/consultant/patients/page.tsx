"use client";

import Image from "next/image";
import Link from "next/link";
import DoctorMobileNav from "@/components/doctor-mobile-nav";

type PatientConsultationSummary = {
  id: string;
  patientName: string;
  patientId: string;
  consultationsWithDoctor: number;
  rating: number;
};

const patientSummaries: PatientConsultationSummary[] = [
  {
    id: "pt-1",
    patientName: "Arthur Morgan",
    patientId: "DW-10021",
    consultationsWithDoctor: 4,
    rating: 5.0,
  },
  {
    id: "pt-2",
    patientName: "Sarah Williams",
    patientId: "DW-10032",
    consultationsWithDoctor: 3,
    rating: 4.8,
  },
  {
    id: "pt-3",
    patientName: "Daniel Okafor",
    patientId: "DW-10047",
    consultationsWithDoctor: 2,
    rating: 4.9,
  },
  {
    id: "pt-4",
    patientName: "Grace Bennett",
    patientId: "DW-10058",
    consultationsWithDoctor: 1,
    rating: 4.6,
  },
  {
    id: "pt-5",
    patientName: "Rita Adeyemi",
    patientId: "DW-10076",
    consultationsWithDoctor: 5,
    rating: 5.0,
  },
];

export default function ConsultantPatientsPage() {
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
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">group</span>
            <span>Patients</span>
          </div>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/reports">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
          <Link className="flex items-center gap-3 p-3 text-[#7784ac]/85 hover:bg-[#00020d]/10" href="/dashboard/doctor/wallet">
            <span className="material-symbols-outlined">wallet</span>
            <span>Wallet</span>
          </Link>
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
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Patients</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">
            Patients who have completed consultations with you, including consultation count and rating.
          </p>
        </header>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-1xl font-semibold text-[#00020d]">Patient Consultation History</h2>
            <p className="text-xs text-[#64748b]">Total: {patientSummaries.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                  <th className="rounded-l-lg px-3 py-3">Patient Name</th>
                  <th className="px-3 py-3">Patient ID</th>
                  <th className="px-3 py-3">Consultations with Doctor</th>
                  <th className="rounded-r-lg px-3 py-3">Patient Rating</th>
                </tr>
              </thead>
              <tbody>
                {patientSummaries.map((patient) => (
                  <tr key={patient.id} className="border-b border-[#e2e8f0] last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-[#001b5e]">{patient.patientName}</td>
                    <td className="px-3 py-3 text-[#475569]">{patient.patientId}</td>
                    <td className="px-3 py-3 text-[#475569]">{patient.consultationsWithDoctor}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#16b36c]/15 px-2 py-1 text-[10px] font-semibold text-[#16b36c]">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {patient.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}