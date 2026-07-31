import OSPageShell from "../components/os/OSPageShell";
import ActionsManager from "./ActionsManager";

export default function ActionsPage() {
  return (
    <OSPageShell title="Actions">
      <ActionsManager />
    </OSPageShell>
  );
}
