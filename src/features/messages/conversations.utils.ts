import { getAuthSession } from "@/lib/shared/auth/authToken.utils";

function hiddenKey(): string {
  return `solaria.hiddenConversations.${getAuthSession()?.userId ?? "anonymous"}`;
}

/** O messenger não tem exclusão de conversa (só sair de grupo); "excluir" tira a conversa da lista neste navegador. */
export function getHiddenConversations(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(hiddenKey()) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function hideConversation(id: string): void {
  try {
    localStorage.setItem(hiddenKey(), JSON.stringify([...new Set([...getHiddenConversations(), id])]));
  } catch {
    return;
  }
}
