import { Megaphone } from "lucide-react";
import ModuleComingSoon from "../../components/os/ModuleComingSoon";
import OSPageShell from "../../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="Marketing Manager">
      <ModuleComingSoon
        icon={Megaphone}
        title="Marketing Manager"
        description="Turn occupancy, location, season and market information into practical campaigns."
        items={[
        "Occupancy-based marketing priorities",
        "Low-cost to paid campaign ladder",
        "Seasonal and location-based activities",
        "OTA, website and social-media recommendations"
        ]}
      />
    </OSPageShell>
  );
}

