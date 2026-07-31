import { QrCode } from "lucide-react";
import PlannedModulePage from "../components/os/PlannedModulePage";
export default function QrMenuPage() { return <PlannedModulePage eyebrow="Connected module" title="QR Menu" description="Connect a separate N K QR Menu product to the property using the same property ID and account access." icon={QrCode} primaryAction={{label:"Activate QR Menu",href:"/settings"}} cards={[
  {title:"Module status",description:"Check whether QR Menu Basic or Pro is active for the selected property.",status:"Connected"},
  {title:"Manage menus",description:"Open restaurant, bar, pool and room-service menu administration."},
  {title:"Public menu",description:"Open and test the guest-facing menu URL without requiring guest login."},
  {title:"Download QR code",description:"Generate printable QR codes for outlets, rooms or tables."},
  {title:"Availability",description:"Control item availability, pricing, categories and special offers."},
  {title:"Analytics",description:"Track menu views and popular categories in a later release."}
]} />; }
