"use client";

import { type PatientProfile } from "@/lib/api";
import { getPatientInitials } from "@/lib/use-patient-profile";

type PatientAvatarProps = {
  profile: PatientProfile | null;
  className?: string;
};

export default function PatientAvatar({
  profile,
  className = "h-11 w-11 text-sm",
}: PatientAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-[#16b46f]/40 bg-[#16b46f]/20 font-bold text-[#d7ffe9] ${className}`}
    >
      {getPatientInitials(profile)}
    </div>
  );
}
