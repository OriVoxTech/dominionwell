"use client";

import { useEffect, useState } from "react";
import { patientApiService, type PatientProfile } from "@/lib/api";
import { getPatientAccessToken } from "@/lib/patient-session";

let cachedPatientProfile: PatientProfile | null = null;
let cachedAccessToken: string | null = null;
let profileRequest: Promise<PatientProfile> | null = null;

function requestPatientProfile() {
  const accessToken = getPatientAccessToken();

  if (cachedAccessToken !== accessToken) {
    cachedPatientProfile = null;
    cachedAccessToken = accessToken;
    profileRequest = null;
  }

  if (cachedPatientProfile) return Promise.resolve(cachedPatientProfile);

  if (!profileRequest) {
    profileRequest = patientApiService
      .getProfile()
      .then((response) => {
        cachedPatientProfile = response.data;
        return response.data;
      })
      .finally(() => {
        profileRequest = null;
      });
  }

  return profileRequest;
}

export function setCachedPatientProfile(profile: PatientProfile) {
  cachedAccessToken = getPatientAccessToken();
  cachedPatientProfile = profile;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dw-patient-profile-updated"));
  }
}

export function getPatientDisplayName(profile: PatientProfile | null) {
  if (!profile) return "Patient";

  const name = [profile.user.firstName, profile.user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return name || profile.user.username || profile.user.email;
}

export function getPatientFirstName(profile: PatientProfile | null) {
  if (!profile) return "there";
  return profile.user.firstName?.trim() || getPatientDisplayName(profile);
}

export function getPatientInitials(profile: PatientProfile | null) {
  if (!profile) return "PT";

  const initials = [profile.user.firstName, profile.user.lastName]
    .map((part) => part.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .join("");

  return initials || profile.user.email.charAt(0).toUpperCase() || "PT";
}

export function getPatientShortId(profile: PatientProfile | null) {
  if (!profile) return "Patient account";
  return `ID: ${profile.id.slice(0, 8).toUpperCase()}`;
}

export function usePatientProfile() {
  const [profile, setProfile] = useState<PatientProfile | null>(cachedPatientProfile);

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = () => {
      void requestPatientProfile()
        .then((nextProfile) => {
          if (!isCancelled) setProfile(nextProfile);
        })
        .catch(() => {
          // Authenticated request errors and redirects are handled by the API client.
        });
    };

    loadProfile();
    window.addEventListener("dw-patient-profile-updated", loadProfile);

    return () => {
      isCancelled = true;
      window.removeEventListener("dw-patient-profile-updated", loadProfile);
    };
  }, []);

  return profile;
}
