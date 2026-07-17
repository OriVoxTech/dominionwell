"use client";

import { useSyncExternalStore } from "react";
import { isPatientSessionActive } from "@/lib/patient-session";

const subscribeToPatientSession = () => () => {};
const getServerPatientSessionSnapshot = () => false;

export function usePatientSessionActive() {
  return useSyncExternalStore(
    subscribeToPatientSession,
    isPatientSessionActive,
    getServerPatientSessionSnapshot,
  );
}
