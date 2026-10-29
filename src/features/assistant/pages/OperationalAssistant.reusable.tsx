import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import type { ScreenLink } from "../assistant.utils";

export function ReplyActions({
  links,
  proposal,
  onConfirm,
  onDecline,
}: {
  links: ScreenLink[];
  proposal: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation("chat", { keyPrefix: "operational" });
  if (!links.length && !proposal) return null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const label = t("openScreen", { screen: t(`screens.${link.screen}`) });
            return (
              <ToolbarAction
                key={link.screen}
                to={link.to}
                icon="chevronRight"
                label={label}
                content={label}
                backgroundColor="var(--color-white)"
                className="h-8!"
              />
            );
          })}
        </div>
      )}
      {proposal && (
        <>
          <p className="text-sidebar-group text-operational-muted">{t("proposalNotice")}</p>
          <div className="flex flex-wrap gap-2">
            <ToolbarAction
              icon="check"
              label={t("confirm")}
              content={t("confirm")}
              backgroundColor="var(--color-white)"
              className="h-8!"
              onClick={onConfirm}
            />
            <ToolbarAction
              icon="x"
              label={t("decline")}
              content={t("decline")}
              backgroundColor="var(--color-white)"
              className="h-8!"
              onClick={onDecline}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function FailedMessageActions({ reason, onRetry, onDiscard }: { reason?: string; onRetry: () => void; onDiscard: () => void }) {
  const { t } = useTranslation("chat", { keyPrefix: "operational" });
  return (
    <div className="flex flex-wrap items-center gap-2" aria-live="polite">
      <span role="alert" className="text-sidebar-group text-(--message-muted)">
        {reason ?? t("failed")}
      </span>
      <ToolbarAction
        icon="refresh"
        label={t("retry")}
        content={t("retry")}
        color="var(--color-white)"
        hoverColor="var(--color-white)"
        className="h-7!"
        onClick={onRetry}
      />
      <ToolbarAction
        label={t("discard")}
        content={t("discard")}
        color="var(--color-white)"
        hoverColor="var(--color-white)"
        className="h-7!"
        onClick={onDiscard}
      />
    </div>
  );
}
