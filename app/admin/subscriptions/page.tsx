"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ADMIN_UPDATED_EVENT,
  addSubscriptionPlan,
  readAdminSettings,
  readSubscriptionPlans,
  updateAdminSettings,
  type SubscriptionPlan,
} from "@/lib/admin-portal";
import {
  adminApiService,
  getApiErrorMessage,
  type AdminSubscriptionPlan,
} from "@/lib/api";

function mapApiPlanToSubscriptionPlan(plan: AdminSubscriptionPlan): SubscriptionPlan {
  return {
    id: plan.id,
    name: plan.name,
    monthlyPrice:
      plan.monthlyPrice ??
      plan.priceNaira ??
      Math.floor((plan.priceCents ?? 0) / 100),
    consultationsPerMonth:
      plan.consultationsPerMonth ?? plan.consultationCredits ?? 0,
    description: plan.description ?? "No description provided.",
    active: plan.active ?? plan.isActive ?? true,
  };
}

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(readSubscriptionPlans());
  const [pointValue, setPointValue] = useState(readAdminSettings().pointValue);
  const [isSavingPointValue, setIsSavingPointValue] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    monthlyPrice: "",
    consultationsPerMonth: "",
    description: "",
  });

  const loadPlans = useCallback(async () => {
    setPlansError("");
    setIsLoadingPlans(true);

    try {
      const response = await adminApiService.listSubscriptionPlans();
      setPlans(response.data.map(mapApiPlanToSubscriptionPlan));
    } catch (error) {
      setPlansError(getApiErrorMessage(error));
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPlans();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadPlans]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void adminApiService
        .getDoctorPointValue()
        .then((response) => {
          setPointValue(response.data.pointValue);
          updateAdminSettings({ pointValue: response.data.pointValue });
        })
        .catch(() => {
          // Keep the locally cached value if the backend value is temporarily unavailable.
        });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleSavePointValue = async () => {
    const normalizedPointValue = Math.max(0, Math.floor(pointValue));

    setNotice("");
    setIsSavingPointValue(true);

    try {
      const response = await adminApiService.updateDoctorPointValue({
        pointValue: normalizedPointValue,
      });
      const savedPointValue = response.data.pointValue ?? normalizedPointValue;

      setPointValue(savedPointValue);
      updateAdminSettings({ pointValue: savedPointValue });
      setNotice("Point value updated successfully.");
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    } finally {
      setIsSavingPointValue(false);
    }
  };

  const handleAddPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const payload = {
      name: form.name,
      monthlyPrice: Number(form.monthlyPrice) || 0,
      consultationsPerMonth: Number(form.consultationsPerMonth) || 1,
      description: form.description || "Custom plan",
    };

    setNotice("");
    setIsAddingPlan(true);

    try {
      const response = await adminApiService.createSubscriptionPlan(payload);

      addSubscriptionPlan({
        id: response.data.id,
        name: response.data.name,
        monthlyPrice:
          response.data.monthlyPrice ??
          response.data.priceNaira ??
          Math.floor((response.data.priceCents ?? payload.monthlyPrice * 100) / 100),
        consultationsPerMonth:
          response.data.consultationsPerMonth ??
          response.data.consultationCredits ??
          payload.consultationsPerMonth,
        description: response.data.description ?? payload.description,
        active: response.data.active ?? response.data.isActive ?? true,
      });
      setPlans((current) => {
        const createdPlan = mapApiPlanToSubscriptionPlan(response.data);
        const existingPlans = current.filter((plan) => plan.id !== createdPlan.id);

        return [createdPlan, ...existingPlans];
      });

      setNotice("Subscription plan created successfully.");
    } catch (error) {
      setNotice(getApiErrorMessage(error));
      return;
    } finally {
      setIsAddingPlan(false);
    }

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

      {notice ? (
        <p className="rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#334155]">
          {notice}
        </p>
      ) : null}

      {plansError ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
          <span>{plansError}</span>
          <button
            type="button"
            onClick={() => void loadPlans()}
            className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white"
          >
            Try Again
          </button>
        </div>
      ) : null}

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
            className="h-10 rounded-lg bg-[#001b5e] px-4 text-sm font-semibold text-white hover:bg-[#0b2b75] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
            disabled={isSavingPointValue}
            onClick={handleSavePointValue}
          >
            {isSavingPointValue ? "Saving..." : "Save Point Value"}
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
          <button
            type="submit"
            disabled={isAddingPlan}
            className="h-10 rounded-lg bg-[#16b46f] px-4 text-sm font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8] md:col-span-2"
          >
            {isAddingPlan ? "Adding..." : "Add Plan"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-[#001b5e]">Existing Plans</h3>
          <button
            type="button"
            onClick={() => void loadPlans()}
            disabled={isLoadingPlans}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-3 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            Refresh
          </button>
        </div>
        {!isLoadingPlans && !plansError && plans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-center text-sm text-[#64748b]">
            No active subscription plans found.
          </p>
        ) : null}
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
              {isLoadingPlans ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-sm text-[#64748b]">
                    Loading subscription plans...
                  </td>
                </tr>
              ) : null}
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
