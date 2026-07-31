import { Settings } from "lucide-react";
import ModuleComingSoon from "../components/os/ModuleComingSoon";
import OSPageShell from "../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Settings">
      <ModuleComingSoon
        icon={Settings}
        title="Settings"
        description="Control the core rules used by N K Hotel OS."
        items={[
        "Property defaults",
        "Booking settings",
        "Currency and timezone",
        "Integration settings"
        ]}
      />
    </OSPageShell>
  );
}
