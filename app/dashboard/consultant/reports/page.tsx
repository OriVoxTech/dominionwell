"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorProfileSummary from "@/components/doctor-profile-summary";
import DoctorLogoutButton from "@/components/doctor-logout-button";

type DoctorReport = {
  id: string;
  consultationId: string;
  patientId: string;
  summary: string;
  createdAt: string;
  fullReport: string;
};

const doctorReports: DoctorReport[] = [
  {
    id: "RPT-201",
    consultationId: "CNS-1001",
    patientId: "DW-10021",
    summary: "Patient improved after medication adjustment and lifestyle guidance.",
    createdAt: "Today, 10:45 AM",
    fullReport:
      "Patient presented with recurring chest discomfort during exertion. ECG review remained stable, and blood pressure improved after dosage adjustment. Advised strict medication adherence, reduced sodium intake, and a follow-up review in two weeks.",
  },
  {
    id: "RPT-202",
    consultationId: "CNS-1002",
    patientId: "DW-10032",
    summary: "Post-op markers stable. Continue monitoring for one week.",
    createdAt: "Yesterday, 4:20 PM",
    fullReport:
      "Post-operative recovery is progressing without acute complications. Wound inspection appears clean, inflammatory markers are within expected range, and the patient reports only mild fatigue. Continue current care plan and monitor vitals daily for the next seven days.",
  },
  {
    id: "RPT-203",
    consultationId: "CNS-1005",
    patientId: "DW-10076",
    summary: "Routine check completed. Follow-up scheduled after 30 days.",
    createdAt: "Jul 6, 11:05 AM",
    fullReport:
      "Routine cardiovascular screening completed successfully. No urgent abnormalities detected during assessment. Patient was counseled on hydration, exercise consistency, and symptom tracking before the next scheduled consultation in 30 days.",
  },
];

export default function ConsultantReportsPage() {
  const [selectedReport, setSelectedReport] = useState<DoctorReport | null>(doctorReports[0] ?? null);

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
              alt="Doctor profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBveWw5sJYO4vcFdjWVdbuGQDlC0JKaMeg6jsjDDSJkIwdRjG_4H_Ao7x2stxD6kTx4oY4DP80Tf-kMczLWJQqZw7ajzN4HpSFJ0W7qcoFs9bxbSpMN7PrAqivavfdvvECjYhZNcT_25wMoRamMlavt1GZ5bU5v1LXmZRreRkSDQzcoG5jXyD19NtcvpsAZFGHlPJkNdm6Vme6nV5SmbMT-CGGHwt91t_aHyC2bbT4qoU6rYhO4t232jYBYnX0OKrxpnI_i4VeK-yJ_"
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <DoctorProfileSummary />
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
          <div className="flex items-center gap-3 rounded-lg border-l-4 border-[#16b36c] bg-[#74fcad] p-3 text-[#007443]">
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </div>
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
            <h1 className="text-xl font-semibold text-[#00020d] sm:text-2xl">Reports</h1>
          </div>
          <p className="text-xs text-[#45464e] sm:text-sm">
            View all reports created for consultations, including patient and consultation references.
          </p>
        </header>

        <section className="rounded-xl border border-[#eaecf0] bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-1xl font-semibold text-[#00020d]">Doctor Reports</h2>
            <p className="text-xs text-[#64748b]">Total: {doctorReports.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f2f4f7] text-[11px] uppercase tracking-wide text-[#64748b]">
                  <th className="rounded-l-lg px-3 py-3">Report ID</th>
                  <th className="px-3 py-3">Consultation ID</th>
                  <th className="px-3 py-3">Patient ID</th>
                  <th className="px-3 py-3">Summary</th>
                  <th className="rounded-r-lg px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {doctorReports.map((report) => (
                  <tr
                    key={report.id}
                    className={`cursor-pointer border-b border-[#e2e8f0] transition last:border-b-0 hover:bg-[#f8fafc] ${
                      selectedReport?.id === report.id ? "bg-[#eff6ff]" : ""
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-3 py-3 font-semibold text-[#001b5e]">{report.id}</td>
                    <td className="px-3 py-3 text-[#475569]">{report.consultationId}</td>
                    <td className="px-3 py-3 text-[#475569]">{report.patientId}</td>
                    <td className="px-3 py-3 text-[#475569]">{report.summary}</td>
                    <td className="px-3 py-3 text-[#475569]">{report.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedReport ? (
            <div className="mt-5 rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#001b5e]">Full Report</h3>
                  <p className="text-xs text-[#64748b]">
                    {selectedReport.id} • {selectedReport.consultationId} • {selectedReport.patientId}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-[#dbeafe] px-3 py-1 text-[11px] font-semibold text-[#1d4ed8]">
                  {selectedReport.createdAt}
                </span>
              </div>
              <p className="text-sm leading-6 text-[#334155]">{selectedReport.fullReport}</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
