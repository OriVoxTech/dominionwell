"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  adminApiService,
  getApiErrorMessage,
  type AdminSpecialty,
} from "@/lib/api";

const initialForm = {
  name: "",
  description: "",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function AdminSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<AdminSpecialty[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const isFormValid =
    form.name.trim().length >= 2 && form.description.trim().length >= 3;

  const activeSpecialtiesCount = useMemo(
    () => specialties.filter((specialty) => specialty.isActive).length,
    [specialties],
  );

  const loadSpecialties = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await adminApiService.listSpecialties();
      setSpecialties(response.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSpecialties();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSpecialties]);

  const handleCreateSpecialty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isCreating) return;

    setError("");
    setNotice("");
    setIsCreating(true);

    try {
      const response = await adminApiService.createSpecialty({
        name: form.name.trim(),
        description: form.description.trim(),
      });

      setSpecialties((current) => {
        const others = current.filter(
          (specialty) => specialty.id !== response.data.id,
        );
        return [response.data, ...others];
      });
      setForm(initialForm);
      setNotice(`${response.data.name} was created successfully.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#001b5e]">Medical Specialties</h2>
          <p className="mt-1 text-sm text-[#475569]">
            Create and review medical specialties available across the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSpecialties()}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd5e1] px-3 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc] disabled:cursor-wait disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh
        </button>
      </div>

      {notice ? (
        <p className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          {notice}
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadSpecialties()}
            className="rounded-lg border border-[#fca5a5] px-3 py-1.5 text-xs font-semibold hover:bg-white"
          >
            Try Again
          </button>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Total Specialties</p>
          <p className="mt-2 text-2xl font-semibold text-[#001b5e]">{isLoading ? "-" : specialties.length}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Active</p>
          <p className="mt-2 text-2xl font-semibold text-[#166534]">{isLoading ? "-" : activeSpecialtiesCount}</p>
        </article>
        <article className="rounded-xl border border-[#dbe4f0] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Inactive</p>
          <p className="mt-2 text-2xl font-semibold text-[#b45309]">{isLoading ? "-" : specialties.length - activeSpecialtiesCount}</p>
        </article>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <h3 className="text-base font-semibold text-[#001b5e]">Create Specialty</h3>
        <form className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]" onSubmit={handleCreateSpecialty}>
          <label className="sr-only" htmlFor="specialty-name">Specialty name</label>
          <input
            id="specialty-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f] focus:ring-2 focus:ring-[#16b46f]/15"
            placeholder="Specialty name"
            required
          />
          <label className="sr-only" htmlFor="specialty-description">Description</label>
          <input
            id="specialty-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="h-10 rounded-lg border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f] focus:ring-2 focus:ring-[#16b46f]/15"
            placeholder="Description"
            required
          />
          <button
            type="submit"
            disabled={!isFormValid || isCreating}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#16b46f] px-4 text-sm font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {isCreating ? "Creating..." : "Create"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#e2e8f0] p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-[#001b5e]">Existing Specialties</h3>
          <span className="w-fit rounded-full bg-[#e2e8f0] px-2.5 py-1 text-xs font-semibold text-[#334155]">
            {isLoading ? "Loading..." : `${specialties.length} specialties`}
          </span>
        </div>

        {!isLoading && specialties.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#cbd5e1] p-4 text-center text-sm text-[#64748b]">
            No specialties have been created yet.
          </p>
        ) : null}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-[#64748b]">
                <th className="px-3 py-2">Specialty</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {specialties.map((specialty) => (
                <tr key={specialty.id} className="border-b border-[#e2e8f0] last:border-b-0">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-[#001b5e]">{specialty.name}</p>
                    <p className="text-xs text-[#64748b]">{specialty.id}</p>
                  </td>
                  <td className="max-w-[420px] px-3 py-3 text-[#475569]">{specialty.description}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${specialty.isActive ? "bg-[#16b46f]/15 text-[#166534]" : "bg-[#ef4444]/12 text-[#b91c1c]"}`}>
                      {specialty.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#475569]">{formatDate(specialty.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {specialties.map((specialty) => (
            <article key={specialty.id} className="rounded-xl border border-[#dbe4f0] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="break-words text-sm font-semibold text-[#001b5e]">{specialty.name}</h4>
                  <p className="mt-1 break-words text-xs text-[#64748b]">{specialty.id}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${specialty.isActive ? "bg-[#16b46f]/15 text-[#166534]" : "bg-[#ef4444]/12 text-[#b91c1c]"}`}>
                  {specialty.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#475569]">{specialty.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                Created {formatDate(specialty.createdAt)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
