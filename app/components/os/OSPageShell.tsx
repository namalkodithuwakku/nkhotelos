"use client";

import { ReactNode } from "react";
import { usePersistentOSLayout } from "./OSLayoutContext";
import LegacyOSPageShell from "./OSPageShellLegacy";

type Props = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  compact?: boolean;
};

export default function OSPageShell(props: Props) {
  const persistentLayoutActive = usePersistentOSLayout();

  if (persistentLayoutActive) {
    return <>{props.children}</>;
  }

  return <LegacyOSPageShell {...props} />;
}
