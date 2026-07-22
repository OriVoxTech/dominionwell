"use client";

import {
  getDoctorDisplayName,
  getDoctorSpecialization,
  useDoctorProfile,
} from "@/lib/use-doctor-profile";

export default function DoctorProfileSummary() {
  const profile = useDoctorProfile();

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-bold text-white">
        {getDoctorDisplayName(profile)}
      </p>
      <p className="mt-0.5 truncate text-[10px] font-medium text-[#aebee0]">
        {getDoctorSpecialization(profile)}
      </p>
    </div>
  );
}
