import { type ReactNode } from "react";
import PatientAuthGuard from "@/components/patient-auth-guard";

export default function PatientDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PatientAuthGuard>{children}</PatientAuthGuard>;
}
