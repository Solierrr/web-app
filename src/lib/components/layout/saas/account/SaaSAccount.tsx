import { useCallback, useId, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { SIDEBAR_ICON_SIZE } from "@@/layout/sidebar/Sidebar.styles";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

interface SaaSAccountProps {
  email: string;
  signingOut?: boolean;
  onLogout?: () => Promise<void>;
  managedCompanyName?: string;
}

export default function SaaSAccount({ email, managedCompanyName, signingOut = false, onLogout }: SaaSAccountProps) {
  const { t } = useTranslation("saas");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const navigate = useNavigate();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<ContextMenuHandle>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  return (
    <>
      <ToolbarAction
        ref={trigger}
        icon="account"
        iconSize={SIDEBAR_ICON_SIZE}
        iconMotion="account"
        label={t("shell.account")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (open) {
            menu.current?.close();
            return;
          }
          const bounds = trigger.current?.getBoundingClientRect();
          if (!bounds) return;
          setOpen(true);
          menu.current?.open(
            [
              { label: t("navigation.items.settings"), icon: "settings", onClick: () => navigate(routePaths.settings(lang)) },
              { label: t("navigation.items.profile"), icon: "user", onClick: () => navigate(routePaths.ownUserProfile(lang)) },
              ...(onLogout
                ? [{ label: t("shell.logout"), icon: "logout" as const, disabled: signingOut, onClick: () => void onLogout().catch(() => undefined) }]
                : []),
            ],
            bounds.right,
            bounds.bottom,
          );
        }}
      />
      <ContextMenu
        ref={menu}
        id={id}
        label={t("shell.account")}
        autoFocus
        triggerRef={trigger}
        align="end"
        onClose={close}
        className="max-w-[calc(100vw-2rem)]"
        header={
          <div className="flex flex-col gap-1">
            <p className="break-all text-body">{email}</p>
            {managedCompanyName && (
              <p className="break-words text-body text-operational-muted">{t("shell.managedBy", { company: managedCompanyName })}</p>
            )}
          </div>
        }
      />
    </>
  );
}
