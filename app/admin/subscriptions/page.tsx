"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ADMIN_UPDATED_EVENT,
  addSubscriptionPlan,
  readAdminSettings,
  readSubscriptionPlans,
  updateAdminSettings,
  type SubscriptionPlan,
} from "@/lib/admin-portal";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(readSubscriptionPlans());
  const [pointValue, setPointValue] = useState(readAdminSettings().pointValue);
  const [form, setForm] = useState({
    name: "",
    monthlyPrice: "",
    consultationsPerMonth: "",
    description: "",
  });

  useEffect(() => {
    const sync = () => {
      setPlans(readSubscriptionPlans());
      setPointValue(readAdminSettings().pointValue);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(ADMIN_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ADMIN_UPDATED_EVENT, sync);
    };
  }, []);

  const handleAddPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    addSubscriptionPlan({
      name: form.name,
      monthlyPrice: Number(form.monthlyPrice) || 0,
      consultationsPerMonth: Number(form.consultationsPerMonth) || 1,
      description: form.description || "Custom plan",
    });

    setForm({
      name: "",
      monthlyPrice: "",
      consultationsPerMonth: "",
      description: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#001b5e]">Subscription Plans</h2>
        <p className="mt-1 text-sm text-[#475569]">Create and inspect subscription plans, plus doctor wallet payout configuration.</p>
      </div>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <h3 className="text-base font-semibold text-[#001b5e]">Doctor Wallet Configuration</h3>
        <p className="mt-1 text-sm text-[#475569]">Each completed consultation awards 1 point. Configure point-to-currency value.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="number"
            min={1000}
            value={pointValue}
            onChange={(event) => setPointValue(Number(event.target.value) || 0)}
            className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm"
          />
          <button
            type="button"
            className="h-10 rounded-lg bg-[#001b5e] px-4 text-sm font-semibold text-white hover:bg-[#0b2b75]"
            onClick={() => updateAdminSettings({ pointValue: Math.max(0, Math.floor(pointValue)) })}
          >
            Save Point Value
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <h3 className="text-base font-semibold text-[#001b5e]">Add Subscription Plan</h3>
        <form className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleAddPlan}>
          <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm" placeholder="Plan name" required />
          <input value={form.monthlyPrice} onChange={(e) => setForm((current) => ({ ...current, monthlyPrice: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm" placeholder="Monthly price (NGN)" type="number" min={0} />
          <input value={form.consultationsPerMonth} onChange={(e) => setForm((current) => ({ ...current, consultationsPerMonth: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm" placeholder="Consultations per month" type="number" min={1} />
          <input value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm" placeholder="Description" />
          <button type="submit" className="h-10 rounded-lg bg-[#16b46f] px-4 text-sm font-semibold text-white hover:bg-[#149660] md:col-span-2">
            Add Plan
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <h3 className="mb-3 text-base font-semibold text-[#001b5e]">Existing Plans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Consultations</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-[#e2e8f0] last:border-b-0">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-[#001b5e]">{plan.name}</p>
                    <p className="text-xs text-[#64748b]">{plan.description}</p>
                  </td>
                  <td className="px-3 py-3 text-[#475569]">NGN {plan.monthlyPrice.toLocaleString()}</td>
                  <td className="px-3 py-3 text-[#475569]">{plan.consultationsPerMonth}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${plan.active ? "bg-[#16b46f]/15 text-[#166534]" : "bg-[#ef4444]/12 text-[#b91c1c]"}`}>
                      {plan.active ? "Active" : "Inactive"}
                    </span>
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
