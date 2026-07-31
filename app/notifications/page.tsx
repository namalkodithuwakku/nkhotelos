import { Bell } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function NotificationsPage() { return <PlannedModulePage eyebrow="More" title="Notifications" description="Central alerts for bookings, occupancy, payments, managers, actions and system notices." icon={Bell} cards={[
  {title:"Bookings",description:"New bookings, modifications, cancellations, arrivals and departures."},
  {title:"Occupancy",description:"High occupancy, low occupancy, sold-out dates and pickup changes."},
  {title:"Revenue",description:"Rate opportunities, slow pickup, peak dates and OTA action suggestions."},
  {title:"Marketing",description:"Campaign priorities, low-demand periods and overdue activities."},
  {title:"Reputation",description:"New negative reviews, unanswered reviews and repeated complaints."},
  {title:"System",description:"Assigned actions, overdue work, subscription and backup notices."}
]} />; }
