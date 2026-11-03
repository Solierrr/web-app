import type { MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { notify } from "@@/feedback/toast/Toast.utils";
import type { ContextMenuItem } from "./ContextMenu";
import { useContextMenu } from "./useContextMenu";

const NATIVE_MENU_TARGETS = "input, textarea, select, [contenteditable='true'], [contenteditable='']";

/**
 * useGeneralContextMenu
 *
 * Menu de contexto geral das telas: copiar seleção e endereço do link (quando existirem), voltar, avançar,
 * recarregar, copiar o link da página e ir para o início. Campos de texto mantêm o menu nativo do navegador.
 *
 * @param homePath - Rota aberta pela ação "ir para o início".
 *
 * @returns Handler para o `onContextMenu` do contêiner da página.
 */
export function useGeneralContextMenu(homePath: string) {
  const contextMenu = useContextMenu();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const { t } = useTranslation("commons", { keyPrefix: "actions" });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(t("copied"));
    } catch {
      notify(t("copyFailed"), undefined, true);
    }
  }

  return (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (event.defaultPrevented || target?.closest(NATIVE_MENU_TARGETS)) return;
    event.preventDefault();
    const link = target?.closest<HTMLAnchorElement>("a[href]");
    const selection = window.getSelection()?.toString().trim();
    const items: ContextMenuItem[] = [];
    if (selection) items.push({ label: t("copySelection"), icon: "copy", onClick: () => void copy(selection) });
    if (link) items.push({ label: t("copyLinkAddress"), icon: "link", onClick: () => void copy(link.href) });
    items.push(
      { label: t("back"), icon: "chevronLeft", onClick: () => navigate(-1) },
      { label: t("forward"), icon: "chevronRight", onClick: () => navigate(1) },
      { label: t("reload"), icon: "refresh", onClick: () => navigate(0) },
      { label: t("copyPageLink"), icon: "link", onClick: () => void copy(new URL(`${pathname}${search}${hash}`, document.baseURI).href) },
      { label: t("goHome"), icon: "home", onClick: () => navigate(homePath) },
    );
    contextMenu.open(items, event.clientX, event.clientY);
  };
}
