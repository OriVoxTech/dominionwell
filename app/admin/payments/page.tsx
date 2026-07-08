"use client";

import { useEffect, useState } from "react";
import { ADMIN_UPDATED_EVENT, readPaymentRecords, updatePaymentStatus, type PaymentRecord } from "@/lib/admin-portal";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(readPaymentRecords());

  useEffect(() => {
    const sync = () => {
      setPayments(readPaymentRecords());
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
        <h2 className="text-2xl font-semibold text-[#001b5e]">Payments</h2>
        <p className="mt-1 text-sm text-[#475569]">Manage all subscription purchases and payment states.</p>
      </div>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                <th className="px-3 py-2">Patient</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-[#e2e8f0] last:border-b-0">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-[#001b5e]">{payment.patientName}</p>
                    <p className="text-xs text-[#64748b]">{payment.patientId}</p>
                  </td>
                  <td className="px-3 py-3 text-[#475569]">{payment.planName}</td>
                  <td className="px-3 py-3 text-[#475569]">NGN {payment.amount.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[#475569]">{new Date(payment.paidAt).toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        payment.status === "Paid"
                          ? "bg-[#16b46f]/15 text-[#166534]"
                          : payment.status === "Pending"
                            ? "bg-[#f59e0b]/15 text-[#b45309]"
                            : "bg-[#ef4444]/12 text-[#b91c1c]"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="rounded-lg border border-[#16b46f]/40 px-2 py-1 text-xs font-semibold text-[#166534]" onClick={() => updatePaymentStatus(payment.id, "Paid")}>Mark Paid</button>
                      <button type="button" className="rounded-lg border border-[#ef4444]/40 px-2 py-1 text-xs font-semibold text-[#b91c1c]" onClick={() => updatePaymentStatus(payment.id, "Refunded")}>Refund</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
