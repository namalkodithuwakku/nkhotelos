import { Users } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function StaffPage() { return <PlannedModulePage eyebrow="More" title="Staff & Access" description="Manage hotel users, N K Hotels support access and property-based permissions." icon={Users} cards={[
  {title:"Master",description:"Full system and multi-property administration."},
  {title:"Supervisor",description:"Assigned-property management, approvals and staff oversight."},
  {title:"N K Hotels Team",description:"Reservation, marketing and support access for assigned hotels."},
  {title:"Hotel Manager",description:"Complete access to their own property and staff management."},
  {title:"Hotel Team",description:"Limited calendar, booking, payment and action access."},
  {title:"Security",description:"Account status, last login, password reset, sessions and audit activity."}
]} />; }
