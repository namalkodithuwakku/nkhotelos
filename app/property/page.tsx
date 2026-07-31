import { Building2 } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function PropertyPage() { return <PlannedModulePage eyebrow="More" title="Property" description="Maintain the complete hotel profile used by bookings and all intelligent managers." icon={Building2} cards={[
  {title:"Hotel profile",description:"Name, code, type, contacts, location, currency, timezone and operational details."},
  {title:"Rooms and room types",description:"Capacity, room inventory, amenities, rates, operational status and sort order."},
  {title:"Rates and commercial profile",description:"Minimum, maximum, standard, weekend and seasonal rates plus business targets."},
  {title:"Online presence",description:"Website, Google Business, OTA, review and social-media links."},
  {title:"Markets and seasons",description:"Target guests, nearby attractions, seasonal patterns and unique selling points."},
  {title:"Policies",description:"Check-in, check-out, cancellation, child, pet and payment policies."}
]} />; }
