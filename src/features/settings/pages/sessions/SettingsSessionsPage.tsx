import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { logout } from "@/features/access/access.service";
import type { DeviceSession } from "../../settings";
import { listSessions, revokeSession } from "../../settings.service";

export default function SettingsSessionsPage() {
  const { t, i18n } = useTranslation("commons", { keyPrefix: "settingsSessions" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [message, setMessage] = useState<"revoked" | "error" | null>(null);

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
      setMessage("revoked");
    } catch {
      setMessage("error");
    }
  }

  async function handleSignOut() {
    await logout();
    navigate(routePaths.login(lang), { replace: true });
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} loading={sessions === null && message === null} compact>
      <ul className="flex flex-col divide-y divide-operational-border rounded-small border border-operational-border">
        {sessions?.map((session) => (
          <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{session.current ? t("current") : session.device}</p>
              <p className="text-sm text-operational-muted">
                {t("lastActive", { date: new Date(session.lastActive).toLocaleDateString(i18n.language) })}
              </p>
            </div>
            {session.current ? (
              <button type="button" onClick={() => void handleSignOut()} className="rounded-small border border-operational-border px-3 py-2">
                {t("signOut")}
              </button>
            ) : (
              <button type="button" onClick={() => void handleRevoke(session.id)} className="rounded-small border border-operational-border px-3 py-2">
                {t("revoke")}
              </button>
            )}
          </li>
        ))}
      </ul>
      {sessions && sessions.length === 1 ? <p className="text-sm text-operational-muted">{t("onlyCurrent")}</p> : null}
      {message ? <p role={message === "error" ? "alert" : "status"}>{t(message)}</p> : null}
    </OperationalPage>
  );
}
