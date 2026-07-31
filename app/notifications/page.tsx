import { Bell } from "lucide-react";
import ModuleComingSoon from "../components/os/ModuleComingSoon";
import OSPageShell from "../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Notifications">
      <ModuleComingSoon
        icon={Bell}
        title="Notifications"
        description="Keep important hotel and system alerts in one place."
        items={[
        "Booking alerts",
        "Occupancy alerts",
        "Revenue alerts",
        "System notifications"
        ]}
      />
    </OSPageShell>
  );
}
