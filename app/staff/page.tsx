import { Users } from "lucide-react";
import ModuleComingSoon from "../components/os/ModuleComingSoon";
import OSPageShell from "../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Staff">
      <ModuleComingSoon
        icon={Users}
        title="Staff"
        description="Manage property access and responsibilities."
        items={[
        "Hotel Manager access",
        "Hotel Team access",
        "Supervisor access",
        "NKH Team access"
        ]}
      />
    </OSPageShell>
  );
}
