"use client";

import { type FormEvent, useState } from "react";
import { doctorAuthApi, getApiErrorMessage, getApiResponseMessage } from "@/lib/api";

type DoctorChangePasswordModalProps = {
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export default function DoctorChangePasswordModal({ onClose, onSuccess }: DoctorChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = Boolean(currentPassword) && newPassword.length >= 8 && confirmPassword === newPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await doctorAuthApi.changePassword({ currentPassword, newPassword, confirmPassword });
      onSuccess(getApiResponseMessage(response.data, "Your password was changed successfully."));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    {
      label: "Current Password",
      value: currentPassword,
      setValue: setCurrentPassword,
      visible: showCurrentPassword,
      setVisible: setShowCurrentPassword,
      autoComplete: "current-password",
    },
    {
      label: "New Password",
      value: newPassword,
      setValue: setNewPassword,
      visible: showNewPassword,
      setVisible: setShowNewPassword,
      autoComplete: "new-password",
    },
    {
      label: "Confirm New Password",
      value: confirmPassword,
      setValue: setConfirmPassword,
      visible: showConfirmPassword,
      setVisible: setShowConfirmPassword,
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6">
      <button type="button" aria-label="Close change password dialog" disabled={isSubmitting} onClick={onClose} className="absolute inset-0 bg-[#0f172a]/55 backdrop-blur-[2px]" />
      <section role="dialog" aria-modal="true" aria-labelledby="doctor-change-password-title" className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="doctor-change-password-title" className="text-lg font-bold text-[#001b5e] sm:text-xl">Change Password</h2>
            <p className="mt-1 text-xs text-[#64748b] sm:text-sm">Enter your current password and choose a new one.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Close change password dialog" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c6c6cf] text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50">
            <span className="material-symbols-outlined text-[19px]">close</span>
          </button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            <label key={field.label} className="grid gap-1.5 text-xs font-medium text-[#334155] sm:text-sm">
              {field.label}
              <div className="relative">
                <input
                  autoFocus={index === 0}
                  type={field.visible ? "text" : "password"}
                  autoComplete={field.autoComplete}
                  minLength={index === 0 ? undefined : 8}
                  required
                  value={field.value}
                  onChange={(event) => {
                    field.setValue(event.target.value);
                    setErrorMessage("");
                  }}
                  className="h-11 w-full rounded-lg border border-[#c6c6cf] px-3 pr-11 outline-none focus:border-[#0aa4b4]"
                />
                <button type="button" onClick={() => field.setVisible((current) => !current)} aria-label={field.visible ? `Hide ${field.label.toLowerCase()}` : `Show ${field.label.toLowerCase()}`} className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-[#64748b] hover:text-[#001b5e]">
                  <span className="material-symbols-outlined text-[19px]">{field.visible ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {index === 1 ? <span className="font-normal text-[#64748b]">Use at least 8 characters.</span> : null}
            </label>
          ))}

          {errorMessage ? <p role="alert" className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c] sm:text-sm">{errorMessage}</p> : null}

          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="h-11 rounded-lg border border-[#c6c6cf] px-4 text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] disabled:opacity-50 sm:h-10">Cancel</button>
            <button type="submit" disabled={!isValid || isSubmitting} className="h-11 rounded-lg bg-[#16b46f] px-4 text-sm font-semibold text-white hover:bg-[#149660] disabled:cursor-not-allowed disabled:bg-[#94a3b8] sm:h-10">
              {isSubmitting ? "Changing password..." : "Save New Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
