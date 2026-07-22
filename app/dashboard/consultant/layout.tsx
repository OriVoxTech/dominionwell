import { type ReactNode } from "react";

export default function ConsultantDashboardLayout({ children }: { children: ReactNode }) {
  return <div className="dw-doctor-workspace">{children}</div>;
}
