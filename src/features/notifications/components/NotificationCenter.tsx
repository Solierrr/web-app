import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Popover from "@@/overlay/popover/Popover";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton, SurfaceButton } from "@@/ui/button/Button.presets";
import { SIDEBAR_ICON_SIZE } from "@@/layout/sidebar/Sidebar.styles";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import type { NotificationItem } from "../notification";
import { PushStatus } from "../notification.enum";
import { useForegroundPush, useNotificationList, usePushRegistration, usePushStatus, useUnreadCount } from "../notification.hooks";
import { resolveNotificationRoute } from "../notification.utils";
import { NotificationRetry, NotificationRow, NotificationSkeleton } from "./NotificationCenter.reusable";

const MAX_BADGE = 99;

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation("notifications", { keyPrefix: "center" });
  const { t: tPush } = useTranslation("notifications", { keyPrefix: "push" });
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const navigate = useNavigate();
  const list = useNotificationList();
  const push = usePushStatus();
  const [announcement, setAnnouncement] = useState("");
  const hasUnread = list.items.some((item) => item.readAt === null);

  function open(item: NotificationItem) {
    if (item.readAt === null) void list.markRead(item.id);
    const route = resolveNotificationRoute({ type: item.type, data: item.data }, lang);
    if (!route) return;
    onClose();
    navigate(route);
  }

  async function markAll() {
    if (await list.markAllRead()) setAnnouncement(t("allRead"));
  }

  return (
    <div className="flex max-h-[min(36rem,calc(100dvh-8rem))] flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-label font-medium">{t("title")}</h2>
        <SurfaceButton
          type="button"
          disabled={!hasUnread}
          content={t("markAllRead")}
          description={t("markAllRead")}
          onClick={() => void markAll()}
          className="min-h-10"
        />
      </div>
      {push.status === PushStatus.OFF && (
        <div className="flex flex-col items-start gap-2 rounded-medium bg-operational-hover p-3">
          <p>{t("enablePrompt")}</p>
          <PrimaryButton type="button" disabled={push.busy} content={t("enable")} description={t("enable")} onClick={() => void push.enable()} />
          {push.failed && <p role="alert">{tPush("error")}</p>}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
        {list.status === "loading" && <NotificationSkeleton />}
        {list.status === "error" && <NotificationRetry message={t("error")} onRetry={list.retry} />}
        {list.status === "ready" && list.items.length === 0 && <p className="p-2 text-operational-muted">{t("empty")}</p>}
        {list.status === "ready" && list.items.length > 0 && (
          <ul aria-label={t("list")} className="flex flex-col gap-1">
            {list.items.map((item) => (
              <NotificationRow key={item.id} item={item} onOpen={() => open(item)} onMarkRead={() => void list.markRead(item.id)} />
            ))}
          </ul>
        )}
        {list.status === "ready" && list.hasMore && (
          <SurfaceButton
            type="button"
            disabled={list.loadingMore}
            content={list.loadingMore ? t("loadingMore") : t("loadMore")}
            description={t("loadMore")}
            onClick={() => void list.loadMore()}
            className="mt-2 w-full"
          />
        )}
      </div>
      {list.status === "ready" && list.failed && (
        <p role="alert" className="text-feedback-error">
          {t("actionError")}
        </p>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export default function NotificationCenter() {
  const { t } = useTranslation("notifications", { keyPrefix: "center" });
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { count, announced } = useUnreadCount();
  usePushRegistration();
  useForegroundPush();

  return (
    <>
      <span className="relative inline-flex">
        <ToolbarAction
          ref={trigger}
          icon="bell"
          iconSize={SIDEBAR_ICON_SIZE}
          label={count > 0 ? t("bellUnread", { count }) : t("bell")}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-orange px-1 text-sidebar-group font-semi-bold leading-5 text-white">
            {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
          </span>
        )}
      </span>
      <p role="status" className="sr-only">
        {announced === null ? "" : t("announce", { count: announced })}
      </p>
      {open && (
        <Popover anchorRef={trigger} label={t("title")} onClose={close} className="max-w-md!">
          <NotificationPanel onClose={close} />
        </Popover>
      )}
    </>
  );
}
