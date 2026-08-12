"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface MemberPageHeader {
  title: string;
  subtitle: string;
}

interface MemberPageHeaderContextValue {
  header: MemberPageHeader | null;
  setHeader: (header: MemberPageHeader | null) => void;
}

const MemberPageHeaderContext = createContext<MemberPageHeaderContextValue | null>(
  null,
);

export function MemberPageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<MemberPageHeader | null>(null);
  const value = useMemo(() => ({ header, setHeader }), [header]);

  return (
    <MemberPageHeaderContext.Provider value={value}>
      {children}
    </MemberPageHeaderContext.Provider>
  );
}

export function useMemberPageHeader() {
  const context = useContext(MemberPageHeaderContext);
  if (!context) {
    throw new Error("useMemberPageHeader must be used within MemberPageHeaderProvider");
  }
  return context;
}

export function useMemberPageHeaderOptional() {
  return useContext(MemberPageHeaderContext);
}
