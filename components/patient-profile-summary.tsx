"use client";

import {
  getPatientDisplayName,
  getPatientShortId,
  usePatientProfile,
} from "@/lib/use-patient-profile";

export default function PatientProfileSummary() {
  const profile = usePatientProfile();

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-white">
        {getPatientDisplayName(profile)}
      </p>
      <p className="truncate text-xs text-[#d8e2ff]">
        {getPatientShortId(profile)}
      </p>
    </div>
  );
}
