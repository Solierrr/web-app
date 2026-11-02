import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ContextMenuProvider } from "@@/overlay/contextMenu/provider/ContextMenuProvider";
import { useContextMenu } from "@@/overlay/contextMenu/useContextMenu";

import Navbar from "@@/layout/navbar/Navbar";
import Footer from "@@/layout/footer/Footer";

export function AppLayout() {
  return (
    <ContextMenuProvider>
      <AppLayoutContent />
    </ContextMenuProvider>
  );
}

function AppLayoutContent() {
  const navigate = useNavigate();
  const contextMenu = useContextMenu();
  const { t } = useTranslation("commons");
  const { t: tShell } = useTranslation("saas", { keyPrefix: "shell" });

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    contextMenu.open([{ label: t("actions.back"), onClick: () => navigate(-1) }], event.clientX, event.clientY);
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col" onContextMenu={handleContextMenu}>
      <a
        href="#main-content"
        onClick={(event) => {
          const main = document.querySelector<HTMLElement>("main");
          if (!main) return;
          event.preventDefault();
          main.tabIndex = -1;
          main.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-medium focus:bg-white focus:p-4">
        {tShell("skipContent")}
      </a>
      <Navbar />
      <div id="main-content" className="w-full flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
