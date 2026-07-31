import OccupancyInventoryWorkspace from "../../components/occupancy/OccupancyInventoryWorkspace";
import OSPageShell from "../../components/os/OSPageShell";

export default function OccupancyPage() {
  return (
    <OSPageShell title="Occupancy" compact>
      <OccupancyInventoryWorkspace />
    </OSPageShell>
  );
}

