"use client";

import { useEffect, useState } from "react";
import { ADMIN_UPDATED_EVENT, readAdminReports, type AdminReport } from "@/lib/admin-portal";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>(readAdminReports());

  useEffect(() => {
    const sync = () => {
      setReports(readAdminReports());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(ADMIN_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ADMIN_UPDATED_EVENT, sync);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Reports</h2>
        <p className="mt-1 text-sm text-[#475569]">Central reporting desk for operational, clinical, and revenue observations.</p>
      </div>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {reports.map((report) => (
          <article key={report.id} className="rounded-xl border border-[#e2e8f0] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#64748b]">{report.type}</p>
                <h3 className="mt-1 text-base font-semibold text-[#001b5e]">{report.title}</h3>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${report.status === "Open" ? "bg-[#f59e0b]/15 text-[#b45309]" : "bg-[#16b46f]/15 text-[#166534]"}`}>
                {report.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-[#334155]">{report.summary}</p>
            <p className="mt-3 text-xs text-[#64748b]">Generated: {new Date(report.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
