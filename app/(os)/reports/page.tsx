import { FileChartColumn } from "lucide-react";
import ModuleComingSoon from "../../components/os/ModuleComingSoon";
import OSPageShell from "../../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Reports">
      <ModuleComingSoon
        icon={FileChartColumn}
        title="Reports"
        description="Simple management summaries without unnecessary complexity."
        items={[
        "Booking performance",
        "Occupancy summary",
        "Revenue summary",
        "Source and channel summary"
        ]}
      />
    </OSPageShell>
  );
}

