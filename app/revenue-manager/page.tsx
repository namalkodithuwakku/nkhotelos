import RevenueManagerWorkspace from "../components/revenue/RevenueManagerWorkspace";
import OSPageShell from "../components/os/OSPageShell";

export default function RevenueManagerPage() {
  return (
    <OSPageShell title="Revenue Manager" compact>
      <RevenueManagerWorkspace />
    </OSPageShell>
  );
}
