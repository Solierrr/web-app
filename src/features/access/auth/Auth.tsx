import { useState, type ReactNode } from "react";
import type { Access } from "../access";
import { AuthContext } from "./Auth.utils";

interface AuthProps {
  children: ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const [access, setAccess] = useState<Access | null>(null);

  return (
    <AuthContext.Provider
      value={{
        authenticated: access !== null,
        access,
        login: setAccess,
        logout: () => setAccess(null),
      }}>
      {children}
    </AuthContext.Provider>
  );
}
