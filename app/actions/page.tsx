import { Zap } from "lucide-react";
import ModuleComingSoon from "../components/os/ModuleComingSoon";
import OSPageShell from "../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Actions">
      <ModuleComingSoon
        icon={Zap}
        title="Actions"
        description="See what needs to be done, who should do it and what matters most."
        items={[
        "Priority action list",
        "Revenue actions",
        "Marketing actions",
        "Reputation actions"
        ]}
      />
    </OSPageShell>
  );
}
