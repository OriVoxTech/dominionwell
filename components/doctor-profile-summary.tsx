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
      <p className="truncate font-semibold text-[#7784ac]">
        {getDoctorDisplayName(profile)}
      </p>
      <p className="truncate text-xs text-[#7784ac]/80">
        {getDoctorSpecialization(profile)}
      </p>
    </div>
  );
}
