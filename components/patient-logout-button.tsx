"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { patientAuthApi } from "@/lib/api";
import { clearPatientSession } from "@/lib/patient-session";

type PatientLogoutButtonProps = {
  className: string;
  iconClassName?: string;
  label?: string;
};

export default function PatientLogoutButton({
  className,
  iconClassName = "text-[20px]",
  label = "Logout",
}: PatientLogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await patientAuthApi.logout();
    } catch {
      // Local session cleanup must still happen if the server session has expired.
    } finally {
      clearPatientSession();
      router.replace("/login/patient");
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={handleLogout} disabled={isLoggingOut} className={className}>
      <span className={`material-symbols-outlined ${iconClassName}`}>logout</span>
      <span>{isLoggingOut ? "Logging out..." : label}</span>
    </button>
  );
}
