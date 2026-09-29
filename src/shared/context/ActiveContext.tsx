import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Company } from "@/features/companies/company";
import { getMyCompany, getMyMembership } from "@/features/companies/company.service";
import { getMyPlatformAdmin } from "@/features/platform-admin/platformAdmin.service";

type ContextKind = "personal" | "company";

interface ActiveContextValue {
  loading: boolean;
  kind: ContextKind;
  setKind: (kind: ContextKind) => void;
  company: Company | null;
  isAdmin: boolean;
  hasCompany: boolean;
  isPlatformAdmin: boolean;
}

const ActiveContextContext = createContext<ActiveContextValue | null>(null);

export function ActiveContextProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [kind, setKind] = useState<ContextKind>("company");

  useEffect(() => {
    let active = true;
    Promise.all([getMyMembership(), getMyCompany(), getMyPlatformAdmin().catch(() => null)]).then(([membership, loadedCompany, platformAdmin]) => {
      if (!active) return;
      setCompany(loadedCompany);
      setIsAdmin(membership?.position.name === "ADMIN");
      setIsPlatformAdmin(platformAdmin !== null);
      setKind(loadedCompany ? "company" : "personal");
    }).catch(() => {
      if (active) setCompany(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<ActiveContextValue>(() => ({
    loading,
    kind: company ? kind : "personal",
    setKind,
    company,
    isAdmin,
    hasCompany: company !== null,
    isPlatformAdmin,
  }), [loading, kind, company, isAdmin, isPlatformAdmin]);

  return <ActiveContextContext.Provider value={value}>{children}</ActiveContextContext.Provider>;
}

export function useActiveContext(): ActiveContextValue {
  const value = useContext(ActiveContextContext);
  if (!value) throw new Error("useActiveContext deve ser usado dentro de ActiveContextProvider");
  return value;
}
