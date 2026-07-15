"use client";

import { useRouter } from "next/navigation";
import { clearDoctorSession } from "@/lib/doctor-session";

type DoctorLogoutButtonProps = {
  className: string;
  iconClassName?: string;
};

export default function DoctorLogoutButton({ className, iconClassName = "" }: DoctorLogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearDoctorSession();
    router.replace("/login/doctor");
    router.refresh();
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      <span className={`material-symbols-outlined ${iconClassName}`}>logout</span>
      <span>Logout</span>
    </button>
  );
}
