import OSPageShell from "../../components/os/OSPageShell";
import SettingsManager from "./SettingsManager";

export default function SettingsPage() {
  return (
    <OSPageShell title="Settings">
      <SettingsManager />
    </OSPageShell>
  );
}

