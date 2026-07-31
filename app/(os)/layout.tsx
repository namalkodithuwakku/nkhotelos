import { ReactNode } from "react";
import PersistentOSLayout from "../components/os/PersistentOSLayout";

export default function OSLayout({ children }: { children: ReactNode }) {
  return <PersistentOSLayout>{children}</PersistentOSLayout>;
}
