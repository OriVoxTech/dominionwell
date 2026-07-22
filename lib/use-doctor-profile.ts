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

export function setCachedDoctorProfile(profile: DoctorProfile) {
  cachedDoctorProfile = profile;
  cachedAccessToken = getDoctorAccessToken();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dw-doctor-profile-updated"));
  }
}

export function useDoctorProfile() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = () => {
      void requestDoctorProfile()
        .then((nextProfile) => {
          if (!isCancelled) setProfile(nextProfile);
        })
        .catch(() => {
          // Authenticated request errors and redirects are handled by the API client.
        });
    };

    window.addEventListener("dw-doctor-profile-updated", loadProfile);
    loadProfile();

    return () => {
      isCancelled = true;
      window.removeEventListener("dw-doctor-profile-updated", loadProfile);
    };
  }, []);

  return profile;
}
