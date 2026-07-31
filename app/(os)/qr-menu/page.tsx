import { QrCode } from "lucide-react";
import ModuleComingSoon from "../../components/os/ModuleComingSoon";
import OSPageShell from "../../components/os/OSPageShell";

export default function Page() {
  return (
    <OSPageShell title="QR Menu">
      <ModuleComingSoon
        icon={QrCode}
        title="QR Menu"
        description="Manage a simple digital guest menu connected to the property."
        items={[
        "Menu categories and items",
        "Prices and availability",
        "Property QR code",
        "Mobile guest view"
        ]}
      />
    </OSPageShell>
  );
}

