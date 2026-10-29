import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { SurfaceButton } from "@@/ui/button/Button.presets";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import type { NotificationItem } from "../notification";

const SKELETON_ROWS = 3;

interface NotificationRowProps {
  item: NotificationItem;
  onOpen: () => void;
  onMarkRead: () => void;
}

export function NotificationRow({ item, onOpen, onMarkRead }: NotificationRowProps) {
  const { t, i18n } = useTranslation("notifications", { keyPrefix: "center" });
  const unread = item.readAt === null;

  return (
    <li className={`flex items-start gap-2 rounded-medium p-1 ${unread ? "bg-operational-hover" : ""}`}>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-small p-2 text-left hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:outline-orange">
        <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${unread ? "bg-orange" : "bg-transparent"}`} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={`break-words ${unread ? "font-semi-bold" : "font-medium"}`}>
            {unread && <span className="sr-only">{t("unread")}: </span>}
            {item.title}
          </span>
          <span className="line-clamp-2 break-words text-operational-muted">{item.body}</span>
          <time dateTime={item.createdAt} className="text-sidebar-group text-operational-muted">
            {new Date(item.createdAt).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" })}
          </time>
        </span>
      </button>
      {unread && <ToolbarAction icon="check" label={`${t("markRead")}: ${item.title}`} onClick={onMarkRead} className="mt-1" />}
    </li>
  );
}

export function NotificationSkeleton() {
  const { t } = useTranslation("notifications", { keyPrefix: "center" });
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">{t("loading")}</span>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} height="4.5rem" className="rounded-medium" />
      ))}
    </div>
  );
}

interface NotificationRetryProps {
  message: string;
  onRetry: () => void;
}

export function NotificationRetry({ message, onRetry }: NotificationRetryProps) {
  const { t } = useTranslation("notifications", { keyPrefix: "center" });
  return (
    <div role="alert" className="flex flex-col items-start gap-2">
      <p>{message}</p>
      <SurfaceButton type="button" content={t("retry")} description={t("retry")} onClick={onRetry} />
    </div>
  );
}
