import { type ReactNode } from "react";

export default function DoctorDashboardLayout({ children }: { children: ReactNode }) {
  return <div className="dw-doctor-workspace">{children}</div>;
}
