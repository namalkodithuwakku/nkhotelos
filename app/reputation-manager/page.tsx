import { Star } from "lucide-react";
import ModuleComingSoon from "../components/os/ModuleComingSoon";
import OSPageShell from "../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Reputation Manager">
      <ModuleComingSoon
        icon={Star}
        title="Reputation Manager"
        description="Understand guest feedback and turn reviews into clear improvement actions."
        items={[
        "Review summary and sentiment",
        "Suggested guest responses",
        "Recurring issue detection",
        "Property improvement priorities"
        ]}
      />
    </OSPageShell>
  );
}
