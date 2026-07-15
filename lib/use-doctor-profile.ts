"use client";

import { useEffect, useState } from "react";
import { doctorApiService, type DoctorProfile } from "@/lib/api";
import { getDoctorAccessToken } from "@/lib/doctor-session";

let cachedDoctorProfile: DoctorProfile | null = null;
let cachedAccessToken: string | null = null;
let profileRequest: Promise<DoctorProfile> | null = null;

function requestDoctorProfile() {
  const accessToken = getDoctorAccessToken();

  if (cachedAccessToken !== accessToken) {
    cachedDoctorProfile = null;
    cachedAccessToken = accessToken;
    profileRequest = null;
  }

  if (cachedDoctorProfile) return Promise.resolve(cachedDoctorProfile);

  if (!profileRequest) {
    profileRequest = doctorApiService
      .getProfile()
      .then((response) => {
        cachedDoctorProfile = response.data;
        return response.data;
      })
      .finally(() => {
        profileRequest = null;
      });
  }

  return profileRequest;
}

export function getDoctorDisplayName(profile: DoctorProfile | null) {
  if (!profile) return "Doctor";

  const name = [profile.user.firstName, profile.user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return name ? `Dr. ${name}` : profile.user.username;
}

export function getDoctorSpecialization(profile: DoctorProfile | null) {
  if (!profile) return "Loading profile...";

  return profile.specializations
    .map((item) => item.replaceAll("_", " "))
    .join(", ") || "Specialization not provided";
}

export function useDoctorProfile() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);

  useEffect(() => {
    if (profile) return;

    let isCancelled = false;

    void requestDoctorProfile()
      .then((nextProfile) => {
        if (!isCancelled) setProfile(nextProfile);
      })
      .catch(() => {
        // Authenticated request errors and redirects are handled by the API client.
      });

    return () => {
      isCancelled = true;
    };
  }, [profile]);

  return profile;
}
