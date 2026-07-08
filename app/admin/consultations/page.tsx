"use client";

import { useEffect, useState } from "react";
import { APPOINTMENT_REQUESTS_UPDATED_EVENT, readAppointmentRequests, updateAppointmentRequestStatus } from "@/lib/appointments";

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState(readAppointmentRequests());

  useEffect(() => {
    const sync = () => {
      setConsultations(readAppointmentRequests());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(APPOINTMENT_REQUESTS_UPDATED_EVENT, sync);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Consultation Management</h2>
        <p className="mt-1 text-sm text-[#475569]">Track all bookings, consultation lifecycles, and booking details.</p>
      </div>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#001b5e]">All Consultations</h3>
          <p className="text-xs text-[#64748b]">{consultations.length} records</p>
        </div>

        {consultations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#c6c6cf] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No bookings available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                  <th className="px-3 py-2">Doctor</th>
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((consultation) => (
                  <tr key={consultation.id} className="border-b border-[#e2e8f0] last:border-b-0">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-[#001b5e]">{consultation.doctorName}</p>
                      <p className="text-xs text-[#64748b]">{consultation.doctorSpecialization}</p>
                    </td>
                    <td className="px-3 py-3 text-[#475569]">
                      <p>{consultation.patientName}</p>
                      <p className="text-xs text-[#64748b]">{consultation.patientId}</p>
                    </td>
                    <td className="px-3 py-3 text-[#475569]">{consultation.dateLabel}</td>
                    <td className="px-3 py-3 text-[#475569]">{consultation.timeSlot}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                          consultation.status === "Completed"
                            ? "bg-[#16b46f]/15 text-[#166534]"
                            : consultation.status === "Pending"
                              ? "bg-[#f59e0b]/15 text-[#b45309]"
                              : consultation.status === "Rejected"
                                ? "bg-[#ef4444]/12 text-[#b91c1c]"
                                : "bg-[#0aa4b4]/15 text-[#0369a1]"
                        }`}
                      >
                        {consultation.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {consultation.status !== "Completed" ? (
                        <button
                          type="button"
                          className="rounded-lg bg-[#001b5e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b2b75]"
                          onClick={() => {
                            updateAppointmentRequestStatus(consultation.id, "Completed");
                            setConsultations(readAppointmentRequests());
                          }}
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-xs text-[#64748b]">Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
