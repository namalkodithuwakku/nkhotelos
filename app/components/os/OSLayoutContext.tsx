"use client";

import { createContext, ReactNode, useContext } from "react";

const OSLayoutContext = createContext(false);

export function OSLayoutProvider({ children }: { children: ReactNode }) {
  return (
    <OSLayoutContext.Provider value={true}>
      {children}
    </OSLayoutContext.Provider>
  );
}

export function usePersistentOSLayout() {
  return useContext(OSLayoutContext);
}
