import { useCallback, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import Surface from "@@/ui/surface/Surface";
import type { RememberedLogin } from "./LoginPage.utils";

export function LoginEntryChoices({
  lang,
  state,
  remembered,
  busy,
  onSignIn,
  onContinue,
  onForget,
}: {
  lang: SupportedLanguage;
  state?: unknown;
  remembered: RememberedLogin | null;
  busy: boolean;
  onSignIn: () => void;
  onContinue: () => void;
  onForget: () => void;
}) {
  const { t } = useTranslation("access");
  const row = "h-auto! min-h-14 w-full justify-start px-4 py-3 font-medium";
  return (
    <div className="flex flex-col gap-4">
      {remembered && (
        <div className="flex flex-col gap-2">
          <p title={remembered.email} className="truncate text-body font-medium text-operational-muted">
            {t("login.lastUsed")} · {remembered.email}
          </p>
          <Surface contentClassName="flex items-center gap-1 p-1">
            <ToolbarAction
              icon={remembered.method === "password" ? "user" : remembered.method}
              label={t("login.continueAs", { email: remembered.email })}
              content={remembered.method === "password" ? t("entry.email") : t(`login.${remembered.method}`)}
              className={`${row} min-w-0 flex-1`}
              disabled={busy}
              onClick={onContinue}
            />
            <ToolbarAction icon="x" label={t("login.forgetAccount")} disabled={busy} onClick={onForget} />
          </Surface>
        </div>
      )}
      <Surface contentClassName="flex flex-col gap-1 p-1">
        <ToolbarAction icon="login" label={t("entry.signIn")} content={t("entry.signIn")} className={row} disabled={busy} onClick={onSignIn} />
        <ToolbarAction
          icon="userPlus"
          label={t("entry.register")}
          content={t("entry.register")}
          className={row}
          to={routePaths.register(lang)}
          state={state}
        />
      </Surface>
    </div>
  );
}

export function LoginShortcuts({ lang, state, policiesOnly = false }: { lang: SupportedLanguage; state?: unknown; policiesOnly?: boolean }) {
  const { t } = useTranslation("access");
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
    <Surface contentClassName="flex items-center justify-center gap-3 p-1">
      {!policiesOnly && <ToolbarAction icon="userPlus" label={t("login.register")} to={routePaths.register(lang)} state={state} />}
      {!policiesOnly && <ToolbarAction icon="key" label={t("login.forgotPassword")} to={routePaths.forgotPassword(lang)} state={state} />}
      <ToolbarAction
        ref={trigger}
        icon="shieldCheck"
        label={t("login.policiesIntro")}
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
              { label: t("login.terms"), onClick: () => navigate(routePaths.termsPolicy(lang)) },
              { label: t("login.privacy"), onClick: () => navigate(routePaths.privacyPolicy(lang)) },
              { label: t("login.cookies"), onClick: () => navigate(routePaths.cookiePolicy(lang)) },
            ],
            bounds.right,
            bounds.bottom + 8,
          );
        }}
      />
      <ContextMenu ref={menu} id={id} label={t("login.policiesIntro")} autoFocus triggerRef={trigger} align="end" onClose={close} />
    </Surface>
  );
}
