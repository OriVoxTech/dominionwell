"use client";

import Link from "next/link";
import { type ChangeEvent, FormEvent, useRef, useState } from "react";
import { addDoctorJoinRequest } from "@/lib/admin-portal";

const MAX_DOCUMENT_FILES = 5;

const specializationOptions = [
  "GENERAL_PRACTICE",
  "CARDIOLOGY",
  "DERMATOLOGY",
  "ENDOCRINOLOGY",
  "GASTROENTEROLOGY",
  "GYNECOLOGY",
  "NEUROLOGY",
  "ONCOLOGY",
  "OPHTHALMOLOGY",
  "ORTHOPEDICS",
  "PEDIATRICS",
  "PSYCHIATRY",
  "UROLOGY",
] as const;

function formatSpecialization(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function JoinDoctorPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files ?? []);

    setSelectedFiles((currentFiles) => {
      const nextFiles = [...currentFiles];

      incomingFiles.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified,
        );

        if (!alreadySelected && nextFiles.length < MAX_DOCUMENT_FILES) {
          nextFiles.push(file);
        }
      });

      return nextFiles;
    });

    event.target.value = "";
  };

  const removeSelectedFile = (fileToRemove: File) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (file) =>
          file.name !== fileToRemove.name ||
          file.size !== fileToRemove.size ||
          file.lastModified !== fileToRemove.lastModified,
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const specialty = String(formData.get("specialty") ?? "").trim();

    if (!name || !email || !phone || !username || !specialty) {
      setMessage("Please complete all required fields before sending your request.");
      return;
    }

    if (selectedFiles.length === 0) {
      setMessage("Please attach at least one supporting document or license.");
      return;
    }

    addDoctorJoinRequest({
      name,
      email,
      phone,
      username,
      specialization: specialty,
      documents: selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type || "Unknown",
      })),
    });

    event.currentTarget.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedFiles([]);
    setMessage("Your doctor application request has been sent. Our verification team will review it soon.");
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#191c1e]">
      <header className="border-b border-[#dbe4f0] bg-white/90 px-4 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-extrabold text-[#001b5e]">
            DominionWell+
          </Link>
          <Link href="/login/doctor" className="rounded-lg border border-[#c6c6cf] px-4 py-2 text-sm font-semibold text-[#001b5e] hover:bg-[#f8fafc]">
            Doctor Login
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-10 md:py-16">
        <div className="rounded-[2rem] bg-[#001b5e] p-7 text-white md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#74fcad]">Join our care network</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Apply to become a DominionWell+ doctor.</h1>
          <p className="mt-5 text-sm leading-7 text-[#d8e2ff]">
            Submit your provider details, specialty, licenses, and supporting documents. Our verification team will review your application before granting access.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Verified patient access",
              "Secure virtual consultation tools",
              "Wallet and subscription-powered earnings",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                <span className="material-symbols-outlined text-[#74fcad]">check_circle</span>
                <span className="text-sm text-[#eef4ff]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[#dbe4f0] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#001b5e]">Doctor application</h2>
            <p className="mt-2 text-sm text-[#64748b]">Fields marked with * are required.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Full name *</span>
              <input name="name" required className="mt-2 h-11 w-full rounded-xl border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f]" placeholder="Dr. Ada Lovelace" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Email *</span>
              <input name="email" required type="email" className="mt-2 h-11 w-full rounded-xl border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f]" placeholder="doctor@example.com" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Phone *</span>
              <input name="phone" required type="tel" className="mt-2 h-11 w-full rounded-xl border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f]" placeholder="+2348012345678" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Create username *</span>
              <input name="username" required className="mt-2 h-11 w-full rounded-xl border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#16b46f]" placeholder="drada" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Specialty *</span>
              <select name="specialty" required defaultValue="" className="mt-2 h-11 w-full rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#16b46f]">
                <option value="" disabled>Select specialty</option>
                {specializationOptions.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {formatSpecialization(specialty)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Supporting documents and licenses *</span>
                <p className="mt-1 text-xs text-[#64748b]">Upload up to {MAX_DOCUMENT_FILES} files. PDF, images, and Word documents are supported.</p>
              </div>
              {selectedFiles.length > 0 && selectedFiles.length < MAX_DOCUMENT_FILES ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-fit rounded-lg border border-[#001b5e]/20 px-3 py-2 text-xs font-semibold text-[#001b5e] hover:bg-[#f8fafc]"
                >
                  Add more
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              name="documents"
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />
            {selectedFiles.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#94a3b8] bg-[#f8fafc] p-6 text-center text-sm text-[#475569] hover:border-[#16b46f] hover:bg-[#f0fdf4]"
              >
                <span className="material-symbols-outlined mb-2 text-[#001b5e]">upload_file</span>
                <span className="font-semibold text-[#001b5e]">Select files</span>
                <span className="mt-1 text-xs text-[#64748b]">You can add multiple files now or add more later.</span>
              </button>
            ) : null}
          </div>

          {selectedFiles.length > 0 ? (
            <div className="mt-4 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Selected files</p>
                <p className="text-xs font-semibold text-[#64748b]">{selectedFiles.length}/{MAX_DOCUMENT_FILES}</p>
              </div>
              <ul className="space-y-1 text-sm text-[#475569]">
                {selectedFiles.map((file) => (
                  <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3">
                    <span className="truncate">{file.name}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-[#64748b]">{Math.ceil(file.size / 1024)} KB</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(file)}
                        className="rounded-md border border-[#ef4444]/30 px-2 py-1 text-[11px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {selectedFiles.length >= MAX_DOCUMENT_FILES ? (
                <p className="mt-3 text-xs text-[#b45309]">Maximum of {MAX_DOCUMENT_FILES} files reached.</p>
              ) : null}
            </div>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] px-4 py-3 text-sm text-[#334155]">
              {message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/" className="rounded-xl border border-[#c6c6cf] px-5 py-3 text-center text-sm font-semibold text-[#475569] hover:bg-[#f8fafc]">
              Back Home
            </Link>
            <button type="submit" className="rounded-xl bg-[#16b46f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#149660]">
              Send Request
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
