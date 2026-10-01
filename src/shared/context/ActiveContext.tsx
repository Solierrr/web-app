import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Company } from "@/features/companies/company";
import { getMyCompany, getMyMembership } from "@/features/companies/company.service";
import { getMyPlatformAdmin } from "@/features/platform-admin/platformAdmin.service";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getOperationalAccount, getSelectedContext, selectContext } from "@/features/access/onboarding.service";
import type { OperationalMembership } from "@/features/access/onboarding";

type ContextKind = "personal" | "company";

interface ActiveContextValue {
  loading: boolean;
  kind: ContextKind;
  setKind: (kind: ContextKind) => void;
  company: Company | null;
  isAdmin: boolean;
  hasCompany: boolean;
  isPlatformAdmin: boolean;
  can?: (permission: string) => boolean;
  memberships?: OperationalMembership[];
  selectCompany?: (id: string) => void;
  needsContextChoice?: boolean;
}

const ActiveContextContext = createContext<ActiveContextValue | null>(null);

export function ActiveContextProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [kind, setKind] = useState<ContextKind>("company");
  const [memberships, setMemberships] = useState<OperationalMembership[]>([]);
  const [needsContextChoice, setNeedsContextChoice] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    let generation = 0;
    function load() {
      const current = ++generation;
      setLoading(true);
      Promise.all([getMyMembership(), getMyCompany(), isAlwaysMockMode() ? Promise.resolve(null) : getMyPlatformAdmin().catch(() => null)])
        .then(([membership, loadedCompany, platformAdmin]) => {
          if (!active || current !== generation) return;
          setCompany(loadedCompany);
          setIsAdmin(membership?.position.name === "ADMIN");
          setPermissions(membership?.permissions ?? []);
          setIsPlatformAdmin(platformAdmin !== null);
          const account = getOperationalAccount();
          setMemberships(account.memberships);
          const selected = getSelectedContext();
          const valid = selected === "personal" || selected === loadedCompany?.id || account.memberships.some((item) => item.id === selected);
          setNeedsContextChoice(Boolean(loadedCompany) && !valid);
          setKind(selected === "personal" ? "personal" : loadedCompany ? "company" : "personal");
        })
        .catch(() => {
          if (active && current === generation) {
            setCompany(null);
            setIsAdmin(false);
            setIsPlatformAdmin(false);
            setPermissions([]);
            setMemberships([]);
            setNeedsContextChoice(false);
          }
        })
        .finally(() => {
          if (active && current === generation) setLoading(false);
        });
    }
    load();
    window.addEventListener("solaria:context", load);
    return () => {
      active = false;
      window.removeEventListener("solaria:context", load);
    };
  }, []);

  const value = useMemo<ActiveContextValue>(
    () => ({
      loading,
      kind: company ? kind : "personal",
      setKind: (next) => {
        setKind(next);
        selectContext(next === "personal" ? "personal" : (company?.id ?? "personal"));
      },
      company,
      isAdmin,
      hasCompany: company !== null,
      isPlatformAdmin,
      can: (permission) => isAlwaysMockMode() || (kind === "company" && company !== null && (isAdmin || permissions.includes(permission))),
      memberships,
      selectCompany: selectContext,
      needsContextChoice,
    }),
    [loading, kind, company, isAdmin, isPlatformAdmin, permissions, memberships, needsContextChoice],
  );

  return <ActiveContextContext.Provider value={value}>{children}</ActiveContextContext.Provider>;
}

export function useActiveContext(): ActiveContextValue {
  const value = useContext(ActiveContextContext);
  if (!value) throw new Error("useActiveContext deve ser usado dentro de ActiveContextProvider");
  return value;
}
