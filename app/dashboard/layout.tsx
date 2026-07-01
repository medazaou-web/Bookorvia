import { ReactNode } from "react";
import DashboardShell from "./DashboardShell";
import DashboardProtect from "./DashboardProtect";

// Dashboard protection: redirects logged-out users to /login before rendering UI
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProtect>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProtect>
  );
}
