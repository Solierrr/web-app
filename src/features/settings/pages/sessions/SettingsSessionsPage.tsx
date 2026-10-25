import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { logout, logoutAll } from "@/features/access/access.service";
import type { DeviceSession } from "../../settings";
import { listSessions, revokeSession } from "../../settings.service";

export default function SettingsSessionsPage() {
  const { t, i18n } = useTranslation("commons", { keyPrefix: "settingsSessions" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t: tCommon } = useTranslation("commons");
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [message, setMessage] = useState<"error" | "revokeError" | null>(null);

  useEffect(() => {
    let active = true;
    listSessions()
      .then((items) => {
        if (active) setSessions(items);
      })
      .catch(() => {
        if (active) setMessage("error");
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleRevoke(id: string) {
    try {
      await revokeSession(id);
      setSessions((items) => items?.filter((item) => item.id !== id) ?? null);
      setMessage(null);
    } catch {
      throw new Error(t("revokeError"));
    }
  }

  async function handleSignOut() {
    await logout().catch(() => undefined);
    navigate(routePaths.login(lang), { replace: true });
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} loading={sessions === null && message === null} centered sideBackground>
      <div className="flex items-center justify-between gap-4">
        <span className="text-body">{t("signOutAll")}</span>
        <ConfirmedAction
          icon="logout"
          label={t("signOutAll")}
          name={t("allDevices")}
          onConfirm={async () => {
            await logoutAll();
            navigate(routePaths.login(lang), { replace: true });
          }}
        />
      </div>
      <OperationalTable
        label={t("title")}
        items={sessions ?? []}
        onRefresh={async () => setSessions(await listSessions())}
        getKey={(session) => session.id}
        empty={tCommon("operational.empty")}
        columns={[
          {
            key: "device",
            value: (session) => (session.current ? t("current") : session.device),
            label: t("device"),
            render: (session) => <span className="font-medium">{session.current ? t("current") : session.device}</span>,
          },
          {
            key: "active",
            value: (session) => Date.parse(session.lastActive),
            label: t("lastActiveLabel"),
            render: (session) => new Date(session.lastActive).toLocaleDateString(i18n.language),
          },
          {
            key: "actions",
            label: tCommon("operational.actions"),
            render: (session) =>
              session.current ? (
                <ToolbarAction
                  icon="logout"
                  label={t("signOut")}
                  onClick={() => void handleSignOut()}
                  backgroundColor="var(--color-input-bg)"
                  className="h-8!"
                />
              ) : (
                <ConfirmedAction icon="x" label={t("revoke")} name={session.device} onConfirm={() => handleRevoke(session.id)} />
              ),
          },
        ]}
      />
      {sessions && sessions.length === 1 ? <p className="text-body text-operational-muted">{t("onlyCurrent")}</p> : null}
      {message ? <p role="alert">{t(message)}</p> : null}
    </OperationalPage>
  );
}
