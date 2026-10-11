import { createContext, useContext, useState, type ReactNode } from "react";
import { company } from "../fixtures";
type ContextValue = ReturnType<typeof import("../../src/lib/shared/context/ActiveContext").useActiveContext>;
const Context = createContext<ContextValue | null>(null);
export function ActiveContextProvider({
  children,
  initialKind = "company",
  platformAdmin = false,
}: {
  children: ReactNode;
  initialKind?: "personal" | "company";
  platformAdmin?: boolean;
}) {
  const parent = useContext(Context);
  const [kind, setKind] = useState(initialKind);
  const value: ContextValue = {
    loading: false,
    kind,
    setKind,
    company,
    isAdmin: true,
    hasCompany: true,
    isPlatformAdmin: platformAdmin,
    can: () => true,
    needsContextChoice: false,
    memberships: [{ id: company.id, name: company.tradeName, type: "SUPPLIER", admin: true }],
    selectCompany: () => setKind("company"),
  };
  return <Context.Provider value={parent ?? value}>{children}</Context.Provider>;
}
export function useActiveContext(): ContextValue {
  const value = useContext(Context);
  if (!value) throw new Error("Story requires ActiveContextProvider");
  return value;
}
