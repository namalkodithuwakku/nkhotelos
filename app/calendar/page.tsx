import CalendarWorkspace from "../components/calendar/CalendarWorkspace";
import OSProtectedPage from "../components/os/OSProtectedPage";

export default function CalendarPage() {
  return (
    <OSProtectedPage
      eyebrow="N K Hotel OS"
      title="Booking Calendar"
      fullWidth
    >
      <CalendarWorkspace />
    </OSProtectedPage>
  );
}
