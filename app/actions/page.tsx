import { ListChecks } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function ActionsPage() { return <PlannedModulePage eyebrow="Workspace" title="Actions" description="One place for recommendations and work created by Revenue, Marketing, Reputation, Occupancy and hotel staff." icon={ListChecks} cards={[
  {title:"Pending",description:"New recommendations and manual actions waiting to be started.",status:"Ready"},
  {title:"In progress",description:"Work currently assigned to hotel or N K Hotels team members."},
  {title:"Waiting",description:"Actions waiting for approval, information or an external response."},
  {title:"Completed",description:"Finished work with completion notes and evidence."},
  {title:"Priority and ownership",description:"Filter by urgency, manager source, staff member, property and due date."},
  {title:"Result tracking",description:"Record what was done and compare the result with the expected impact."}
]} />; }
