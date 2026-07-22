"use client";

import { useState } from "react";
import DoctorMobileNav from "@/components/doctor-mobile-nav";
import DoctorPageHeader from "@/components/doctor-page-header";
import DoctorSidebar from "@/components/doctor-sidebar";

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
    <div className="min-h-screen bg-[#f4f7fb] text-[#17223b]">
      <DoctorMobileNav />
      <DoctorSidebar active="reports" />

      <main className="dw-modern-dashboard min-h-screen lg:ml-[264px]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
          <DoctorPageHeader title="Reports" description="Review clinical notes created after completed consultations and open the full report in context." icon="clinical_notes" />

          <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
            <section className="rounded-[1.5rem] border border-[#e0e7ef] bg-white p-4 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-5">
              <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b9459]">Report library</p><h2 className="mt-1 text-base font-bold text-[#001b5e]">Consultation reports</h2></div><span className="rounded-full bg-[#eafbf2] px-2.5 py-1 text-[10px] font-bold text-[#0b9459]">{doctorReports.length} total</span></div>
              <div className="grid gap-3">
                {doctorReports.map((report) => (
                  <button key={report.id} type="button" onClick={() => setSelectedReport(report)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedReport?.id === report.id ? "border-[#315ead] bg-[#eef4ff] shadow-sm" : "border-[#e5eaf0] bg-[#fafcff] hover:border-[#bdcbe0] hover:bg-white"}`}>
                    <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#315ead] shadow-sm"><span className="material-symbols-outlined text-[18px]">description</span></span><span className="text-[10px] font-semibold text-[#8a96a8]">{report.createdAt}</span></div>
                    <h3 className="mt-3 text-sm font-bold text-[#001b5e]">{report.id}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#64748b]">{report.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-[#526175]"><span className="rounded-full bg-white px-2 py-1">{report.consultationId}</span><span className="rounded-full bg-white px-2 py-1">{report.patientId}</span></div>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-h-[420px] rounded-[1.5rem] border border-[#e0e7ef] bg-white p-5 shadow-[0_8px_28px_rgba(30,52,83,0.05)] sm:p-7">
              {selectedReport ? (
                <div><div className="flex flex-col gap-4 border-b border-[#edf1f5] pb-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eafbf2] text-[#0b9459]"><span className="material-symbols-outlined">clinical_notes</span></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b9459]">Clinical report</p><h2 className="mt-1 text-lg font-bold text-[#001b5e]">{selectedReport.id}</h2></div></div><span className="w-fit rounded-full bg-[#eef4ff] px-3 py-1.5 text-[10px] font-bold text-[#315ead]">{selectedReport.createdAt}</span></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase text-[#8a96a8]">Consultation</p><p className="mt-1 text-xs font-bold text-[#001b5e]">{selectedReport.consultationId}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase text-[#8a96a8]">Patient</p><p className="mt-1 text-xs font-bold text-[#001b5e]">{selectedReport.patientId}</p></div></div>
                  <div className="mt-6"><h3 className="text-sm font-bold text-[#001b5e]">Consultation summary</h3><p className="mt-3 text-sm leading-7 text-[#526175]">{selectedReport.fullReport}</p></div>
                  <div className="mt-7 rounded-2xl border border-[#d7efe2] bg-[#f4fbf7] p-4"><div className="flex gap-3"><span className="material-symbols-outlined text-[20px] text-[#0b9459]">verified_user</span><div><p className="text-xs font-bold text-[#075d3a]">Private clinical record</p><p className="mt-1 text-[11px] leading-5 text-[#4c7661]">This report is part of the patient&apos;s protected consultation history.</p></div></div></div>
                </div>
              ) : <div className="grid h-full min-h-80 place-items-center text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4ff] text-[#315ead]"><span className="material-symbols-outlined">description</span></span><p className="mt-4 text-sm font-bold text-[#001b5e]">Select a report</p></div></div>}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
