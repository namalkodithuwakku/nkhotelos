import { Settings } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function SettingsPage() { return <PlannedModulePage eyebrow="More" title="Settings" description="Configure the selected property's OS preferences, modules, security and backup connections." icon={Settings} cards={[
  {title:"General",description:"Language, currency, timezone, date formats and user preferences."},
  {title:"Bookings",description:"Sources, statuses, colours, payment methods and booking defaults."},
  {title:"Modules",description:"Enable QR Menu and future optional products by subscription."},
  {title:"Notifications",description:"Choose in-app, email and future WhatsApp or SMS preferences."},
  {title:"Google Sheet backup",description:"Connect a property backup Sheet, show last sync and run a manual backup."},
  {title:"Security and audit",description:"Sessions, access logs, data export, retention and recovery settings."}
]} />; }
