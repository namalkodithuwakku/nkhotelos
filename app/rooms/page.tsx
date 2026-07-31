import OSPageShell from "../components/os/OSPageShell";
import RoomsManager from "./RoomsManager";

export default function RoomsPage() {
  return (
    <OSPageShell title="Rooms & Room Types">
      <RoomsManager />
    </OSPageShell>
  );
}
