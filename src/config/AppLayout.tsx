import { Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ContextMenuProvider } from "@@/overlay/contextMenu/provider/ContextMenuProvider";
import { useGeneralContextMenu } from "@@/overlay/contextMenu/useGeneralContextMenu";
import { routePaths } from "@/config/i18n/paths";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";

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
  const { lang } = useParams<{ lang: string }>();
  const handleContextMenu = useGeneralContextMenu(routePaths.home(isSupportedLanguage(lang) ? lang : DEFAULT));
  const { t: tShell } = useTranslation("saas", { keyPrefix: "shell" });

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
