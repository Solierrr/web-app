import { useTranslation } from "react-i18next";

import type { ConnectionState } from "@/features/messages/messages.messenger.realtime";

export default function ConnectionNotice({ connection }: { connection: ConnectionState }) {
  const { t } = useTranslation("chat");
  if (connection.status === "unavailable") {
    return (
      <p role="status" className="text-body text-operational-muted">
        {t("realtimeUnavailable")}
      </p>
    );
  }
  if (connection.status !== "connecting" && connection.status !== "reconnecting") return null;
  return (
    <p role="status" className="text-body text-operational-muted">
      {connection.attempts >= 2 ? t("realtimeWaking") : t("realtimeReconnecting")}
    </p>
  );
}
