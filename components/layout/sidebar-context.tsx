"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type SidebarContextType = {
  title: string | null;
  setTitle: (title: string | null) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);

  return (
    <SidebarContext.Provider value={{ title, setTitle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarTitle({ title }: { title: string | null }) {
  const { setTitle } = useSidebarContext();
  
  // Set the title on mount and clear on unmount
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);

  return null;
}
