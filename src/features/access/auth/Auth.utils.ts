import { createContext, useContext } from "react";
import type { Access } from "../access";

export interface AuthContextValue {
  authenticated: boolean;
  access: Access | null;
  login: (access: Access) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth: chamado fora de um <Auth> provider.");
  return context;
}
