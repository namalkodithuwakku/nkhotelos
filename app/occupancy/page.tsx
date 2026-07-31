import OccupancyInventoryWorkspace from "../components/occupancy/OccupancyInventoryWorkspace";
import OSProtectedPage from "../components/os/OSProtectedPage";

export default function OccupancyPage() {
  return (
    <OSProtectedPage
      eyebrow="N K Hotel OS"
      title="Occupancy"
      fullWidth
    >
      <OccupancyInventoryWorkspace />
    </OSProtectedPage>
  );
}
