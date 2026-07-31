import { Star } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function ReputationPage() { return <PlannedModulePage eyebrow="Business manager" title="Reputation Manager" description="Understand guest reviews, identify repeated issues and turn feedback into clear service-improvement actions." icon={Star} cards={[
  { title:"Review overview",description:"Track review volume, average score and unanswered reviews across connected platforms." },
  { title:"Sentiment and themes",description:"Group feedback into cleanliness, service, rooms, food, value, facilities and communication." },
  { title:"Suggested replies",description:"Draft professional responses while keeping manager approval before publication." },
  { title:"Repeated complaints",description:"Detect recurring operational issues and create staff follow-up actions." },
  { title:"Positive review opportunities",description:"Identify strong feedback suitable for marketing and staff recognition." },
  { title:"Reputation trend",description:"Compare rating and sentiment changes by week, month and platform." }
]} />; }
