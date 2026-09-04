import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ContextMenuProvider } from "@@/overlay/contextMenu/provider/ContextMenuProvider";
import { useContextMenu } from "@@/overlay/contextMenu/useContextMenu";

import Navbar from "@@/layout/navbar/Navbar";

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

  function handleContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    contextMenu.open([{ label: t("actions.back"), onClick: () => navigate(-1) }], event.clientX, event.clientY);
  }

  return (
    <div className="min-h-screen min-w-screen" onContextMenu={handleContextMenu}>
      <Navbar />
      <div className="w-full h-full">
        <Outlet />
      </div>
    </div>
  );
}
