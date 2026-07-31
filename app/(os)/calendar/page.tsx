import CalendarWorkspace from "../../components/calendar/CalendarWorkspace";
import OSPageShell from "../../components/os/OSPageShell";

export default function CalendarPage() {
  return (
    <OSPageShell title="Booking Calendar" compact>
      <CalendarWorkspace />
    </OSPageShell>
  );
}

