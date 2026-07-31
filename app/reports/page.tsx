import { BarChart3 } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function ReportsPage() { return <PlannedModulePage eyebrow="More" title="Reports" description="Simple operational and business reports for booking, occupancy, revenue, marketing and reputation performance." icon={BarChart3} cards={[
  {title:"Bookings",description:"Booking list, arrivals, departures, cancellations, no-shows and booking sources."},
  {title:"Occupancy",description:"Daily and monthly occupancy, room-type performance, availability and pickup."},
  {title:"Revenue",description:"Room revenue, ADR, RevPAR, source performance, commission and balances."},
  {title:"Marketing",description:"Activity status, campaign cost, enquiries and direct-booking progress."},
  {title:"Reputation",description:"Ratings, sentiment, common complaints, response status and improvement actions."},
  {title:"Export",description:"Prepare PDF, Excel, CSV and print-friendly outputs."}
]} />; }
