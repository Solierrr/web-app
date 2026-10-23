import { useCallback, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GroupAction from "@@/ui/button/GroupAction";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
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
  const rememberedLabel =
    remembered?.method === "google" ? t("entry.googleLogin") : remembered?.method === "microsoft" ? t("entry.microsoftLogin") : t("entry.emailLogin");
  return (
    <div className="flex flex-col gap-4">
      {remembered && (
        <SurfaceGroup direction="horizontal">
          <GroupAction
            icon={remembered.method === "password" ? "user" : remembered.method}
            label={t("login.continueAs", { email: remembered.email })}
            content={rememberedLabel}
            detail={remembered.email}
            disabled={busy}
            onClick={onContinue}
          />
          <GroupAction layout="icon" icon="x" iconSize={18} label={t("login.forgetAccount")} disabled={busy} onClick={onForget} className="w-14" />
        </SurfaceGroup>
      )}
      <SurfaceGroup>
        <GroupAction icon="login" label={t("entry.signIn")} content={t("entry.signIn")} disabled={busy} onClick={onSignIn} />
        <GroupAction icon="userPlus" label={t("entry.register")} content={t("entry.register")} to={routePaths.register(lang)} state={state} />
      </SurfaceGroup>
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
    <SurfaceGroup direction="horizontal" divided={false} className="self-center">
      {!policiesOnly && <GroupAction layout="icon" icon="userPlus" label={t("login.register")} to={routePaths.register(lang)} state={state} />}
      {!policiesOnly && <GroupAction layout="icon" icon="key" label={t("login.forgotPassword")} to={routePaths.forgotPassword(lang)} state={state} />}
      <GroupAction
        layout="icon"
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
    </SurfaceGroup>
  );
}
