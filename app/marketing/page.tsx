import { Megaphone } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";

export default function MarketingPage() {
  return <PlannedModulePage eyebrow="Business manager" title="Marketing Manager" description="Turn occupancy gaps, location, seasons and the hotel's online presence into practical marketing actions ordered from free to higher-cost activities." icon={Megaphone} cards={[
    { title: "Priority activity plan", description: "Recommended activities for the selected week or month, ranked by urgency, cost and expected benefit.", status: "Planned" },
    { title: "Low-occupancy campaigns", description: "Create offers for weak dates using room availability, minimum rates and target markets." },
    { title: "Online presence audit", description: "Review website, Google Business, OTA and social links stored in the property profile." },
    { title: "Content and promotion ideas", description: "Generate social posts, packages, direct-booking campaigns and required creative assets." },
    { title: "Campaign actions", description: "Assign each recommendation to staff and track progress through the Actions page." },
    { title: "Cost ladder", description: "Show free, very-low-cost, low-cost, paid and long-term activities separately." }
  ]} />;
}
